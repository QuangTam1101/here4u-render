const chatContainer = document.getElementById("chat-container");
chatContainer.style.opacity = "0";
chatContainer.style.display = "none";
const chatBody = document.querySelector(".chat-body");
const messageInput = document.querySelector(".message-input");
const sendMessageButton = document.querySelector("#send-message");
const languageSelectOverlay = document.getElementById("language-select");

let knownCause = false;

function detectKnownCause(message) {
    const lowerMsg = message.toLowerCase();
    const keywords = [
        // Học tập, điểm số
        "học", "bài", "thi", "kiểm tra", "điểm", "bằng cấp", "trường", "lớp", "bài tập", "deadline", "thi cử", "học hành", "áp lực học",

        // Bạn bè, xã hội
        "bạn", "bè", "bạn bè", "tình bạn", "cô lập", "bị bỏ rơi", "bị cô lập", "không ai chơi", "một mình", "cô đơn", "không có bạn", "cô độc",

        // Gia đình
        "gia đình", "ba mẹ", "cha mẹ", "mẹ", "bố", "cha", "ông bà", "bị la", "bị mắng", "bị áp lực", "áp lực gia đình", "xung đột gia đình",

        // Tình cảm, yêu đương
        "yêu", "tình cảm", "crush", "bạn trai", "bạn gái", "mối quan hệ", "chia tay", "cãi nhau", "gãy đổ",

        // LGBT / Giới tính
        "gay", "les", "lgbt", "đồng tính", "song tính", "chuyển giới", "giới tính", "bị kỳ thị", "kỳ thị", "coming out", "queer", "bị ba mẹ kỳ thị", "bị gia đình kỳ thị",

        // Stress, lo âu
        "stress", "lo lắng", "căng thẳng", "mệt mỏi", "kiệt sức", "bị trầm cảm", "buồn",

        // Bắt nạt, bạo lực
        "bắt nạt", "bị bắt nạt", "bạo lực", "bạo hành", "bị đánh", "bị chửi",

        // Tự ti, áp lực bản thân
        "tự ti", "ghét bản thân", "tệ hại", "không giỏi", "vô dụng", "không ai yêu", "không ai hiểu",

        // Khác
        "sức khỏe", "thân thể", "ngoại hình", "béo", "ốm", "mập", "gầy", "tự hại", "tự làm đau"
    ];
    return keywords.some(keyword => lowerMsg.includes(keyword));
}

function scrollToBottomSmoothIfNear() {
    const threshold = 100; 
    if (chatBody.scrollHeight - chatBody.scrollTop - chatBody.clientHeight < threshold) {
        chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
    }
}

function scrollToBottom() {
    chatBody.scrollTop = chatBody.scrollHeight;
}

// document.querySelector('#send-message').addEventListener('click', scrollToBottom); 

messageInput.addEventListener('focus', () => {
    setTimeout(scrollToBottom, 300); 
});


// Ngôn ngữ mặc định
let userLang = "vi";

const greetings = {
  vi: `Chào bạn! Mình là <strong>Calmi</strong> – một người bạn ảo luôn sẵn sàng lắng nghe và đồng hành cùng bạn 😊  Mọi phản hồi đều do AI tạo ra và chỉ mang tính tham khảo, không thay thế cho tư vấn chuyên môn 💛  
Bạn muốn chia sẻ điều gì hôm nay?`,

  en: `Hi there! I'm <strong>Calmi</strong> – your virtual companion who’s here to listen and support you 😊  All responses are AI-generated and should be seen as support, not a replacement for professional advice 💛  
What would you like to share today?`
};

const headerTexts = {
  vi: "Bạn không cô đơn – Mình ở đây để lắng nghe bạn ❤️",
  en: "You are not alone – I'm here to listen ❤️"
};

const supportNotes = {
  vi: "Nếu bạn cảm thấy căng thẳng, hãy gọi <strong>1800 1567</strong> để nhận được sự hỗ trợ từ chuyên gia.",
  en: "If you're feeling overwhelmed, please call an adult or someone you trust for help, or <strong>1800 1567</strong> if you're in Vietnam."
};

const inputPlaceholders = {
  vi: "Nhắn tâm sự của bạn...",
  en: "Tell me your thoughts..."
};

