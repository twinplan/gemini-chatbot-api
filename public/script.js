const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');

// Track conversation history
const conversationHistory = [];

form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const userMessage = input.value.trim();
    if (!userMessage) return;

    // 1. Add user message
    appendMessage('user', userMessage);
    conversationHistory.push({ role: 'user', text: userMessage });
    input.value = '';

    // 2. Show typing indicator (loading animation)
    const loadingDiv = showLoading();

    try {
        // 3. Send the POST request to backend
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ conversation: conversationHistory })
        });

        if (!response.ok) {
            throw new Error(`Server responded with status ${response.status}`);
        }

        const data = await response.json();

        // 4. Remove loading indicator and show AI reply
        loadingDiv.remove();

        if (data && data.result) {
            // Use marked.js to parse markdown text to HTML
            const htmlContent = marked.parse(data.result);
            appendMessage('bot', htmlContent, true);

            conversationHistory.push({ role: 'model', text: data.result });
        } else {
            throw new Error("Invalid response format");
        }
    } catch (error) {
        console.error('Chat API Error:', error);
        loadingDiv.remove();
        appendMessage('bot', 'Failed to get response from server.', false);
    }
});

// Helper function to append message
function appendMessage(sender, content, isHtml = false) {
    const msg = document.createElement('div');
    msg.classList.add('message', sender);

    if (isHtml) {
        msg.innerHTML = content;
    } else {
        msg.textContent = content;
    }

    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Helper function to show loading animation
function showLoading() {
    const loader = document.createElement('div');
    loader.classList.add('typing-indicator');

    // 3 bouncing dots
    loader.innerHTML = '<span></span><span></span><span></span>';

    chatBox.appendChild(loader);
    chatBox.scrollTop = chatBox.scrollHeight;
    return loader;
}
