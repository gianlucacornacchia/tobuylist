# Deployment Guide

The ToBuy List PWA is configured for easy deployment to **GitHub Pages**.

## 🔄 Automatic Deployment (GitHub Actions)
The project includes a GitHub Actions workflow that automatically builds and deploys your app whenever you push to the `main` branch.

### Setup Instructions:
1. Go to your repository settings on GitHub.
2. Navigate to **Pages** in the side menu.
3. Under **Build and deployment > Source**, select **GitHub Actions**.
4. Push your changes to the `main` branch.
5. GitHub will automatically run the "Deploy" action.

## 🚀 Manual Deployment
If you prefer to deploy manually from your local machine, the project is equipped with the `gh-pages` package.

1. **Run the deploy command**:
   ```bash
   npm run deploy
   ```
   This command will:
   - Run the TypeScript compiler (`tsc`).
   - Create a production build (`vite build`).
   - Push the contents of the `dist/` folder to the `gh-pages` branch.

2. **Configure GitHub Settings**:
   If using this method, ensure your GitHub Pages settings is set to **Deploy from a branch** and the branch is set to `gh-pages`.

## ⚙️ Configuration Notes

### Base Path
The app is configured with a base path of `/tobuylist/` in `vite.config.ts`. If you rename your repository, you must update this value to match your new repo name.

```typescript
// vite.config.ts
export default defineConfig({
  base: '/your-new-repo-name/',
  // ...
})
```

### HTTPS
GitHub Pages provides HTTPS by default. This is **required** for the browser's Geolocation API and Service Workers (PWA functionality) to work correctly.
