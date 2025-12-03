#!/bin/bash

# vLLM Deployment Script for Elective Chooser
# This script sets up vLLM for private LLM deployment

set -e

echo "🚀 Setting up vLLM for Elective Chooser..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if NVIDIA Docker is available (for GPU support)
if ! docker run --rm --gpus all nvidia/cuda:11.0-base nvidia-smi &> /dev/null; then
    echo "⚠️  NVIDIA Docker not detected. vLLM will run on CPU (slower)."
    echo "   For GPU support, install nvidia-docker2"
fi

# Create models directory
mkdir -p models
mkdir -p ssl

# Set up environment variables
if [ ! -f .env.vllm ]; then
    echo "📝 Creating .env.vllm file..."
    cat > .env.vllm << EOF
# vLLM Configuration
VLLM_BASE_URL=http://localhost:8000/v1
VLLM_API_KEY=local-anything
VLLM_MODEL=meta-llama/Meta-Llama-3.1-8B-Instruct

# Hugging Face Token (get from https://huggingface.co/settings/tokens)
HF_TOKEN=your_huggingface_token_here

# Optional: Custom model path
# VLLM_MODEL_PATH=/models/your-custom-model
EOF
    echo "✅ Created .env.vllm file. Please update HF_TOKEN with your Hugging Face token."
fi

# Create nginx configuration for production
cat > nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    upstream vllm_backend {
        server vllm-server:8000;
    }

    server {
        listen 80;
        server_name localhost;

        # Rate limiting
        limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
        limit_req zone=api burst=20 nodelay;

        location / {
            proxy_pass http://vllm_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # Timeout settings
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }
    }
}
EOF

echo "🐳 Starting vLLM server..."
docker-compose -f docker-compose.vllm.yml up -d

echo "⏳ Waiting for vLLM server to start..."
sleep 30

# Test the server
echo "🧪 Testing vLLM server..."
if curl -s http://localhost:8000/v1/models > /dev/null; then
    echo "✅ vLLM server is running successfully!"
    echo "📊 Available models:"
    curl -s http://localhost:8000/v1/models | jq '.data[].id' 2>/dev/null || echo "   (Install jq for better output formatting)"
else
    echo "❌ vLLM server failed to start. Check logs with:"
    echo "   docker-compose -f docker-compose.vllm.yml logs"
fi

echo ""
echo "🎉 vLLM setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update your .env file with:"
echo "   VLLM_BASE_URL=http://localhost:8000/v1"
echo "   VLLM_API_KEY=local-anything"
echo "   VLLM_MODEL=meta-llama/Meta-Llama-3.1-8B-Instruct"
echo ""
echo "2. Test the integration:"
echo "   npm run test:vllm"
echo ""
echo "3. For production deployment, see docs/vllm-production.md"
