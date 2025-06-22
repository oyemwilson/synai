import axios from 'axios';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * Makes a request to OpenRouter API with automatic fallback capabilities
 * @param {string} prompt - The prompt to send to the model
 * @param {Object} options - Configuration options
 * @param {string} options.model - Primary model to use (default: google/gemini-2.5-pro-exp-03-25:free)
 * @param {string} options.fallbackModel - Fallback model if primary fails (default: anthropic/claude-3-sonnet)
 * @param {number} options.maxAttempts - Maximum number of attempts (default: 2)
 * @param {number} options.temperature - Model temperature (default: 0.7)
 * @param {number} options.maxTokens - Maximum response tokens (default: 1000)
 * @param {number} options.timeoutMs - Request timeout in milliseconds (default: 30000)
 * @returns {Promise<string>} - The AI response content
 * @throws {Error} - If all attempts fail or validation fails
 */
const callOpenRouter = async (prompt, options = {}) => {
  // Input validation
  if (!prompt || typeof prompt !== 'string') {
    throw new Error('Prompt must be a non-empty string');
  }

  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY environment variable is not set');
  }

  // Configuration with defaults
  const {
    model = "google/gemma-3-4b-it",
    fallbackModel = "anthropic/claude-3-sonnet",
    maxAttempts = 2,
    temperature = 0.7,
    maxTokens = 1000,
    timeoutMs = 30000
  } = options;

  // Define models to try in sequence
  const modelSequence = [model];
  if (fallbackModel && fallbackModel !== model) {
    modelSequence.push(fallbackModel);
  }

  // Limit attempts to available models
  const attempts = Math.min(maxAttempts, modelSequence.length);
  let lastError = null;

  for (let attempt = 0; attempt < attempts; attempt++) {
    const currentModel = modelSequence[attempt % modelSequence.length];
    
    try {
      console.log(`Attempt ${attempt + 1}/${attempts} with model: ${currentModel}`);
      
      const response = await axios.post(
        OPENROUTER_API_URL,
        {
          model: currentModel,
          messages: [{ role: 'user', content: prompt }],
          temperature,
          max_tokens: maxTokens
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'HTTP-Referer': process.env.SITE_URL || 'https://synai.com',
            'X-Title': process.env.APP_NAME || 'Synai Financial Advisor',
            'Content-Type': 'application/json'
          },
          timeout: timeoutMs
        }
      );

      // Check for API-level errors
      if (response.data?.error) {
        throw new Error(`API Error: ${response.data.error.message || 'Unknown error'}`);
      }

      // Extract and validate response content
      const message = response.data?.choices?.[0]?.message;
      if (!message) {
        throw new Error('Invalid response structure: missing message');
      }

      const content = message.content?.trim();
      if (!content) {
        throw new Error('AI returned empty content');
      }

      // Success - return the content
      return content;

    } catch (error) {
      lastError = error;
      
      // Enhance error object with context
      const contextualError = {
        attempt: attempt + 1,
        model: currentModel,
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      };
      
      console.error(`Request failed:`, contextualError);

      // If this is the last attempt, throw a detailed error
      if (attempt === attempts - 1) {
        throw new Error(`All ${attempts} attempts failed. Last error with ${currentModel}: ${lastError.message}`);
      }
      
      // Otherwise continue to next attempt
    }
  }
};

export default callOpenRouter;