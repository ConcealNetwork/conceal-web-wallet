/*
 * Copyright (c) 2024 Acktarius
 * Copyright (c) 2018-2024 Conceal Community, Conceal.Network & Conceal Devs
*/

/**
 * Initializes the message menu functionality.
 * This function ensures the event handler is attached at the right time
 * depending on the DOM loading state.
 */
export function initializeMessageMenu(): void {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        // If DOM is loading, wait for it to be ready before attaching handler
        document.addEventListener('DOMContentLoaded', attachHandler);
    } else {
        // If DOM is already loaded, attach handler immediately
        attachHandler();
        console.log('Message menu initialized after DOM ready');
    }
}

/**
 * Attaches click event handler to the message menu link.
 * This handler removes the unread message counter and bold styling
 * and reset isInitialized to false.
 */
function attachHandler() {
    // Find the message menu link in the DOM
    const messageLink = document.querySelector('#menu a[href="#!messages"]');
    if (!messageLink) {
        console.log('Message menu link not found');
        return;
    }

    // Add click event listener to handle message notifications
    messageLink.addEventListener('click', (event: Event) => {
        const target = event.currentTarget as HTMLAnchorElement;
        // select last span
        const messageText = target.querySelector('span:last-child');
        // If message count exists (ends with parenthesis), remove it
        if (messageText?.textContent?.endsWith(')')) {
            // Remove the count and keep only the text
            messageText.textContent = messageText.textContent.split(' (')[0];
            // Remove bold styling indicating unread messages
            target.classList.remove('font-bold');
            
            // Reset the initialization state in AccountView
            const accountView = (window as any).accountView;
            if (accountView) {
                accountView.isInitialized = false;
            }
        }
        
    });
}
