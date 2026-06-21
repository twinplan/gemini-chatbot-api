document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const chatBox = document.getElementById('chat-box');

    // Track conversation history
    const conversationHistory = [];

    // Helper function to append a message to the chat box
    function appendMessage(role, text) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', role);
        
        const label = role === 'user' ? 'You:' : 'Bot:';
        
        // Use textContent to prevent XSS
        const textSpan = document.createElement('span');
        textSpan.textContent = text;
        
        const labelSpan = document.createElement('strong');
        labelSpan.textContent = `${label} `;
        
        messageElement.appendChild(labelSpan);
        messageElement.appendChild(textSpan);
        
        chatBox.appendChild(messageElement);
        
        // Scroll to the bottom
        chatBox.scrollTop = chatBox.scrollHeight;
        
        return textSpan; // Return the span containing text so we can update it later if needed
    }

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const messageText = userInput.value.trim();
        if (!messageText) return;

        // 1. Add the user's message to the chat box
        appendMessage('user', messageText);

        // Update history
        conversationHistory.push({ role: 'user', text: messageText });

        // Clear input field
        userInput.value = '';

        // 2. Show a temporary "Thinking..." bot message
        const thinkingTextSpan = appendMessage('model', 'Thinking...');

        try {
            // 3. Send the POST request to /api/chat
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ conversation: conversationHistory })
            });

            if (!response.ok) {
                throw new Error(`Server responded with status ${response.status}`);
            }

            const data = await response.json();

            // 4. Replace the "Thinking..." message with the AI's reply
            if (data && data.result) {
                thinkingTextSpan.textContent = data.result;
                
                // Add the model's response to history
                conversationHistory.push({ role: 'model', text: data.result });
            } else {
                throw new Error("Invalid response format");
            }
        } catch (error) {
            console.error('Chat API Error:', error);
            // 5. Show error message
            thinkingTextSpan.textContent = 'Failed to get response from server.';
            // Optionally remove the last user message from history if the request failed
            // conversationHistory.pop();
        }
    });
});
