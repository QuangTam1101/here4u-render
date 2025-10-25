// Calmi Chat Management
let chatHistory = []; 
let isTyping = false;

// Initialize Chat
document.addEventListener('DOMContentLoaded', function() {
    initializeChat();
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

// Function để format markdown
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
    
    // Only keep in memory for current session, DON'T SAVE
    chatHistory.push({ sender, message, timestamp: new Date().toISOString() });
    // REMOVED saveChatHistory();
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

async function callCalmiAPI(message) {
    try {
        showTypingIndicator();
        
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message })
        });
        
        hideTypingIndicator();
        
        const data = await response.json();

        if (!response.ok || data.error) {
            console.error('Server Error:', data.error);
            addMessageToChat('Xin lỗi, máy chủ đang gặp sự cố. Vui lòng thử lại sau. 😔', 'calmi');
            return;
        }
        
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
        hideTypingIndicator();
        addMessageToChat('Lỗi kết nối. Vui lòng kiểm tra mạng và thử lại. 🌐', 'calmi');
    }
}
