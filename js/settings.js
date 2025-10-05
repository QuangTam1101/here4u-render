// Settings Management
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
    // Language change
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) {
        languageSelect.addEventListener('change', function() {
            userSettings.language = this.value;
            saveSettings();
            
            if (this.value === 'en') {
                translateToEnglish();
            } else {
                translateToVietnamese();
            }
            
            showNotification(
                this.value === 'en' ? 'Language changed to English' : 'Đã đổi ngôn ngữ sang Tiếng Việt',
                'success'
            );
        });
    }
    
    // Notification toggle
    const notificationToggle = document.getElementById('notificationToggle');
    if (notificationToggle) {
        notificationToggle.addEventListener('change', function() {
            userSettings.notifications = this.checked;
            saveSettings();
            
            if (this.checked) {
                requestNotificationPermission();
                showNotification('Đã bật thông báo nhắc nhở', 'success');
            } else {
                showNotification('Đã tắt thông báo nhắc nhở', 'success');
            }
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
        // Check if it's time for reminder
        const now = new Date();
        const [hours, minutes] = userSettings.notificationTime.split(':');
        const scheduledTime = new Date();
        scheduledTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        
        if (scheduledTime > now) {
            const timeout = scheduledTime - now;
            setTimeout(() => {
                showBrowserNotification();
                // Schedule for next day
                setTimeout(() => scheduleNotification(), 24 * 60 * 60 * 1000);
            }, timeout);
        }
    }
}

function showBrowserNotification() {
    new Notification('Calm Space', {
        body: 'Đừng quên ghi lại tâm trạng của bạn hôm nay nhé! 💙',
        icon: '/images/avatar.jpg',
        badge: '/images/avatar.jpg'
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
        sunset: {
            '--rainbow-1': '#FF6B6B',
            '--rainbow-2': '#FFB366',
            '--rainbow-3': '#FFD93D',
            '--rainbow-4': '#6BCB77',
            '--rainbow-5': '#4D96FF',
            '--rainbow-6': '#9D84B7'
        },
        ocean: {
            '--rainbow-1': '#E8F6FF',
            '--rainbow-2': '#B8E3FF',
            '--rainbow-3': '#7FC8F5',
            '--rainbow-4': '#5AA7E5',
            '--rainbow-5': '#3E7CB1',
            '--rainbow-6': '#2C5985'
        }
    };
    
    if (themes[themeName]) {
        Object.entries(themes[themeName]).forEach(([key, value]) => {
            root.style.setProperty(key, value);
        });
    }
}

// Translation functions
const translations = {
    en: {
        'Nhật ký tâm trạng': 'Mood Diary',
        'Khám phá': 'Explore',
        'Hồ sơ': 'Profile',
        'Cài đặt': 'Settings',
        'Đăng nhập': 'Login',
        'Đăng ký': 'Register',
        'Đăng xuất': 'Logout',
        'Hôm nay bạn cảm thấy thế nào?': 'How are you feeling today?',
        'Lưu tâm trạng': 'Save Mood',
        'Chọn chủ đề liên quan:': 'Select related topics:',
        'Gia đình': 'Family',
        'Bạn bè': 'Friends',
        'Công việc': 'Work',
        'Học tập': 'Study',
        'Sức khỏe': 'Health',
        'Tình yêu': 'Love'
    },
    vi: {
        'Mood Diary': 'Nhật ký tâm trạng',
        'Explore': 'Khám phá',
        'Profile': 'Hồ sơ',
        'Settings': 'Cài đặt',
        'Login': 'Đăng nhập',
        'Register': 'Đăng ký',
        'Logout': 'Đăng xuất',
        'How are you feeling today?': 'Hôm nay bạn cảm thấy thế nào?',
        'Save Mood': 'Lưu tâm trạng',
        'Select related topics:': 'Chọn chủ đề liên quan:',
        'Family': 'Gia đình',
        'Friends': 'Bạn bè',
        'Work': 'Công việc',
        'Study': 'Học tập',
        'Health': 'Sức khỏe',
        'Love': 'Tình yêu'
    }
};

function translateToEnglish() {
    translatePage(translations.en);
}

function translateToVietnamese() {
    translatePage(translations.vi);
}

function translatePage(dictionary) {
    // Translate all text nodes
    const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );
    
    let node;
    while (node = walker.nextNode()) {
        const text = node.textContent.trim();
        if (text && dictionary[text]) {
            node.textContent = dictionary[text];
        }
    }
    
    // Translate placeholders
    document.querySelectorAll('[placeholder]').forEach(element => {
        const text = element.placeholder;
        if (dictionary[text]) {
            element.placeholder = dictionary[text];
        }
    });
}

// Export settings
window.openSettings = openSettings;
window.closeSettings = closeSettings;
window.getUserSettings = function() {
    return userSettings;
};