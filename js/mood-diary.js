// Mood Diary Management
let moodData = JSON.parse(localStorage.getItem('moodData')) || {};
let selectedMood = null;
let selectedTags = [];
let currentDate = new Date();

// Initialize Mood Diary
document.addEventListener('DOMContentLoaded', function() {
    initializeCalendar();
    initializeMoodButtons();
    initializeTagButtons();
    loadMoodData();
    updateMoodChart();
});

function initializeCalendar() {
    const calendar = document.getElementById('calendar');
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Clear calendar
    calendar.innerHTML = '';
    
    // Add day headers
    const dayHeaders = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
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
        
        const dateKey = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        
        // Check if mood exists for this day
        if (moodData[dateKey]) {
            const mood = moodData[dateKey].mood;
            if (mood <= 2) dayElement.classList.add('sad');
            else if (mood >= 4) dayElement.classList.add('happy');
            else dayElement.classList.add('neutral');
        }
        
        // Add click event
        dayElement.addEventListener('click', function() {
            selectDate(year, month, day);
        });
        
        calendar.appendChild(dayElement);
    }
}

function selectDate(year, month, day) {
    const dateKey = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    
    // Load existing mood data if exists
    if (moodData[dateKey]) {
        const data = moodData[dateKey];
        selectedMood = data.mood;
        document.getElementById('moodNote').value = data.note || '';
        selectedTags = data.tags || [];
        
        // Update UI
        updateMoodButtons();
        updateTagButtons();
    } else {
        // Reset form
        selectedMood = null;
        selectedTags = [];
        document.getElementById('moodNote').value = '';
        updateMoodButtons();
        updateTagButtons();
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
        showNotification('Vui lòng chọn tâm trạng của bạn!', 'error');
        return;
    }
    
    const today = new Date();
    const dateKey = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
    
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
    
    // Show success message
    showNotification('Đã lưu tâm trạng của bạn!', 'success');
    
    // Reset form
    selectedMood = null;
    selectedTags = [];
    document.getElementById('moodNote').value = '';
    updateMoodButtons();
    updateTagButtons();
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
                label: 'Tâm trạng',
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
    container.innerHTML = '<h4>Yếu tố ảnh hưởng nhiều nhất:</h4>';
    
    const tagNames = {
        family: '👨‍👩‍👧‍👦 Gia đình',
        friends: '👥 Bạn bè',
        work: '💼 Công việc',
        study: '📚 Học tập',
        health: '💪 Sức khỏe',
        love: '❤️ Tình yêu'
    };
    
    topFactors.forEach(([tag, count]) => {
        const badge = document.createElement('div');
        badge.className = 'factor-badge';
        badge.innerHTML = `${tagNames[tag]} (${count})`;
        container.appendChild(badge);
    });
}