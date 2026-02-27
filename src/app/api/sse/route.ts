export const dynamic = 'force-dynamic'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sseManager } from '@/lib/sse'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const userId = session.user.id

  const stream = new ReadableStream({
    start(controller) {
      const client = sseManager.addClient(userId, controller)

      // Send initial connected event
      const encoder = new TextEncoder()
      controller.enqueue(
        encoder.encode(`event: connected\ndata: ${JSON.stringify({ userId })}\n\n`)
      )

      // Keepalive every 30 seconds
      const keepalive = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': keepalive\n\n'))
        } catch {
          clearInterval(keepalive)
          sseManager.removeClient(client)
        }
      }, 30000)

      // Cleanup when the connection closes
      const cleanup = () => {
        clearInterval(keepalive)
        sseManager.removeClient(client)
      }

      // AbortSignal is not directly available here, so we rely on
      // the enqueue error handling in sendToUser and keepalive
      // to detect disconnection and clean up
      controller.enqueue(encoder.encode(''))

      // Store cleanup reference on the controller for cancel
      ;(controller as ReadableStreamDefaultController & { _cleanup?: () => void })._cleanup = cleanup
    },
    cancel() {
      // Stream was cancelled by the client
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
