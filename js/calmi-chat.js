// Calmi Chat Management
let chatHistory = [];
let isTyping = false;

// Helper function to get current language
function getCurrentLanguage() {
    const settings = localStorage.getItem('userSettings');
    if (settings) {
        const parsed = JSON.parse(settings);
        return parsed.language || 'vi';
    }
    return 'vi';
}

// Initialize Chat
document.addEventListener('DOMContentLoaded', function() {
    initializeChat();
    loadChatHistory();
    showWelcomeMessage();
});

function showWelcomeMessage() {
    const chatMessages = document.getElementById('chatMessages');
    const lang = getCurrentLanguage();
    
    // Clear existing welcome message if any
    const existingWelcome = chatMessages.querySelector('.calmi-message');
    if (existingWelcome && existingWelcome.parentElement.children.length === 1) {
        existingWelcome.remove();
    }
    
    // Add localized welcome message
    const welcomeMessage = lang === 'en' 
        ? "Hello! I'm Calmi, your AI friend. You can share anything with me. I'm here to listen and support you. 💙"
        : "Xin chào! Mình là Calmi, người bạn AI của bạn. Bạn có thể chia sẻ với mình bất cứ điều gì. Mình ở đây để lắng nghe và hỗ trợ bạn. 💙";
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message calmi-message';
    
    const messageText = document.createElement('p');
    messageText.textContent = welcomeMessage;
    
    messageDiv.appendChild(messageText);
    chatMessages.appendChild(messageDiv);
}

// Listen for language changes
window.addEventListener('languageChanged', function() {
    // Update UI elements
    const lang = getCurrentLanguage();
    
    // Update status text
    const statusElement = document.querySelector('.calmi-info .status');
    if (statusElement) {
        statusElement.textContent = lang === 'en' 
            ? 'Ready to listen to you'
            : 'Sẵn sàng lắng nghe bạn';
    }
    
    // Update input placeholder
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.placeholder = lang === 'en' 
            ? 'Type your message...'
            : 'Nhập tin nhắn...';
    }
    
    // If chat is empty (only welcome message), update it
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages.children.length === 1) {
        showWelcomeMessage();
    }
});

function initializeChat() {
    const chatInput = document.getElementById('chatInput');
    
    // Handle Enter key
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Auto-resize textarea
    chatInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = this.scrollHeight + 'px';
    });
    
    // Set initial placeholder based on language
    const lang = getCurrentLanguage();
    chatInput.placeholder = lang === 'en' 
        ? 'Type your message...'
        : 'Nhập tin nhắn...';
}

function detectLanguage(text) {
    // Simple language detection based on character patterns
    // Check for Vietnamese-specific characters
    const vietnamesePattern = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐ]/;
    
    // Check for common Vietnamese words
    const vietnameseWords = /\b(là|và|của|có|được|cho|với|này|đã|sẽ|rất|cũng|như|nhưng|mà|nếu|thì|vì|để|từ|trong|ngoài|trên|dưới|bạn|tôi|mình|anh|chị|em)\b/i;
    
    if (vietnamesePattern.test(text) || vietnameseWords.test(text)) {
        return 'vi';
    }
    
    // Default to English for non-Vietnamese text
    return 'en';
}

function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message to chat
    addMessageToChat(message, 'user');
    
    // Clear input
    input.value = '';
    input.style.height = 'auto';
    
    // Detect language of user message
    const detectedLang = detectLanguage(message);
    
    // Send to API with language info
    callCalmiAPI(message, detectedLang);
}

function formatMarkdown(text) {
    // Xử lý bold text 
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/__(.*?)__/g, '<strong>$1</strong>');
    
    // Xử lý italic 
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    text = text.replace(/_(.*?)_/g, '<em>$1</em>');
    
    // Xử lý line breaks
    text = text.replace(/\n/g, '<br>');
    
    // Xử lý bullet points
    text = text.replace(/^\* /gm, '• ');
    
    // Xử lý numbered lists
    text = text.replace(/^\d+\. /gm, function(match) {
        return match;
    });
    
    return text;
}

