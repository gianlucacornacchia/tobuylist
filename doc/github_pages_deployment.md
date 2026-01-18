# GitHub Pages Deployment Guide

## ✅ Setup Complete

I've configured your app for GitHub Pages deployment:

1. ✅ Added `base: '/tobuylist/'` to [vite.config.ts](file:///c:/my/projects/tobuy-list/vite.config.ts)
2. ✅ Added `deploy` script to [package.json](file:///c:/my/projects/tobuy-list/package.json)
3. ✅ Installed `gh-pages` package
4. ✅ Created GitHub Actions workflow ([.github/workflows/deploy.yml](file:///c:/my/projects/tobuy-list/.github/workflows/deploy.yml))

## 🚀 Deploy Steps

### Option 1: Automatic Deployment (Recommended)

1. **Enable GitHub Pages in your repo:**
   - Go to: https://github.com/gianlucacornacchia/tobuylist/settings/pages
   - Under "Build and deployment":
     - **Source:** Select "GitHub Actions"
   - Click "Save"

2. **Push your changes:**
   ```bash
   git add .
   git commit -m "Configure GitHub Pages deployment"
   git push origin main
   ```

3. **Wait for deployment** (1-2 minutes)
   - Check progress: https://github.com/gianlucacornacchia/tobuylist/actions

4. **Access your app:**
   - URL: **https://gianlucacornacchia.github.io/tobuylist/**

### Option 2: Manual Deployment

Run this command:
```bash
npm run deploy
```

Then enable GitHub Pages:
- Go to repo settings → Pages
- Source: "Deploy from a branch"
- Branch: `gh-pages` / `root`

## 📱 Mobile Access

Once deployed, you can:
1. Open the URL on your phone: `https://gianlucacornacchia.github.io/tobuylist/`
2. Add to home screen for PWA experience
3. Works offline after first visit!

## 🔄 Future Updates

Every time you push to `main`, the app auto-deploys via GitHub Actions.

Or manually deploy anytime:
```bash
npm run deploy
```

## ⚠️ Important Notes

- First deployment takes 2-5 minutes
- The app will be public (anyone with the link can access)
- All data is stored locally in the browser (privacy-safe)
- HTTPS is automatic (required for geolocation)

## 🎉 Next Steps

1. Push the changes
2. Enable GitHub Pages in repo settings
3. Wait for deployment
4. Open the URL on your mobile!

Your app will be live at:
**https://gianlucacornacchia.github.io/tobuylist/**
