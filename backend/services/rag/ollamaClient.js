const axios = require('axios');
const { OLLAMA_HOST, OLLAMA_LLM_MODEL } = require('../../config/ragConfig');

async function listModels() {
  const response = await axios.get(`${OLLAMA_HOST}/api/tags`, { timeout: 5000 });
  return (response.data.models || []).map((m) => m.name);
}

async function generateText(prompt, { stream = false } = {}) {
  const response = await axios.post(
    `${OLLAMA_HOST}/api/generate`,
    { model: OLLAMA_LLM_MODEL, prompt, stream },
    { timeout: 120000 }
  );
  return response.data.response;
}

module.exports = { listModels, generateText };
