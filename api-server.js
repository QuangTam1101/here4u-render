// api-server.js
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const app = express();

// CORS configuration cho production
const corsOptions = {
    origin: function (origin, callback) {
        // Cho phép requests từ bất kỳ origin nào (có thể giới hạn sau)
        callback(null, true);
    },
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static('.')); 

// Lấy API key từ environment variable (bảo mật hơn)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`;

// Health check endpoint cho Render
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Server is running' });
});

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
            }
        );
        
        console.log('Response received successfully');
        res.json(response.data);
        
    } catch (error) {
        console.error('API Error:', error.response?.data || error.message);
        
        // Fallback response
        res.json({
            candidates: [{
                content: {
                    parts: [{
                        text: "Xin lỗi, mình đang gặp một chút trục trặc. Bạn có thể thử lại sau nhé! 💙"
                    }]
                }
            }]
        });
    }
});

app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'API server is running!',
        model: MODEL_NAME,
        environment: process.env.NODE_ENV || 'development'
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Sử dụng PORT từ environment variable (Render tự động set)
const PORT = process.env.PORT || 8000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server is running on port ${PORT}`);
    console.log(`📋 Environment: ${process.env.NODE_ENV || 'development'}`);
});