const basePrompt = {
  vi: `Bạn là một bác sĩ tâm lý đang đóng vai một người bạn đồng hành đáng tin cậy, xưng "mình" - "bạn", trò chuyện với những người trẻ (13-19 tuổi) khi họ cảm thấy căng thẳng, buồn, lo lắng, mất động lực, hoặc gặp khó khăn trong cuộc sống, học tập, quan hệ hoặc với chính bản thân.

Giọng điệu của bạn dịu dàng, chân thành, không phán xét, tạo cảm giác an toàn và dễ chia sẻ.

🎯 Khi phản hồi, hãy tuân theo các bước tư vấn tâm lý cần thiết:
1️⃣ **Thiết lập an toàn & xác nhận cảm xúc:** Bắt đầu bằng sự đồng cảm, công nhận cảm xúc hoặc nỗ lực của người nhắn một cách nhẹ nhàng.  
2️⃣ **Khám phá & làm rõ vấn đề:** Hỏi một câu hỏi ngắn, khuyến khích họ chia sẻ thêm để hiểu rõ hơn về điều đang khiến họ buồn hoặc căng thẳng, KHÔNG vội vàng khuyên ngay.  
3️⃣ **Xác định nhu cầu:** Khi đã hiểu rõ hơn, nhẹ nhàng hỏi xem họ mong muốn điều gì (chỉ cần lắng nghe, hay cần cùng tìm cách vượt qua, hay cần giảm bớt cảm xúc tiêu cực).  
4️⃣ **Hỗ trợ & phản hồi:** Dựa trên thông tin họ chia sẻ, đưa ra một lời khuyên nhỏ, thiết thực, không áp đặt, khuyến khích họ chăm sóc bản thân.  
5️⃣ **Kết thúc & duy trì kết nối:** Động viên họ, nhắn họ có thể chia sẻ tiếp khi sẵn sàng, nhấn mạnh rằng họ không đơn độc.

✅ Giữ câu trả lời ngắn gọn (1-3 câu mỗi lượt), dễ đọc, tự nhiên, giống một buổi tâm sự thực tế, không spam quá dài hoặc liệt kê nhiều bước.  
✅ Dùng emoji nhẹ nhàng nếu phù hợp (💛, 🌿, 😊) nhưng không lạm dụng.

🚫 Không phán xét, không tạo áp lực, không khuyên khi chưa hiểu rõ vấn đề.  
🚫 Không đóng vai “bác sĩ trị liệu cứng nhắc”, mà là “một người bạn biết lắng nghe, hiểu tâm lý”.  
🚫 Không trả lời dài gây ngợp.

📌 Nếu người dùng đề cập đến ý định tự làm hại bản thân hoặc không an toàn, phản hồi ngay:
“Cảm ơn bạn đã chia sẻ với mình 💛 Mình lo lắng khi nghe bạn cảm thấy như vậy, và mình muốn bạn được an toàn. Bạn có thể nói ngay với ba mẹ, người lớn bạn tin cậy hoặc gọi 1900 9254 (Việt Nam) hoặc 988 (Mỹ) nếu bạn cảm thấy không ổn nhé. Bạn không phải đối mặt một mình, mình sẽ luôn ở đây lắng nghe bạn.”

Hãy luôn phản hồi như một người bạn thực sự, giúp họ cảm thấy được lắng nghe, được tôn trọng và không đơn độc.
`,

  en: `You are a psychologist taking the role of a caring friend, using "I" and "you" when talking, supporting young people (ages 13-19) when they feel stressed, sad, anxious, unmotivated, or facing challenges in life, studies, relationships, or with themselves.

Your tone is gentle, sincere, and non-judgmental, creating a safe and easy space for them to open up.

🎯 When replying, follow these essential mental health support steps:
1️⃣ **Establish safety & acknowledge feelings:** Start by validating and acknowledging their feelings or efforts softly.  
2️⃣ **Explore & clarify:** Ask a short, gentle question encouraging them to share more so you can understand what’s making them sad or stressed, without rushing into advice.  
3️⃣ **Identify their needs:** Once you understand, gently ask what they would like (just to be heard, help in coping, or reducing negative feelings).  
4️⃣ **Support & respond:** Based on what they share, give a small, practical, non-pressuring suggestion, encouraging them to care for themselves.  
5️⃣ **Close & maintain connection:** Encourage them, let them know they can share more anytime, and remind them they’re not alone.

✅ Keep your responses short (1-3 sentences per turn), easy to read, natural, like a real heart-to-heart chat, not overwhelming or robotic.  
✅ Feel free to use soft emojis (💛, 🌿, 😊) if appropriate, but don’t overuse.

🚫 Do not judge, pressure, or advise before understanding.  
🚫 Do not act like a rigid “therapist,” but like a “friend who understands psychology.”  
🚫 Do not send long, overwhelming paragraphs.

📌 If the user mentions wanting to harm themselves or feeling unsafe, immediately respond:
“Thank you for sharing this with me 💛 I’m really concerned to hear you’re feeling this way, and I want you to be safe. Please consider talking to your parents, a trusted adult, or calling 988 (US) or 1900 9254 (Vietnam) if you ever feel unsafe. You don’t have to face this alone, and I’ll be here to listen.”

Always respond like a real friend, making them feel heard, respected, and never alone.
`
};

// Thay đổi theo ngôn ngữ chọn
window.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".language-select-box button").forEach(btn => {
    btn.addEventListener("click", () => {
      userLang = btn.dataset.lang;

      languageSelectOverlay.style.opacity = "0";
      setTimeout(() => {
        languageSelectOverlay.style.display = "none";

        chatContainer.style.display = "flex";
        setTimeout(() => {
          chatContainer.style.opacity = "1";
        }, 50);

        document.querySelector(".chat-header h3").innerHTML = headerTexts[userLang];
        document.querySelector(".chat-support-note").innerHTML = supportNotes[userLang];
        messageInput.placeholder = inputPlaceholders[userLang];
          
        showBotGreeting();
      }, 300);
    });
  });
});


