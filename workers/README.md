# Cloudflare Worker - Gemini API Proxy

This Cloudflare Worker acts as a secure proxy between the Instinct Platform frontend and Google's Gemini API.

## Purpose

- **Security**: Keeps the Gemini API key secure (never exposed to clients)
- **CORS**: Handles Cross-Origin Resource Sharing for the frontend
- **Rate Limiting**: Implements basic rate limiting per IP address
- **Centralized Control**: Single point for API access management

## Architecture

```
Client Request → Cloudflare Worker → Gemini API
(No API Key)     (API Key Added)      (Authenticated)
```

## Files

- **gemini-proxy.js**: The worker code that handles proxying requests
- **wrangler.toml**: Cloudflare Worker configuration file
- **.dev.vars**: Local development environment variables (git-ignored)

## Setup Instructions

### Prerequisites

1. A [Cloudflare account](https://dash.cloudflare.com/sign-up)
2. [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) installed
3. A [Gemini API key](https://aistudio.google.com/app/apikey)

### Installation

1. **Install Wrangler globally**
   ```bash
   npm install -g wrangler
   ```

2. **Login to Cloudflare**
   ```bash
   wrangler login
   ```
   
   This will open a browser window to authenticate.

3. **Get your Account ID**
   
   - Visit https://dash.cloudflare.com/
   - Select your account
   - Copy your Account ID from the right sidebar
   
   Or use CLI:
   ```bash
   wrangler whoami
   ```

4. **Update wrangler.toml**
   
   Edit the `wrangler.toml` file and uncomment the account_id line:
   ```toml
   account_id = "your_account_id_here"
   ```

### Deployment

1. **Navigate to the workers directory**
   ```bash
   cd workers
   ```

2. **Set the API Key as a secret**
   ```bash
   wrangler secret put GEMINI_API_KEY
   ```
   
   When prompted, paste your Gemini API key and press Enter.

3. **Deploy the worker**
   ```bash
   wrangler deploy
   ```

4. **Note the deployment URL**
   
   After successful deployment, you'll see output like:
   ```
   Published instinct-gemini-proxy
   https://instinct-gemini-proxy.your-subdomain.workers.dev
   ```
   
   Save this URL - you'll need it for the frontend configuration.

### Local Development

1. **Create a .dev.vars file** (this file is git-ignored)
   ```bash
   echo "GEMINI_API_KEY=your_api_key_here" > .dev.vars
   ```

2. **Start the local dev server**
   ```bash
   wrangler dev
   ```
   
   The worker will be available at `http://localhost:8787`

3. **Test locally**
   ```bash
   curl -X POST http://localhost:8787 \
     -H "Content-Type: application/json" \
     -d '{
       "endpoint": "models",
       "method": "GET"
     }'
   ```

## Configuration

### CORS Settings

The worker is configured to allow requests from:
- `https://research.genesisconductor.io` (production)

To add more domains, edit the `CORS_HEADERS` object in `gemini-proxy.js`:

```javascript
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://your-domain.com',
  // ...
};
```

For multiple domains, you can modify the code to check the origin dynamically:

```javascript
function getCorsHeaders(origin) {
  const allowedOrigins = [
    'https://research.genesisconductor.io',
    'https://your-other-domain.com',
  ];
  
  if (allowedOrigins.includes(origin)) {
    return {
      'Access-Control-Allow-Origin': origin,
      // ... other headers
    };
  }
  
  return {}; // Deny
}
```

### Rate Limiting

The worker implements a simple in-memory rate limiter:
- **Limit**: 60 requests per minute per IP address
- **Scope**: Per worker instance (resets on worker restart)

To adjust the rate limit, edit the `RATE_LIMIT_PER_MINUTE` constant:

```javascript
const RATE_LIMIT_PER_MINUTE = 100; // Increase to 100
```

For production-grade rate limiting, consider using:
- [Cloudflare Rate Limiting](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/)
- [Cloudflare KV](https://developers.cloudflare.com/kv/) for distributed rate limiting
- [Durable Objects](https://developers.cloudflare.com/durable-objects/) for stateful rate limiting

### Custom Domain (Optional)

You can use a custom domain instead of `*.workers.dev`:

1. **Add a route in wrangler.toml**:
   ```toml
   routes = [
     { pattern = "api.research.genesisconductor.io/*", zone_name = "genesisconductor.io" }
   ]
   ```

2. **Add a DNS record** in Cloudflare:
   - Type: CNAME
   - Name: api.research
   - Target: your-worker-name.workers.dev
   - Proxy status: Proxied (orange cloud)

3. **Redeploy**:
   ```bash
   wrangler deploy
   ```

## API Usage

The worker expects POST requests with the following JSON structure:

```json
{
  "endpoint": "models/gemini-2.5-flash:generateContent",
  "method": "POST",
  "body": {
    "contents": "Your prompt here"
  },
  "stream": false
}
```

### Example Request

```javascript
const response = await fetch('https://your-worker.workers.dev', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    endpoint: 'models/gemini-2.5-flash:generateContent',
    method: 'POST',
    body: {
      contents: {
        parts: [{ text: 'Hello, Gemini!' }]
      }
    }
  })
});

const data = await response.json();
console.log(data);
```

### Streaming Support

For streaming responses:

```javascript
const response = await fetch('https://your-worker.workers.dev', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    endpoint: 'models/gemini-2.5-flash:streamGenerateContent',
    method: 'POST',
    body: {
      contents: {
        parts: [{ text: 'Tell me a story' }]
      }
    },
    stream: true
  })
});

const reader = response.body.getReader();
// Process stream...
```

## Monitoring

### View Logs

```bash
wrangler tail
```

This shows real-time logs from your deployed worker.

### Metrics

View metrics in the Cloudflare dashboard:
1. Go to Workers & Pages
2. Select your worker
3. View the Metrics tab

Metrics include:
- Request count
- Error rate
- CPU time
- Duration

## Security Best Practices

1. **Never expose the API key**
   - Always use `wrangler secret put` for sensitive data
   - Never commit secrets to git

2. **Implement rate limiting**
   - The included rate limiter is basic
   - Consider more robust solutions for production

3. **Validate requests**
   - The worker validates request structure
   - Add additional validation as needed

4. **Monitor usage**
   - Regularly check logs and metrics
   - Set up alerts for unusual patterns

5. **CORS configuration**
   - Only allow your production domain(s)
   - Don't use wildcard (`*`) in production

## Troubleshooting

### "Error: Not authorized" during deployment

- Ensure you're logged in: `wrangler login`
- Check your account ID is correct in `wrangler.toml`

### "API key not configured" in responses

- The secret wasn't set properly
- Run: `wrangler secret put GEMINI_API_KEY`
- Redeploy: `wrangler deploy`

### CORS errors in browser

- Check the allowed origin matches exactly (including protocol and port)
- Ensure the worker is deployed (not just dev mode)
- Check browser dev tools Network tab for preflight requests

### Rate limit errors

- Increase `RATE_LIMIT_PER_MINUTE` if needed
- Consider implementing a more sophisticated rate limiting solution
- Check if multiple IPs are sharing the same address (NAT/proxy)

## Costs

Cloudflare Workers free tier includes:
- 100,000 requests per day
- 10ms CPU time per request

For higher usage, see [Cloudflare Workers Pricing](https://developers.cloudflare.com/workers/platform/pricing/).

The Gemini API has its own pricing - check [Google AI pricing](https://ai.google.dev/pricing) for details.

## Updates

To update the worker after making changes:

```bash
wrangler deploy
```

Changes are deployed immediately with zero downtime.

## Additional Resources

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Reference](https://developers.cloudflare.com/workers/wrangler/commands/)
- [Google Gemini API Documentation](https://ai.google.dev/docs)
- [Workers Examples](https://developers.cloudflare.com/workers/examples/)
