# Deployment Checklist

This checklist ensures all components are properly configured for production deployment.

## 📋 Pre-Deployment Checklist

### 1. Repository Setup

- [x] Repository created on GitHub
- [ ] Repository settings configured
  - [ ] GitHub Pages enabled
  - [ ] Source set to "GitHub Actions"
  - [ ] Custom domain added (if using): `research.genesisconductor.ai`

### 2. DNS Configuration

- [ ] DNS records configured for custom domain
  - [ ] CNAME record: `research` → `igor-holt.github.io`
  - OR
  - [ ] A records pointing to GitHub Pages IPs
  - [ ] AAAA records for IPv6 (optional but recommended)
- [ ] DNS propagation verified (can take 24-48 hours)
  - Check with: `nslookup research.genesisconductor.ai`

### 3. Environment Variables

#### Local Development
- [ ] `.env.local` created
- [ ] `GEMINI_API_KEY` set in `.env.local`
- [ ] `.env.local` added to `.gitignore` (already done)

#### Production
- [ ] Cloudflare Worker deployed (see below)
- [ ] Worker endpoint URL noted
- [ ] No secrets in repository

### 4. Cloudflare Worker Setup

- [ ] Cloudflare account created
- [ ] Wrangler CLI installed: `npm install -g wrangler`
- [ ] Logged into Cloudflare: `wrangler login`
- [ ] Account ID added to `wrangler.toml`
- [ ] API key set as secret: `wrangler secret put GEMINI_API_KEY`
- [ ] Worker deployed: `wrangler deploy`
- [ ] Worker URL noted (format: `https://instinct-gemini-proxy.*.workers.dev`)
- [ ] Worker tested with curl/Postman

### 5. Frontend Configuration

- [ ] `vite.config.ts` reviewed
  - [ ] `base: '/'` for custom domain
  - [ ] `outDir: 'docs'` for GitHub Pages
- [ ] `CNAME` file contains correct domain
- [ ] `.nojekyll` file exists (bypasses Jekyll processing)
- [ ] `public/404.html` exists for SPA routing

### 6. GitHub Actions

- [ ] `.github/workflows/deploy.yml` exists
- [ ] Workflow permissions configured correctly
- [ ] Workflow triggers on `main` branch push
- [ ] Workflow copies CNAME and .nojekyll to docs/

### 7. Build Verification

- [ ] Local build succeeds: `npm run build`
- [ ] `docs/` folder contains:
  - [ ] `index.html`
  - [ ] `404.html`
- [ ] `docs/` will contain CNAME and .nojekyll after workflow runs

## 🚀 Deployment Steps

### Step 1: Deploy Cloudflare Worker

```bash
cd workers
wrangler login
wrangler secret put GEMINI_API_KEY
wrangler deploy
```

Note the worker URL from the deployment output.

### Step 2: Update Frontend (if using worker in dev)

If you want to test the worker locally, create `.env.local`:
```env
GEMINI_API_KEY=your_key_for_local_dev
WORKER_ENDPOINT=https://your-worker.workers.dev
```

### Step 3: Push to Main Branch

```bash
git checkout main
git merge your-feature-branch
git push origin main
```

This triggers the GitHub Actions workflow.

### Step 4: Monitor Deployment

1. Go to your repository on GitHub
2. Click on "Actions" tab
3. Watch the workflow run
4. Verify it completes successfully

### Step 5: Verify Deployment

- [ ] Visit `https://igor-holt.github.io/Instinctv2.1/` (if using repo path)
- [ ] Visit `https://research.genesisconductor.ai` (if using custom domain)
- [ ] Check that the site loads correctly
- [ ] Test navigation between pages
- [ ] Verify 404 page redirects work

### Step 6: Test Functionality

**Without Worker (Local API Key)**:
- [ ] Can access the site
- [ ] UI renders correctly
- [ ] Navigation works
- [ ] Shows message about worker configuration

**With Worker (Production)**:
- [ ] Update `WORKER_ENDPOINT` in build environment
- [ ] Rebuild and redeploy
- [ ] Test KATIA chat functionality
- [ ] Test section analysis
- [ ] Test other AI features
- [ ] Verify no API keys in browser dev tools

## 🔧 Post-Deployment Configuration

### Update Worker Endpoint for Production

