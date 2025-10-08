// server.js - PRODUCTION READY VERSION
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname)));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/images', express.static(path.join(__dirname, 'images')));

// API Configuration - LẤY TỪ ENVIRONMENT VARIABLE
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // KHÔNG có default value cho production
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`;

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'API server is running!',
        model: 'gemini-2.0-flash-exp',
        apiKeyConfigured: !!GEMINI_API_KEY,
        environment: process.env.NODE_ENV || 'development'
    });
});

// Chat endpoint cho script.js cũ
app.post('/chat', async (req, res) => {
    try {
        const requestOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-goog-api-key": GEMINI_API_KEY
            },
            body: JSON.stringify(req.body)
        };
        
        const response = await fetch(API_URL, requestOptions);
        const data = await response.json();
        console.log("Gemini API response:", data);

        if (!response.ok) {
            console.error("Gemini API error:", data);
            return res.status(response.status).json(data);
        }

        res.status(response.status).json(data);
    } catch (err) {
        console.error("Server error:", err);
        res.status(500).json({ error: err.message });
    }
});

// Chat endpoint cho calmi-chat.js
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
        
        const requestOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-goog-api-key": GEMINI_API_KEY
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: systemPrompt + "\n\nNgười dùng: " + message
                    }]
                }]
            })
        };
        
        const response = await fetch(API_URL, requestOptions);
        const data = await response.json();
        
        if (!response.ok) {
            console.error("Gemini API error:", data);
            return res.status(response.status).json(data);
        }
        
        res.json(data);
        
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ 
            error: 'API request failed',
            details: error.message 
        });
    }
});

// Serve index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Port từ environment
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server is running on port ${PORT}`);
    console.log(`📋 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔑 API Key: ${GEMINI_API_KEY ? 'Configured' : 'Not configured'}`);
});