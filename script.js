// ====== Global Variables ======
let userLang = "vi";
let currentSection = "home";
let moodData = JSON.parse(localStorage.getItem('moodData')) || {};
let userPreferences = JSON.parse(localStorage.getItem('userPreferences')) || {};
let conversationContext = [];
let knownCause = false;

// ====== Base Prompts for AI ======
const basePrompt = {
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
🚫 Không đóng vai "bác sĩ trị liệu cứng nhắc", mà là "một người bạn biết lắng nghe, hiểu tâm lý".  
🚫 Không trả lời dài gây ngợp.

📌 Nếu người dùng đề cập đến ý định tự làm hại bản thân hoặc không an toàn, phản hồi ngay:
"Cảm ơn bạn đã chia sẻ với mình 💛 Mình lo lắng khi nghe bạn cảm thấy như vậy, và mình muốn bạn được an toàn. Bạn có thể nói ngay với ba mẹ, người lớn bạn tin cậy hoặc gọi 1900 9254 (Việt Nam) hoặc 988 (Mỹ) nếu bạn cảm thấy không ổn nhé. Bạn không phải đối mặt một mình, mình sẽ luôn ở đây lắng nghe bạn."

Hãy luôn phản hồi như một người bạn thực sự, giúp họ cảm thấy được lắng nghe, được tôn trọng và không đơn độc.`,

  en: `You are a psychologist taking the role of a caring friend, using "I" and "you" when talking, supporting young people (ages 13-19) when they feel stressed, sad, anxious, unmotivated, or facing challenges in life, studies, relationships, or with themselves.

Your tone is gentle, sincere, and non-judgmental, creating a safe and easy space for them to open up.

🎯 When replying, follow these essential mental health support steps:
1️⃣ **Establish safety & acknowledge feelings:** Start by validating and acknowledging their feelings or efforts softly.  
2️⃣ **Explore & clarify:** Ask a short, gentle question encouraging them to share more so you can understand what's making them sad or stressed, without rushing into advice.  
3️⃣ **Identify their needs:** Once you understand, gently ask what they would like (just to be heard, help in coping, or reducing negative feelings).  
4️⃣ **Support & respond:** Based on what they share, give a small, practical, non-pressuring suggestion, encouraging them to care for themselves.  
5️⃣ **Close & maintain connection:** Encourage them, let them know they can share more anytime, and remind them they're not alone.

✅ Keep your responses short (1-3 sentences per turn), easy to read, natural, like a real heart-to-heart chat, not overwhelming or robotic.  
✅ Feel free to use soft emojis (💛, 🌿, 😊) if appropriate, but don't overuse.

🚫 Do not judge, pressure, or advise before understanding.  
🚫 Do not act like a rigid "therapist," but like a "friend who understands psychology."  
🚫 Do not send long, overwhelming paragraphs.

📌 If the user mentions wanting to harm themselves or feeling unsafe, immediately respond:
"Thank you for sharing this with me 💛 I'm really concerned to hear you're feeling this way, and I want you to be safe. Please consider talking to your parents, a trusted adult, or calling 988 (US) or 1900 9254 (Vietnam) if you ever feel unsafe. You don't have to face this alone, and I'll be here to listen."

Always respond like a real friend, making them feel heard, respected, and never alone.`
};

// API Configuration
const API_URL = `${window.location.origin}/chat`;

// ====== Initialize App ======
document.addEventListener('DOMContentLoaded', () => {
    initializeLanguageSelection();
    initializeNavigation();
    initializeMoodTracker();
    initializeChat();
    initializeRecommendations();
    initializeBreathingExercise();
    initializeProfile();
    generateMoodCalendar();
});

// ====== Language Selection ======
function initializeLanguageSelection() {
    const languageButtons = document.querySelectorAll('.language-select-box button');
    const languageOverlay = document.getElementById('language-select');
    
    languageButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            userLang = btn.dataset.lang;
            localStorage.setItem('userLang', userLang);
            
            languageOverlay.style.opacity = '0';
            setTimeout(() => {
                languageOverlay.style.display = 'none';
                updateLanguage();
            }, 300);
        });
    });
    
    // Check if language was previously selected
    const savedLang = localStorage.getItem('userLang');
    if (savedLang) {
        userLang = savedLang;
        languageOverlay.style.display = 'none';
        updateLanguage();
    }
}

// ====== Navigation ======
function initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetSection = item.dataset.section;
            switchSection(targetSection);
            
            // Update active state
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
        });
    });
}

function switchSection(sectionName) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.classList.remove('active'));
    
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
        currentSection = sectionName;
        
        // Initialize section-specific features
        if (sectionName === 'chat' && !window.chatInitialized) {
            showBotGreeting();
            window.chatInitialized = true;
        }
    }
}

// ====== Mood Tracker ======
function initializeMoodTracker() {
    const moodButtons = document.querySelectorAll('.mood-btn');
    const saveMoodBtn = document.querySelector('.save-mood-btn');
    const moodTextarea = document.querySelector('.mood-textarea');
    
    let selectedMood = null;
    
    moodButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            moodButtons.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedMood = btn.dataset.mood;
        });
    });
    
    saveMoodBtn?.addEventListener('click', () => {
        if (selectedMood) {
            const today = new Date().toISOString().split('T')[0];
            moodData[today] = {
                mood: selectedMood,
                note: moodTextarea.value,
                timestamp: new Date().toISOString()
            };
            
            localStorage.setItem('moodData', JSON.stringify(moodData));
            
            // Show success message
            showNotification('Tâm trạng đã được lưu!', 'success');
            
            // Update calendar
            generateMoodCalendar();
            
            // Generate recommendations based on mood
            generateMoodBasedRecommendations(selectedMood);
            
            // Reset form
            moodButtons.forEach(b => b.classList.remove('selected'));
            moodTextarea.value = '';
            selectedMood = null;
        } else {
            showNotification('Vui lòng chọn tâm trạng của bạn', 'warning');
        }
    });
}

function generateMoodCalendar() {
    const calendarGrid = document.getElementById('mood-calendar-grid');
    if (!calendarGrid) return;
    
    calendarGrid.innerHTML = '';
    
    const today = new Date();
    const last30Days = [];
    
    for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        last30Days.push(date.toISOString().split('T')[0]);
    }
    
    last30Days.forEach(date => {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';
        
        if (moodData[date]) {
            dayDiv.classList.add(`mood-${moodData[date].mood}`);
            dayDiv.title = `${date}: ${moodData[date].mood}`;
        } else {
            dayDiv.style.background = '#f0f0f0';
        }
        
        const dayNumber = new Date(date).getDate();
        dayDiv.textContent = dayNumber;
        
        calendarGrid.appendChild(dayDiv);
    });
    
    // Update analytics
    updateMoodAnalytics();
}

function updateMoodAnalytics() {
    // Calculate mood trends
    const moodCounts = {};
    Object.values(moodData).forEach(entry => {
        moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
    });
    
    // Update UI with analytics (simplified version)
    const analyticsValue = document.querySelector('.analytic-value');
    if (analyticsValue && Object.keys(moodCounts).length > 0) {
        const dominantMood = Object.keys(moodCounts).reduce((a, b) => 
            moodCounts[a] > moodCounts[b] ? a : b
        );
        
        const moodEmojis = {
            'very-happy': '😊',
            'happy': '🙂',
            'neutral': '😐',
            'sad': '😔',
            'very-sad': '😢'
        };
        
        analyticsValue.textContent = `${moodEmojis[dominantMood]} ${dominantMood.replace('-', ' ')}`;
    }
}

// ====== Chat System with Gemini API ======
function initializeChat() {
    const messageInput = document.querySelector('.message-input');
    const sendButton = document.getElementById('send-message');
    const chatBody = document.querySelector('.chat-body');
    
    if (!messageInput || !sendButton) return;
    
    sendButton.addEventListener('click', () => sendMessage());
    
    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Auto-resize textarea
    messageInput.addEventListener('input', () => {
        messageInput.style.height = 'auto';
        messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + 'px';
    });
}

function detectKnownCause(message) {
    const lowerMsg = message.toLowerCase();
    const keywords = [
        // Học tập, điểm số
        "học", "bài", "thi", "kiểm tra", "điểm", "bằng cấp", "trường", "lớp", "bài tập", "deadline", "thi cử", "học hành", "áp lực học",
        
        // Bạn bè, xã hội
        "bạn", "bè", "bạn bè", "tình bạn", "cô lập", "bị bỏ rơi", "bị cô lập", "không ai chơi", "một mình", "cô đơn", "không có bạn", "cô độc",
        
        // Gia đình
        "gia đình", "ba mẹ", "cha mẹ", "mẹ", "bố", "cha", "ông bà", "bị la", "bị mắng", "bị áp lực", "áp lực gia đình", "xung đột gia đình",
        
        // Tình cảm, yêu đương
        "yêu", "tình cảm", "crush", "bạn trai", "bạn gái", "mối quan hệ", "chia tay", "cãi nhau", "gãy đổ",
        
        // LGBT / Giới tính
        "gay", "les", "lgbt", "đồng tính", "song tính", "chuyển giới", "giới tính", "bị kỳ thị", "kỳ thị", "coming out", "queer",
        
        // Stress, lo âu
        "stress", "lo lắng", "căng thẳng", "mệt mỏi", "kiệt sức", "bị trầm cảm", "buồn",
        
        // Bắt nạt, bạo lực
        "bắt nạt", "bị bắt nạt", "bạo lực", "bạo hành", "bị đánh", "bị chửi",
        
        // Tự ti, áp lực bản thân
        "tự ti", "ghét bản thân", "tệ hại", "không giỏi", "vô dụng", "không ai yêu", "không ai hiểu",
        
        // Sức khỏe
        "sức khỏe", "thân thể", "ngoại hình", "béo", "ốm", "mập", "gầy", "tự hại", "tự làm đau"
    ];
    
    return keywords.some(keyword => lowerMsg.includes(keyword));
}

function detectCriticalKeywords(message) {
    const lowerMsg = message.toLowerCase();
    const criticalKeywords = [
        "tự tử", "muốn chết", "không muốn sống", "tự hại", "tự làm đau",
        "suicide", "kill myself", "end my life", "self harm", "hurt myself",
        "không còn muốn", "hết hy vọng", "không thể chịu", "muốn biến mất"
    ];
    
    return criticalKeywords.some(keyword => lowerMsg.includes(keyword));
}

function sendMessage() {
    const messageInput = document.querySelector('.message-input');
    const chatBody = document.querySelector('.chat-body');
    
    const message = messageInput.value.trim();
    if (!message) return;
    
    // Add user message
    const userMessageDiv = document.createElement('div');
    userMessageDiv.className = 'message user-message';
    userMessageDiv.innerHTML = `<div class="message-text">${escapeHtml(message)}</div>`;
    chatBody.appendChild(userMessageDiv);
    
    // Store message in context
    conversationContext.push({ role: 'user', content: message });
    
    // Clear input and reset height
    messageInput.value = '';
    messageInput.style.height = 'auto';
    
    // Scroll to bottom
    chatBody.scrollTop = chatBody.scrollHeight;
    
    // Check for critical keywords
    if (detectCriticalKeywords(message)) {
        // Show immediate crisis response
        const crisisResponse = userLang === 'vi' 
            ? "Cảm ơn bạn đã chia sẻ với mình 💛 Mình lo lắng khi nghe bạn cảm thấy như vậy, và mình muốn bạn được an toàn. Bạn có thể nói ngay với ba mẹ, người lớn bạn tin cậy hoặc gọi 1900 9254 (Việt Nam) nếu bạn cảm thấy không ổn nhé. Bạn không phải đối mặt một mình, mình sẽ luôn ở đây lắng nghe bạn."
            : "Thank you for sharing this with me 💛 I'm really concerned to hear you're feeling this way, and I want you to be safe. Please consider talking to your parents, a trusted adult, or calling 988 (US) if you ever feel unsafe. You don't have to face this alone, and I'll be here to listen.";
        
        const crisisDiv = document.createElement('div');
        crisisDiv.className = 'message bot-message';
        crisisDiv.innerHTML = `
            ${getSVGIcon()}
            <div class="message-text" style="background: #ffe5e5; border: 2px solid #ff6b6b;">
                ${crisisResponse}
            </div>
        `;
        chatBody.appendChild(crisisDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
        return;
    }
    
    // Check if we've identified the cause
    if (!knownCause && detectKnownCause(message)) {
        knownCause = true;
    }
    
    // Show typing indicator
    setTimeout(() => {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message thinking';
        typingDiv.innerHTML = `
            ${getSVGIcon()}
            <div class="message-text">
                <div class="thinking-indicator">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                </div>
            </div>
        `;
        chatBody.appendChild(typingDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
        
        // Generate bot response using Gemini API
        generateBotResponse(message, typingDiv);
    }, 500);
}

async function generateBotResponse(userMessage, typingDiv) {
    const chatBody = document.querySelector('.chat-body');
    
    try {
        // Build dynamic prompt based on conversation stage
        let dynamicPrompt = "";
        if (!knownCause) {
            dynamicPrompt = userLang === 'vi'
                ? "Hãy chỉ lắng nghe và hỏi nhẹ nhàng thêm để hiểu rõ điều khiến bạn ấy stress, buồn, lo lắng, KHÔNG đưa ra lời khuyên vội."
                : "Just listen and gently ask more to understand what's causing their stress or sadness, DO NOT rush to give advice.";
        } else {
            dynamicPrompt = userLang === 'vi'
                ? "Bạn đã biết nguyên nhân khiến bạn ấy stress, buồn, lo lắng, giờ bạn có thể đưa ra một lời khuyên nhẹ nhàng, thực tế, không phán xét, không ép buộc."
                : "You now know the cause of their stress or sadness, you can now give gentle, practical, non-judgmental, non-forcing advice.";
        }
        
        // Build conversation history for context
        const recentContext = conversationContext.slice(-6); // Keep last 6 messages for context
        let contextString = recentContext.map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n');
        
        const fullPrompt = `${basePrompt[userLang]}\n\n${dynamicPrompt}\n\nConversation history:\n${contextString}\n\nUser's current message:\n"${userMessage}"\n\nYour response:`;
        
        const requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [
                    {
                        role: "user",
                        parts: [{ text: fullPrompt }]
                    }
                ]
            })
        };
        
        const response = await fetch(API_URL, requestOptions);
        const data = await response.json();
        
        if (!response.ok || !data.candidates || !data.candidates[0]) {
            throw new Error(data.error?.message || "API Error");
        }
        
        const apiResponseText = data.candidates[0].content.parts[0].text
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
            .trim();
        
        // Remove typing indicator and show response
        typingDiv.classList.remove('thinking');
        typingDiv.querySelector('.message-text').innerHTML = apiResponseText;
        
        // Store bot response in context
        conversationContext.push({ role: 'assistant', content: apiResponseText });
        
        // Scroll to bottom
        chatBody.scrollTop = chatBody.scrollHeight;
        
        // Analyze sentiment and update mood recommendations
        analyzeSentimentAndUpdateRecommendations(userMessage);
        
    } catch (error) {
        console.error("Error generating bot response:", error);
        
        // Fallback responses
        const fallbackResponses = {
            vi: [
                "Mình hiểu cảm xúc của bạn. Bạn có thể chia sẻ thêm để mình hiểu rõ hơn không? 💛",
                "Cảm ơn bạn đã tin tưởng chia sẻ với mình. Điều gì khiến bạn cảm thấy như vậy?",
                "Mình ở đây để lắng nghe bạn. Bạn muốn kể thêm về điều đang làm bạn lo lắng không?",
                "Nghe có vẻ bạn đang trải qua khoảng thời gian khó khăn. Mình có thể giúp gì cho bạn?"
            ],
            en: [
                "I understand how you're feeling. Would you like to share more so I can understand better? 💛",
                "Thank you for trusting me with this. What makes you feel this way?",
                "I'm here to listen. Would you like to tell me more about what's worrying you?",
                "It sounds like you're going through a tough time. How can I help you?"
            ]
        };
        
        const randomFallback = fallbackResponses[userLang][Math.floor(Math.random() * fallbackResponses[userLang].length)];
        typingDiv.classList.remove('thinking');
        typingDiv.querySelector('.message-text').innerHTML = randomFallback;
        
        chatBody.scrollTop = chatBody.scrollHeight;
    }
}

