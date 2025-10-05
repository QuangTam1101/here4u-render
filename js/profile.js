// Profile Management
let userStats = {
    avgMood: 0,
    streak: 0,
    achievements: []
};

// Initialize Profile
document.addEventListener('DOMContentLoaded', function() {
    if (currentUser) {
        loadUserProfile();
        calculateUserStats();
        loadAchievements();
    }
});

function loadUserProfile() {
    // This is already done in auth.js updateUserInterface()
    // Additional profile-specific loading can go here
}

function calculateUserStats() {
    const moodData = JSON.parse(localStorage.getItem('moodData')) || {};
    
    // Calculate average mood
    const moodValues = Object.values(moodData).map(entry => entry.mood);
    if (moodValues.length > 0) {
        const avgMood = moodValues.reduce((a, b) => a + b, 0) / moodValues.length;
        userStats.avgMood = avgMood.toFixed(1);
        
        // Update UI
        const avgMoodElement = document.getElementById('avgMood');
        if (avgMoodElement) {
            avgMoodElement.textContent = getMoodEmoji(Math.round(avgMood));
        }
    }
    
    // Calculate streak
    userStats.streak = calculateStreak(moodData);
    const streakElement = document.getElementById('streak');
    if (streakElement) {
        streakElement.textContent = `${userStats.streak} ngày`;
    }
    
    // Update achievements count
    const achievementsElement = document.getElementById('achievements');
    if (achievementsElement) {
        achievementsElement.textContent = userStats.achievements.length;
    }
}

function getMoodEmoji(mood) {
    const emojis = ['', '😢', '😔', '😐', '🙂', '😄'];
    return emojis[mood] || '😐';
}

function calculateStreak(moodData) {
    const dates = Object.keys(moodData).sort().reverse();
    if (dates.length === 0) return 0;
    
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < dates.length; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        const dateKey = checkDate.toISOString().split('T')[0];
        
        if (moodData[dateKey]) {
            streak++;
        } else if (i > 0) {
            // Streak broken (not counting today if not logged yet)
            break;
        }
    }
    
    return streak;
}

function loadAchievements() {
    const achievements = [
        {
            id: 'first_entry',
            name: 'Bước đầu tiên',
            description: 'Ghi nhật ký tâm trạng lần đầu',
            icon: '🌟',
            condition: () => Object.keys(JSON.parse(localStorage.getItem('moodData') || '{}')).length >= 1
        },
        {
            id: 'week_streak',
            name: 'Tuần kiên trì',
            description: 'Ghi nhật ký 7 ngày liên tiếp',
            icon: '🔥',
            condition: () => userStats.streak >= 7
        },
        {
            id: 'month_streak',
            name: 'Tháng bền bỉ',
            description: 'Ghi nhật ký 30 ngày liên tiếp',
            icon: '🏆',
            condition: () => userStats.streak >= 30
        },
        {
            id: 'happy_week',
            name: 'Tuần vui vẻ',
            description: 'Có tâm trạng tích cực 7 ngày liên tiếp',
            icon: '😊',
            condition: () => checkHappyWeek()
        },
        {
            id: 'self_aware',
            name: 'Tự nhận thức',
            description: 'Thêm ghi chú cho 10 ngày',
            icon: '📝',
            condition: () => checkNotesCount() >= 10
        }
    ];
    
    // Check which achievements are unlocked
    userStats.achievements = achievements.filter(a => a.condition());
    
    // Display achievements
    displayAchievements(achievements);
}

function displayAchievements(allAchievements) {
    const container = document.querySelector('.profile-container');
    
    // Check if achievements section exists
    let achievementsSection = document.querySelector('.profile-achievements');
    if (!achievementsSection) {
        achievementsSection = document.createElement('div');
        achievementsSection.className = 'profile-achievements';
        achievementsSection.innerHTML = '<h3>Thành tựu</h3><div class="achievements-grid"></div>';
        container.appendChild(achievementsSection);
    }
    
    const grid = achievementsSection.querySelector('.achievements-grid');
    grid.innerHTML = '';
    
    allAchievements.forEach(achievement => {
        const badge = document.createElement('div');
        badge.className = 'achievement-badge';
        
        const isUnlocked = userStats.achievements.find(a => a.id === achievement.id);
        if (isUnlocked) {
            badge.classList.add('unlocked');
        }
        
        badge.innerHTML = achievement.icon;
        badge.title = `${achievement.name}: ${achievement.description}`;
        
        grid.appendChild(badge);
    });
}

function checkHappyWeek() {
    const moodData = JSON.parse(localStorage.getItem('moodData')) || {};
    const dates = Object.keys(moodData).sort().reverse().slice(0, 7);
    
    if (dates.length < 7) return false;
    
    return dates.every(date => moodData[date].mood >= 4);
}

function checkNotesCount() {
    const moodData = JSON.parse(localStorage.getItem('moodData')) || {};
    return Object.values(moodData).filter(entry => entry.note && entry.note.trim()).length;
}

// Change avatar functionality
document.addEventListener('DOMContentLoaded', function() {
    const changeAvatarBtn = document.querySelector('.change-avatar-btn');
    if (changeAvatarBtn) {
        changeAvatarBtn.addEventListener('click', function() {
            changeAvatar();
        });
    }
});

function changeAvatar() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const newAvatar = e.target.result;
                
                // Update avatar in UI
                document.getElementById('profileAvatar').src = newAvatar;
                document.getElementById('userAvatar').src = newAvatar;
                
                // Save to localStorage
                if (currentUser) {
                    currentUser.picture = newAvatar;
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));
                }
                
                showNotification('Đã cập nhật ảnh đại diện!', 'success');
            };
            reader.readAsDataURL(file);
        }
    };
    
    input.click();
}

// Export stats for other modules
window.getUserStats = function() {
    return userStats;
};

// Refresh stats when needed
window.refreshUserStats = function() {
    calculateUserStats();
    loadAchievements();
};