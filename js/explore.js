// Explore Section Management
let currentTab = 'articles';
let exploreContent = {
    articles: [],
    exercises: [],
    music: []
};

// Initialize Explore
document.addEventListener('DOMContentLoaded', function() {
    loadExploreContent();
    initializeTabSwitching();
});

function loadExploreContent() {
    // Load articles
    exploreContent.articles = [
        {
            id: 1,
            title: '5 cách giảm stress hiệu quả',
            description: 'Khám phá các phương pháp đơn giản giúp bạn giảm căng thẳng trong cuộc sống hàng ngày.',
            image: 'https://picsum.photos/300/200?random=1',
            content: 'Nội dung chi tiết về cách giảm stress...',
            author: 'Dr. Tâm Lý',
            date: '2024-01-15'
        },
        {
            id: 2,
            title: 'Mindfulness cho người mới bắt đầu',
            description: 'Hướng dẫn cơ bản về chánh niệm và cách áp dụng vào cuộc sống.',
            image: 'https://picsum.photos/300/200?random=2',
            content: 'Mindfulness là gì và tại sao quan trọng...',
            author: 'Thiền sư Minh',
            date: '2024-01-14'
        },
        {
            id: 3,
            title: 'Ngủ ngon để sống khỏe',
            description: 'Bí quyết để có giấc ngủ chất lượng và tầm quan trọng của giấc ngủ.',
            image: 'https://picsum.photos/300/200?random=3',
            content: 'Giấc ngủ ảnh hưởng như thế nào đến sức khỏe...',
            author: 'BS. Nguyễn Văn A',
            date: '2024-01-13'
        },
        {
            id: 4,
            title: 'Yoga cho sức khỏe tinh thần',
            description: 'Các tư thế yoga đơn giản giúp cải thiện tâm trạng.',
            image: 'https://picsum.photos/300/200?random=4',
            content: 'Yoga không chỉ tốt cho cơ thể...',
            author: 'Yoga Master',
            date: '2024-01-12'
        }
    ];
    
    // Load exercises
    exploreContent.exercises = [
        {
            id: 1,
            title: 'Bài tập thở 4-7-8',
            description: 'Kỹ thuật thở giúp thư giãn và giảm lo âu',
            icon: 'fa-lungs',
            duration: '5 phút',
            difficulty: 'Dễ'
        },
        {
            id: 2,
            title: 'Thiền 5 phút',
            description: 'Thiền ngắn giúp tập trung và bình tĩnh',
            icon: 'fa-brain',
            duration: '5 phút',
            difficulty: 'Dễ'
        },
        {
            id: 3,
            title: 'Body Scan',
            description: 'Quét cơ thể để nhận biết và thả lỏng căng thẳng',
            icon: 'fa-body',
            duration: '10 phút',
            difficulty: 'Trung bình'
        },
        {
            id: 4,
            title: 'Gratitude Journal',
            description: 'Viết nhật ký biết ơn để tăng cường tích cực',
            icon: 'fa-heart',
            duration: '10 phút',
            difficulty: 'Dễ'
        }
    ];
    
    // Load music
    exploreContent.music = [
        {
            id: 1,
            title: 'Tiếng mưa nhẹ',
            duration: '30 phút',
            url: 'https://example.com/rain.mp3',
            category: 'Nature'
        },
        {
            id: 2,
            title: 'Sóng biển êm dịu',
            duration: '45 phút',
            url: 'https://example.com/ocean.mp3',
            category: 'Nature'
        },
        {
            id: 3,
            title: 'Piano thư giãn',
            duration: '60 phút',
            url: 'https://example.com/piano.mp3',
            category: 'Instrumental'
        },
        {
            id: 4,
            title: 'Tiếng chim hót',
            duration: '20 phút',
            url: 'https://example.com/birds.mp3',
            category: 'Nature'
        },
        {
            id: 5,
            title: 'Nhạc thiền Tibet',
            duration: '40 phút',
            url: 'https://example.com/tibet.mp3',
            category: 'Meditation'
        }
    ];
    
    // Display initial content
    displayArticles();
}

function initializeTabSwitching() {
    // Already handled in main.js, but we can add specific logic here
}

function displayArticles() {
    const container = document.getElementById('articlesTab');
    const grid = container.querySelector('.articles-grid');
    
    grid.innerHTML = '';
    
    exploreContent.articles.forEach(article => {
        const card = createArticleCard(article);
        grid.appendChild(card);
    });
}

function createArticleCard(article) {
    const card = document.createElement('article');
    card.className = 'article-card';
    
    card.innerHTML = `
        <img src="${article.image}" alt="${article.title}">
        <h3>${article.title}</h3>
        <p>${article.description}</p>
        <a href="#" class="read-more" onclick="readArticle(${article.id})">Đọc thêm →</a>
    `;
    
    return card;
}

