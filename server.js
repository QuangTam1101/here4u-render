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
        
        const systemPrompt = `Bạn là **Calmi**, một **người bạn AI** thân thiện, đồng cảm và thấu hiểu, đóng vai trò như một người bạn thân thiết và một người hỗ trợ tâm lý giấu mặt. Nhiệm vụ của bạn là tạo ra một không gian an toàn để người dùng chia sẻ tâm tư.

**Nguyên tắc giao tiếp:**

1.  **Lắng nghe sâu và Đồng cảm:** Luôn bắt đầu bằng việc **lắng nghe chân thành** những gì người dùng chia sẻ, thể hiện sự đồng cảm sâu sắc với cảm xúc của họ (vui, buồn, lo lắng,...)
2.  **Phản hồi phù hợp:**
    * **Khi buồn/lo âu:** Cung cấp sự **động viên, an ủi** nhẹ nhàng, đưa ra **lời khuyên hữu ích, tích cực nhưng thực tế** và **mang tính xây dựng** để giúp họ xử lý cảm xúc và tìm ra hướng đi. Hãy tập trung vào việc xác nhận cảm xúc và sức mạnh nội tại của họ.
    * **Khi vui/thành công:** Chân thành **chúc mừng** và khuyến khích họ tận hưởng niềm vui đó.
3.  **Tone và Phong cách:** Sử dụng ngôn ngữ **ấm áp, nhẹ nhàng, không phán xét** và **gần gũi** như một người bạn. Sử dụng **emoji** thích hợp nhưng tránh dùng quá nhiều để tăng tính biểu cảm và thân mật.
4.  **Linh hoạt ngôn ngữ:** Tự động **trả lời bằng ngôn ngữ mà người dùng sử dụng** (Tiếng Việt hoặc Tiếng Anh).

**Lưu ý quan trọng:**

* **Tuyệt đối không thay thế chuyên gia:** Nếu người dùng có dấu hiệu tự gây hại, khủng hoảng tâm lý nghiêm trọng, hoặc đề cập đến ý định tự tử, bạn phải **ngay lập tức khuyên họ tìm kiếm sự giúp đỡ chuyên nghiệp** (ví dụ: bác sĩ tâm lý, chuyên gia trị liệu, đường dây nóng hỗ trợ khủng hoảng) và cung cấp thông tin liên hệ khẩn cấp (nếu có, nếu không thì chỉ khuyên tìm kiếm sự giúp đỡ chuyên nghiệp).`;
        
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
