const fs = require('fs');
const path = require('path');

// Build script specifically for Cloudflare Pages
// This script builds the app and then copies only the necessary files

async function buildForCloudflare() {
  console.log('🚀 Building for Cloudflare Pages...');
  
  // Run the normal build
  const { execSync } = require('child_process');
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('✅ Build completed');
  
  // Create out directory for Cloudflare Pages
  const outDir = path.join(__dirname, 'out');
  if (fs.existsSync(outDir)) {
    fs.rmSync(outDir, { recursive: true });
  }
  fs.mkdirSync(outDir, { recursive: true });
  
  // Copy static files
  const staticDir = path.join(__dirname, '.next', 'static');
  const outStaticDir = path.join(outDir, '_next', 'static');
  
  if (fs.existsSync(staticDir)) {
    fs.mkdirSync(outStaticDir, { recursive: true });
    copyDir(staticDir, outStaticDir);
    console.log('📁 Copied static files');
  }
  
  // Copy HTML files
  const htmlFiles = [
    'index.html',
    'login.html',
    'signup.html',
    'setprofile.html',
    'chatbot.html',
    'admin.html',
    '404.html'
  ];
  
  for (const htmlFile of htmlFiles) {
    const srcPath = path.join(__dirname, '.next', 'server', 'app', htmlFile.replace('.html', ''));
    const destPath = path.join(outDir, htmlFile);
    
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath);
      console.log(`📄 Copied ${htmlFile}`);
    }
  }
  
  // Create a simple index.html if it doesn't exist
  const indexPath = path.join(outDir, 'index.html');
  if (!fs.existsSync(indexPath)) {
    const defaultHtml = `<!DOCTYPE html>
<html>
<head>
  <title>Elective Chooser</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
  <div id="__next"></div>
  <script src="/_next/static/chunks/webpack.js"></script>
  <script src="/_next/static/chunks/main.js"></script>
</body>
</html>`;
    fs.writeFileSync(indexPath, defaultHtml);
    console.log('📄 Created default index.html');
  }
  
  console.log('🎉 Cloudflare Pages build completed!');
  console.log(`📁 Output directory: ${outDir}`);
}

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

buildForCloudflare().catch(console.error);
