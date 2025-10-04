// ====== Global Variables ======
let userLang = "vi";
let currentSection = "home";
let moodData = JSON.parse(localStorage.getItem('moodData')) || {};
let userPreferences = JSON.parse(localStorage.getItem('userPreferences')) || {};

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

// ====== Chat System ======
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
        
        // Generate bot response
        generateBotResponse(message, typingDiv);
    }, 500);
}

function showBotGreeting() {
    const chatBody = document.querySelector('.chat-body');
    if (!chatBody) return;
    
    const greetings = {
        vi: `Chào bạn! Mình là <strong>Calmi</strong> – người bạn AI luôn sẵn sàng lắng nghe và hỗ trợ bạn 💜 Bạn muốn chia sẻ điều gì hôm nay?`,
        en: `Hi there! I'm <strong>Calmi</strong> – your AI companion who's here to listen and support you 💜 What would you like to share today?`
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
    // This is a simplified version - integrate with your API
    const responses = {
        vi: [
            "Mình hiểu cảm xúc của bạn. Bạn có muốn chia sẻ thêm không?",
            "Cảm ơn bạn đã tin tưởng chia sẻ với mình. Mình luôn ở đây để lắng nghe.",
            "Điều đó nghe có vẻ khó khăn. Bạn đã thử làm gì để cảm thấy tốt hơn chưa?",
            "Mình nghĩ bạn rất dũng cảm khi chia sẻ điều này. Hãy nhớ rằng bạn không đơn độc nhé."
        ],
        en: [
            "I understand how you're feeling. Would you like to share more?",
            "Thank you for trusting me with this. I'm here to listen.",
            "That sounds challenging. Have you tried anything to feel better?",
            "I think you're brave for sharing this. Remember, you're not alone."
        ]
    };
    
    // Simulate API delay
    setTimeout(() => {
        const randomResponse = responses[userLang][Math.floor(Math.random() * responses[userLang].length)];
        typingDiv.classList.remove('thinking');
        typingDiv.querySelector('.message-text').innerHTML = randomResponse;
        
        const chatBody = document.querySelector('.chat-body');
        chatBody.scrollTop = chatBody.scrollHeight;
    }, 1500);
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