function addMessageToChat(message, sender) {
    const chatMessages = document.getElementById('chatMessages');
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender === 'user' ? 'user-message' : 'calmi-message'}`;
    
    const messageText = document.createElement('p');
    
    if (sender === 'calmi') {
        messageText.innerHTML = formatMarkdown(message);
    } else {
        messageText.textContent = message;
    }
    
    messageDiv.appendChild(messageText);
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Save to history
    chatHistory.push({ sender, message, timestamp: new Date().toISOString() });
    saveChatHistory();
}

function showTypingIndicator() {
    if (isTyping) return;
    
    const chatMessages = document.getElementById('chatMessages');
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator';
    typingDiv.id = 'typingIndicator';
    
    for (let i = 0; i < 3; i++) {
        const dot = document.createElement('div');
        dot.className = 'typing-dot';
        typingDiv.appendChild(dot);
    }
    
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    isTyping = true;
}

function hideTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) {
        indicator.remove();
    }
    isTyping = false;
}

async function callCalmiAPI(message, detectedLang = 'vi') {
    try {
        showTypingIndicator();
        
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                message: message,
                language: detectedLang // Send detected language to server
            })
        });
        
        hideTypingIndicator();
        
        const data = await response.json();

        if (!response.ok || data.error) {
            console.error('Server Error:', data.error);
            const errorMessage = detectedLang === 'en'
                ? 'Sorry, the server is having issues. Please try again later. 😔'
                : 'Xin lỗi, máy chủ đang gặp sự cố. Vui lòng thử lại sau. 😔';
            addMessageToChat(errorMessage, 'calmi');
            return;
        }
        
        let responseText = detectedLang === 'en'
            ? 'Sorry, I cannot process this request. Please try again.'
            : 'Xin lỗi, mình không thể xử lý yêu cầu này. Vui lòng thử lại.';
            
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            responseText = data.candidates[0].content.parts[0].text;
        } else {
            console.error('Invalid response structure from Gemini API:', data);
            responseText = detectedLang === 'en'
                ? 'Sorry, an unexpected error occurred. 😔'
                : 'Xin lỗi, có một lỗi không mong muốn xảy ra. 😔';
        }
        
        addMessageToChat(responseText, 'calmi');
        
    } catch (error) {
        console.error('Error calling Calmi API:', error);
        hideTypingIndicator();
        const errorMessage = detectedLang === 'en'
            ? 'Connection error. Please check your network and try again. 🌐'
            : 'Lỗi kết nối. Vui lòng kiểm tra mạng và thử lại. 🌐';
        addMessageToChat(errorMessage, 'calmi');
    }
}

function loadChatHistory() {
    const saved = localStorage.getItem('chatHistory');
    if (saved) {
        chatHistory = JSON.parse(saved);
        
        const recentMessages = chatHistory.slice(-10);
        const chatMessages = document.getElementById('chatMessages');
        
        // Clear all messages except welcome
        while (chatMessages.children.length > 1) {
            chatMessages.removeChild(chatMessages.lastChild);
        }
        
        recentMessages.forEach(msg => {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${msg.sender === 'user' ? 'user-message' : 'calmi-message'}`;
            
            const messageText = document.createElement('p');
            
            if (msg.sender === 'calmi') {
                messageText.innerHTML = formatMarkdown(msg.message);
            } else {
                messageText.textContent = msg.message;
            }
            
            messageDiv.appendChild(messageText);
            chatMessages.appendChild(messageDiv);
        });
    }
}

function saveChatHistory() {
    // Keep only last 50 messages
    if (chatHistory.length > 50) {
        chatHistory = chatHistory.slice(-50);
    }
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
}

// Clear chat function (optional)
function clearChat() {
    const lang = getCurrentLanguage();
    if (confirm(lang === 'en' ? 'Clear all chat history?' : 'Xóa toàn bộ lịch sử chat?')) {
        chatHistory = [];
        localStorage.removeItem('chatHistory');
        const chatMessages = document.getElementById('chatMessages');
        while (chatMessages.children.length > 0) {
            chatMessages.removeChild(chatMessages.lastChild);
        }
        showWelcomeMessage();
    }
}
