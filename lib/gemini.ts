import { db } from './firebase'
import {
  collection,
  doc,
  getDoc,
  setDoc,
  query,
  where,
  getDocs,
  Timestamp,
} from 'firebase/firestore'

// ============================================================================
// TYPES
// ============================================================================

interface GeminiCacheEntry {
  id?: string
  cacheKey: string
  type: 'testResult' | 'drugInfo' | 'pharmacistSummary'
  result: string
  input: Record<string, any>
  createdAt: Timestamp
  expiresAt: Timestamp
}

interface GeminiUsageLog {
  id?: string
  type: 'testResult' | 'drugInfo' | 'pharmacistSummary'
  status: 'success' | 'error' | 'cached'
  cacheHit: boolean
  duration: number // milliseconds
  error?: string
  createdAt: Timestamp
}

// ============================================================================
// INITIALIZATION & VALIDATION
// ============================================================================

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'
const CACHE_DURATION_MS = 30 * 24 * 60 * 60 * 1000 // 30 days
const REQUEST_TIMEOUT_MS = 30000 // 30 seconds

if (!GEMINI_API_KEY) {
  console.warn('NEXT_PUBLIC_GEMINI_API_KEY is not configured. Gemini features will be unavailable.')
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate a hash of the input parameters for cache key
 */
async function generateCacheKey(type: string, input: Record<string, any>): Promise<string> {
  const key = `${type}:${JSON.stringify(input)}`
  const encoder = new TextEncoder()
  const data = encoder.encode(key)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}

/**
 * Log API usage for monitoring and analytics
 */
async function logUsage(
  type: 'testResult' | 'drugInfo' | 'pharmacistSummary',
  status: 'success' | 'error' | 'cached',
  cacheHit: boolean,
  duration: number,
  error?: string
) {
  try {
    const logEntry: GeminiUsageLog = {
      type,
      status,
      cacheHit,
      duration,
      error,
      createdAt: Timestamp.now(),
    }
    await setDoc(doc(collection(db, 'gemini_usage_logs')), logEntry)
  } catch (err) {
    console.error('Failed to log Gemini usage:', err)
  }
}

/**
 * Call Gemini API with timeout
 */
async function callGeminiAPI(prompt: string, systemPrompt: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured')
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_ONLY_HIGH',
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_ONLY_HIGH',
          },
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 500,
        },
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        `Gemini API error: ${response.status} - ${
          errorData.error?.message || 'Unknown error'
        }`
      )
    }

    const data = await response.json()
    const content = data.contents?.[0]?.parts?.[0]?.text

    if (!content) {
      throw new Error('Empty response from Gemini API')
    }

    return content
  } catch (error: any) {
    clearTimeout(timeoutId)
    if (error.name === 'AbortError') {
      throw new Error('Gemini API request timeout')
    }
    throw error
  }
}

/**
 * Get or create cache entry
 */
async function getFromCache(cacheKey: string): Promise<string | null> {
  try {
    const docSnap = await getDoc(doc(db, 'gemini_cache', cacheKey))
    if (docSnap.exists()) {
      const data = docSnap.data() as GeminiCacheEntry
      // Check if cache has expired
      if (data.expiresAt && data.expiresAt.toMillis() > Date.now()) {
        return data.result
      } else {
        // Cache expired, we could delete it here but for now just return null
        return null
      }
    }
    return null
  } catch (error) {
    console.error('Cache read error:', error)
    return null
  }
}

/**
 * Store result in cache
 */
async function setInCache(
  cacheKey: string,
  type: 'testResult' | 'drugInfo' | 'pharmacistSummary',
  result: string,
  input: Record<string, any>
) {
  try {
    const cacheEntry: GeminiCacheEntry = {
      cacheKey,
      type,
      result,
      input,
      createdAt: Timestamp.now(),
      expiresAt: Timestamp.fromMillis(Date.now() + CACHE_DURATION_MS),
    }
    await setDoc(doc(db, 'gemini_cache', cacheKey), cacheEntry)
  } catch (error) {
    console.error('Cache write error:', error)
    // Don't throw - cache failures shouldn't break the feature
  }
}

