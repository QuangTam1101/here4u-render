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
    if (isTyping) return; // Nếu đã có typing indicator thì không tạo nữa
    
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
        // CHỈ GỌI MỘT LẦN Ở ĐÂY
        showTypingIndicator();
        
        // Dùng đường dẫn tương đối
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message })
        });
        
        // Luôn ẩn indicator sau khi có response
        hideTypingIndicator();
        
        const data = await response.json();

        // Kiểm tra lỗi từ server
        if (!response.ok || data.error) {
            console.error('Server Error:', data.error);
            addMessageToChat('Xin lỗi, máy chủ đang gặp sự cố. Vui lòng thử lại sau. 😔', 'calmi');
            return;
        }
        
        // Xử lý response từ Gemini
        let responseText = 'Xin lỗi, mình không thể xử lý yêu cầu này. Vui lòng thử lại.';
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            responseText = data.candidates[0].content.parts[0].text;
        } else {
            console.error('Invalid response structure from Gemini API:', data);
            responseText = 'Xin lỗi, có một lỗi không mong muốn xảy ra. 😔';
        }
        
        addMessageToChat(responseText, 'calmi');
        
    } catch (error) {
        console.error('Error calling Calmi API:', error);
        hideTypingIndicator(); // Đảm bảo ẩn indicator khi có lỗi
        addMessageToChat('Lỗi kết nối. Vui lòng kiểm tra mạng và thử lại. 🌐', 'calmi');
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
