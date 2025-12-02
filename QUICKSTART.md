# Quick Start Guide

Get the Instinct Platform running locally in 5 minutes.

## Prerequisites

Before you begin, ensure you have:
- ✅ Node.js 18 or later ([Download](https://nodejs.org/))
- ✅ npm (comes with Node.js)
- ✅ A Gemini API key ([Get one free](https://aistudio.google.com/app/apikey))
- ✅ Git

## 5-Minute Setup

### 1. Clone & Install (2 min)

```bash
# Clone the repository
git clone https://github.com/igor-holt/Instinctv2.1.git
cd Instinctv2.1

# Install dependencies
npm install
```

### 2. Configure API Key (1 min)

```bash
# Copy the example environment file
cp .env.example .env.local

# Edit .env.local and add your API key
# You can use nano, vim, or any text editor
nano .env.local
```

Add your API key:
```env
GEMINI_API_KEY=your_actual_api_key_here
```

**Where to get your API key:**
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key
4. Paste it in `.env.local`

### 3. Start Development Server (30 sec)

```bash
npm run dev
```

You should see:
```
VITE v6.4.1  ready in XXX ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
```

### 4. Open in Browser (30 sec)

Navigate to [http://localhost:3000](http://localhost:3000)

You should see the Instinct Platform landing page!

### 5. Test Features (1 min)

Try these features to verify everything works:

1. **Navigate** - Click "System Synthesis" in the sidebar
2. **KATIA Chat** - Click "KATIA" and send a message
3. **Analysis** - Go to a paper module and click "Analyze" on a section
4. **Research** - Try the "Global Uplink" feature

If you see responses from the AI, you're all set! 🎉

## Common Issues

### "API_KEY_MISSING" Error

**Problem**: The app shows "API_KEY_MISSING"

**Solution**:
1. Check that `.env.local` exists in the project root
2. Check that `GEMINI_API_KEY` is set correctly
3. Restart the dev server: `Ctrl+C` then `npm run dev`

### Port 3000 Already in Use

**Problem**: Error says port 3000 is already in use

**Solution**: Either stop the other process or use a different port:
```bash
PORT=3001 npm run dev
```

### Dependencies Installation Fails

**Problem**: `npm install` fails

**Solution**:
1. Check Node.js version: `node --version` (should be 18+)
2. Clear npm cache: `npm cache clean --force`
3. Delete `node_modules` and `package-lock.json`, then try again:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

### Build Errors

**Problem**: TypeScript or build errors

**Solution**:
1. Ensure you're using TypeScript 5.8+
2. Run type check: `npx tsc --noEmit`
3. Check for missing dependencies

## Project Structure

```
Instinctv2.1/
├── .github/workflows/    # GitHub Actions for deployment
├── components/           # React components
├── services/            # API services (Gemini integration)
├── workers/             # Cloudflare Worker proxy
├── public/              # Static assets
├── App.tsx              # Main application component
├── index.tsx            # Application entry point
├── vite.config.ts       # Vite configuration
├── package.json         # Dependencies
└── .env.local           # Your local environment (git-ignored)
```

## Key Files to Know

- **App.tsx** - Main app component with routing
- **services/geminiService.ts** - AI API integration
- **components/** - Individual UI components
- **vite.config.ts** - Build configuration

## Development Tips

### Hot Reload

The dev server supports hot module replacement (HMR):
- Save a file → Changes appear instantly
- No need to refresh the browser

### Console Debugging

Open browser DevTools (F12) to see:
- API call logs
- Error messages
- Component state

### TypeScript

The project uses TypeScript. Your editor should show:
- Type hints
- Auto-completion
- Error detection

Recommended editors:
- VS Code (best support)
- WebStorm
- Sublime Text with LSP

## Making Changes

### Edit the UI

Components are in the `components/` folder:
```bash
# Example: Edit the landing page
nano components/LandingPage.tsx
```

Save and see changes instantly!

### Modify AI Behavior

Edit `services/geminiService.ts`:
```typescript
// Change the system instruction
const KATIA_SYSTEM_INSTRUCTION = `Your custom prompt here...`;
```

### Add New Features

1. Create a component in `components/`
2. Import it in `App.tsx`
3. Add routing logic if needed

## Testing

### Manual Testing

Test these scenarios:
- ✅ Landing page loads
- ✅ Navigation works
- ✅ KATIA chat responds
- ✅ Section analysis works
- ✅ Mobile responsive (resize browser)

### Browser Compatibility

Tested on:
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers

## Building for Production

```bash
# Create production build
npm run build

# Output will be in docs/ folder
ls docs/
```

The build:
- Optimizes code
- Bundles assets
- Outputs to `docs/` for GitHub Pages

## Next Steps

After getting it running locally:

1. **Explore the codebase** - Read through components
2. **Try modifications** - Change colors, text, layouts
3. **Read documentation**:
   - [README.md](./README.md) - Overview
   - [ARCHITECTURE.md](./ARCHITECTURE.md) - Technical details
   - [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide
4. **Deploy your changes** - Push to GitHub

## Getting Help

If you run into issues:

1. Check [DEPLOYMENT.md](./DEPLOYMENT.md) for troubleshooting
2. Check browser console for errors
3. Check terminal for build errors
4. Search existing GitHub issues
5. Open a new issue with details

## Contributing

Ready to contribute?

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Test locally
5. Commit: `git commit -m "Add my feature"`
6. Push: `git push origin feature/my-feature`
7. Open a Pull Request

## Learn More

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Gemini API Docs](https://ai.google.dev/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

## Pro Tips

### Faster Development

```bash
# Keep dev server running in one terminal
npm run dev

# Use another terminal for git commands
git status
git add .
git commit -m "My changes"
```

### Environment Variables

You can have multiple env files:
- `.env.local` - Your local development
- `.env.production` - Production (usually CI/CD)
- `.env.development` - Development defaults

### Vite Config

The `vite.config.ts` controls:
- Build output location
- Port number
- Alias paths
- Environment variables

### Component Organization

Keep components small and focused:
- One component per file
- Extract reusable logic to hooks
- Use TypeScript for props

## Success!

You're now ready to develop on the Instinct Platform! 🚀

Happy coding! If you build something cool, we'd love to see it.
