# Architecture Overview

This document describes the technical architecture of the Instinct Platform v2.1.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                    User's Browser                               │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │              React/Vite SPA                            │   │
│  │                                                         │   │
│  │  • KATIA Chat Interface                               │   │
│  │  • Research Paper Viewer                              │   │
│  │  • AI-Powered Analysis Tools                          │   │
│  │  • Thermodynamic Monitoring                           │   │
│  │                                                         │   │
│  └─────────────────┬───────────────────────────────────────┘   │
│                    │                                            │
└────────────────────┼────────────────────────────────────────────┘
                     │
                     │ HTTPS
                     │
         ┌───────────▼──────────────┐
         │                          │
         │   GitHub Pages           │
         │                          │
         │ research.genesis         │
         │ conductor.ai             │
         │                          │
         │ • Static HTML/JS/CSS     │
         │ • CDN Distribution       │
         │ • HTTPS Enabled          │
         │ • Custom Domain          │
         │                          │
         └──────────────────────────┘
                     
                     
         ┌───────────────────────────┐
         │                           │
         │   Local Development       │
         │                           │
         │ • Direct API Calls        │───┐
         │ • API Key from .env.local │   │
         │ • Hot Module Reload       │   │
         │                           │   │
         └───────────────────────────┘   │
                                         │
                     ┌───────────────────┘
                     │
                     │ API Calls
                     │
         ┌───────────▼──────────────┐
         │                          │
         │ Cloudflare Worker        │
         │ (Production Only)        │
         │                          │
         │ • API Proxy              │
         │ • Rate Limiting          │
         │ • CORS Handling          │
         │ • Secure Key Storage     │
         │                          │
         └──────────┬───────────────┘
                    │
                    │ Authenticated
                    │ API Calls
                    │
         ┌──────────▼───────────────┐
         │                          │
         │   Google Gemini API      │
         │                          │
         │ • Gemini 3 Pro Preview   │
         │ • Gemini 2.5 Flash       │
         │ • Gemini Flash Lite      │
         │ • Search Grounding       │
         │                          │
         └──────────────────────────┘
```

## Components

### 1. Frontend Application (React/Vite)

**Technology Stack**:
- React 19.2.0
- Vite 6.2.0
- TypeScript 5.8.2
- Tailwind CSS (via CDN)
- Google GenAI SDK 1.30.0

**Key Features**:
- Single Page Application (SPA)
- Server-Side Rendering (SSR) not required
- CDN-based dependencies for faster loading
- Mobile-responsive design
- Real-time AI interactions

**Build Output**:
- Location: `docs/` directory
- Format: Static HTML, CSS, JavaScript
- Deployment: GitHub Pages

### 2. GitHub Pages Hosting

**Configuration**:
- Repository: `igor-holt/Instinctv2.1`
- Branch: `main`
- Source: GitHub Actions
- Custom Domain: `research.genesisconductor.ai`

**Features**:
- Automatic HTTPS
- CDN distribution via GitHub's infrastructure
- Custom domain support
- Zero server maintenance

**Build Process**:
```yaml
Trigger: Push to main branch
↓
GitHub Actions Workflow
↓
Install Node.js & Dependencies
↓
Build React App (npm run build)
↓
Copy Static Assets
↓
Upload to GitHub Pages
↓
Deploy (Live in ~2 minutes)
```

### 3. Cloudflare Worker (API Proxy)

**Purpose**:
- Secure API key storage
- Proxy requests to Gemini API
- CORS handling
- Rate limiting

**Configuration**:
- Runtime: Cloudflare Workers
- Language: JavaScript (ES Modules)
- Secrets: Managed via Wrangler CLI
- Deployment: `wrangler deploy`

**Request Flow**:
```
Client (Browser)
    ↓ POST /
    ↓ Body: { endpoint, method, body, stream }
    ↓
Worker
    ↓ Validate Request
    ↓ Check Rate Limit
    ↓ Add API Key
    ↓
Gemini API
    ↓ Process Request
    ↓ Return Response
    ↓
Worker
    ↓ Add CORS Headers
    ↓ Forward Response
    ↓
Client (Browser)
```

### 4. Google Gemini API

**Models Used**:

1. **Gemini 3 Pro Preview**
   - Purpose: Complex reasoning, chat
   - Features: Thinking budget, high context
   - Fallback: Gemini 2.5 Flash

2. **Gemini 2.5 Flash**
   - Purpose: Fast responses, analysis
   - Features: Search grounding, lower cost
   - Use Cases: Research, web search

3. **Gemini 2.5 Flash Lite**
   - Purpose: Simple classification
   - Features: Very fast, JSON mode
   - Use Cases: Task routing, quick analysis

4. **Gemini 2.5 Flash Image**
   - Purpose: Image understanding/editing
   - Features: Vision capabilities
   - Use Cases: Image analysis

## Data Flow

### Chat Message Flow

```
1. User types message in KATIA interface
   ↓
2. Frontend captures message and history
   ↓
3. Decision Point: Production or Development?
   ├─ Development: Direct API call with local key
   └─ Production: POST to Cloudflare Worker
      ↓
4. Worker validates and proxies to Gemini
   ↓
5. Gemini processes with thinking budget
   ↓
6. Streaming response chunks flow back
   ↓
7. Frontend displays chunks in real-time
```

### Section Analysis Flow

```
1. User clicks "Analyze" on research section
   ↓
2. Frontend sends section text
   ↓
3. Gemini Pro analyzes with specialized prompt
   ↓
4. Returns 3 bullet points:
   - Thermodynamic Impact
   - Failure Mode
   - Optimization Gain
   ↓
5. Display in modal overlay
```

## Security Architecture

### Development Environment

```
Developer Machine
    ↓
