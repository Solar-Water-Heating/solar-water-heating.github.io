# swh.github.io

A lightweight Vite React project configured for GitHub Pages hosting at https://swh.github.io/

## 🚀 Quick Start

### Development

Install dependencies:
```bash
npm install
```

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

Build for production:
```bash
npm run build
```

Preview the production build locally:
```bash
npm run preview
```

## 📦 Deployment

Deploy to GitHub Pages:
```bash
npm run deploy
```

This command will:
1. Build the project with `npm run build`
2. Deploy the `dist` folder to the `gh-pages` branch using `gh-pages`

### GitHub Setup

Ensure your repository settings are configured:
1. Go to your repository Settings
2. Navigate to **Pages**
3. Set the source to **Deploy from a branch**
4. Select the `gh-pages` branch as the source
5. Confirm that the custom domain is set to `swh.github.io` (if using custom domain)

## 📁 Project Structure

```
swh.github.io/
├── index.html           # HTML entry point
├── public/              # Static assets
├── src/
│   ├── App.jsx          # Main React component
│   ├── App.css          # Styles
│   ├── main.jsx         # React DOM render
│   └── index.css        # Global styles
├── vite.config.js       # Vite configuration (base: '/')
├── package.json         # Project metadata and scripts
└── eslint.config.js     # ESLint configuration
```

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
- `npm run deploy` - Build and deploy to GitHub Pages

## ✨ Features

- ⚡ **Vite** - Lightning-fast build tool
- ⚙️ **React 19** - Latest React version
- 📱 **GitHub Pages** - Configured for gh-pages deployment
- 🔧 **ESLint** - Code quality enforcement
- 🎨 **Modern CSS** - Basic styling setup

## 📝 Notes

- The base URL is set to `/` in `vite.config.js` for root domain hosting
- The `homepage` field in `package.json` is set to `https://swh.github.io/`
- Make sure to push the code to your GitHub repository before running `npm run deploy`
