export function handleApiError(contextMessage, error) {
    console.error("API Error Handler Triggered:", contextMessage, error);
    localStorage.removeItem('username');
    localStorage.removeItem('password');
    alert(`An unexpected error occurred: ${contextMessage}. Returning to login screen.`);
    window.location.reload();
}