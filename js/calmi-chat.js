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
        // Show typing indicator
        showTypingIndicator();
        
        // Call to Node.js server
        const response = await fetch('http://localhost:8000/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Hide typing indicator
        hideTypingIndicator();
        
        // Extract response text
        let responseText = 'Xin lỗi, mình không thể xử lý yêu cầu này. Vui lòng thử lại.';
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            responseText = data.candidates[0].content.parts[0].text;
        } else if (data.error) {
            console.error('API Error:', data.error);
            responseText = 'Xin lỗi, có lỗi xảy ra. Hãy thử lại sau nhé! 😔';
        }
        
        // Add Calmi's response to chat
        addMessageToChat(responseText, 'calmi');
        
    } catch (error) {
        console.error('Error calling Calmi API:', error);
        hideTypingIndicator();
        
        // Fallback responses when API fails
        const fallbackResponses = [
            'Mình hiểu cảm giác của bạn. Bạn có muốn chia sẻ thêm không? 💙',
            'Cảm ơn bạn đã tin tưởng chia sẻ với mình. Mình luôn ở đây lắng nghe bạn. 🤗',
            'Điều đó nghe có vẻ khó khăn. Bạn đã thử những cách nào để cải thiện tình hình chưa?',
            'Mình rất vui khi được trò chuyện với bạn. Hãy nhớ rằng bạn không đơn độc nhé! 💪',
            'Thật tuyệt khi bạn nhận ra điều đó. Việc hiểu rõ cảm xúc của mình là bước đầu quan trọng. 🌟'
        ];
        
        const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
        addMessageToChat(randomResponse, 'calmi');
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
