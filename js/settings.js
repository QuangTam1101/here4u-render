// settings.js - FIXED VERSION với confirm dialog và translation emoji
let userSettings = {
    language: 'vi',
    notifications: true,
    notificationTime: '20:00',
    theme: 'rainbow'
};

// Initialize Settings
document.addEventListener('DOMContentLoaded', function() {
    loadSettings();
    initializeSettingsHandlers();
});

function loadSettings() {
    const saved = localStorage.getItem('userSettings');
    if (saved) {
        userSettings = JSON.parse(saved);
        applySettings();
    }
}

function applySettings() {
    // Apply language
    document.getElementById('languageSelect').value = userSettings.language;
    
    // Apply notification settings
    document.getElementById('notificationToggle').checked = userSettings.notifications;
    
    // Apply theme if implemented
    if (userSettings.theme) {
        applyTheme(userSettings.theme);
    }
    
    // Apply language to UI
    if (userSettings.language === 'en') {
        translateToEnglish();
    }
}

function initializeSettingsHandlers() {
    // Language change với confirmation
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) {
        languageSelect.addEventListener('change', function() {
            const newLang = this.value;
            const oldLang = userSettings.language;
            
            // Confirm message based on selected language
            const confirmMsg = newLang === 'en' 
                ? 'Do you want to change the language to English?' 
                : 'Bạn có muốn đổi ngôn ngữ sang Tiếng Việt không?';
            
            if (confirm(confirmMsg)) {
                userSettings.language = newLang;
                saveSettings();
                
                if (newLang === 'en') {
                    translateToEnglish();
                } else {
                    translateToVietnamese();
                }
                
                window.dispatchEvent(new Event('languageChanged'));

                showNotification(
                    newLang === 'en' ? 'Language changed to English' : 'Đã đổi ngôn ngữ sang Tiếng Việt',
                    'success'
                );
            } else {
                // Revert selection if cancelled
                this.value = oldLang;
            }
        });
    }
    
    // Notification toggle
    const notificationToggle = document.getElementById('notificationToggle');
    if (notificationToggle) {
        notificationToggle.addEventListener('change', function() {
            userSettings.notifications = this.checked;
            saveSettings();
            
            const msg = userSettings.language === 'en' 
                ? (this.checked ? 'Notifications enabled' : 'Notifications disabled')
                : (this.checked ? 'Đã bật thông báo nhắc nhở' : 'Đã tắt thông báo nhắc nhở');
            
            if (this.checked) {
                requestNotificationPermission();
            }
            showNotification(msg, 'success');
        });
    }
}

function saveSettings() {
    localStorage.setItem('userSettings', JSON.stringify(userSettings));
}

function openSettings() {
    document.getElementById('settingsModal').style.display = 'block';
}

function closeSettings() {
    document.getElementById('settingsModal').style.display = 'none';
}