function displayExercises() {
    const container = document.getElementById('exercisesTab');
    const list = container.querySelector('.exercises-list');
    
    if (!list) {
        container.innerHTML = '<div class="exercises-list"></div>';
    }
    
    const exercisesList = container.querySelector('.exercises-list');
    exercisesList.innerHTML = '';
    
    exploreContent.exercises.forEach(exercise => {
        const card = createExerciseCard(exercise);
        exercisesList.appendChild(card);
    });
}

function createExerciseCard(exercise) {
    const card = document.createElement('div');
    card.className = 'exercise-card';
    
    card.innerHTML = `
        <i class="fas ${exercise.icon}"></i>
        <h3>${exercise.title}</h3>
        <p>${exercise.description}</p>
        <div class="exercise-meta">
            <span>⏱️ ${exercise.duration}</span>
            <span>📊 ${exercise.difficulty}</span>
        </div>
        <button class="start-btn" onclick="startExercise(${exercise.id})">Bắt đầu</button>
    `;
    
    return card;
}

function displayMusic() {
    const container = document.getElementById('musicTab');
    const list = container.querySelector('.music-list');
    
    if (!list) {
        container.innerHTML = '<div class="music-list"></div>';
    }
    
    const musicList = container.querySelector('.music-list');
    musicList.innerHTML = '';
    
    exploreContent.music.forEach(music => {
        const item = createMusicItem(music);
        musicList.appendChild(item);
    });
}

function createMusicItem(music) {
    const item = document.createElement('div');
    item.className = 'music-item';
    
    item.innerHTML = `
        <i class="fas fa-play-circle" onclick="playMusic(${music.id})"></i>
        <div class="music-info">
            <h4>${music.title}</h4>
            <span>${music.duration} | ${music.category}</span>
        </div>
    `;
    
    return item;
}

// Action functions
function readArticle(articleId) {
    const article = exploreContent.articles.find(a => a.id === articleId);
    if (article) {
        // Create modal to display full article
        showArticleModal(article);
    }
}

function showArticleModal(article) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    
    modal.innerHTML = `
        <div class="modal-content article-modal">
            <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <h2>${article.title}</h2>
            <p class="article-meta">Bởi ${article.author} | ${article.date}</p>
            <img src="${article.image}" alt="${article.title}" style="width: 100%; border-radius: 10px; margin: 1rem 0;">
            <div class="article-content">
                <p>${article.content}</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function startExercise(exerciseId) {
    const exercise = exploreContent.exercises.find(e => e.id === exerciseId);
    if (exercise) {
        // Start exercise based on type
        if (exercise.title.includes('thở')) {
            startBreathingExercise();
        } else if (exercise.title.includes('Thiền')) {
            startMeditation();
        } else {
            showNotification(`Bắt đầu ${exercise.title}`, 'success');
        }
    }
}

function startBreathingExercise() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    
    modal.innerHTML = `
        <div class="modal-content breathing-modal">
            <span class="close" onclick="stopBreathingExercise()">&times;</span>
            <h2>Bài tập thở 4-7-8</h2>
            <div class="breathing-circle" id="breathingCircle">
                <span id="breathingText">Sẵn sàng</span>
            </div>
            <button class="start-btn" onclick="runBreathingCycle()">Bắt đầu</button>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function runBreathingCycle() {
    const circle = document.getElementById('breathingCircle');
    const text = document.getElementById('breathingText');
    
    // Breathing cycle: 4 seconds in, 7 seconds hold, 8 seconds out
    text.textContent = 'Hít vào...';
    circle.style.transform = 'scale(1.2)';
    circle.style.background = '#E3F2FD';
    
    setTimeout(() => {
        text.textContent = 'Giữ...';
        circle.style.background = '#BBDEFB';
    }, 4000);
    
    setTimeout(() => {
        text.textContent = 'Thở ra...';
        circle.style.transform = 'scale(0.8)';
        circle.style.background = '#90CAF9';
    }, 11000);
    
    setTimeout(() => {
        text.textContent = 'Hoàn thành!';
        circle.style.transform = 'scale(1)';
        circle.style.background = '#64B5F6';
    }, 19000);
}

function stopBreathingExercise() {
    document.querySelector('.breathing-modal').parentElement.remove();
}

function startMeditation() {
    showNotification('Bắt đầu phiên thiền 5 phút...', 'success');
    // Could add a timer or guided meditation audio here
}

function playMusic(musicId) {
    const music = exploreContent.music.find(m => m.id === musicId);
    if (music) {
        showNotification(`Đang phát: ${music.title}`, 'success');
        // In real implementation, would play audio file
        console.log(`Playing: ${music.url}`);
    }
}

// Update tab switching to load content
window.switchTab = function(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(content => {
        content.style.display = 'none';
    });
    
    // Show selected tab
    const tabContent = document.getElementById(tabName + 'Tab');
    if (tabContent) {
        tabContent.style.display = 'block';
        
        // Load content if needed
        if (tabName === 'exercises' && !tabContent.querySelector('.exercises-list').children.length) {
            displayExercises();
        } else if (tabName === 'music' && !tabContent.querySelector('.music-list').children.length) {
            displayMusic();
        }
    }
    
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        }
    });
};