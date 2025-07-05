import { showAlert } from './alert.js';

export function handleApiError(contextMessage, error) {
    console.error("API Error Handler Triggered:", contextMessage, error);
    showAlert(`An unexpected error occurred: ${contextMessage}. Returning to login screen.`, () => {
        localStorage.removeItem('username');
        localStorage.removeItem('hashedPassword');
        window.location.reload();
    });
}