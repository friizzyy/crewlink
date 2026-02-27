/**
 * Google Gemini AI provider implementation.
 *
 * Uses the @google/generative-ai SDK with the gemini-2.0-flash model.
 * Lazy-initialises the client so the module can be imported without
 * requiring the API key at import time (important for build-time tree-shaking
 * and environments where the key isn't set).
 */

import { GoogleGenerativeAI, type GenerativeModel } from '@google/generative-ai'
import type { AIGenerateOptions, AIProvider, AIResponse } from './provider'

let _client: GoogleGenerativeAI | null = null
let _model: GenerativeModel | null = null

const MODEL_NAME = 'gemini-2.0-flash'

function getModel(): GenerativeModel {
  if (_model) return _model

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is not set. Add it to your environment variables.'
    )
  }

  _client = new GoogleGenerativeAI(apiKey)
  _model = _client.getGenerativeModel({ model: MODEL_NAME })
  return _model
}

/**
 * Strip markdown fenced-code-block wrappers that Gemini sometimes adds around
 * JSON output (e.g. ```json ... ```).
 */
function stripCodeBlocks(raw: string): string {
  let text = raw.trim()
  // Remove opening ```json or ``` and closing ```
  if (text.startsWith('```')) {
    const firstNewline = text.indexOf('\n')
    if (firstNewline !== -1) {
      text = text.slice(firstNewline + 1)
    }
  }
  if (text.endsWith('```')) {
    text = text.slice(0, -3)
  }
  return text.trim()
}

export const geminiProvider: AIProvider = {
  async generate(
    prompt: string,
    options?: AIGenerateOptions
  ): Promise<AIResponse> {
    const model = getModel()

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      ...(options?.systemPrompt
        ? { systemInstruction: { role: 'system', parts: [{ text: options.systemPrompt }] } }
        : {}),
      generationConfig: {
        temperature: options?.temperature ?? 0.7,
        maxOutputTokens: options?.maxTokens ?? 1024,
      },
    })

    const response = result.response
    const text = response.text()
    const tokensUsed = response.usageMetadata?.totalTokenCount ?? 0

    return { text, tokensUsed, cached: false }
  },

  async generateJSON<T>(
    prompt: string,
    options?: AIGenerateOptions
  ): Promise<{ data: T; tokensUsed: number; cached: boolean }> {
    const model = getModel()

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      ...(options?.systemPrompt
        ? { systemInstruction: { role: 'system', parts: [{ text: options.systemPrompt }] } }
        : {}),
      generationConfig: {
        temperature: options?.temperature ?? 0.4,
        maxOutputTokens: options?.maxTokens ?? 2048,
        responseMimeType: 'application/json',
      },
    })

    const response = result.response
    const rawText = response.text()
    const tokensUsed = response.usageMetadata?.totalTokenCount ?? 0

    const cleaned = stripCodeBlocks(rawText)
    const data = JSON.parse(cleaned) as T

    return { data, tokensUsed, cached: false }
  },
}
