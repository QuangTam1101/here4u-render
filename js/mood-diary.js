// Mood Diary Management with Language Support
let moodData = JSON.parse(localStorage.getItem('moodData')) || {};
let selectedMood = null;
let selectedTags = [];
let currentDate = new Date();
let selectedDate = null;

// Translation strings
const translations = {
    vi: {
        monthNames: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
                    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'],
        dayHeaders: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
        howFeeling: 'Hôm nay bạn cảm thấy thế nào?',
        howFeelingDate: 'Ngày {date} bạn cảm thấy thế nào?',
        cannotSelectFuture: 'Không thể chọn ngày trong tương lai!',
        cannotViewFuture: 'Không thể xem tháng trong tương lai!',
        selectMood: 'Vui lòng chọn tâm trạng của bạn!',
        selectDate: 'Vui lòng chọn ngày!',
        moodUpdated: 'Đã cập nhật tâm trạng!',
        moodSaved: 'Đã lưu tâm trạng của bạn!',
        updateMood: 'Cập nhật tâm trạng',
        saveMood: 'Lưu tâm trạng',
        moodLabel: 'Tâm trạng',
        topFactors: 'Yếu tố ảnh hưởng nhiều nhất:',
        tagNames: {
            family: '👨‍👩‍👧‍👦 Gia đình',
            friends: '👥 Bạn bè',
            work: '💼 Công việc',
            study: '📚 Học tập',
            health: '💪 Sức khỏe',
            love: '❤️ Tình yêu'
        }
    },
    en: {
        monthNames: ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'],
        dayHeaders: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        howFeeling: 'How are you feeling today?',
        howFeelingDate: 'How did you feel on {date}?',
        cannotSelectFuture: 'Cannot select future dates!',
        cannotViewFuture: 'Cannot view future months!',
        selectMood: 'Please select your mood!',
        selectDate: 'Please select a date!',
        moodUpdated: 'Mood updated!',
        moodSaved: 'Your mood has been saved!',
        updateMood: 'Update Mood',
        saveMood: 'Save Mood',
        moodLabel: 'Mood',
        topFactors: 'Top influencing factors:',
        tagNames: {
            family: '👨‍👩‍👧‍👦 Family',
            friends: '👥 Friends',
            work: '💼 Work',
            study: '📚 Study',
            health: '💪 Health',
            love: '❤️ Love'
        }
    }
};

// Get current language
function getCurrentLanguage() {
    const settings = JSON.parse(localStorage.getItem('userSettings') || '{}');
    return settings.language || 'vi';
}

// Get translation
function t(key, params = {}) {
    const lang = getCurrentLanguage();
    let text = translations[lang][key] || translations['vi'][key];
    
    // Replace parameters
    Object.keys(params).forEach(param => {
        text = text.replace(`{${param}}`, params[param]);
    });
    
    return text;
}

// Initialize Mood Diary
document.addEventListener('DOMContentLoaded', function() {
    initializeCalendar();
    initializeMoodButtons();
    initializeTagButtons();
    loadMoodData();
    updateMoodChart();
    
    const today = new Date();
    selectDate(today.getFullYear(), today.getMonth(), today.getDate());
});

function initializeCalendar() {
    const calendar = document.getElementById('calendar');
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const today = new Date();
    const lang = getCurrentLanguage();
    
    calendar.innerHTML = '';
    
    // Add month/year navigation
    const monthNav = document.createElement('div');
    monthNav.className = 'month-navigation';
    monthNav.innerHTML = `
        <button onclick="previousMonth()">‹</button>
        <span>${getMonthName(month)} ${year}</span>
        <button onclick="nextMonth()">›</button>
    `;
    calendar.appendChild(monthNav);
    
    // Add day headers
    const dayHeaders = t('dayHeaders');
    dayHeaders.forEach(day => {
        const header = document.createElement('div');
        header.className = 'calendar-header';
        header.textContent = day;
        header.style.fontWeight = 'bold';
        header.style.textAlign = 'center';
        calendar.appendChild(header);
    });
    
    // Get first day of month
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Add empty cells
    for (let i = 0; i < firstDay; i++) {
        const emptyDay = document.createElement('div');
        calendar.appendChild(emptyDay);
    }
    
    // Add days
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = day;
        
        const dateObj = new Date(year, month, day);
        const dateKey = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        
        // Check if this is future date
        if (dateObj > today) {
            dayElement.classList.add('future-day');
            dayElement.style.opacity = '0.3';
            dayElement.style.cursor = 'not-allowed';
        } else {
            // Check if mood exists for this day
            if (moodData[dateKey]) {
                const mood = moodData[dateKey].mood;
                if (mood <= 2) dayElement.classList.add('sad');
                else if (mood >= 4) dayElement.classList.add('happy');
                else dayElement.classList.add('neutral');
            }
            
            // Add click event only for today and past dates
            dayElement.addEventListener('click', function() {
                selectDate(year, month, day);
            });
        }
        
        // Highlight today
        if (year === today.getFullYear() && 
            month === today.getMonth() && 
            day === today.getDate()) {
            dayElement.classList.add('today');
        }
        
        // Highlight selected date
        if (selectedDate && 
            year === selectedDate.getFullYear() && 
            month === selectedDate.getMonth() && 
            day === selectedDate.getDate()) {
            dayElement.classList.add('selected-day');
        }
        
        calendar.appendChild(dayElement);
    }
}

