/**
 * Abstract AI provider interface.
 * Allows swapping between Gemini, OpenAI, Anthropic, etc. without changing
 * consumer code. Every provider must implement both text and structured JSON
 * generation.
 */

export interface AIGenerateOptions {
  temperature?: number
  maxTokens?: number
  systemPrompt?: string
}

export interface AIResponse {
  text: string
  tokensUsed: number
  cached: boolean
}

export interface AIProvider {
  generate(prompt: string, options?: AIGenerateOptions): Promise<AIResponse>
  generateJSON<T>(
    prompt: string,
    options?: AIGenerateOptions
  ): Promise<{ data: T; tokensUsed: number; cached: boolean }>
}
