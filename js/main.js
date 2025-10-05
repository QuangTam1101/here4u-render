// Main Application State
let currentUser = null;
let currentSection = 'homeSection';

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    checkAuthState();
});

function initializeApp() {
    // Load saved preferences
    loadUserPreferences();
    
    // Initialize components
    if (currentUser) {
        showMainApp();
    }
}

function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            const section = this.dataset.section;
            navigateToSection(section);
        });
    });
    
    // Tab navigation in Explore
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tab = this.dataset.tab;
            switchTab(tab);
        });
    });
}

function navigateToSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.app-section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Show selected section
    const section = document.getElementById(sectionId);
    if (section) {
        section.style.display = 'block';
        currentSection = sectionId;
    }
    
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.section === sectionId) {
            item.classList.add('active');
        }
    });
}

function switchTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(content => {
        content.style.display = 'none';
    });
    
    // Show selected tab
    document.getElementById(tabName + 'Tab').style.display = 'block';
    
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        }
    });
}

function showMainApp() {
    document.getElementById('homeSection').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
    document.getElementById('authButtons').style.display = 'none';
    document.getElementById('userInfo').style.display = 'flex';
    document.getElementById('logoutGroup').style.display = 'block';
    
    // Navigate to mood diary by default
    navigateToSection('moodDiary');
}

function hideMainApp() {
    document.getElementById('homeSection').style.display = 'block';
    document.getElementById('mainApp').style.display = 'none';
    document.getElementById('authButtons').style.display = 'flex';
    document.getElementById('userInfo').style.display = 'none';
    document.getElementById('logoutGroup').style.display = 'none';
}

function loadUserPreferences() {
    const preferences = localStorage.getItem('userPreferences');
    if (preferences) {
        const prefs = JSON.parse(preferences);
        applyPreferences(prefs);
    }
}

function applyPreferences(preferences) {
    // Apply language
    if (preferences.language) {
        document.getElementById('languageSelect').value = preferences.language;
        // Apply language changes here
    }
    
    // Apply notification settings
    if (preferences.notifications !== undefined) {
        document.getElementById('notificationToggle').checked = preferences.notifications;
    }
}

function saveUserPreferences() {
    const preferences = {
        language: document.getElementById('languageSelect').value,
        notifications: document.getElementById('notificationToggle').checked
    };
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
}

// Utility Functions
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Style
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 1rem 2rem;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#F44336' : '#2196F3'};
        color: white;
        border-radius: 10px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 3000;
        animation: slideIn 0.3s;
    `;
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add CSS for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);