export function showNotification(type, message, targetElement) {
    let container = targetElement.querySelector('.notification-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'notification-container';
        targetElement.appendChild(container);
    }
    const notification = document.createElement('div');
    notification.className = type === 'status' ? 'status-notification' : 'damage-notification';
    notification.textContent = message;    
    container.appendChild(notification);
    setTimeout(() => {
        if (container.contains(notification)) {
            container.removeChild(notification);
        }
    }, 1000);
}
export function showStatusNotification(statusName, targetElement) {
    showNotification('status', statusName, targetElement);
}
export function showDamageNotification(amount, targetElement) {
    showNotification('damage', `-${amount}`, targetElement);
} 

export function showError(message) {
    const notification = document.createElement('div');
    notification.className = 'notification error';
    notification.textContent = message;
    document.body.appendChild(notification);

    // Add styles if they don't exist
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 25px;
                border-radius: 4px;
                color: white;
                font-weight: bold;
                z-index: 1000;
                animation: slideIn 0.5s ease-out, fadeOut 0.5s ease-in 2.5s forwards;
            }

            .notification.error {
                background-color: #ff4444;
            }

            .notification.success {
                background-color: #4CAF50;
            }

            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }

            @keyframes fadeOut {
                from {
                    opacity: 1;
                }
                to {
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Remove the notification after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

export function showSuccess(message) {
    const notification = document.createElement('div');
    notification.className = 'notification success';
    notification.textContent = message;
    document.body.appendChild(notification);

    // Remove the notification after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
} 