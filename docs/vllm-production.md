# vLLM Production Deployment Guide

This guide covers deploying vLLM for production use with the Elective Chooser application.

## 🏗️ Architecture Options

### Option 1: Single GPU Server (Recommended for Start)
- **Hardware**: 1× RTX 4090, A10, or A100
- **Models**: 7B-13B parameter models
- **Throughput**: 10-50 requests/second
- **Cost**: $500-2000/month

### Option 2: Multi-GPU Server (High Performance)
- **Hardware**: 2-8× GPUs with NVLink
- **Models**: 13B-70B parameter models
- **Throughput**: 50-200 requests/second
- **Cost**: $2000-8000/month

### Option 3: Kubernetes Cluster (Enterprise)
- **Hardware**: Multiple nodes with GPUs
- **Models**: Any size with auto-scaling
- **Throughput**: Unlimited with proper scaling
- **Cost**: Variable based on usage

## 🚀 Quick Production Setup

### 1. Server Requirements
```bash
# Minimum requirements
- GPU: RTX 4090 (24GB) or better
- RAM: 32GB+ system RAM
- Storage: 100GB+ SSD
- OS: Ubuntu 20.04+ or similar

# Recommended for production
- GPU: A100 (80GB) or H100
- RAM: 64GB+ system RAM
- Storage: 500GB+ NVMe SSD
- Network: 10Gbps+
```

### 2. Docker Compose for Production
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  vllm-server:
    image: vllm/vllm-openai:latest
    container_name: vllm-prod
    ports:
      - "8000:8000"
    volumes:
      - /data/models:/models
      - /data/cache:/root/.cache/huggingface
    environment:
      - HF_TOKEN=${HF_TOKEN}
    command: >
      --model meta-llama/Meta-Llama-3.1-8B-Instruct
      --max-model-len 8192
      --gpu-memory-utilization 0.95
      --dtype float16
      --tensor-parallel-size 1
      --host 0.0.0.0
      --port 8000
      --served-model-name meta-llama/Meta-Llama-3.1-8B-Instruct
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all
              capabilities: [gpu]
    restart: unless-stopped
    networks:
      - vllm-network

  nginx:
    image: nginx:alpine
    container_name: vllm-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.prod.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - vllm-server
    restart: unless-stopped
    networks:
      - vllm-network

networks:
  vllm-network:
    driver: bridge
```

### 3. Production Nginx Configuration
```nginx
# nginx.prod.conf
events {
    worker_connections 1024;
}

http {
    upstream vllm_backend {
        server vllm-server:8000;
        keepalive 32;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=chat:10m rate=5r/s;

    server {
        listen 80;
        server_name your-domain.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name your-domain.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;

        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";

        # API endpoints with rate limiting
        location /v1/chat/completions {
            limit_req zone=chat burst=10 nodelay;
            proxy_pass http://vllm_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # Timeout settings
            proxy_connect_timeout 60s;
            proxy_send_timeout 300s;
            proxy_read_timeout 300s;
        }

        location /v1/models {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://vllm_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

## 🔒 Security Best Practices

### 1. Network Security
```bash
# Firewall rules
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw deny 8000/tcp   # Block direct vLLM access
ufw enable
```

### 2. API Authentication
```python
# Add to your application
import jwt
from datetime import datetime, timedelta

def verify_api_key(api_key: str) -> bool:
    # Implement your API key verification logic
    valid_keys = ["your-secure-api-key-1", "your-secure-api-key-2"]
    return api_key in valid_keys

def generate_jwt_token(user_id: str) -> str:
    payload = {
        'user_id': user_id,
        'exp': datetime.utcnow() + timedelta(hours=24)
    }
    return jwt.encode(payload, 'your-secret-key', algorithm='HS256')
```

### 3. Environment Variables
```bash
# .env.prod
VLLM_BASE_URL=https://your-domain.com/v1
VLLM_API_KEY=your-secure-production-key
VLLM_MODEL=meta-llama/Meta-Llama-3.1-8B-Instruct
HF_TOKEN=your-huggingface-token
```

## 📊 Monitoring and Logging

### 1. Health Checks
```bash
#!/bin/bash
# health-check.sh
curl -f http://localhost:8000/v1/models || exit 1
echo "vLLM server is healthy"
```

### 2. Logging Configuration
```yaml
# docker-compose.prod.yml addition
services:
  vllm-server:
    # ... existing config ...
    logging:
      driver: "json-file"
      options:
        max-size: "100m"
        max-file: "3"
```

### 3. Metrics Collection
```python
# Add to your application
import time
import logging

def log_request_metrics(func):
    def wrapper(*args, **kwargs):
        start_time = time.time()
        try:
            result = func(*args, **kwargs)
            duration = time.time() - start_time
            logging.info(f"Request completed in {duration:.2f}s")
            return result
        except Exception as e:
            duration = time.time() - start_time
            logging.error(f"Request failed after {duration:.2f}s: {e}")
            raise
    return wrapper
```

## 🚀 Deployment Commands

### 1. Initial Setup
```bash
# Clone and setup
git clone your-repo
cd elective-chooser
chmod +x scripts/deploy-vllm.sh
./scripts/deploy-vllm.sh
```

### 2. Production Deployment
```bash
# Start production services
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f vllm-server
```

### 3. Updates and Maintenance
```bash
# Update vLLM
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d

# Backup models
tar -czf models-backup-$(date +%Y%m%d).tar.gz /data/models

# Monitor resources
nvidia-smi
htop
```

## 💰 Cost Optimization

### 1. Model Selection
- **7B models**: Best cost/performance ratio
- **13B models**: Better quality, 2x cost
- **70B+ models**: Best quality, 10x cost

### 2. Quantization
```bash
# Use quantized models for better GPU utilization
--quantization awq
--quantization gptq
```

### 3. Auto-scaling
```yaml
# Kubernetes HPA example
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: vllm-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: vllm-server
  minReplicas: 1
  maxReplicas: 5
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

## 🔧 Troubleshooting

### Common Issues
1. **Out of Memory**: Reduce `--gpu-memory-utilization` or use smaller model
2. **Slow Responses**: Check GPU utilization with `nvidia-smi`
3. **Connection Errors**: Verify firewall and network configuration
4. **Model Loading**: Ensure sufficient disk space and valid model path

### Performance Tuning
```bash
# Optimize for throughput
--max-model-len 4096
--gpu-memory-utilization 0.95
--tensor-parallel-size 2

# Optimize for latency
--max-model-len 2048
--gpu-memory-utilization 0.80
--speculative-model draft-model
```