// COMPREHENSIVE TRANSLATION DICTIONARY với emoji support
const translations = {
    en: {
        // Header & Auth
        'Calm Space': 'Calm Space',
        'Đăng nhập': 'Login',
        'Đăng ký': 'Register',
        'Đăng xuất': 'Logout',
        
        // Welcome Screen
        'Chào mừng đến với Calm Space': 'Welcome to Calm Space',
        'Không gian an toàn cho sức khỏe tâm lý của bạn': 'A safe space for your mental health',
        'Bắt đầu hành trình': 'Start your journey',
        
        // Navigation
        'Nhật ký tâm trạng': 'Mood Diary',
        'Calmi AI': 'Calmi AI',
        'Khám phá': 'Explore',
        'Hồ sơ': 'Profile',
        
        // Features
        'Theo dõi và phân tích cảm xúc hàng ngày của bạn': 'Track and analyze your daily emotions',
        'Người bạn AI luôn sẵn sàng lắng nghe và hỗ trợ': 'AI companion always ready to listen and support',
        'Bài viết, bài tập và âm nhạc thư giãn': 'Articles, exercises and relaxing music',
        
        // Mood Diary
        'Hôm nay bạn cảm thấy thế nào?': 'How are you feeling today?',
        'Chia sẻ thêm về ngày hôm nay... (tùy chọn)': 'Share more about today... (optional)',
        'Chọn chủ đề liên quan:': 'Select related topics:',
        
        // Tag buttons với emoji - FIXED
        '👨‍👩‍👧‍👦 Gia đình': '👨‍👩‍👧‍👦 Family',
        '👥 Bạn bè': '👥 Friends',
        '💼 Công việc': '💼 Work',
        '📚 Học tập': '📚 Study',
        '💪 Sức khỏe': '💪 Health',
        '❤️ Tình yêu': '❤️ Love',
        
        'Lưu tâm trạng': 'Save Mood',
        'Phân tích tâm trạng tuần qua': 'Last week mood analysis',
        
        // Calmi Chat
        'Sẵn sàng lắng nghe bạn': 'Ready to listen to you',
        'Xin chào! Mình là Calmi, người bạn AI của bạn. Bạn có thể chia sẻ với mình bất cứ điều gì. Mình ở đây để lắng nghe và hỗ trợ bạn. 💙': 
        'Hello! I\'m Calmi, your AI friend. You can share anything with me. I\'m here to listen and support you. 💙',
        'Nhập tin nhắn...': 'Type your message...',
        'Xóa lịch sử chat': 'Clear chat history',
        
        // Explore
        '📚 Bài viết': '📚 Articles',
        '🧘 Bài tập': '🧘 Exercises',
        '🎵 Âm nhạc': '🎵 Music',
        '5 cách giảm stress hiệu quả': '5 effective ways to reduce stress',
        'Khám phá các phương pháp đơn giản giúp bạn giảm căng thẳng trong cuộc sống hàng ngày.': 
        'Discover simple methods to reduce stress in daily life.',
        'Mindfulness cho người mới bắt đầu': 'Mindfulness for beginners',
        'Hướng dẫn cơ bản về chánh niệm và cách áp dụng vào cuộc sống.': 
        'Basic guide to mindfulness and how to apply it in life.',
        'Đọc thêm →': 'Read more →',
        'Bài tập thở 4-7-8': '4-7-8 Breathing Exercise',
        'Kỹ thuật thở giúp thư giãn và giảm lo âu': 'Breathing technique to relax and reduce anxiety',
        'Thiền 5 phút': '5-Minute Meditation',
        'Thiền ngắn giúp tập trung và bình tĩnh': 'Short meditation for focus and calm',
        'Bắt đầu': 'Start',
        'Tiếng mưa nhẹ': 'Gentle Rain Sounds',
        'Sóng biển êm dịu': 'Calm Ocean Waves',
        '30 phút': '30 minutes',
        '45 phút': '45 minutes',
        
        // Profile
        'Đã sử dụng:': 'Days used:',
        'ngày': 'days',
        'Tâm trạng trung bình': 'Average Mood',
        'Chuỗi ghi chép': 'Recording Streak',
        'Thành tựu': 'Achievements',
        '0 ngày': '0 days',
        
        // Settings
        'Cài đặt': 'Settings',
        'Ngôn ngữ / Language': 'Language',
        'Tiếng Việt': 'Vietnamese',
        'English': 'English',
        'Thông báo nhắc ghi tâm trạng': 'Mood reminder notifications',
        
        // Modals
        'Chào mừng bạn!': 'Welcome!',
        'Đăng nhập để bắt đầu hành trình chăm sóc sức khỏe tâm lý': 
        'Sign in to start your mental health journey'
    },
    vi: {
        // Reverse translations
        'Login': 'Đăng nhập',
        'Register': 'Đăng ký',
        'Logout': 'Đăng xuất',
        'Welcome to Calm Space': 'Chào mừng đến với Calm Space',
        'A safe space for your mental health': 'Không gian an toàn cho sức khỏe tâm lý của bạn',
        'Start your journey': 'Bắt đầu hành trình',
        'Mood Diary': 'Nhật ký tâm trạng',
        'Explore': 'Khám phá',
        'Profile': 'Hồ sơ',

        'Clear chat history': 'Xóa lịch sử chat',
        
        // Tag buttons reverse - FIXED
        '👨‍👩‍👧‍👦 Family': '👨‍👩‍👧‍👦 Gia đình',
        '👥 Friends': '👥 Bạn bè',
        '💼 Work': '💼 Công việc',
        '📚 Study': '📚 Học tập',
        '💪 Health': '💪 Sức khỏe',
        '❤️ Love': '❤️ Tình yêu',
        
        'How are you feeling today?': 'Hôm nay bạn cảm thấy thế nào?',
        'Share more about today... (optional)': 'Chia sẻ thêm về ngày hôm nay... (tùy chọn)',
        'Select related topics:': 'Chọn chủ đề liên quan:',
        'Save Mood': 'Lưu tâm trạng',
        'Last week mood analysis': 'Phân tích tâm trạng tuần qua',
        'Ready to listen to you': 'Sẵn sàng lắng nghe bạn',
        'Type your message...': 'Nhập tin nhắn...',
        '📚 Articles': '📚 Bài viết',
        '🧘 Exercises': '🧘 Bài tập',
        '🎵 Music': '🎵 Âm nhạc',
        'Read more →': 'Đọc thêm →',
        'Start': 'Bắt đầu',
        'Days used:': 'Đã sử dụng:',
        'days': 'ngày',
        '0 days': '0 ngày',
        'Average Mood': 'Tâm trạng trung bình',
        'Recording Streak': 'Chuỗi ghi chép',
        'Achievements': 'Thành tựu',
        'Settings': 'Cài đặt',
        'Language': 'Ngôn ngữ / Language',
        'Vietnamese': 'Tiếng Việt',
        'Mood reminder notifications': 'Thông báo nhắc ghi tâm trạng',
        'Welcome!': 'Chào mừng bạn!',
        'Sign in to start your mental health journey': 'Đăng nhập để bắt đầu hành trình chăm sóc sức khỏe tâm lý'
    }
};

