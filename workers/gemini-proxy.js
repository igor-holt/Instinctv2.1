/**
 * Cloudflare Worker Proxy for Gemini API
 * 
 * This worker acts as a secure proxy between the frontend and Google's Gemini API.
 * The API key is stored securely as a Cloudflare secret and never exposed to the client.
 */

// CORS headers for the custom domain
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://research.genesisconductor.ai',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

// Rate limiting configuration (simple in-memory for single worker)
const RATE_LIMIT_PER_MINUTE = 60;
const rateLimitMap = new Map();

/**
 * Handle CORS preflight requests
 */
function handleOptions() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

/**
 * Simple rate limiting check
 */
function checkRateLimit(ip) {
  const now = Date.now();
  const minute = Math.floor(now / 60000);
  const key = `${ip}:${minute}`;
  
  const count = rateLimitMap.get(key) || 0;
  
  if (count >= RATE_LIMIT_PER_MINUTE) {
    return false;
  }
  
  rateLimitMap.set(key, count + 1);
  
  // Clean up old entries (keep last 2 minutes)
  const prevMinute = minute - 2;
  for (const [k] of rateLimitMap) {
    const entryMinute = parseInt(k.split(':')[1]);
    if (entryMinute < prevMinute) {
      rateLimitMap.delete(k);
    }
  }
  
  return true;
}

/**
 * Proxy request to Gemini API
 */
async function handleProxy(request, env) {
  try {
    // Get client IP for rate limiting
    const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
    
    // Check rate limit
    if (!checkRateLimit(clientIP)) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
        status: 429,
        headers: {
          ...CORS_HEADERS,
          'Content-Type': 'application/json',
        },
      });
    }
    
    // Parse the incoming request
    const requestData = await request.json();
    
    // Validate request structure
    if (!requestData.endpoint || !requestData.method) {
      return new Response(JSON.stringify({ error: 'Invalid request format' }), {
        status: 400,
        headers: {
          ...CORS_HEADERS,
          'Content-Type': 'application/json',
        },
      });
    }
    
    // Get API key from environment secrets
    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500,
        headers: {
          ...CORS_HEADERS,
          'Content-Type': 'application/json',
        },
      });
    }
    
    // Construct the Gemini API URL
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/${requestData.endpoint}`;
    
    // Forward the request to Gemini API
    const geminiResponse = await fetch(geminiUrl, {
      method: requestData.method,
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: requestData.body ? JSON.stringify(requestData.body) : undefined,
    });
    
    // Handle streaming responses
    if (requestData.stream && geminiResponse.body) {
      return new Response(geminiResponse.body, {
        status: geminiResponse.status,
        headers: {
          ...CORS_HEADERS,
          'Content-Type': geminiResponse.headers.get('Content-Type') || 'application/json',
          'Transfer-Encoding': 'chunked',
        },
      });
    }
    
    // Handle regular responses
    const responseData = await geminiResponse.text();
    
    return new Response(responseData, {
      status: geminiResponse.status,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': geminiResponse.headers.get('Content-Type') || 'application/json',
      },
    });
    
  } catch (error) {
    console.error('Proxy error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error', 
      message: error.message 
    }), {
      status: 500,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'application/json',
      },
    });
  }
}

/**
 * Main worker entry point
 */
export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return handleOptions();
    }
    
    // Only allow POST requests
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: {
          ...CORS_HEADERS,
          'Content-Type': 'application/json',
        },
      });
    }
    
    // Handle the proxy request
    return handleProxy(request, env);
  },
};