// ============================================================================
// PUBLIC API FUNCTIONS
// ============================================================================

/**
 * Explain lab test results in simple, jargon-free language
 * Returns a plain-language explanation that patients can understand
 */
export async function explainTestResult(
  testName: string,
  values: Record<string, number>,
  normalRanges: Record<string, string>
): Promise<string> {
  const startTime = Date.now()
  const input = { testName, values, normalRanges }
  const cacheKey = await generateCacheKey('testResult', input)

  try {
    // Check cache first
    const cached = await getFromCache(cacheKey)
    if (cached) {
      const duration = Date.now() - startTime
      await logUsage('testResult', 'cached', true, duration)
      return cached
    }

    const valuesStr = Object.entries(values)
      .map(([key, val]) => `${key}: ${val}`)
      .join(', ')

    const rangesStr = Object.entries(normalRanges)
      .map(([key, range]) => `${key} (normal: ${range})`)
      .join(', ')

    const systemPrompt = `You are a friendly healthcare assistant explaining test results.
Your goal is to help patients understand their lab results in simple language.
IMPORTANT SAFETY RULES:
- NEVER make diagnoses or give medical advice
- NEVER tell them to stop or start medications
- Focus only on explaining what the numbers mean
- Always encourage them to talk to their doctor
- Use simple words, avoid medical jargon
- Be supportive and reassuring when values are normal
- Be calm when values are abnormal - just explain what further steps might be needed
Keep response under 200 words.`

    const prompt = `My test is called "${testName}". 
My results are: ${valuesStr}
Normal ranges are: ${rangesStr}

Please explain what these numbers mean in simple words. What should I know about these results?`

    const result = await callGeminiAPI(prompt, systemPrompt)
    const duration = Date.now() - startTime

    // Store in cache
    await setInCache(cacheKey, 'testResult', result, input)
    await logUsage('testResult', 'success', false, duration)

    return result
  } catch (error: any) {
    const duration = Date.now() - startTime
    const errorMsg = error.message || 'Unknown error'
    await logUsage('testResult', 'error', false, duration, errorMsg)

    console.error('Test result explanation error:', error)
    throw new Error(
      `Failed to explain test results: ${errorMsg}. Please try again later.`
    )
  }
}

/**
 * Get drug information in simple, patient-friendly language
 * Returns: what it does, side effects, how to take it
 */
export async function getDrugInfo(drugName: string): Promise<string> {
  const startTime = Date.now()
  const input = { drugName }
  const cacheKey = await generateCacheKey('drugInfo', input)

  try {
    // Check cache first
    const cached = await getFromCache(cacheKey)
    if (cached) {
      const duration = Date.now() - startTime
      await logUsage('drugInfo', 'cached', true, duration)
      return cached
    }

    const systemPrompt = `You are a helpful medication information assistant.
Your role is to explain medications in simple, easy-to-understand language.
IMPORTANT SAFETY RULES:
- NEVER recommend starting or stopping medications
- NEVER substitute for doctor's advice
- Only provide general educational information
- Avoid technical medical terms - use everyday language
- Always tell them to talk to their doctor or pharmacist
- Be honest about common side effects but don't list rare ones
Keep response under 250 words.`

    const prompt = `Tell me about the medication "${drugName}" in simple language. 
Include:
1. What it's used for
2. Common side effects
3. How it's typically taken
4. Important things to know

Use plain words that anyone can understand.`

    const result = await callGeminiAPI(prompt, systemPrompt)
    const duration = Date.now() - startTime

    // Store in cache
    await setInCache(cacheKey, 'drugInfo', result, input)
    await logUsage('drugInfo', 'success', false, duration)

    return result
  } catch (error: any) {
    const duration = Date.now() - startTime
    const errorMsg = error.message || 'Unknown error'
    await logUsage('drugInfo', 'error', false, duration, errorMsg)

    console.error('Drug info retrieval error:', error)
    throw new Error(
      `Failed to get drug information: ${errorMsg}. Please try again later.`
    )
  }
}

/**
 * Generate a shareable summary of medications for a pharmacist
 * Creates a concise, professional summary suitable for sharing with pharmacy
 */
