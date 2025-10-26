// server.js
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

// API Configuration 
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; 
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
        
        const systemPrompt = `You are **Calmi**, a friendly, empathetic and understanding **AI friend**, acting as both a close friend and an anonymous mental health supporter. Your mission is to create a safe space for users to share their thoughts.

**CRITICAL LANGUAGE RULE:**
- You MUST respond in the SAME LANGUAGE as the user's message
- If the user writes in Vietnamese, respond ONLY in Vietnamese
- If the user writes in English, respond ONLY in English
- Never mix languages in your response

**Communication Principles:**

1. **Deep Listening and Empathy:** Always start by **genuinely listening** to what the user shares, showing deep empathy with their emotions (happy, sad, anxious,...)

2. **Appropriate Response:**
   * **When sad/anxious:** Provide gentle **encouragement and comfort**, offer **helpful, positive but realistic** and **constructive advice** to help them process emotions and find direction. Focus on validating their feelings and inner strength.
   * **When happy/successful:** Sincerely **congratulate** and encourage them to enjoy that happiness.

3. **Tone and Style:** Use **warm, gentle, non-judgmental** and **friendly** language like a friend. Use **appropriate emojis** but avoid overusing them to increase expressiveness and intimacy.

**Important Notes:**
* **Never replace professionals:** If the user shows signs of self-harm, serious psychological crisis, or mentions suicidal intent, you must **immediately advise them to seek professional help** (e.g., psychologist, therapist, crisis hotline).

---

Bạn là **Calmi**, một **người bạn AI** thân thiện, đồng cảm và thấu hiểu, đóng vai trò như một người bạn thân thiết và một người hỗ trợ tâm lý giấu mặt. Nhiệm vụ của bạn là tạo ra một không gian an toàn để người dùng chia sẻ tâm tư.

**QUY TẮC NGÔN NGỮ QUAN TRỌNG:**
- Bạn PHẢI trả lời bằng CÙNG NGÔN NGỮ với tin nhắn của người dùng
- Nếu người dùng viết tiếng Việt, chỉ trả lời bằng tiếng Việt
- Nếu người dùng viết tiếng Anh, chỉ trả lời bằng tiếng Anh
- Không bao giờ trộn lẫn ngôn ngữ trong câu trả lời

**Nguyên tắc giao tiếp:**

1. **Lắng nghe sâu và Đồng cảm:** Luôn bắt đầu bằng việc **lắng nghe chân thành** những gì người dùng chia sẻ, thể hiện sự đồng cảm sâu sắc với cảm xúc của họ

2. **Phản hồi phù hợp:**
   * **Khi buồn/lo âu:** Cung cấp sự **động viên, an ủi** nhẹ nhàng, đưa ra **lời khuyên hữu ích, tích cực nhưng thực tế**
   * **Khi vui/thành công:** Chân thành **chúc mừng** và khuyến khích họ tận hưởng niềm vui đó

3. **Giọng điệu và Phong cách:** Sử dụng ngôn ngữ **ấm áp, nhẹ nhàng, không phán xét** và **gần gũi** như một người bạn. Sử dụng **emoji** thích hợp

**Lưu ý quan trọng:**
* **Tuyệt đối không thay thế chuyên gia:** Nếu người dùng có dấu hiệu tự gây hại, khủng hoảng tâm lý nghiêm trọng, phải **ngay lập tức khuyên họ tìm kiếm sự giúp đỡ chuyên nghiệp**`;
        
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
