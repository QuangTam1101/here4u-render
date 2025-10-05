// Calmi Chat Management
let chatHistory = [];
let isTyping = false;

// Initialize Chat
document.addEventListener('DOMContentLoaded', function() {
    initializeChat();
    loadChatHistory();
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
    
    // Show typing indicator
    showTypingIndicator();
    
    // Send to API
    callCalmiAPI(message);
}

function addMessageToChat(message, sender) {
    const chatMessages = document.getElementById('chatMessages');
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender === 'user' ? 'user-message' : 'calmi-message'}`;
    
    const messageText = document.createElement('p');
    messageText.textContent = message;
    messageDiv.appendChild(messageText);
    
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Save to history
    chatHistory.push({ sender, message, timestamp: new Date().toISOString() });
    saveChatHistory();
}

function showTypingIndicator() {
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

async function callCalmiAPI(message) {
    try {
        const API_URL = window.APP_CONFIG ? window.APP_CONFIG.API_URL : 'http://localhost:8000';

        const response = await fetch(`${API_URL}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Ẩn typing indicator
        hideTypingIndicator();
        
        // Lấy text trả lời
        let responseText = 'Xin lỗi, mình không thể xử lý yêu cầu này. Vui lòng thử lại.';
        if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
            responseText = data.candidates[0].content.parts[0].text;
        } else if (data.error) {
            console.error('API Error:', data.error);
            responseText = 'Xin lỗi, có lỗi xảy ra. Hãy thử lại sau nhé! 😔';
        }
        
        // Thêm tin nhắn trả lời vào chat
        addMessageToChat(responseText, 'calmi');
        
    } catch (error) {
        console.error('Error calling Calmi API:', error);
        hideTypingIndicator();
        
        // Không còn fallback responses nữa
        addMessageToChat('Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau nhé! 💙', 'calmi');
    }
}

function loadChatHistory() {
    const saved = localStorage.getItem('chatHistory');
    if (saved) {
        chatHistory = JSON.parse(saved);
        
        // Display last 10 messages
        const recentMessages = chatHistory.slice(-10);
        const chatMessages = document.getElementById('chatMessages');
        
        // Clear existing messages except welcome message
        while (chatMessages.children.length > 1) {
            chatMessages.removeChild(chatMessages.lastChild);
        }
        
        // Add messages
        recentMessages.forEach(msg => {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${msg.sender === 'user' ? 'user-message' : 'calmi-message'}`;
            
            const messageText = document.createElement('p');
            messageText.textContent = msg.message;
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

