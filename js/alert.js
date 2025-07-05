export function showAlert(message, callback = null) {
    removeAlert();
    
    const overlay = document.createElement('div');
    overlay.id = 'custom-alert-overlay';
    overlay.className = 'alert-overlay';
    
    const alertContainer = document.createElement('div');
    alertContainer.className = 'alert-container';
    
    const alertContent = document.createElement('div');
    alertContent.className = 'alert-content';
    
    const messageElement = document.createElement('div');
    messageElement.className = 'alert-message';
    messageElement.textContent = message;
    
    const button = document.createElement('button');
    button.className = 'alert-button';
    button.textContent = 'OK';
    
    button.addEventListener('click', () => {
        removeAlert();
        if (callback && typeof callback === 'function') {
            callback();
        }
    });
    
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            removeAlert();
            if (callback && typeof callback === 'function') {
                callback();
            }
        }
    });
    
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            removeAlert();
            document.removeEventListener('keydown', handleEscape);
            if (callback && typeof callback === 'function') {
                callback();
            }
        }
    };
    document.addEventListener('keydown', handleEscape);
    
    alertContent.appendChild(messageElement);
    alertContent.appendChild(button);
    alertContainer.appendChild(alertContent);
    overlay.appendChild(alertContainer);
    
    document.body.appendChild(overlay);
    
    setTimeout(() => {
        button.focus();
    }, 100);
    
    setTimeout(() => {
        overlay.classList.add('show');
        alertContainer.classList.add('show');
    }, 10);
}

function removeAlert() {
    const existingAlert = document.getElementById('custom-alert-overlay');
    if (existingAlert) {
        existingAlert.remove();
    }
}

const style = document.createElement('style');
style.textContent = `
    .alert-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        opacity: 0;
        transition: opacity 0.3s ease;
    }
    
    .alert-overlay.show {
        opacity: 1;
    }
    
    .alert-container {
        background-color: #202020;
        border-left: 3px solid #909090;
        border-radius: 6px;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.5);
        max-width: 400px;
        width: 90%;
        max-height: 300px;
        transform: scale(0.8);
        transition: transform 0.3s ease;
        position: relative;
    }
    
    .alert-container::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 15px;
        height: 3px;
        background-color: #909090;
    }
    
    .alert-container::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 30px;
        height: 3px;
        background-color: #909090;
    }
    
    .alert-container.show {
        transform: scale(1);
    }
    
    .alert-content {
        padding: 24px;
        text-align: center;
    }
    
    .alert-message {
        font-size: 16px;
        line-height: 1.5;
        color: white;
        margin-bottom: 20px;
        word-wrap: break-word;
        font-family: Arial, sans-serif;
    }
    
    .alert-button {
        background-color: #333;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 4px;
        font-size: 16px;
        cursor: pointer;
        min-width: 80px;
        transition: background-color 0.3s ease;
        font-family: Arial, sans-serif;
    }
    
    .alert-button:hover {
        background-color: #4fc3f7;
        color: #121212;
    }
    
    .alert-button:focus {
        outline: 2px solid #4fc3f7;
        outline-offset: 2px;
    }
    
    .alert-button:active {
        background-color: #29b6f6;
        color: #121212;
    }
    
    @media (max-width: 480px) {
        .alert-container {
            width: 95%;
            margin: 10px;
        }
        
        .alert-content {
            padding: 20px;
        }
        
        .alert-message {
            font-size: 14px;
        }
        
        .alert-button {
            padding: 12px 20px;
            font-size: 14px;
        }
    }
`;

if (!document.querySelector('#custom-alert-styles')) {
    style.id = 'custom-alert-styles';
    document.head.appendChild(style);
}