export async function generatePharmacistSummary(
  medications: string[],
  drugInfos: string[]
): Promise<string> {
  const startTime = Date.now()
  const input = { medications, drugInfosCount: drugInfos.length }
  const cacheKey = await generateCacheKey('pharmacistSummary', input)

  try {
    // Check cache first
    const cached = await getFromCache(cacheKey)
    if (cached) {
      const duration = Date.now() - startTime
      await logUsage('pharmacistSummary', 'cached', true, duration)
      return cached
    }

    const systemPrompt = `You are a professional medical assistant creating a summary for pharmacists.
Your goal is to create a clear, organized summary that helps pharmacists understand patient medications.
Requirements:
- Use professional but clear language
- Format as a structured summary
- Include key interactions or contraindications (based on provided information)
- Make it easy to scan and understand quickly
- Focus on practical information pharmacists need
Keep response under 250 words.`

    const medListStr = medications.join(', ')
    const infosStr = drugInfos.join('\n---\n')

    const prompt = `Create a professional summary for a pharmacist about the following medications:

Medications: ${medListStr}

Drug Information Details:
${infosStr}

Please create a clear, organized summary that would be helpful for a pharmacist to understand the patient's current medication profile. Include any important considerations or interactions you notice.`

    const result = await callGeminiAPI(prompt, systemPrompt)
    const duration = Date.now() - startTime

    // Store in cache
    await setInCache(cacheKey, 'pharmacistSummary', result, input)
    await logUsage('pharmacistSummary', 'success', false, duration)

    return result
  } catch (error: any) {
    const duration = Date.now() - startTime
    const errorMsg = error.message || 'Unknown error'
    await logUsage('pharmacistSummary', 'error', false, duration, errorMsg)

    console.error('Pharmacist summary generation error:', error)
    throw new Error(
      `Failed to generate pharmacist summary: ${errorMsg}. Please try again later.`
    )
  }
}

/**
 * Check if Gemini API is configured and accessible
 * Useful for UI conditionals to show/hide AI features
 */
export function isGeminiAvailable(): boolean {
  return !!GEMINI_API_KEY
}

/**
 * Clear cache entries (useful for testing or admin purposes)
 * In production, use Firebase console to manage cache expiration
 */
export async function clearCache(type?: 'testResult' | 'drugInfo' | 'pharmacistSummary'): Promise<void> {
  try {
    const q = type
      ? query(collection(db, 'gemini_cache'), where('type', '==', type))
      : query(collection(db, 'gemini_cache'))

    const snapshot = await getDocs(q)
    // Note: In production, prefer batch delete or scheduled cleanup jobs
    console.warn(`Found ${snapshot.size} cache entries. Use Firebase console for batch delete.`)
  } catch (error) {
    console.error('Error checking cache:', error)
  }
}

/**
 * Get usage statistics for monitoring API usage and costs
 */
export async function getUsageStats(hours: number = 24): Promise<any> {
  try {
    const sinceTime = Timestamp.fromMillis(Date.now() - hours * 60 * 60 * 1000)

    const q = query(
      collection(db, 'gemini_usage_logs'),
      where('createdAt', '>=', sinceTime)
    )

    const snapshot = await getDocs(q)
    const logs = snapshot.docs.map((doc) => doc.data() as GeminiUsageLog)

    const stats = {
      totalRequests: logs.length,
      successCount: logs.filter((l) => l.status === 'success').length,
      cachedCount: logs.filter((l) => l.status === 'cached').length,
      errorCount: logs.filter((l) => l.status === 'error').length,
      averageDuration:
        logs.length > 0 ? logs.reduce((sum, l) => sum + l.duration, 0) / logs.length : 0,
      cacheHitRate:
        logs.length > 0
          ? (logs.filter((l) => l.cacheHit).length / logs.length) * 100
          : 0,
      byType: {
        testResult: logs.filter((l) => l.type === 'testResult').length,
        drugInfo: logs.filter((l) => l.type === 'drugInfo').length,
        pharmacistSummary: logs.filter((l) => l.type === 'pharmacistSummary').length,
      },
    }

    return stats
  } catch (error) {
    console.error('Error fetching usage stats:', error)
    return null
  }
}
