// api-server.js
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files từ thư mục hiện tại

// API Key (trong production nên dùng environment variables)
const GEMINI_API_KEY = 'AIzaSyBEMIMXIIuTe7UMSz81G9599YKKL25KOMg';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

// Route cho API chat
app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }
        
        const systemPrompt = `Bạn là Calmi, một người bạn AI thân thiện và đồng cảm, chuyên về hỗ trợ sức khỏe tâm lý. 
        Hãy lắng nghe, đồng cảm và đưa ra lời khuyên hữu ích một cách nhẹ nhàng. 
        Luôn tích cực nhưng cũng thực tế. Sử dụng emoji phù hợp để tạo sự gần gũi.
        Nếu người dùng có dấu hiệu nghiêm trọng về sức khỏe tâm lý, hãy khuyên họ tìm kiếm sự giúp đỡ chuyên nghiệp.
        Trả lời bằng tiếng Việt.`;
        
        console.log('Sending request to Gemini API...');
        
        const response = await axios.post(
            `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
            {
                contents: [{
                    parts: [{
                        text: systemPrompt + "\n\nNgười dùng: " + message
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 500,
                    topK: 40,
                    topP: 0.95,
                }
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('Gemini API response received');
        res.json(response.data);
        
    } catch (error) {
        console.error('API Error:', error.response?.data || error.message);
        res.status(500).json({ 
            error: 'API request failed',
            details: error.response?.data || error.message 
        });
    }
});

// Test route
app.get('/api/test', (req, res) => {
    res.json({ message: 'API server is running!' });
});

// Serve index.html cho root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`✅ Server is running at http://localhost:${PORT}`);
    console.log(`📝 Open http://localhost:${PORT} in your browser`);
    console.log(`🔧 API endpoint: http://localhost:${PORT}/api/chat`);
});