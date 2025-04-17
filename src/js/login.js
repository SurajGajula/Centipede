function displayLoginForm() {
    const loginContainer = document.getElementById('login-container');
    if (!loginContainer) {
        console.error('Login container not found!');
        return;
    }
    loginContainer.innerHTML = `
        <div id="login-form-wrapper">
            <h2>Login</h2>
            <form id="login-form">
                <div>
                    <label for="username">Username:</label>
                    <input type="text" id="username" name="username" required>
                </div>
                <div>
                    <label for="password">Password:</label>
                    <input type="password" id="password" name="password" required>
                </div>
                <button type="submit">Login</button>
                <p id="login-error" class="error-message" style="display: none; color: red;"></p>
            </form>
        </div>
    `;
    const form = document.getElementById('login-form');
    form.addEventListener('submit', handleFormSubmit);
}
async function handleFormSubmit(event) {
    event.preventDefault();
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const errorElement = document.getElementById('login-error');
    const username = usernameInput.value;
    const password = passwordInput.value;
    errorElement.style.display = 'none';
    try {
        const success = await attemptLogin(username, password);
        if (success) {
            localStorage.setItem('username', username);
            localStorage.setItem('password', password);
            proceedToGame();
        } else {
            errorElement.textContent = 'Invalid username or password.';
            errorElement.style.display = 'block';
            passwordInput.value = '';
        }
    } catch (error) {
        console.error('Login error:', error);
        errorElement.textContent = 'An error occurred during login. Please try again.';
        errorElement.style.display = 'block';
    }
}
async function attemptLogin(username, password) {
    console.log(`Attempting login for user: ${username}`);
    try {
        const response = await fetch("https://l6ct9b9z8g.execute-api.us-west-2.amazonaws.com/login", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
            console.error('Login failed with status:', response.status);
            return false;
        }
        const result = await response.json();
        return result.message === "Login successful.";

    } catch (error) {
        console.error('Network or other error during login:', error);
        return false;
    }
}
function proceedToGame() {
    const loginContainer = document.getElementById('login-container');
    if (loginContainer) {
        loginContainer.innerHTML = '';
        loginContainer.style.display = 'none';
    }
    if (typeof setupUI === 'function') {
        setupUI();
    } else {
        console.error('setupUI function not found!');
    }
}
document.addEventListener('DOMContentLoaded', () => {
    const storedUsername = localStorage.getItem('username');
    const storedPassword = localStorage.getItem('password');
    if (storedUsername && storedPassword) {
        attemptLogin(storedUsername, storedPassword).then(success => {
            if (success) {
                console.log('Auto-login successful.');
                proceedToGame();
            } else {
                console.log('Auto-login failed. Clearing stored credentials.');
                localStorage.removeItem('username');
                localStorage.removeItem('password');
                displayLoginForm();
            }
        }).catch(error => {
             console.error('Error during auto-login attempt:', error);
             localStorage.removeItem('username');
             localStorage.removeItem('password');
             displayLoginForm();
        });
    } else {
        displayLoginForm();
    }
});