/* ====== Fonts ====== */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

/* ====== Reset & base ====== */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: "Inter", sans-serif;
    transition: all 0.2s ease;
}

html, body {
    height: 100%;
}

body {
    background: linear-gradient(135deg, #667eea, #764ba2, #f093fb, #f5576c, #4facfe);
    background-size: 300% 300%;
    animation: gradientShift 12s ease infinite;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 10px;
}

/* ====== Animations ====== */
@keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
}

@keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
}

@keyframes messageSlide {
    from { opacity: 0; transform: translateY(15px); }
    to { opacity: 1; transform: translateY(0); }
}

@keyframes bounce {
    0%, 80%, 100% { transform: translateY(0) scale(1); opacity: 0.7; }
    40% { transform: translateY(-8px) scale(1.1); opacity: 1; }
}

/* ====== chọn Language ====== */
.language-select-overlay {
    position: fixed;
    inset: 0;
    background: rgba(20, 20, 20, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999;
}

.language-select-box {
    background: #fff;
    padding: 30px 40px;
    border-radius: 12px;
    text-align: center;
    box-shadow: 0 0 15px rgba(0,0,0,0.2);
}

.language-select-box h2 {
    margin-bottom: 20px;
    font-size: 1.2rem;
}

.language-select-box button {
    margin: 10px;
    padding: 10px 20px;
    font-size: 1rem;
    border: none;
    border-radius: 8px;
    background: linear-gradient(45deg, #667eea, #764ba2);
    color: white;
    cursor: pointer;
}

.language-select-box button:hover {
    transform: scale(1.05);
}

/* ====== Chat container ====== */
.chat-container {
    width: 100%;
    max-width: 420px;
    height: 90vh;
    max-height: 650px;
    display: flex;
    flex-direction: column;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border-radius: 20px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

/* ====== Header ====== */
.chat-fixed-header {
    position: sticky;
    top: 0;
    background: white;
    z-index: 10;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.chat-header {
    position: relative;
    background: linear-gradient(135deg, #ff6b6b, #ffa726, #42a5f5);
    color: white;
    padding: 20px;
    text-align: center;
    font-weight: 600;
}

.chat-header::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(45deg, rgba(255,255,255,0.1), transparent);
    animation: shimmer 3s infinite;
}

.chat-support-note {
    background: linear-gradient(135deg, #e3f2fd, #f3e5f5);
    color: #2c5282;
    padding: 12px 16px;
    font-size: 0.9rem;
    text-align: center;
}

.chat-support-note strong {
    color: #d63384;
}

/* ====== Chat Body ====== */
.chat-body {
    flex: 1;
    padding: 16px;
    overflow-y: auto;
    background: linear-gradient(to bottom, #f8fafc, #f1f5f9);
}

.chat-body::-webkit-scrollbar {
    width: 6px;
}
.chat-body::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
}
.chat-body::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
}

/* ====== Messages ====== */
.message {
    display: flex;
    align-items: flex-end;
    margin-bottom: 16px;
    animation: messageSlide 0.3s ease;
}

.user-message {
    justify-content: flex-end;
}

.message svg {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea, #764ba2);
    padding: 8px;
    fill: white;
    margin-right: 10px;
}

.message-text {
    max-width: 75%;
    padding: 12px 16px;
    font-size: 0.95rem;
    line-height: 1.5;
    border-radius: 18px;
    position: relative;
    word-wrap: break-word;
}

.user-message .message-text {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
}

.bot-message .message-text {
    background: #fff;
    color: #2d3748;
    border: 1px solid rgba(0,0,0,0.05);
}

.bot-message.thinking .message-text {
    background: #f1f5f9;
}

/* Thinking indicator */
.thinking-indicator {
    display: flex;
    gap: 4px;
}
.thinking .dot {
    width: 8px;
    height: 8px;
    background: #667eea;
    border-radius: 50%;
    animation: bounce 1.2s infinite ease-in-out;
}
.thinking .dot:nth-child(2) { animation-delay: 0.2s; }
.thinking .dot:nth-child(3) { animation-delay: 0.4s; }

/* ====== Input Area ====== */
.chat-input {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    background: #fff;
    border-top: 1px solid rgba(0,0,0,0.05);
    gap: 10px;
    position: sticky;
    bottom: 0;
}

.message-input {
    flex: 1;
    border: 2px solid #e2e8f0;
    border-radius: 18px;
    padding: 10px 14px;
    resize: none;
    min-height: 40px;
    max-height: 120px;
    font-size: 0.95rem;
    background: #fafbfc;
}

.message-input:focus {
    border-color: #667eea;
    background: #fff;
    box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
    outline: none;
}

#send-message {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    border: none;
    border-radius: 50%;
    width: 44px;
    height: 44px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.4rem;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(102,126,234,0.3);
}

#send-message:hover {
    transform: translateY(-2px);
}

#send-message:active {
    transform: scale(0.95);
}

/* ====== Misc ====== */
::selection {
    background: rgba(102, 126, 234, 0.2);
}

/* ====== Responsive ====== */
@media (max-width: 480px) {
    .chat-container {
        height: 100vh;
        max-height: 100vh;
        border-radius: 0;
    }
}
