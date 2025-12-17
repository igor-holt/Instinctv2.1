/**
 * API Client for Cloudflare Worker Proxy
 * 
 * This module provides functions to communicate with the Cloudflare Worker proxy
 * instead of calling the Gemini API directly, ensuring API keys are kept secure.
 */

// Get the worker endpoint from environment variables
// In production (GitHub Pages), this will point to the Cloudflare Worker
// In development, it can be empty to use direct API calls for testing
const WORKER_ENDPOINT = process.env.WORKER_ENDPOINT || '';

// Production hostnames that should use worker proxy
const PRODUCTION_HOSTNAMES = ['research.genesisconductor.io', 'igor-holt.github.io'];

// Check if we should use the worker proxy
const USE_WORKER_PROXY = WORKER_ENDPOINT && PRODUCTION_HOSTNAMES.includes(window.location.hostname);

/**
 * Make a request through the Cloudflare Worker proxy
 */
async function proxyRequest(endpoint: string, method: string, body?: any, stream: boolean = false) {
  if (!USE_WORKER_PROXY) {
    throw new Error('Worker proxy not configured for this environment');
  }

  const response = await fetch(WORKER_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      endpoint,
      method,
      body,
      stream,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `Proxy request failed: ${response.status}`);
  }

  return response;
}

/**
 * Parse streaming response from the worker proxy
 */
async function* parseStreamingResponse(response: Response) {
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No response body');
  }

  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      
      // Keep the last incomplete line in the buffer
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.trim() === '') continue;
        if (line.startsWith('data: ')) {
          const data = line.substring(6);
          if (data === '[DONE]') continue;
          
          try {
            const parsed = JSON.parse(data);
            if (parsed.candidates?.[0]?.content?.parts?.[0]?.text) {
              yield parsed.candidates[0].content.parts[0].text;
            }
          } catch (e) {
            console.warn('Failed to parse streaming chunk:', e);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

export { USE_WORKER_PROXY, WORKER_ENDPOINT, PRODUCTION_HOSTNAMES, proxyRequest, parseStreamingResponse };