function selectDate(year, month, day) {
    const selected = new Date(year, month, day);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    if (selected > today) {
        showNotification(t('cannotSelectFuture'), 'error');
        return;
    }
    
    selectedDate = selected;
    
    const dateKey = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    
    // Update header to show selected date
    const header = document.querySelector('.mood-input-section h3');
    if (header) {
        const dateStr = formatDate(selected);
        const isToday = isSameDay(selected, new Date());
        header.textContent = isToday ? 
            t('howFeeling') : 
            t('howFeelingDate', { date: dateStr });
    }
    
    // Load existing mood data if exists
    if (moodData[dateKey]) {
        const data = moodData[dateKey];
        selectedMood = data.mood;
        document.getElementById('moodNote').value = data.note || '';
        selectedTags = data.tags || [];
        
        updateMoodButtons();
        updateTagButtons();
        
        const saveBtn = document.querySelector('.save-mood-btn');
        if (saveBtn) {
            saveBtn.textContent = t('updateMood');
        }
    } else {
        selectedMood = null;
        selectedTags = [];
        document.getElementById('moodNote').value = '';
        updateMoodButtons();
        updateTagButtons();
        
        const saveBtn = document.querySelector('.save-mood-btn');
        if (saveBtn) {
            saveBtn.textContent = t('saveMood');
        }
    }
    
    initializeCalendar();
}

function getMonthName(month) {
    const monthNames = t('monthNames');
    return monthNames[month];
}

function formatDate(date) {
    const lang = getCurrentLanguage();
    if (lang === 'en') {
        return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    }
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

function isSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
}

function previousMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    initializeCalendar();
}

function nextMonth() {
    const today = new Date();
    const nextMonth = new Date(currentDate);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    if (nextMonth.getMonth() <= today.getMonth() || 
        nextMonth.getFullYear() < today.getFullYear()) {
        currentDate = nextMonth;
        initializeCalendar();
    } else {
        showNotification(t('cannotViewFuture'), 'warning');
    }
}

function saveMood() {
    if (!selectedMood) {
        showNotification(t('selectMood'), 'error');
        return;
    }
    
    if (!selectedDate) {
        showNotification(t('selectDate'), 'error');
        return;
    }
    
    const dateKey = `${selectedDate.getFullYear()}-${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}-${selectedDate.getDate().toString().padStart(2, '0')}`;
    
    const isUpdate = !!moodData[dateKey];
    
    moodData[dateKey] = {
        mood: selectedMood,
        note: document.getElementById('moodNote').value,
        tags: selectedTags,
        timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('moodData', JSON.stringify(moodData));
    
    initializeCalendar();
    updateMoodChart();
    
    const message = isUpdate ? t('moodUpdated') : t('moodSaved');
    showNotification(message, 'success');
    
    selectedMood = null;
    selectedTags = [];
    document.getElementById('moodNote').value = '';
    updateMoodButtons();
    updateTagButtons();
    
    const today = new Date();
    selectDate(today.getFullYear(), today.getMonth(), today.getDate());
}

function updateMoodChart() {
    const ctx = document.getElementById('moodChart');
    if (!ctx) return;
    
    const labels = [];
    const data = [];
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
        
        labels.push(`${date.getDate()}/${date.getMonth() + 1}`);
        data.push(moodData[dateKey] ? moodData[dateKey].mood : null);
    }
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: t('moodLabel'),
                data: data,
                borderColor: 'rgb(124, 77, 255)',
                backgroundColor: 'rgba(124, 77, 255, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 5,
                    ticks: {
                        callback: function(value) {
                            const moods = ['', '😢', '😔', '😐', '🙂', '😄'];
                            return moods[value] || '';
                        }
                    }
                }
            }
        }
    });
    
    updateTopFactors();
}

function updateTopFactors() {
    const factorCounts = {};
    
    Object.values(moodData).forEach(entry => {
        if (entry.tags) {
            entry.tags.forEach(tag => {
                factorCounts[tag] = (factorCounts[tag] || 0) + 1;
            });
        }
    });
    
    const topFactors = Object.entries(factorCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);
    
    const container = document.getElementById('topFactors');
    container.innerHTML = `<h4>${t('topFactors')}</h4>`;
    
    const tagNames = t('tagNames');
    
    topFactors.forEach(([tag, count]) => {
        const badge = document.createElement('div');
        badge.className = 'factor-badge';
        badge.innerHTML = `${tagNames[tag]} (${count})`;
        container.appendChild(badge);
    });
}

// Keep existing button initialization functions
function initializeMoodButtons() {
    document.querySelectorAll('.mood-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            selectedMood = parseInt(this.dataset.mood);
            updateMoodButtons();
        });
    });
}

function updateMoodButtons() {
    document.querySelectorAll('.mood-btn').forEach(btn => {
        if (parseInt(btn.dataset.mood) === selectedMood) {
            btn.classList.add('selected');
        } else {
            btn.classList.remove('selected');
        }
    });
}

function initializeTagButtons() {
    document.querySelectorAll('.tag-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tag = this.dataset.tag;
            if (selectedTags.includes(tag)) {
                selectedTags = selectedTags.filter(t => t !== tag);
            } else {
                selectedTags.push(tag);
            }
            updateTagButtons();
        });
    });
}

function updateTagButtons() {
    document.querySelectorAll('.tag-btn').forEach(btn => {
        if (selectedTags.includes(btn.dataset.tag)) {
            btn.classList.add('selected');
        } else {
            btn.classList.remove('selected');
        }
    });
}

function loadMoodData() {
    const saved = localStorage.getItem('moodData');
    if (saved) {
        moodData = JSON.parse(saved);
    }
}
