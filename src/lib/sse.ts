type SSEClient = {
  userId: string
  controller: ReadableStreamDefaultController
}

class SSEManager {
  private clients: Map<string, Set<SSEClient>> = new Map()

  addClient(userId: string, controller: ReadableStreamDefaultController): SSEClient {
    const client: SSEClient = { userId, controller }
    if (!this.clients.has(userId)) {
      this.clients.set(userId, new Set())
    }
    this.clients.get(userId)!.add(client)
    return client
  }

  removeClient(client: SSEClient): void {
    const userClients = this.clients.get(client.userId)
    if (userClients) {
      userClients.delete(client)
      if (userClients.size === 0) {
        this.clients.delete(client.userId)
      }
    }
  }

  sendToUser(userId: string, event: string, data: unknown): void {
    const userClients = this.clients.get(userId)
    if (!userClients) return

    const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
    const encoder = new TextEncoder()

    Array.from(userClients).forEach((client) => {
      try {
        client.controller.enqueue(encoder.encode(message))
      } catch {
        this.removeClient(client)
      }
    })
  }
}

export const sseManager = new SSEManager()