function showBotGreeting() {
    const chatBody = document.querySelector('.chat-body');
    if (!chatBody) return;
    
    const greetings = {
        vi: `Chào bạn! Mình là <strong>Calmi</strong> – người bạn AI luôn sẵn sàng lắng nghe và hỗ trợ bạn 💜 
        <br><br>
        Mọi chia sẻ của bạn đều được bảo mật và mình sẽ cố gắng hết sức để hiểu và đồng hành cùng bạn. 
        Bạn muốn chia sẻ điều gì hôm nay?`,
        en: `Hi there! I'm <strong>Calmi</strong> – your AI companion who's here to listen and support you 💜 
        <br><br>
        Everything you share is confidential and I'll do my best to understand and support you. 
        What would you like to share today?`
    };
    
    const greetingDiv = document.createElement('div');
    greetingDiv.className = 'message bot-message';
    greetingDiv.innerHTML = `
        ${getSVGIcon()}
        <div class="message-text">${greetings[userLang]}</div>
    `;
    chatBody.appendChild(greetingDiv);
    
    // Store greeting in context
    conversationContext.push({ role: 'assistant', content: greetings[userLang] });
}

function getSVGIcon() {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 1024 1024">
        <path d="M738.3 287.6H285.7c-59 0-106.8 47.8-106.8 106.8v303.1c0 59 47.8 106.8 106.8 106.8h81.5v111.1c0 .7.8 1.1 1.4.7l166.9-110.6 41.8-.8h117.4l43.6-.4c59 0 106.8-47.8 106.8-106.8V394.5c0-59-47.8-106.9-106.8-106.9zM351.7 448.2c0-29.5 23.9-53.5 53.5-53.5s53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5-53.5-23.9-53.5-53.5zm157.9 267.1c-67.8 0-123.8-47.5-132.3-109h264.6c-8.6 61.5-64.5 109-132.3 109zm110-213.7c-29.5 0-53.5-23.9-53.5-53.5s23.9-53.5 53.5-53.5 53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5zM867.2 644.5V453.1h26.5c19.4 0 35.1 15.7 35.1 35.1v121.1c0 19.4-15.7 35.1-35.1 35.1h-26.5zM95.2 609.4V488.2c0-19.4 15.7-35.1 35.1-35.1h26.5v191.3h-26.5c-19.4 0-35.1-15.7-35.1-35.1zM561.5 149.6c0 23.4-15.6 43.3-36.9 49.7v44.9h-30v-44.9c-21.4-6.5-36.9-26.3-36.9-49.7 0-28.6 23.3-51.9 51.9-51.9s51.9 23.3 51.9 51.9z"></path>
    </svg>`;
}

// ====== Sentiment Analysis for Recommendations ======
function analyzeSentimentAndUpdateRecommendations(message) {
    const lowerMsg = message.toLowerCase();
    
    // Detect mood from message
    let detectedMood = 'neutral';
    
    const positiveWords = ['vui', 'happy', 'tốt', 'good', 'great', 'yêu', 'love', 'thích', 'like'];
    const negativeWords = ['buồn', 'sad', 'chán', 'tired', 'mệt', 'lo', 'worry', 'sợ', 'fear', 'căng thẳng', 'stress'];
    
    const positiveCount = positiveWords.filter(word => lowerMsg.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerMsg.includes(word)).length;
    
    if (negativeCount > positiveCount) {
        detectedMood = 'sad';
    } else if (positiveCount > negativeCount) {
        detectedMood = 'happy';
    }
    
    // Update recommendations based on detected mood
    generateMoodBasedRecommendations(detectedMood);
}

// ====== Recommendations ======
function initializeRecommendations() {
    const tabs = document.querySelectorAll('.rec-tab');
    const contents = document.querySelectorAll('.rec-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;
            
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            
            tab.classList.add('active');
            document.getElementById(`${targetTab}-content`)?.classList.add('active');
        });
    });
    
    // Initialize exercise buttons
    document.querySelectorAll('.start-exercise').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const exerciseTitle = e.target.parentElement.querySelector('h3').textContent;
            startExercise(exerciseTitle);
        });
    });
    
    // Initialize playlist buttons
    document.querySelectorAll('.play-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const playlistTitle = e.target.closest('.playlist-card').querySelector('h3').textContent;
            playPlaylist(playlistTitle);
        });
    });
    
    // Initialize habit buttons
    document.querySelectorAll('.add-habit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const habitTitle = e.target.parentElement.querySelector('h3').textContent;
            addHabitToProfile(habitTitle);
        });
    });
}

function generateMoodBasedRecommendations(mood) {
    // Update recommendation content based on mood
    const articleGrid = document.querySelector('.article-grid');
    const exerciseGrid = document.querySelector('.exercise-grid');
    
    if (mood === 'sad' || mood === 'very-sad') {
        // Show uplifting content
        showNotification('Chúng tôi đã cập nhật gợi ý phù hợp với tâm trạng của bạn 💛', 'info');
        
        // Prioritize calming exercises and uplifting articles
        if (articleGrid) {
            const articles = articleGrid.querySelectorAll('.article-card');
            articles[0].querySelector('h3').textContent = '7 cách vượt qua cảm giác buồn bã';
            articles[1].querySelector('h3').textContent = 'Sức mạnh của lòng biết ơn trong những ngày khó khăn';
        }
        
        if (exerciseGrid) {
            const exercises = exerciseGrid.querySelectorAll('.exercise-card');
            exercises[0].querySelector('h3').textContent = 'Thở sâu để thư giãn';
            exercises[1].querySelector('h3').textContent = 'Thiền từ bi với bản thân';
        }
    } else if (mood === 'very-happy' || mood === 'happy') {
        // Show content to maintain positive mood
        showNotification('Tuyệt vời! Hãy duy trì tâm trạng tích cực này nhé! 🌟', 'success');
        
        if (articleGrid) {
            const articles = articleGrid.querySelectorAll('.article-card');
            articles[0].querySelector('h3').textContent = 'Cách duy trì năng lượng tích cực';
            articles[1].querySelector('h3').textContent = 'Chia sẻ niềm vui để nhân đôi hạnh phúc';
        }
    }
}

function startExercise(exerciseName) {
    showNotification(`Bắt đầu bài tập: ${exerciseName}`, 'info');
    
    // Track exercise usage
    const exercises = JSON.parse(localStorage.getItem('exerciseHistory')) || [];
    exercises.push({
        name: exerciseName,
        date: new Date().toISOString()
    });
    localStorage.setItem('exerciseHistory', JSON.stringify(exercises));
    
    // Open breathing exercise for demo
    if (exerciseName.includes('Thở')) {
        const breathingExercise = document.querySelector('.breathing-exercise');
        if (breathingExercise) {
            breathingExercise.classList.remove('hidden');
            startBreathingAnimation();
        }
    }
}

function playPlaylist(playlistName) {
    showNotification(`Đang phát: ${playlistName}`, 'info');
    
    // Track music preferences
    const playlists = JSON.parse(localStorage.getItem('playlistHistory')) || [];
    playlists.push({
        name: playlistName,
        date: new Date().toISOString()
    });
    localStorage.setItem('playlistHistory', JSON.stringify(playlists));
}

function addHabitToProfile(habitName) {
    showNotification(`Đã thêm thói quen: ${habitName}`, 'success');
    
    // Save habit to profile
    const habits = JSON.parse(localStorage.getItem('userHabits')) || [];
    if (!habits.find(h => h.name === habitName)) {
        habits.push({
            name: habitName,
            dateAdded: new Date().toISOString(),
            streak: 0
        });
        localStorage.setItem('userHabits', JSON.stringify(habits));
    }
}

// ====== Breathing Exercise ======
function initializeBreathingExercise() {
    const breathingBtn = document.querySelector('.breathing-btn');
    const meditationBtn = document.querySelector('.meditation-btn');
    const breathingExercise = document.querySelector('.breathing-exercise');
    const closeBtn = document.querySelector('.close-breathing');
    
    if (breathingBtn) {
        breathingBtn.addEventListener('click', () => {
            if (breathingExercise) {
                breathingExercise.classList.remove('hidden');
                startBreathingAnimation();
            }
        });
    }
    
    if (meditationBtn) {
        meditationBtn.addEventListener('click', () => {
            showNotification('Bắt đầu thiền 5 phút 🧘', 'info');
            startMeditationTimer();
        });
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            if (breathingExercise) {
                breathingExercise.classList.add('hidden');
            }
        });
    }
}

function startBreathingAnimation() {
    const breathingText = document.querySelector('.breathing-text');
    if (!breathingText) return;
    
    const phases = [
        { text: 'Hít vào... 4', duration: 4000 },
        { text: 'Giữ... 7', duration: 7000 },
        { text: 'Thở ra... 8', duration: 8000 }
    ];
    
    let currentPhase = 0;
    let animationInterval;
    
    function animatePhase() {
        const breathingExercise = document.querySelector('.breathing-exercise');
        if (breathingExercise.classList.contains('hidden')) {
            clearInterval(animationInterval);
            return;
        }
        
        breathingText.textContent = phases[currentPhase].text;
        currentPhase = (currentPhase + 1) % phases.length;
    }
    
    animatePhase();
    animationInterval = setInterval(animatePhase, 
        phases.reduce((sum, phase) => sum + phase.duration, 0) / phases.length);
}

function startMeditationTimer() {
    let timeLeft = 300; // 5 minutes in seconds
    
    const timerInterval = setInterval(() => {
        timeLeft--;
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            showNotification('Hoàn thành thiền 5 phút! Tuyệt vời! 🎉', 'success');
        }
    }, 1000);
}

// ====== Profile ======
function initializeProfile() {
    const profileName = document.querySelector('.profile-name');
    const profileBio = document.querySelector('.profile-bio');
    const changeAvatarBtn = document.querySelector('.change-avatar');
    
    // Load saved profile
    const savedProfile = JSON.parse(localStorage.getItem('userProfile')) || {};
    if (profileName) profileName.value = savedProfile.name || '';
    if (profileBio) profileBio.value = savedProfile.bio || '';
    
    // Save profile on change
    profileName?.addEventListener('input', () => {
        savedProfile.name = profileName.value;
        localStorage.setItem('userProfile', JSON.stringify(savedProfile));
    });
    
    profileBio?.addEventListener('input', () => {
        savedProfile.bio = profileBio.value;
        localStorage.setItem('userProfile', JSON.stringify(savedProfile));
    });
    
    changeAvatarBtn?.addEventListener('click', () => {
        const avatars = ['👤', '😊', '🌟', '🌈', '💜', '🦋', '🌸', '🎨'];
        const currentAvatar = document.querySelector('.avatar');
        const currentIndex = avatars.indexOf(currentAvatar.textContent);
        const nextIndex = (currentIndex + 1) % avatars.length;
        currentAvatar.textContent = avatars[nextIndex];
        
        savedProfile.avatar = avatars[nextIndex];
        localStorage.setItem('userProfile', JSON.stringify(savedProfile));
    });
    
    // Load saved avatar
    if (savedProfile.avatar) {
        const avatar = document.querySelector('.avatar');
        if (avatar) avatar.textContent = savedProfile.avatar;
    }
    
    // Update stats
    updateProfileStats();
}

function updateProfileStats() {
    // Calculate streak
    const moodEntries = Object.keys(moodData).sort();
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        const dateStr = checkDate.toISOString().split('T')[0];
        
        if (moodData[dateStr]) {
            streak++;
        } else if (i > 0) {
            break;
        }
    }
    
    // Update streak display
    const streakElement = document.querySelector('.stat-value');
    if (streakElement) {
        streakElement.textContent = streak;
    }
    
    // Calculate positive mood percentage
    const moodValues = Object.values(moodData);
    const positiveMoods = moodValues.filter(m => 
        m.mood === 'happy' || m.mood === 'very-happy'
    ).length;
    
    const positivePercentage = moodValues.length > 0 
        ? Math.round((positiveMoods / moodValues.length) * 100)
        : 0;
    
    // Update other stats
    const statValues = document.querySelectorAll('.stat-value');
    if (statValues[1]) statValues[1].textContent = `${positivePercentage}%`;
    
    // Count completed goals/habits
    const habits = JSON.parse(localStorage.getItem('userHabits')) || [];
    if (statValues[2]) statValues[2].textContent = habits.length;
}

// ====== Utility Functions ======
function updateLanguage() {
    const translations = {
        vi: {
            home: 'Trang chủ',
            mood: 'Tâm trạng',
            chat: 'Trò chuyện',
            recommendations: 'Khám phá',
            profile: 'Hồ sơ',
            supportNote: 'Nếu cần hỗ trợ khẩn cấp, hãy gọi <strong>1800 1567</strong>',
            chatHeader: 'Calmi - AI Đồng hành của bạn'
        },
        en: {
            home: 'Home',
            mood: 'Mood',
            chat: 'Chat',
            recommendations: 'Explore',
            profile: 'Profile',
            supportNote: 'If you need urgent support, call <strong>988</strong> (US) or <strong>1800 1567</strong> (Vietnam)',
            chatHeader: 'Calmi - Your AI Companion'
        }
    };
    
    // Update navigation
    document.querySelectorAll('.nav-text').forEach((element, index) => {
        const keys = ['home', 'mood', 'chat', 'recommendations', 'profile'];
        element.textContent = translations[userLang][keys[index]];
    });
    
    // Update chat header
    const chatHeader = document.querySelector('.chat-header h3');
    if (chatHeader) {
        chatHeader.textContent = translations[userLang].chatHeader;
    }
    
    // Update support note
    const supportNote = document.querySelector('.chat-support-note');
    if (supportNote) {
        supportNote.innerHTML = translations[userLang].supportNote;
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Style based on type
    const colors = {
        success: '#4ade80',
        warning: '#fbbf24',
        error: '#f87171',
        info: '#60a5fa'
    };
    
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        padding: 15px 20px;
        background: white;
        border-left: 4px solid ${colors[type]};
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        z-index: 3000;
        animation: slideIn 0.3s ease;
        max-width: 300px;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// ====== Add CSS animations for notifications ======
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .notification {
        font-family: 'Inter', sans-serif;
        font-size: 0.95rem;
        color: #2D3748;
        line-height: 1.5;
    }
`;
document.head.appendChild(style);

// ====== Initialize settings/toggles ======
document.addEventListener('DOMContentLoaded', () => {
    // Dark mode toggle
    const darkModeToggle = document.querySelector('input[type="checkbox"]:last-of-type');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', (e) => {
            if (e.target.checked) {
                document.body.classList.add('dark-mode');
                localStorage.setItem('darkMode', 'true');
            } else {
                document.body.classList.remove('dark-mode');
                localStorage.setItem('darkMode', 'false');
            }
        });
        
        // Load saved dark mode preference
        if (localStorage.getItem('darkMode') === 'true') {
            darkModeToggle.checked = true;
            document.body.classList.add('dark-mode');
        }
    }
    
    // Daily reminder toggle
    const reminderToggle = document.querySelector('input[type="checkbox"]:first-of-type');
    if (reminderToggle) {
        reminderToggle.addEventListener('change', (e) => {
            localStorage.setItem('dailyReminder', e.target.checked);
            if (e.target.checked) {
                scheduleDailyReminder();
            }
        });
        
        // Load saved reminder preference
        const savedReminder = localStorage.getItem('dailyReminder');
        if (savedReminder === 'true') {
            reminderToggle.checked = true;
        }
    }
});

function scheduleDailyReminder() {
    // This would typically use service workers or push notifications
    // For now, just show a notification
    showNotification('Nhắc nhở hàng ngày đã được bật! 🔔', 'success');
}
