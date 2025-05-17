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