# Deployment Guide for MediParse.AI

This guide provides detailed instructions for deploying MediParse.AI on various platforms.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Build Commands](#build-commands)
- [Vercel Deployment](#vercel-deployment)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

- ✅ Node.js v18 or higher
- ✅ npm (comes with Node.js)
- ✅ A Google Gemini API Key from [Google AI Studio](https://aistudio.google.com/)
- ✅ A [Vercel](https://vercel.com) account (free tier available)

---

## Build Commands

| Command | Description | When to Use |
| :--- | :--- | :--- |
| `npm install` | Installs all project dependencies | First-time setup or after updating dependencies |
| `npm run build` | Compiles TypeScript and builds production bundle | Before deployment or to test production build |
| `npm run dev` | Starts development server with hot reload | Local development |
| `npm run preview` | Serves the production build locally | Testing production build before deployment |
| `npm run lint` | Runs ESLint to check code quality | Before committing changes |

### Build Output

Running `npm run build` will:
1. Compile TypeScript files using `tsc -b`
2. Bundle the application with Vite
3. Output optimized files to the `dist/` directory

```
dist/
├── assets/
│   ├── index-[hash].js      # Main JavaScript bundle
│   └── index-[hash].css     # Main CSS bundle
├── index.html               # Entry HTML file
└── [other static assets]
```

---

## Vercel Deployment

### Method 1: One-Click Deploy (Recommended)

Click the button below to deploy instantly:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Suvam-paul145/Medical-Doccument-Extraction&env=GEMINI_API_KEY&envDescription=Your%20Google%20Gemini%20API%20Key&project-name=mediparse-ai&repository-name=mediparse-ai)

### Method 2: Vercel Dashboard

1. **Sign in to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub, GitLab, or Bitbucket

2. **Import Project**
   - Click **"Add New..."** → **"Project"**
   - Find and select `Medical-Doccument-Extraction`
   - Click **"Import"**

3. **Configure Project**

   Vercel will auto-detect the Vite framework. Verify these settings:

   | Setting | Value |
   | :--- | :--- |
   | **Framework Preset** | Vite |
   | **Root Directory** | `./` (default) |
   | **Build Command** | `npm run build` |
   | **Output Directory** | `dist` |
   | **Install Command** | `npm install` |

4. **Set Environment Variables**

   Under "Environment Variables", add:
   
   | Key | Value | Environment |
   | :--- | :--- | :--- |
   | `GEMINI_API_KEY` | Your API key | Production, Preview, Development |

5. **Deploy**
   - Click **"Deploy"**
   - Wait for the build to complete (usually 1-2 minutes)
   - Your app will be available at `https://[project-name].vercel.app`

### Method 3: Vercel CLI

For developers who prefer the command line:

```bash
# Step 1: Install Vercel CLI
npm install -g vercel

# Step 2: Login to Vercel
vercel login

# Step 3: Navigate to your project
cd Medical-Doccument-Extraction

# Step 4: Deploy to preview
vercel

# Step 5: Deploy to production
vercel --prod
```

During `vercel` command, you'll be prompted:
- **Set up and deploy?** → `Y`
- **Which scope?** → Select your account
- **Link to existing project?** → `N` (for first deploy)
- **Project name?** → `mediparse-ai` (or your preferred name)
- **Directory with code?** → `./`
- **Override settings?** → `N`

### Method 4: Git Integration (Automatic Deploys)

Once connected to Vercel:
- Every push to `main` → Production deployment
- Every push to other branches → Preview deployment
- Every pull request → Preview deployment with unique URL

---

## Environment Variables

### Required Variables

| Variable | Description | Example |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | Your Google Gemini API key | `AIzaSy...` |

### Getting a Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click **"Get API key"**
4. Create a new API key or select an existing project
5. Copy the key and add it to Vercel environment variables

### Security Notes

⚠️ **Important**: The `GEMINI_API_KEY` environment variable is exposed to the client-side bundle via the `envPrefix` configuration in `vite.config.ts`. Never store other sensitive backend secrets without the proper security configuration.

---

## Troubleshooting

### Build Fails

**Error: TypeScript compilation errors**
```bash
# Check for TypeScript errors locally
npm run build
```

**Error: Missing dependencies**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Deployment Issues

**App shows blank page**
- Check browser console for errors
- Verify `GEMINI_API_KEY` is set correctly
- Ensure the API key has proper permissions

**API calls fail**
- Verify the Gemini API key is valid
- Check if the API key has billing enabled (if required)
- Ensure CORS settings allow requests from your Vercel domain

### Environment Variable Issues

**Variables not accessible**
- Make sure the `GEMINI_API_KEY` variable is configured correctly in Vercel
- Redeploy after adding new variables
- Check the correct environment (Production/Preview/Development)

---

## Post-Deployment Checklist

After successful deployment:

- [ ] Test the main functionality (upload an image)
- [ ] Verify AI extraction works with your API key
- [ ] Test voice assistant features
- [ ] Check mobile responsiveness
- [ ] Set up a custom domain (optional)
- [ ] Configure analytics (optional)

---

## Custom Domain Setup

To use a custom domain on Vercel:

1. Go to your project settings
2. Click **"Domains"**
3. Add your custom domain
4. Configure DNS as instructed by Vercel
5. Wait for SSL certificate provisioning

---

## Need Help?

- 📖 [Vercel Documentation](https://vercel.com/docs)
- 🐛 [Open an Issue](https://github.com/Suvam-paul145/Medical-Doccument-Extraction/issues)
- 💬 [Vite Documentation](https://vitejs.dev/guide/)
