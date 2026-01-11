const axios = require('axios');

// ✅ Helper function to clean AI response
function extractJSON(text) {
  // Remove markdown code blocks
  let cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  
  // Try to find JSON array or object
  const jsonMatch = cleaned.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
  
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.error('Failed to parse extracted JSON:', e);
    }
  }
  
  // Fallback: return as single suggestion
  return [{
    comment: cleaned,
    code: null
  }];
}

const reviewPr = async (req, res) => {
  const { code } = req.body;
  
  try {
    if (!code) {
      return res.status(400).json({ message: 'No code provided' });
    }

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'deepseek/deepseek-r1',
        messages: [
          {
            role: 'system',
            content: 'You are a code reviewer. Provide suggestions as a JSON array with this exact format: [{"comment": "description", "code": "example or null"}]. Return ONLY the JSON array, no markdown formatting, no explanation.'
          },
          {
            role: 'user',
            content: `Review this code and provide 3-5 specific suggestions:\n\n${code}`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      },
      { 
        headers: { 
          'Authorization': `Bearer ${process.env.OPEN_ROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const raw = response.data.choices?.[0]?.message?.content || '[]';
    console.log('📥 Raw AI Response:', raw);

    // ✅ Use the helper function to extract and parse JSON safely
    const suggestions = extractJSON(raw);
    
    console.log('✅ Parsed Suggestions:', suggestions);

    res.json({ suggestions });
    
  } catch (error) {
    console.error('❌ OpenRouter API error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to get response from OpenRouter',
      details: error.response?.data || error.message,
    });
  }
};

module.exports = reviewPr;