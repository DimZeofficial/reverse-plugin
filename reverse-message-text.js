// This is a Vencord plugin, following the structure from https://docs.vencord.dev/plugins/

const plugin = (Vencord) => {
    const { Patcher, DOM, React } = Vencord;
    const { getModule, getModuleByDisplayName, findByProps } = Vencord.Webpack;

    // Discord Class Names (extracted from your screenshot)
    const MESSAGE_CLASS = "message-1S_kPz"; // The main message container
    const CONTENTS_CLASS = "contents-18S-eR"; // The wrapper for message content
    const MESSAGE_CONTENT_CLASS = "messageContent-2qP_VD"; // The actual text element

    // --- Helper function to create the button ---
    const createReverseButton = (messageElement, originalTextElement) => {
        const button = document.createElement("button");
        button.className = "reverse-text-button";
        button.textContent = "Reverse Text";
        button.onclick = (e) => {
            e.stopPropagation(); // Prevent message click events
            const originalText = originalTextElement.textContent;
            const reversedText = originalText.split('').reverse().join('');
            originalTextElement.textContent = reversedText;
        };
        return button;
    };

    // --- Main plugin logic ---
    return {
        // Vencord plugin metadata
        id: "reverse-message-text",
        name: "Reverse Message Text",
        description: "Adds a button to reverse message text on hover.",
        author: "YourName",
        version: "1.0.0",

        // This function is called when the plugin starts
        start: () => {
            Vencord.Logger.log("Reverse Message Text plugin started!");

            // Inject CSS for the button
            DOM.addStyle(`
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

                .${MESSAGE_CLASS}:hover .reverse-text-button {
                    opacity: 1; /* Show on message hover */
                }
            `);

            // We need to patch a React component that renders messages
            // This is a common pattern for injecting UI elements in Discord modding.
            // We'll try to find the Message component.
            const MessageModule = findByProps("getMessage"); // Finding a module with getMessage is a good start
            if (!MessageModule) {
                Vencord.Logger.error("Could not find Message module to patch!");
                return;
            }

            Patcher.after(MessageModule, "default", (_, [props], res) => {
                // Ensure the message has content and is not empty
                if (!res || !res.props || !res.props.children) return res;

                // Find the main message element (which is usually rendered by this component)
                const messageElement = res.props.children.find(child => 
                    child && child.props && child.props.className && child.props.className.includes(MESSAGE_CLASS)
                );

                if (messageElement) {
                    // Find the message content wrapper and the actual text element within the rendered React tree
                    const contentsWrapper = messageElement.props.children.find(child =>
                        child && child.props && child.props.className && child.props.className.includes(CONTENTS_CLASS)
                    );
                    
                    const textElement = contentsWrapper?.props.children.find(child =>
                        child && child.props && child.props.className && child.props.className.includes(MESSAGE_CONTENT_CLASS)
                    );

                    if (contentsWrapper && textElement) {
                        // Create a React element for the button and inject it
                        // This is a simplified direct DOM append, a proper React injection might be more complex
                        // but this should work by attaching it to the underlying DOM node after render.
                        
                        // We can't directly append a DOM node to a React render tree,
                        // so we'll listen for when the actual DOM element for the message is created.
                        const origRef = messageElement.ref;
                        messageElement.ref = (e) => {
                            if (e && e instanceof Element) { // Ensure it's a DOM element
                                const contentNode = e.querySelector(`.${CONTENTS_CLASS}`);
                                const textNode = e.querySelector(`.${MESSAGE_CONTENT_CLASS}`);
                                if (contentNode && textNode && !e.querySelector(".reverse-text-button")) {
                                    const button = createReverseButton(e, textNode);
                                    contentNode.style.position = "relative";
                                    contentNode.appendChild(button);
                                    
                                    // Remove button on mouse leave
                                    e.addEventListener("mouseleave", () => {
                                        const existingButton = e.querySelector(".reverse-text-button");
                                        if (existingButton) existingButton.remove();
                                    });
                                }
                            }
                            if (origRef) { // Call original ref if it exists
                                if (typeof origRef === 'function') origRef(e);
                                else if (origRef.hasOwnProperty('current')) origRef.current = e;
                            }
                        };
                    }
                }
                return res;
            });

            // Vencord.Logger.log("Patch applied to message rendering.");
        },

        // This function is called when the plugin stops
        stop: () => {
            Vencord.Logger.log("Reverse Message Text plugin stopped!");
            Patcher.unpatchAll("reverse-message-text"); // Unpatch all patches made by this plugin
            DOM.removeStyle(); // Remove the injected CSS
        }
    };
};

module.exports = plugin;