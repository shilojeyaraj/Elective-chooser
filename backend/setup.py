#!/usr/bin/env python3
"""
Setup script for Waterloo Elective Chooser
Installs both Node.js and Python dependencies
"""

import os
import sys
import subprocess
import platform
from pathlib import Path

def run_command(command, shell=True):
    """Run a command and return success status"""
    try:
        result = subprocess.run(command, shell=shell, check=True, capture_output=True, text=True)
        print(f"✅ {command}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {command}")
        print(f"Error: {e.stderr}")
        return False

def check_command(command):
    """Check if a command exists"""
    try:
        subprocess.run(f"which {command}" if platform.system() != "Windows" else f"where {command}", 
                      shell=True, check=True, capture_output=True)
        return True
    except subprocess.CalledProcessError:
        return False

def main():
    print("🚀 Setting up Waterloo Elective Chooser...\n")
    
    # Check if we're in the right directory
    if not Path("package.json").exists():
        print("❌ Please run this script from the project root directory")
        sys.exit(1)
    
    # Check for Node.js
    if not check_command("node"):
        print("❌ Node.js is not installed. Please install Node.js from https://nodejs.org/")
        sys.exit(1)
    
    if not check_command("npm"):
        print("❌ npm is not installed. Please install npm")
        sys.exit(1)
    
    print("✅ Node.js and npm found")
    
    # Install Node.js dependencies
    print("\n📦 Installing Node.js dependencies...")
    if not run_command("npm install"):
        print("❌ Failed to install Node.js dependencies")
        sys.exit(1)
    
    # Check for Python
    if not check_command("python") and not check_command("python3"):
        print("❌ Python is not installed. Please install Python from https://python.org/")
        sys.exit(1)
    
    python_cmd = "python3" if check_command("python3") else "python"
    print(f"✅ Python found ({python_cmd})")
    
    # Install Python dependencies
    print("\n🐍 Installing Python dependencies...")
    if not run_command(f"{python_cmd} -m pip install -r requirements.txt"):
        print("❌ Failed to install Python dependencies")
        sys.exit(1)
    
    # Create .env.local if it doesn't exist
    env_file = Path(".env.local")
    if not env_file.exists():
        print("\n📝 Creating .env.local file...")
        env_example = Path("env.example")
        if env_example.exists():
            env_file.write_text(env_example.read_text())
            print("✅ Created .env.local - Please fill in your API keys")
        else:
            print("⚠️  env.example not found, creating basic .env.local")
            env_file.write_text("""# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/elective_chooser

# Web Search API (optional)
TAVILY_API_KEY=your_tavily_api_key
""")
    else:
        print("✅ .env.local already exists")
    
    print("\n🎉 Setup complete! Next steps:")
    print("1. Fill in your API keys in .env.local")
    print("2. Set up your Supabase database using supabase-schema.sql")
    print("3. Run: npm run dev")
    print("4. Visit: http://localhost:3000")
    print("\n📚 See README.md for detailed instructions")
    print("\n🐍 For Python data processing, use:")
    print("   python scripts/data_processor.py upload-courses sample-data/courses.csv")
    print("   python scripts/data_processor.py upload-options sample-data/options.csv")

if __name__ == "__main__":
    main()