Option 1: Environment variable in GitHub Actions
```yaml
# In .github/workflows/deploy.yml, add:
- name: Build
  run: npm run build
  env:
    WORKER_ENDPOINT: ${{ secrets.WORKER_ENDPOINT }}
```

Then add the secret:
1. Go to repository Settings
2. Secrets and variables → Actions
3. Add new secret: `WORKER_ENDPOINT`
4. Value: Your worker URL

Option 2: Hardcode for production (not recommended)
```typescript
// In geminiService.ts
const workerEndpoint = process.env.WORKER_ENDPOINT || 'https://your-worker.workers.dev';
```

### Enable HTTPS

- [ ] HTTPS automatically enabled by GitHub Pages
- [ ] Cloudflare Worker uses HTTPS by default
- [ ] Verify all resources load over HTTPS

### Configure Custom Domain SSL

- [ ] GitHub Pages automatically provisions SSL for custom domains
- [ ] Wait for SSL certificate to be issued (can take a few minutes)
- [ ] Verify HTTPS works on custom domain

## 🧪 Testing Checklist

### Local Development
- [ ] `npm install` works
- [ ] `npm run dev` starts dev server
- [ ] Site loads on localhost:3000
- [ ] Hot reload works
- [ ] API calls work with local key

### Production Build
- [ ] `npm run build` succeeds
- [ ] No build errors or warnings
- [ ] `docs/` folder created
- [ ] All assets in docs/ folder

### Production Site
- [ ] Site accessible at production URL
- [ ] All pages load
- [ ] Navigation works
- [ ] Images load correctly
- [ ] External links work
- [ ] API integration works (with worker)
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Works in different browsers

## 🐛 Troubleshooting

### Build Fails
- Check Node.js version (requires 18+)
- Run `npm install` to ensure dependencies are installed
- Check for TypeScript errors: `npx tsc --noEmit`

### Deployment Fails
- Check GitHub Actions logs
- Verify workflow has correct permissions
- Ensure `docs/` folder is created during build

### Site Not Loading
- Check DNS propagation
- Verify CNAME file contents
- Check GitHub Pages settings
- Wait for GitHub Actions to complete

### API Errors
- Verify worker is deployed
- Check worker logs: `wrangler tail`
- Verify API key is set in worker
- Check CORS settings in worker

### 404 Errors
- Ensure `.nojekyll` file exists
- Check 404.html is in docs folder
- Verify SPA routing code in 404.html

## 📊 Monitoring

### GitHub Actions
- Monitor workflow runs in Actions tab
- Set up notifications for failed builds

### Cloudflare Worker
- View metrics in Cloudflare dashboard
- Monitor request count and error rate
- Check logs with `wrangler tail`

### Analytics (Optional)
Consider adding:
- Google Analytics
- Cloudflare Web Analytics
- Custom analytics solution

## 🔐 Security Checklist

- [ ] No API keys in repository
- [ ] No secrets in frontend code
- [ ] Worker CORS configured correctly
- [ ] Rate limiting enabled in worker
- [ ] HTTPS enforced
- [ ] Dependencies up to date: `npm audit`

## 📝 Documentation

- [ ] README.md updated
- [ ] Deployment process documented
- [ ] Architecture diagram created (optional)
- [ ] API endpoints documented
- [ ] Environment variables documented

## ✅ Success Criteria

Your deployment is successful when:

1. ✅ Site loads at production URL
2. ✅ All pages are accessible
3. ✅ Navigation works correctly
4. ✅ AI features work (with worker)
5. ✅ No console errors
6. ✅ Mobile responsive
7. ✅ HTTPS enabled
8. ✅ DNS properly configured
9. ✅ GitHub Actions deploying automatically
10. ✅ Worker proxying API calls securely

## 🎉 Next Steps

After successful deployment:

1. Share the URL with users
2. Monitor usage and performance
3. Gather feedback
4. Plan future enhancements
5. Keep dependencies updated
6. Monitor costs (Cloudflare and Gemini API)

## 📞 Support

If you encounter issues:

1. Check this deployment checklist
2. Review the main README.md
3. Check workers/README.md for worker-specific issues
4. Review GitHub Actions logs
5. Check Cloudflare Worker logs
6. Open an issue on GitHub

---

**Last Updated**: December 2024
**Version**: 2.1
