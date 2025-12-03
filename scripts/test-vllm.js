#!/usr/bin/env node

// Test script for vLLM integration
const OpenAI = require('openai');

const VLLM_BASE_URL = process.env.VLLM_BASE_URL || 'http://localhost:8000/v1';
const VLLM_API_KEY = process.env.VLLM_API_KEY || 'local-anything';
const VLLM_MODEL = process.env.VLLM_MODEL || 'meta-llama/Meta-Llama-3.1-8B-Instruct';

const client = new OpenAI({
  baseURL: VLLM_BASE_URL,
  apiKey: VLLM_API_KEY,
});

async function testVLLM() {
  console.log('🧪 Testing vLLM Integration...');
  console.log(`📍 Base URL: ${VLLM_BASE_URL}`);
  console.log(`🤖 Model: ${VLLM_MODEL}`);
  console.log('');

  try {
    // Test 1: Health check
    console.log('1️⃣ Testing server health...');
    const modelsResponse = await fetch(`${VLLM_BASE_URL}/models`);
    if (modelsResponse.ok) {
      const models = await modelsResponse.json();
      console.log('✅ Server is healthy');
      console.log(`📋 Available models: ${models.data.map(m => m.id).join(', ')}`);
    } else {
      throw new Error(`Server health check failed: ${modelsResponse.status}`);
    }

    // Test 2: Simple chat completion
    console.log('\n2️⃣ Testing chat completion...');
    const chatResponse = await client.chat.completions.create({
      model: VLLM_MODEL,
      messages: [
        { role: 'system', content: 'You are a helpful assistant for an elective course recommendation system.' },
        { role: 'user', content: 'What are the benefits of taking software engineering electives?' }
      ],
      temperature: 0.2,
      max_tokens: 200,
    });

    console.log('✅ Chat completion successful');
    console.log(`💬 Response: ${chatResponse.choices[0].message.content}`);

    // Test 3: Elective recommendation scenario
    console.log('\n3️⃣ Testing elective recommendation scenario...');
    const recommendationResponse = await client.chat.completions.create({
      model: VLLM_MODEL,
      messages: [
        { 
          role: 'system', 
          content: 'You are an academic advisor helping students choose elective courses. Provide specific, actionable advice based on their interests and career goals.' 
        },
        { 
          role: 'user', 
          content: 'I am a Computer Engineering student interested in AI and machine learning. I want to work in tech startups after graduation. What electives should I consider for my 3A term?' 
        }
      ],
      temperature: 0.3,
      max_tokens: 300,
    });

    console.log('✅ Recommendation scenario successful');
    console.log(`🎯 Recommendation: ${recommendationResponse.choices[0].message.content}`);

    // Test 4: Performance test
    console.log('\n4️⃣ Testing performance...');
    const startTime = Date.now();
    const perfResponse = await client.chat.completions.create({
      model: VLLM_MODEL,
      messages: [
        { role: 'user', content: 'List 3 key skills for software engineers.' }
      ],
      temperature: 0.1,
      max_tokens: 100,
    });
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    console.log('✅ Performance test successful');
    console.log(`⏱️  Response time: ${responseTime}ms`);
    console.log(`📝 Response: ${perfResponse.choices[0].message.content}`);

    console.log('\n🎉 All tests passed! vLLM integration is working correctly.');
    console.log('\n📋 Integration Summary:');
    console.log(`   • Server: ${VLLM_BASE_URL}`);
    console.log(`   • Model: ${VLLM_MODEL}`);
    console.log(`   • Response time: ~${responseTime}ms`);
    console.log(`   • Status: Ready for production`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure vLLM server is running: docker-compose -f docker-compose.vllm.yml ps');
    console.log('2. Check server logs: docker-compose -f docker-compose.vllm.yml logs vllm-server');
    console.log('3. Verify environment variables in .env.vllm');
    console.log('4. Test server directly: curl http://localhost:8000/v1/models');
    process.exit(1);
  }
}

// Run the test
testVLLM();
