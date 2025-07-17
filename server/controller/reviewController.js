const axios = require('axios');

const reviewPr = async (req,res) => {
    const { code } = req.body;
    try{
        if(!code)
        {
            return res.status(400).json({message:'No code provided'});
        }
        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions',
            {
              model: 'deepseek/deepseek-r1-0528-qwen3-8b:free',
              messages: [
                {
                  role: 'user',
                  content: `You are a code reviewer bot. Given a code snippet, return 
                  improvement suggestions as a JSON array. Each suggestion should have 
                  the fields: "comment" (string) and "code" (optional code snippet). Respond ONLY
                  with the raw JSON. Do not include explanation or formatting.\n\nReview this code:\n\n${code}`,
                },
                ],
              },
            { 
                headers: { 
                    Authorization: `Bearer ${process.env.OPEN_ROUTER_API_KEY}`,
                    'Content-Type': 'application/json',
            },
        });
        const raw = response.data.choices?.[0]?.message?.content || '[]';
        const suggestions = typeof raw === 'string' ? JSON.parse(raw) : raw; //ies to convert it to a JavaScript object (with JSON.parse)
        res.json({ suggestions });

      } 
      catch (error) {
        console.error('OpenRouter API error:', error.response?.data || error.message);
        res.status(500).json({
          error: 'Failed to get response from OpenRouter',
          details: error.response?.data || error.message,
        });
      }
    };

module.exports = reviewPr;