function translateToEnglish() {
    translatePage(translations.en);
}

function translateToVietnamese() {
    translatePage(translations.vi);
}

function translatePage(dictionary) {
    // Translate all text elements including buttons with emoji
    document.querySelectorAll('h1, h2, h3, h4, p, span, button, label, option, a, div').forEach(element => {
        // Handle tag buttons specially
        if (element.classList.contains('tag-btn')) {
            const fullText = element.textContent.trim();
            if (dictionary[fullText]) {
                element.textContent = dictionary[fullText];
            }
        } else if (element.childNodes.length === 1 && element.childNodes[0].nodeType === 3) {
            // Single text node
            const text = element.textContent.trim();
            if (text && dictionary[text]) {
                element.textContent = dictionary[text];
            }
        } else {
            // Multiple nodes - translate only text nodes
            Array.from(element.childNodes).forEach(node => {
                if (node.nodeType === 3) { // Text node
                    const text = node.textContent.trim();
                    if (text && dictionary[text]) {
                        node.textContent = dictionary[text];
                    }
                }
            });
        }
    });
    
    // Translate placeholders
    document.querySelectorAll('[placeholder]').forEach(element => {
        const text = element.placeholder;
        if (dictionary[text]) {
            element.placeholder = dictionary[text];
        }
    });
}

// Notification management
function requestNotificationPermission() {
    if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                scheduleNotification();
            }
        });
    }
}

function scheduleNotification() {
    if (userSettings.notifications && 'Notification' in window && Notification.permission === 'granted') {
        const now = new Date();
        const [hours, minutes] = userSettings.notificationTime.split(':');
        const scheduledTime = new Date();
        scheduledTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        
        if (scheduledTime > now) {
            const timeout = scheduledTime - now;
            setTimeout(() => {
                showBrowserNotification();
                setTimeout(() => scheduleNotification(), 24 * 60 * 60 * 1000);
            }, timeout);
        }
    }
}

function showBrowserNotification() {
    const title = userSettings.language === 'en' ? 'Calm Space' : 'Calm Space';
    const body = userSettings.language === 'en' 
        ? "Don't forget to record your mood today! 💙"
        : 'Đừng quên ghi lại tâm trạng của bạn hôm nay nhé! 💙';
    
    new Notification(title, {
        body: body,
        icon: '/Ảnh/logo.png'
    });
}

// Theme management
function applyTheme(themeName) {
    const root = document.documentElement;
    
    const themes = {
        rainbow: {
            '--rainbow-1': '#FFB3BA',
            '--rainbow-2': '#FFDAB3',
            '--rainbow-3': '#FFFAB3',
            '--rainbow-4': '#BAFFB3',
            '--rainbow-5': '#B3E5FF',
            '--rainbow-6': '#E0B3FF'
        },
        ocean: {
            '--primary': '#6A5ACD',
            '--secondary': '#20B2AA'
        }
    };
    
    if (themes[themeName]) {
        Object.entries(themes[themeName]).forEach(([key, value]) => {
            root.style.setProperty(key, value);
        });
    }
}

// Export functions
window.openSettings = openSettings;
window.closeSettings = closeSettings;
window.getUserSettings = function() {
    return userSettings;
};
