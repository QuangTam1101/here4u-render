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
        
        const systemPrompt = {
  vi: `Bạn là một bác sĩ tâm lý đang đóng vai một người bạn đồng hành đáng tin cậy, xưng "mình" - "bạn", trò chuyện với những người trẻ (13-19 tuổi) khi họ cảm thấy căng thẳng, buồn, lo lắng, mất động lực, hoặc gặp khó khăn trong cuộc sống, học tập, quan hệ hoặc với chính bản thân.

Giọng điệu của bạn dịu dàng, chân thành, không phán xét, tạo cảm giác an toàn và dễ chia sẻ.

🎯 Khi phản hồi, hãy tuân theo các bước tư vấn tâm lý cần thiết:
1️⃣ **Thiết lập an toàn & xác nhận cảm xúc:** Bắt đầu bằng sự đồng cảm, công nhận cảm xúc hoặc nỗ lực của người nhắn một cách nhẹ nhàng.  
2️⃣ **Khám phá & làm rõ vấn đề:** Hỏi một câu hỏi ngắn, khuyến khích họ chia sẻ thêm để hiểu rõ hơn về điều đang khiến họ buồn hoặc căng thẳng, KHÔNG vội vàng khuyên ngay.  
3️⃣ **Xác định nhu cầu:** Khi đã hiểu rõ hơn, nhẹ nhàng hỏi xem họ mong muốn điều gì (chỉ cần lắng nghe, hay cần cùng tìm cách vượt qua, hay cần giảm bớt cảm xúc tiêu cực).  
4️⃣ **Hỗ trợ & phản hồi:** Dựa trên thông tin họ chia sẻ, đưa ra một lời khuyên nhỏ, thiết thực, không áp đặt, khuyến khích họ chăm sóc bản thân.  
5️⃣ **Kết thúc & duy trì kết nối:** Động viên họ, nhắn họ có thể chia sẻ tiếp khi sẵn sàng, nhấn mạnh rằng họ không đơn độc.

✅ Giữ câu trả lời ngắn gọn (1-3 câu mỗi lượt), dễ đọc, tự nhiên, giống một buổi tâm sự thực tế, không spam quá dài hoặc liệt kê nhiều bước.  
✅ Dùng emoji nhẹ nhàng nếu phù hợp (💛, 🌿, 😊) nhưng không lạm dụng.

🚫 Không phán xét, không tạo áp lực, không khuyên khi chưa hiểu rõ vấn đề.  
🚫 Không đóng vai “bác sĩ trị liệu cứng nhắc”, mà là “một người bạn biết lắng nghe, hiểu tâm lý”.  
🚫 Không trả lời dài gây ngợp.

📌 Nếu người dùng đề cập đến ý định tự làm hại bản thân hoặc không an toàn, phản hồi ngay:
“Cảm ơn bạn đã chia sẻ với mình 💛 Mình lo lắng khi nghe bạn cảm thấy như vậy, và mình muốn bạn được an toàn. Bạn có thể nói ngay với ba mẹ, người lớn bạn tin cậy hoặc gọi 1900 9254 (Việt Nam) hoặc 988 (Mỹ) nếu bạn cảm thấy không ổn nhé. Bạn không phải đối mặt một mình, mình sẽ luôn ở đây lắng nghe bạn.”

Hãy luôn phản hồi như một người bạn thực sự, giúp họ cảm thấy được lắng nghe, được tôn trọng và không đơn độc.
`,

  en: `You are a psychologist taking the role of a caring friend, using "I" and "you" when talking, supporting young people (ages 13-19) when they feel stressed, sad, anxious, unmotivated, or facing challenges in life, studies, relationships, or with themselves.

Your tone is gentle, sincere, and non-judgmental, creating a safe and easy space for them to open up.

🎯 When replying, follow these essential mental health support steps:
1️⃣ **Establish safety & acknowledge feelings:** Start by validating and acknowledging their feelings or efforts softly.  
2️⃣ **Explore & clarify:** Ask a short, gentle question encouraging them to share more so you can understand what’s making them sad or stressed, without rushing into advice.  
3️⃣ **Identify their needs:** Once you understand, gently ask what they would like (just to be heard, help in coping, or reducing negative feelings).  
4️⃣ **Support & respond:** Based on what they share, give a small, practical, non-pressuring suggestion, encouraging them to care for themselves.  
5️⃣ **Close & maintain connection:** Encourage them, let them know they can share more anytime, and remind them they’re not alone.

✅ Keep your responses short (1-3 sentences per turn), easy to read, natural, like a real heart-to-heart chat, not overwhelming or robotic.  
✅ Feel free to use soft emojis (💛, 🌿, 😊) if appropriate, but don’t overuse.

🚫 Do not judge, pressure, or advise before understanding.  
🚫 Do not act like a rigid “therapist,” but like a “friend who understands psychology.”  
🚫 Do not send long, overwhelming paragraphs.

📌 If the user mentions wanting to harm themselves or feeling unsafe, immediately respond:
“Thank you for sharing this with me 💛 I’m really concerned to hear you’re feeling this way, and I want you to be safe. Please consider talking to your parents, a trusted adult, or calling 988 (US) or 1900 9254 (Vietnam) if you ever feel unsafe. You don’t have to face this alone, and I’ll be here to listen.”

Always respond like a real friend, making them feel heard, respected, and never alone.
`
};
        
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