.env.local (git-ignored)
    ↓
GEMINI_API_KEY
    ↓
Direct API Calls (for testing)
```

**Security Measures**:
- API keys never committed to git
- `.env.local` in `.gitignore`
- Local keys only used in development

### Production Environment

```
Cloudflare Dashboard
    ↓
Worker Secrets (encrypted)
    ↓
GEMINI_API_KEY (secure storage)
    ↓
Worker Runtime (isolated)
    ↓
API Calls (authenticated)
```

**Security Measures**:
1. **API Key Security**
   - Stored as Cloudflare secret
   - Never exposed to client
   - Encrypted at rest

2. **CORS Protection**
   - Only allows `research.genesisconductor.ai`
   - Rejects unauthorized origins
   - Preflight request handling

3. **Rate Limiting**
   - 60 requests per minute per IP
   - Protects against abuse
   - Returns 429 on limit exceeded

4. **Request Validation**
   - Validates request structure
   - Sanitizes inputs
   - Rejects malformed requests

## Deployment Pipeline

### Continuous Deployment

```
Developer
    ↓
git commit & push to main
    ↓
GitHub Actions Triggered
    ↓
┌─────────────────────────┐
│  1. Checkout Code       │
│  2. Setup Node.js       │
│  3. Install Dependencies│
│  4. Build Application   │
│  5. Copy Static Files   │
│  6. Upload Artifact     │
│  7. Deploy to Pages     │
└─────────────────────────┘
    ↓
Live Site Updated
(~2-3 minutes total)
```

### Worker Deployment

```
Developer
    ↓
cd workers/
    ↓
wrangler deploy
    ↓
Cloudflare Edge Network
    ↓
Live in <1 second
```

## Performance Characteristics

### Frontend

- **Initial Load**: ~200-300ms
  - Static HTML from GitHub CDN
  - CSS loaded from Tailwind CDN
  - React from AI Studio CDN

- **Time to Interactive**: ~500ms
  - Minimal JavaScript bundle
  - No server-side processing

- **Navigation**: Instant
  - Client-side routing
  - No page reloads

### API Calls

- **Chat Stream**: 50-200ms first token
  - Worker adds <10ms latency
  - Gemini API response time varies

- **Analysis**: 1-3 seconds
  - Depends on text length
  - Pro model with thinking budget

- **Classification**: 200-500ms
  - Flash Lite for speed
  - JSON mode for structured output

### Caching

- **Static Assets**: Cached by GitHub CDN
- **API Responses**: Not cached (real-time)
- **Worker**: Edge-cached globally

## Scalability

### Frontend
- **Capacity**: Unlimited
- **CDN**: GitHub's global CDN
- **Cost**: Free (within GitHub limits)

### Worker
- **Free Tier**: 100,000 requests/day
- **Paid**: Unlimited (based on usage)
- **Global**: Deployed to Cloudflare edge
- **Latency**: <50ms worldwide

### API
- **Gemini**: Rate limited by API quota
- **Tokens**: Based on Google's pricing
- **Fallback**: Flash model on Pro exhaustion

## Monitoring & Observability

### Frontend
- Browser DevTools for debugging
- Console logging for errors
- No built-in analytics (can add)

### Worker
- Cloudflare Dashboard metrics
- Real-time logs: `wrangler tail`
- Request count, error rate, CPU time

### API
- Gemini API usage tracked in Google Cloud
- Model switching logged to console
- Error messages displayed to users

## Disaster Recovery

### Frontend Outage
- **GitHub Pages down**: Wait for GitHub
- **Custom domain issue**: Use github.io URL
- **Build failure**: Roll back commit

### Worker Outage
- **Worker down**: Cloudflare SLA 99.99%
- **API key exposed**: Rotate immediately
- **Rate limit hit**: Increase limit or upgrade

### API Outage
- **Gemini down**: Automatic Flash fallback
- **Quota exceeded**: Model fallback active
- **Network issues**: User sees error message

## Development Workflow

```
1. Clone repository
   ↓
2. npm install
   ↓
3. Create .env.local with API key
   ↓
4. npm run dev
   ↓
5. Make changes (hot reload)
   ↓
6. Test locally
   ↓
7. Commit & push
   ↓
8. Automatic deployment
```

## Technology Choices

### Why Vite?
- Fast build times
- Excellent dev experience
- Simple configuration
- Good TypeScript support

### Why GitHub Pages?
- Free hosting
- Automatic HTTPS
- Custom domain support
- Simple deployment via Actions

### Why Cloudflare Workers?
- Serverless (no server management)
- Global edge network
- Fast cold starts
- Generous free tier

### Why React?
- Component-based architecture
- Large ecosystem
- Excellent for SPAs
- Good TypeScript support

## Future Enhancements

### Potential Improvements

1. **Progressive Web App (PWA)**
   - Add service worker
   - Offline support
   - Install to home screen

2. **Analytics**
   - Add Google Analytics
   - Track user interactions
   - Monitor performance

3. **Authentication**
   - User accounts
   - Personalized experience
   - Usage tracking per user

4. **Advanced Rate Limiting**
   - Use Cloudflare KV
   - Per-user limits
   - Token bucket algorithm

5. **Caching Strategy**
   - Cache common queries
   - Reduce API costs
   - Faster responses

6. **Error Tracking**
   - Sentry integration
   - Detailed error logs
   - User feedback system

## Conclusion

This architecture provides:
- ✅ Secure API key management
- ✅ Global CDN distribution
- ✅ Automatic deployments
- ✅ Zero server maintenance
- ✅ Scalable infrastructure
- ✅ Cost-effective hosting

The combination of GitHub Pages for static hosting and Cloudflare Workers for API proxying creates a modern, secure, and performant platform for AI-powered research applications.
