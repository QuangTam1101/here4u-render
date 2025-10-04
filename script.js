// ====== Global Variables ======
let userLang = "vi";
let currentSection = "home";
let moodData = JSON.parse(localStorage.getItem('moodData')) || {};
let userPreferences = JSON.parse(localStorage.getItem('userPreferences')) || {};
let knownCause = false; // Thêm biến này

// ====== API Configuration ======
const API_URL = `${window.location.origin}/chat`;

// ====== Base Prompts cho Gemini ======
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

// ====== Helper Functions ======
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
        "gay", "les", "lgbt", "đồng tính", "song tính", "chuyển giới", "giới tính", "bị kỳ thị", "kỳ thị", "coming out", "queer", "bị ba mẹ kỳ thị", "bị gia đình kỳ thị",
        // Stress, lo âu
        "stress", "lo lắng", "căng thẳng", "mệt mỏi", "kiệt sức", "bị trầm cảm", "buồn",
        // Bắt nạt, bạo lực
        "bắt nạt", "bị bắt nạt", "bạo lực", "bạo hành", "bị đánh", "bị chửi",
        // Tự ti, áp lực bản thân
        "tự ti", "ghét bản thân", "tệ hại", "không giỏi", "vô dụng", "không ai yêu", "không ai hiểu",
        // Khác
        "sức khỏe", "thân thể", "ngoại hình", "béo", "ốm", "mập", "gầy", "tự hại", "tự làm đau"
    ];
    return keywords.some(keyword => lowerMsg.includes(keyword));
}

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

// ====== Chat System (Updated with Gemini API) ======
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
}

function sendMessage() {
    const messageInput = document.querySelector('.message-input');
    const chatBody = document.querySelector('.chat-body');
    
    const message = messageInput.value.trim();
    if (!message) return;
    
    // Add user message
    const userMessageDiv = document.createElement('div');
    userMessageDiv.className = 'message user-message';
    userMessageDiv.innerHTML = `<div class="message-text">${message}</div>`;
    chatBody.appendChild(userMessageDiv);
    
    messageInput.value = '';
    
    // Scroll to bottom
    chatBody.scrollTop = chatBody.scrollHeight;
    
    // Check for known cause
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
        
        // Generate bot response with Gemini API
        generateBotResponse(message, typingDiv);
    }, 600);
}

function showBotGreeting() {
    const chatBody = document.querySelector('.chat-body');
    if (!chatBody) return;
    
    const greetings = {
        vi: `Chào bạn! Mình là <strong>Calmi</strong> – một người bạn ảo luôn sẵn sàng lắng nghe và đồng hành cùng bạn 😊  Mọi phản hồi đều do AI tạo ra và chỉ mang tính tham khảo, không thay thế cho tư vấn chuyên môn 💛  
Bạn muốn chia sẻ điều gì hôm nay?`,
        en: `Hi there! I'm <strong>Calmi</strong> – your virtual companion who's here to listen and support you 😊  All responses are AI-generated and should be seen as support, not a replacement for professional advice 💛  
What would you like to share today?`
    };
    
    const greetingDiv = document.createElement('div');
    greetingDiv.className = 'message bot-message';
    greetingDiv.innerHTML = `
        ${getSVGIcon()}
        <div class="message-text">${greetings[userLang]}</div>
    `;
    chatBody.appendChild(greetingDiv);
}

async function generateBotResponse(userMessage, typingDiv) {
    const messageElement = typingDiv.querySelector(".message-text");
    
    let dynamicPrompt = "";
    if (!knownCause) {
        dynamicPrompt = userLang === 'vi' 
            ? `Hãy chỉ lắng nghe và hỏi nhẹ nhàng thêm để hiểu rõ điều khiến bạn ấy stress, buồn, lo lắng, KHÔNG đưa ra lời khuyên vội.`
            : `Just listen and gently ask more to understand what's making them stressed, sad, or anxious. DO NOT rush to give advice.`;
    } else {
        dynamicPrompt = userLang === 'vi'
            ? `Bạn đã biết nguyên nhân khiến bạn ấy stress, buồn, lo lắng, giờ bạn có thể đưa ra một lời khuyên nhẹ nhàng, thực tế, không phán xét, không ép buộc.`
            : `You now know the cause of their stress, sadness, or anxiety. You can now offer gentle, practical, non-judgmental, non-forcing advice.`;
    }
    
    const fullPrompt = `${basePrompt[userLang]}\n${dynamicPrompt}\n\n${userLang === 'vi' ? 'Người dùng chia sẻ' : 'User shares'}:\n"${userMessage}"`;
    
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
    
    try {
        const response = await fetch(API_URL, requestOptions);
        const data = await response.json();
        console.log("API response:", data);
        
        if (!response.ok || !data.candidates || !data.candidates[0]) {
            throw new Error(data.error?.message || "Unknown error");
        }
        
        const apiResponseText = data.candidates[0].content.parts[0].text
            .replace(/\*\*(.*?)\*\*/g, "$1")
            .trim();
        
        messageElement.innerHTML = apiResponseText;
    } catch (error) {
        console.error("Error generating bot response:", error);
        messageElement.innerHTML = userLang === 'vi' 
            ? "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại."
            : "Sorry, an error occurred. Please try again.";
    } finally {
        typingDiv.classList.remove("thinking");
        const chatBody = document.querySelector('.chat-body');
        chatBody.scrollTop = chatBody.scrollHeight;
    }
}

