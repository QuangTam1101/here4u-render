let moodData = JSON.parse(localStorage.getItem('moodData')) || {};
let selectedMood = null;
let selectedTags = [];
let currentDate = new Date();
let selectedDate = null;

// Helper function to get current language
function getCurrentLanguage() {
    const settings = localStorage.getItem('userSettings');
    if (settings) {
        const parsed = JSON.parse(settings);
        return parsed.language || 'vi';
    }
    return 'vi';
}

// Translation dictionary for mood diary specific texts
const moodDiaryTranslations = {
    en: {
        'Hôm nay bạn cảm thấy thế nào?': 'How are you feeling today?',
        'Ngày': 'Date',
        'bạn cảm thấy thế nào?': 'how did you feel?',
        'Lưu tâm trạng': 'Save Mood',
        'Cập nhật tâm trạng': 'Update Mood',
        'Yếu tố ảnh hưởng nhiều nhất:': 'Most influential factors:',
        'Vui lòng chọn tâm trạng của bạn!': 'Please select your mood!',
        'Vui lòng chọn ngày!': 'Please select a date!',
        'Đã cập nhật tâm trạng!': 'Mood updated!',
        'Đã lưu tâm trạng của bạn!': 'Your mood has been saved!',
        'Không thể chọn ngày trong tương lai!': 'Cannot select future dates!',
        'Không thể xem tháng trong tương lai!': 'Cannot view future months!',
        'Tháng 1': 'January',
        'Tháng 2': 'February',
        'Tháng 3': 'March',
        'Tháng 4': 'April',
        'Tháng 5': 'May',
        'Tháng 6': 'June',
        'Tháng 7': 'July',
        'Tháng 8': 'August',
        'Tháng 9': 'September',
        'Tháng 10': 'October',
        'Tháng 11': 'November',
        'Tháng 12': 'December'
    },
    vi: {
        'How are you feeling today?': 'Hôm nay bạn cảm thấy thế nào?',
        'Date': 'Ngày',
        'how did you feel?': 'bạn cảm thấy thế nào?',
        'Save Mood': 'Lưu tâm trạng',
        'Update Mood': 'Cập nhật tâm trạng',
        'Most influential factors:': 'Yếu tố ảnh hưởng nhiều nhất:',
        'Please select your mood!': 'Vui lòng chọn tâm trạng của bạn!',
        'Please select a date!': 'Vui lòng chọn ngày!',
        'Mood updated!': 'Đã cập nhật tâm trạng!',
        'Your mood has been saved!': 'Đã lưu tâm trạng của bạn!',
        'Cannot select future dates!': 'Không thể chọn ngày trong tương lai!',
        'Cannot view future months!': 'Không thể xem tháng trong tương lai!',
        'January': 'Tháng 1',
        'February': 'Tháng 2',
        'March': 'Tháng 3',
        'April': 'Tháng 4',
        'May': 'Tháng 5',
        'June': 'Tháng 6',
        'July': 'Tháng 7',
        'August': 'Tháng 8',
        'September': 'Tháng 9',
        'October': 'Tháng 10',
        'November': 'Tháng 11',
        'December': 'Tháng 12'
    }
};

// Helper function to translate mood diary texts
function translateMoodText(text) {
    const lang = getCurrentLanguage();
    if (lang === 'en' && moodDiaryTranslations.en[text]) {
        return moodDiaryTranslations.en[text];
    } else if (lang === 'vi' && moodDiaryTranslations.vi[text]) {
        return moodDiaryTranslations.vi[text];
    }
    return text;
}

// Initialize Mood Diary
document.addEventListener('DOMContentLoaded', function() {
    initializeCalendar();
    initializeMoodButtons();
    initializeTagButtons();
    loadMoodData();
    updateMoodChart();
    
    // Mặc định chọn ngày hôm nay
    const today = new Date();
    selectDate(today.getFullYear(), today.getMonth(), today.getDate());
});

function initializeCalendar() {
    const calendar = document.getElementById('calendar');
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const today = new Date();
    
    // Clear calendar
    calendar.innerHTML = '';
    
    // Add month/year navigation
    const monthNav = document.createElement('div');
    monthNav.className = 'month-navigation';
    monthNav.innerHTML = `
        <button onclick="previousMonth()">‹</button>
        <span>${translateMoodText(getMonthName(month))} ${year}</span>
        <button onclick="nextMonth()">›</button>
    `;
    calendar.appendChild(monthNav);
    
    // Add day headers
    const dayHeaders = getCurrentLanguage() === 'en' 
        ? ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
        : ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    
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
    today.setHours(23, 59, 59, 999); // Set to end of today
    
    // Check if selected date is in the future
    if (selected > today) {
        showNotification(translateMoodText('Không thể chọn ngày trong tương lai!'), 'error');
        return;
    }
    
    // Set selected date
    selectedDate = selected;
    
    const dateKey = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    
    // Update header to show selected date with proper translation
    const header = document.querySelector('.mood-input-section h3');
    if (header) {
        const isToday = isSameDay(selected, new Date());
        const lang = getCurrentLanguage();
        
        if (isToday) {
            header.textContent = lang === 'en' 
                ? 'How are you feeling today?'
                : 'Hôm nay bạn cảm thấy thế nào?';
        } else {
            const dateStr = formatDate(selected);
            if (lang === 'en') {
                header.textContent = `How did you feel on ${dateStr}?`;
            } else {
                header.textContent = `Ngày ${dateStr} bạn cảm thấy thế nào?`;
            }
        }
    }
    
    // Load existing mood data if exists
    if (moodData[dateKey]) {
        const data = moodData[dateKey];
        selectedMood = data.mood;
        document.getElementById('moodNote').value = data.note || '';
        selectedTags = data.tags || [];
        
        // Update UI
        updateMoodButtons();
        updateTagButtons();
        
        // Show edit mode indicator with translation
        const saveBtn = document.querySelector('.save-mood-btn');
        if (saveBtn) {
            saveBtn.textContent = translateMoodText('Cập nhật tâm trạng');
        }
    } else {
        // Reset form
        selectedMood = null;
        selectedTags = [];
        document.getElementById('moodNote').value = '';
        updateMoodButtons();
        updateTagButtons();
        
        // Reset button text with translation
        const saveBtn = document.querySelector('.save-mood-btn');
        if (saveBtn) {
            saveBtn.textContent = translateMoodText('Lưu tâm trạng');
        }
    }
    
    // Update calendar to show selection
    initializeCalendar();
}