const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 1024 1024">
  <path d="M738.3 287.6H285.7c-59 0-106.8 47.8-106.8 106.8v303.1c0 59 47.8 106.8 106.8 106.8h81.5v111.1c0 .7.8 1.1 1.4.7l166.9-110.6 41.8-.8h117.4l43.6-.4c59 0 106.8-47.8 106.8-106.8V394.5c0-59-47.8-106.9-106.8-106.9zM351.7 448.2c0-29.5 23.9-53.5 53.5-53.5s53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5-53.5-23.9-53.5-53.5zm157.9 267.1c-67.8 0-123.8-47.5-132.3-109h264.6c-8.6 61.5-64.5 109-132.3 109zm110-213.7c-29.5 0-53.5-23.9-53.5-53.5s23.9-53.5 53.5-53.5 53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5zM867.2 644.5V453.1h26.5c19.4 0 35.1 15.7 35.1 35.1v121.1c0 19.4-15.7 35.1-35.1 35.1h-26.5zM95.2 609.4V488.2c0-19.4 15.7-35.1 35.1-35.1h26.5v191.3h-26.5c-19.4 0-35.1-15.7-35.1-35.1zM561.5 149.6c0 23.4-15.6 43.3-36.9 49.7v44.9h-30v-44.9c-21.4-6.5-36.9-26.3-36.9-49.7 0-28.6 23.3-51.9 51.9-51.9s51.9 23.3 51.9 51.9z"></path>
</svg>`;

const showBotGreeting = () => {
  const greetingText = greetings[userLang];
  const greetingMessage = createMessageElement(
    `${svgIcon}<div class="message-text">${greetingText}</div>`,
    "bot-message"
  );
  chatBody.appendChild(greetingMessage);
};

const API_URL = `${window.location.origin}/chat`;

const userData = {
  message: null
};

const createMessageElement = (content, ...classes) => {
  const div = document.createElement("div");
  div.classList.add("message", ...classes);
  div.innerHTML = content;
  return div;
};

const generateBotResponse = async (incomingMessageDiv) => {
    const messageElement = incomingMessageDiv.querySelector(".message-text");

    let dynamicPrompt = "";
    if (!knownCause) {
        dynamicPrompt = `Hãy chỉ lắng nghe và hỏi nhẹ nhàng thêm để hiểu rõ điều khiến bạn ấy stress, buồn, lo lắng, KHÔNG đưa ra lời khuyên vội.`;
    } else {
        dynamicPrompt = `Bạn đã biết nguyên nhân khiến bạn ấy stress, buồn, lo lắng, giờ bạn có thể đưa ra một lời khuyên nhẹ nhàng, thực tế, không phán xét, không ép buộc.`;
    }

    const fullPrompt = `${basePrompt[userLang]}\n${dynamicPrompt}\n\nNgười dùng chia sẻ:\n"${userData.message}"`;

    const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [
                {
                    role: "user",
                    parts: [{ text: fullPrompt }]
                }
            ]
        })
    };

    try {
        const response = await fetch(API_URL, requestOptions);
        const data = await response.json();
        console.log("API response:", data);

        if (!response.ok || !data.candidates || !data.candidates[0]) {
            throw new Error(data.error?.message || "Unknown error");
        }

        const apiResponseText = data.candidates[0].content.parts[0].text
            .replace(/\*\*(.*?)\*\*/g, "$1")
            .trim();

        messageElement.innerText = apiResponseText;
    } catch (error) {
        console.error("Lỗi khi tạo phản hồi của bot:", error);
        messageElement.innerText = "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại.";
    } finally {
        incomingMessageDiv.classList.remove("thinking");
        scrollToBottomSmoothIfNear();
    }
};


const handOutgoingMessage = (e = null) => {
    if (e) e.preventDefault();

    const userMessage = messageInput.value.trim();
    if (!userMessage) return;

    userData.message = userMessage;
    messageInput.value = "";

    const outgoingMessageDiv = createMessageElement(`<div class="message-text">${userData.message}</div>`, "user-message");
    chatBody.appendChild(outgoingMessageDiv);
    scrollToBottomSmoothIfNear();

    if (!knownCause && detectKnownCause(userMessage)) {
        knownCause = true; 
    }

    setTimeout(() => {
        const messageContent = `${svgIcon}<div class="message-text">
          <div class="thinking-indicator">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
          </div>
        </div>`;

        const incomingMessageDiv = createMessageElement(messageContent, "bot-message", "thinking");
        chatBody.appendChild(incomingMessageDiv);
        generateBotResponse(incomingMessageDiv);
    }, 600);
};

messageInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    handOutgoingMessage();
  }
});

sendMessageButton.addEventListener("click", handOutgoingMessage);