function getSVGIcon() {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 1024 1024">
        <path d="M738.3 287.6H285.7c-59 0-106.8 47.8-106.8 106.8v303.1c0 59 47.8 106.8 106.8 106.8h81.5v111.1c0 .7.8 1.1 1.4.7l166.9-110.6 41.8-.8h117.4l43.6-.4c59 0 106.8-47.8 106.8-106.8V394.5c0-59-47.8-106.9-106.8-106.9zM351.7 448.2c0-29.5 23.9-53.5 53.5-53.5s53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5-53.5-23.9-53.5-53.5zm157.9 267.1c-67.8 0-123.8-47.5-132.3-109h264.6c-8.6 61.5-64.5 109-132.3 109zm110-213.7c-29.5 0-53.5-23.9-53.5-53.5s23.9-53.5 53.5-53.5 53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5zM867.2 644.5V453.1h26.5c19.4 0 35.1 15.7 35.1 35.1v121.1c0 19.4-15.7 35.1-35.1 35.1h-26.5zM95.2 609.4V488.2c0-19.4 15.7-35.1 35.1-35.1h26.5v191.3h-26.5c-19.4 0-35.1-15.7-35.1-35.1zM561.5 149.6c0 23.4-15.6 43.3-36.9 49.7v44.9h-30v-44.9c-21.4-6.5-36.9-26.3-36.9-49.7 0-28.6 23.3-51.9 51.9-51.9s51.9 23.3 51.9 51.9z"></path>
    </svg>`;
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
}

function generateMoodBasedRecommendations(mood) {
    // Generate personalized recommendations based on mood
    if (mood === 'sad' || mood === 'very-sad') {
        // Show uplifting content
        showNotification('Chúng tôi đã cập nhật gợi ý phù hợp với tâm trạng của bạn', 'info');
    } else if (mood === 'very-happy' || mood === 'happy') {
        // Show content to maintain positive mood
        showNotification('Tuyệt vời! Hãy duy trì tâm trạng tích cực này nhé!', 'success');
    }
}

// ====== Breathing Exercise ======
function initializeBreathingExercise() {
    const breathingBtn = document.querySelector('.breathing-btn');
    const breathingExercise = document.querySelector('.breathing-exercise');
    const closeBtn = document.querySelector('.close-breathing');
    const breathingText = document.querySelector('.breathing-text');
    
    if (!breathingBtn || !breathingExercise) return;
    
    breathingBtn.addEventListener('click', () => {
        breathingExercise.classList.remove('hidden');
        startBreathingAnimation();
    });
    
    closeBtn?.addEventListener('click', () => {
        breathingExercise.classList.add('hidden');
    });
    
    function startBreathingAnimation() {
        const phases = [
            { text: 'Hít vào...', duration: 4000 },
            { text: 'Giữ...', duration: 4000 },
            { text: 'Thở ra...', duration: 4000 }
        ];
        
        let currentPhase = 0;
        
        function animatePhase() {
            if (breathingExercise.classList.contains('hidden')) return;
            
            breathingText.textContent = phases[currentPhase].text;
            currentPhase = (currentPhase + 1) % phases.length;
            
            setTimeout(animatePhase, phases[currentPhase].duration);
        }
        
        animatePhase();
    }
}

// ====== Profile ======
function initializeProfile() {
    const profileName = document.querySelector('.profile-name');
    const profileBio = document.querySelector('.profile-bio');
    
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
}

// ====== Utility Functions ======
function updateLanguage() {
    // Update UI text based on selected language
    const translations = {
        vi: {
            home: 'Trang chủ',
            mood: 'Tâm trạng',
            chat: 'Trò chuyện',
            recommendations: 'Khám phá',
            profile: 'Hồ sơ'
        },
        en: {
            home: 'Home',
            mood: 'Mood',
            chat: 'Chat',
            recommendations: 'Explore',
            profile: 'Profile'
        }
    };
    
    document.querySelectorAll('.nav-text').forEach((element, index) => {
        const keys = Object.keys(translations[userLang]);
        element.textContent = translations[userLang][keys[index]];
    });
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        padding: 15px 20px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        z-index: 3000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
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
`;
document.head.appendChild(style);