// Helper functions
function getMonthName(month) {
    const months = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
                   'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
    return months[month];
}

function formatDate(date) {
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
    
    // Don't allow navigating to future months
    if (nextMonth.getMonth() <= today.getMonth() || 
        nextMonth.getFullYear() < today.getFullYear()) {
        currentDate = nextMonth;
        initializeCalendar();
    } else {
        showNotification(translateMoodText('Không thể xem tháng trong tương lai!'), 'warning');
    }
}

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

function saveMood() {
    if (!selectedMood) {
        showNotification(translateMoodText('Vui lòng chọn tâm trạng của bạn!'), 'error');
        return;
    }
    
    if (!selectedDate) {
        showNotification(translateMoodText('Vui lòng chọn ngày!'), 'error');
        return;
    }
    
    // Use selected date instead of today
    const dateKey = `${selectedDate.getFullYear()}-${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}-${selectedDate.getDate().toString().padStart(2, '0')}`;
    
    // Check if updating existing mood
    const isUpdate = !!moodData[dateKey];
    
    // Save mood data
    moodData[dateKey] = {
        mood: selectedMood,
        note: document.getElementById('moodNote').value,
        tags: selectedTags,
        timestamp: new Date().toISOString()
    };
    
    // Save to localStorage
    localStorage.setItem('moodData', JSON.stringify(moodData));
    
    // Update calendar
    initializeCalendar();
    
    // Update chart
    updateMoodChart();
    
    // Show success message with translation
    const message = isUpdate 
        ? translateMoodText('Đã cập nhật tâm trạng!')
        : translateMoodText('Đã lưu tâm trạng của bạn!');
    showNotification(message, 'success');
    
    // Reset form
    selectedMood = null;
    selectedTags = [];
    document.getElementById('moodNote').value = '';
    updateMoodButtons();
    updateTagButtons();
    
    // Reset to today
    const today = new Date();
    selectDate(today.getFullYear(), today.getMonth(), today.getDate());
}

function loadMoodData() {
    const saved = localStorage.getItem('moodData');
    if (saved) {
        moodData = JSON.parse(saved);
    }
}

function updateMoodChart() {
    const ctx = document.getElementById('moodChart');
    if (!ctx) return;
    
    // Get last 7 days data
    const labels = [];
    const data = [];
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
        
        labels.push(`${date.getDate()}/${date.getMonth() + 1}`);
        data.push(moodData[dateKey] ? moodData[dateKey].mood : null);
    }
    
    // Create chart
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: getCurrentLanguage() === 'en' ? 'Mood' : 'Tâm trạng',
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
    
    // Update top factors
    updateTopFactors();
}

function updateTopFactors() {
    const factorCounts = {};
    
    // Count tags
    Object.values(moodData).forEach(entry => {
        if (entry.tags) {
            entry.tags.forEach(tag => {
                factorCounts[tag] = (factorCounts[tag] || 0) + 1;
            });
        }
    });
    
    // Sort and display top factors
    const topFactors = Object.entries(factorCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);
    
    const container = document.getElementById('topFactors');
    const lang = getCurrentLanguage();
    
    // Use proper translation for header
    const headerText = lang === 'en' 
        ? 'Most influential factors:' 
        : 'Yếu tố ảnh hưởng nhiều nhất:';
    container.innerHTML = `<h4>${headerText}</h4>`;
    
    const tagNames = {
        family: lang === 'en' ? '👨‍👩‍👧‍👦 Family' : '👨‍👩‍👧‍👦 Gia đình',
        friends: lang === 'en' ? '👥 Friends' : '👥 Bạn bè',
        work: lang === 'en' ? '💼 Work' : '💼 Công việc',
        study: lang === 'en' ? '📚 Study' : '📚 Học tập',
        health: lang === 'en' ? '💪 Health' : '💪 Sức khỏe',
        love: lang === 'en' ? '❤️ Love' : '❤️ Tình yêu'
    };
    
    topFactors.forEach(([tag, count]) => {
        const badge = document.createElement('div');
        badge.className = 'factor-badge';
        badge.innerHTML = `${tagNames[tag]} (${count})`;
        container.appendChild(badge);
    });
}

// Add event listener for language changes to refresh mood diary
window.addEventListener('languageChanged', function() {
    const today = new Date();
    if (selectedDate) {
        selectDate(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    } else {
        selectDate(today.getFullYear(), today.getMonth(), today.getDate());
    }
    
    updateMoodChart();
});
