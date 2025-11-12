// META { "name": "ReverseMessageText", "author": "YourName", "version": "1.0.0", "description": "Reverses the text of a Discord message on hover with a button." } META

class ReverseMessageText {
    getName() { return "ReverseMessageText"; }
    getAuthor() { return "YourName"; }
    getVersion() { return "1.0.0"; }
    getDescription() { return "Reverses the text of a Discord message on hover with a button."; }

    start() {
        this.observer = new MutationObserver(this.handleMutations.bind(this));
        this.observer.observe(document.body, { childList: true, subtree: true });
        this.addStyles();
        console.log("ReverseMessageText started!");
    }

    stop() {
        if (this.observer) {
            this.observer.disconnect();
        }
        this.removeStyles();
        console.log("ReverseMessageText stopped!");
    }

    handleMutations(mutations) {
        for (const mutation of mutations) {
            if (mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1 && node.querySelector && node.classList.contains("message-2CShn3")) { // Discord message class
                        this.addHoverListener(node);
                    }
                });
            }
        }
    }

    addHoverListener(messageElement) {
        messageElement.addEventListener("mouseenter", this.onMessageHover.bind(this));
        messageElement.addEventListener("mouseleave", this.onMessageLeave.bind(this));
    }

    onMessageHover(event) {
        const messageElement = event.currentTarget;
        const button = this.createReverseButton(messageElement);
        const messageContent = messageElement.querySelector(".contents-2m5oLu"); // Class for message content wrapper
        if (messageContent) {
            messageContent.style.position = "relative"; // Ensure button can be positioned relative to content
            messageContent.appendChild(button);
        }
    }

    onMessageLeave(event) {
        const messageElement = event.currentTarget;
        const existingButton = messageElement.querySelector(".reverse-text-button");
        if (existingButton) {
            existingButton.remove();
        }
    }

    createReverseButton(messageElement) {
        const button = document.createElement("button");
        button.className = "reverse-text-button";
        button.textContent = "Reverse Text";
        button.onclick = (e) => {
            e.stopPropagation(); // Prevent message click events
            this.reverseMessageText(messageElement);
        };
        return button;
    }

    reverseMessageText(messageElement) {
        const messageTextElements = messageElement.querySelectorAll(".messageContent-2qP_VD"); // Class for message text
        messageTextElements.forEach(textElement => {
            const originalText = textElement.textContent;
            const reversedText = originalText.split('').reverse().join('');
            textElement.textContent = reversedText;
        });
    }

    addStyles() {
        const style = document.createElement("style");
        style.id = "ReverseMessageTextStyle";
        style.textContent = `
            .reverse-text-button {
                position: absolute;
                top: 50%;
                right: 10px; /* Adjust as needed */
                transform: translateY(-50%);
                background-color: var(--background-secondary);
                color: var(--header-primary);
                border: 1px solid var(--background-modifier-accent);
                border-radius: 3px;
                padding: 4px 8px;
                cursor: pointer;
                opacity: 0; /* Hidden by default */
                transition: opacity 0.2s ease-in-out;
                z-index: 1000; /* Ensure button is above other elements */
            }

            .message-2CShn3:hover .reverse-text-button {
                opacity: 1; /* Show on message hover */
            }
        `;
        document.head.appendChild(style);
    }

    removeStyles() {
        const style = document.getElementById("ReverseMessageTextStyle");
        if (style) {
            style.remove();
        }
    }
}