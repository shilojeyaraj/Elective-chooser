#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Waterloo Elective Chooser...\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env.local file...');
  const envExample = fs.readFileSync(path.join(process.cwd(), 'env.example'), 'utf8');
  fs.writeFileSync(envPath, envExample);
  console.log('✅ Created .env.local - Please fill in your API keys\n');
} else {
  console.log('✅ .env.local already exists\n');
}

// Check if node_modules exists
const nodeModulesPath = path.join(process.cwd(), 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('📦 Installing dependencies...');
  const { execSync } = require('child_process');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencies installed\n');
  } catch (error) {
    console.error('❌ Failed to install dependencies:', error.message);
    process.exit(1);
  }
} else {
  console.log('✅ Dependencies already installed\n');
}

console.log('🎉 Setup complete! Next steps:');
console.log('1. Fill in your API keys in .env.local');
console.log('2. Set up your Supabase database using supabase-schema.sql');
console.log('3. Run: npm run dev');
console.log('4. Visit: http://localhost:3000');
console.log('\n📚 See README.md for detailed instructions');
