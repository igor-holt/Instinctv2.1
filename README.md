# The Instinct Platform v2.1

<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

[![Deploy to GitHub Pages](https://github.com/igor-holt/Instinctv2.1/actions/workflows/deploy.yml/badge.svg)](https://github.com/igor-holt/Instinctv2.1/actions/workflows/deploy.yml)
</div>

An AI-powered research platform exploring thermodynamic computing and "Energentic Intelligence" - where thermodynamic constraints drive AI orchestration.

**Live Site**: [research.genesisconductor.ai](https://research.genesisconductor.ai)

**AI Studio App**: https://ai.studio/apps/drive/1VN-izNTkI4aGIbMRUuT5hMBB3hJ6YR8k

## 🏗️ Architecture

This application uses a secure architecture designed for GitHub Pages hosting:

```
Frontend (GitHub Pages)          Cloudflare Worker           Google Gemini API
   React/Vite App      ------>   Secure API Proxy   ------>  AI Services
research.genesisconductor.ai     (API Key Hidden)            generativelanguage.googleapis.com
```

### Why This Architecture?

1. **Security**: API keys are never exposed to the client - they're stored securely in Cloudflare Workers
2. **Static Hosting**: The frontend is completely static and can be served from GitHub Pages
3. **Rate Limiting**: The worker provides a single point for implementing rate limits
4. **CORS Control**: Properly configured CORS headers protect against unauthorized access

## 🚀 Quick Start (Local Development)

**📖 [Quick Start Guide](./QUICKSTART.md)** - Get running in 5 minutes!

### Prerequisites

- Node.js 18+ 
- npm or yarn
- A Gemini API key (get one at [Google AI Studio](https://aistudio.google.com/app/apikey))

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/igor-holt/Instinctv2.1.git
   cd Instinctv2.1
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🌐 Production Deployment

The application automatically deploys to GitHub Pages when changes are pushed to the `main` branch.

**📋 [Complete Deployment Checklist](./DEPLOYMENT.md)** - Follow this comprehensive guide for deployment

### GitHub Pages Setup

1. **Enable GitHub Pages**
   - Go to your repository settings
   - Navigate to "Pages" section
   - Source: "GitHub Actions"
   - The workflow will automatically build and deploy

2. **Configure Custom Domain (Optional)**
   - In GitHub Pages settings, add your custom domain: `research.genesisconductor.ai`
   - The `CNAME` file is already included in the repository

### DNS Configuration

To use the custom domain `research.genesisconductor.ai`, configure these DNS records:

**Option 1: CNAME Record (Recommended)**
```
Type: CNAME
Name: research
Value: igor-holt.github.io
TTL: 3600
```

**Option 2: A Records**
```
Type: A
Name: research
Value: 185.199.108.153
Value: 185.199.109.153
Value: 185.199.110.153
Value: 185.199.111.153
TTL: 3600
```

Also add AAAA records for IPv6:
```
Type: AAAA
Name: research
Value: 2606:50c0:8000::153
Value: 2606:50c0:8001::153
Value: 2606:50c0:8002::153
Value: 2606:50c0:8003::153
TTL: 3600
```

## 🔐 Cloudflare Worker Setup

The Cloudflare Worker acts as a secure proxy for Gemini API calls.

### Prerequisites

- A Cloudflare account
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) installed

### Deployment Steps

1. **Install Wrangler (if not already installed)**
   ```bash
   npm install -g wrangler
   ```

2. **Login to Cloudflare**
   ```bash
   wrangler login
   ```

3. **Update wrangler.toml**
   
   Edit `wrangler.toml` and add your account ID:
   ```toml
   account_id = "your_cloudflare_account_id"
   ```
   
   Find your account ID at: https://dash.cloudflare.com/

4. **Set the API Key Secret**
   ```bash
   cd workers
   wrangler secret put GEMINI_API_KEY
   ```
   
   When prompted, paste your Gemini API key.

5. **Deploy the Worker**
   ```bash
   wrangler deploy
   ```

6. **Note the Worker URL**
   
   After deployment, you'll get a URL like:
   ```
   https://instinct-gemini-proxy.your-subdomain.workers.dev
   ```

7. **Update Frontend Configuration**
   
   For production builds, set the worker endpoint:
   ```bash
   # In your deployment environment or GitHub Actions
   WORKER_ENDPOINT=https://instinct-gemini-proxy.your-subdomain.workers.dev
   ```

### Optional: Custom Domain for Worker

You can set up a custom subdomain for your worker:

1. **Add a route in wrangler.toml**:
   ```toml
   routes = [
     { pattern = "api.research.genesisconductor.ai/*", zone_name = "genesisconductor.ai" }
   ]
   ```

2. **Update the DNS** with a CNAME record pointing to your worker

3. **Update CORS in the worker** to allow your custom domain

## 📦 Build and Deploy Manually

If you need to build and deploy manually:

```bash
# Build the application
npm run build

# The output will be in the docs/ folder
# You can deploy this folder to any static hosting service
```

## 🧪 Testing

The application includes several AI-powered features:

1. **KATIA Chat**: Interactive AI assistant with Tree-of-Thought reasoning
2. **Section Analysis**: Technical analysis of research excerpts
3. **Task Energy Classification**: Complexity and energy estimation
4. **Image Editing**: AI-powered image manipulation
5. **Web Search**: Research with grounding sources

### Local Testing (Development Mode)

- Uses direct Gemini API calls with your local API key
- Full functionality available
- API key from `.env.local`

### Production Testing

- Uses Cloudflare Worker proxy
- API key is never exposed to the client
- Requires worker to be deployed and configured

## 🔧 Configuration Files

### Key Files

- **vite.config.ts**: Vite build configuration with GitHub Pages settings
- **wrangler.toml**: Cloudflare Worker configuration
- **.github/workflows/deploy.yml**: GitHub Actions deployment workflow
- **CNAME**: Custom domain configuration
- **.nojekyll**: Bypasses Jekyll processing on GitHub Pages

### Environment Variables

**Local Development (.env.local)**:
```env
GEMINI_API_KEY=your_api_key_here
```

**Production (GitHub Actions)**:
```env
WORKER_ENDPOINT=https://your-worker.workers.dev
```

## 📚 Technical Modules

The platform includes three core research papers:

1. **The Landauer Context** (Thermodynamics)
   - Zenodo ID: 14501698
   - Explores thermodynamic constraints in AI systems

2. **Beyond Retry** (LID-LIFT)
   - Zenodo ID: 14501706
   - Latency-aware orchestration strategies

3. **Dissonance Eviction** (Memory)
   - Zenodo ID: 14502099
   - Entropy-driven memory management

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is part of the Genesis Conductor AI research initiative.

## 👤 Author

**Igor Holt** - Lead Architect

## 🔗 Links

- [Live Application](https://research.genesisconductor.ai)
- [AI Studio](https://ai.studio/apps/drive/1VN-izNTkI4aGIbMRUuT5hMBB3hJ6YR8k)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [GitHub Pages Docs](https://docs.github.com/en/pages)
- [Google Gemini API](https://ai.google.dev/)

## 🐛 Troubleshooting

### "API_KEY_MISSING" error in development

- Ensure `.env.local` exists with your `GEMINI_API_KEY`
- Restart the dev server after creating the env file

### "Worker Endpoint Missing" in production

- Deploy the Cloudflare Worker
- Set the `WORKER_ENDPOINT` environment variable
- Rebuild and redeploy the frontend

### 404 errors on page refresh

- Ensure the `404.html` file is in the `docs/` folder after build
- Check that `.nojekyll` file exists in the docs folder

### Build fails on GitHub Actions

- Check that all dependencies are in `package.json`
- Verify the workflow has proper permissions
- Review the Actions logs for specific errors

## 🛡️ Security

- **Never commit API keys** to the repository
- API keys are stored as Cloudflare secrets
- The worker implements basic rate limiting
- CORS is configured to only allow the production domain

## 📊 Performance

- Static site with instant loading
- CDN-delivered React bundles
- Optimized for mobile devices
- Streaming responses for AI interactions
