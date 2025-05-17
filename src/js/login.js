import { handleApiError } from './error.js';
import { showLoadingScreen, hideLoadingScreen } from "./loading.js";

// Function to hash password using SHA-256
async function hashPassword(password, salt = '') {
    // Add a salt to the password for better security
    const saltedPassword = password + salt;
    
    // Convert the string to an ArrayBuffer
    const encoder = new TextEncoder();
    const data = encoder.encode(saltedPassword);
    
    // Hash the password using SHA-256
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    
    // Convert the ArrayBuffer to a hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return hashHex;
}

function displayLoginForm() {
    const loginContainer = document.getElementById('login-container');
    if (!loginContainer) {
        console.error('Login container not found!');
        return;
    }
    loginContainer.innerHTML = `
        <h1 id="game-title">Centipede</h1>
        <div id="login-form-wrapper">
            <form id="login-form">
                <div>
                    <label for="username">USERNAME</label>
                    <input type="text" id="username" name="username" required>
                </div>
                <div>
                    <label for="password">PASSWORD</label>
                    <input type="password" id="password" name="password" required>
                </div>
                <button type="submit">Login</button>
                <p id="login-error" class="error-message"></p>
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
    errorElement.textContent = '';
    
    // Show loading screen
    showLoadingScreen("Logging In");
    
    try {
        // Hash the password before sending to the server
        // Use username as part of the salt for better security
        const hashedPassword = await hashPassword(password, username);
        
        const success = await attemptLogin(username, hashedPassword);
        if (success) {
            // Store the hashed password instead of plaintext
            localStorage.setItem('username', username);
            localStorage.setItem('hashedPassword', hashedPassword);
            proceedToGame();
        } else {
            errorElement.textContent = 'Invalid username or password.';
            passwordInput.value = '';
            hideLoadingScreen();
        }
    } catch (error) {
        console.error('Login error:', error);
        errorElement.textContent = 'An error occurred during login. Please try again.';
        hideLoadingScreen();
    }
}

async function attemptLogin(username, hashedPassword) {
    try {
        const response = await fetch("https://l6ct9b9z8g.execute-api.us-west-2.amazonaws.com/login", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                username, 
                password: hashedPassword,
                passwordIsHashed: true 
            }),
        });
        if (response.status === 200 || response.status === 201) {
            return true;
        } else {
            console.error(`Login/Registration failed with status: ${response.status}`);
            try {
                const errorBody = await response.json();
                console.error('Error details:', errorBody);
            } catch (e) {
                console.error('Could not parse error response body.');
            }
            return false;
        }

    } catch (error) {
        console.error('Network or other error during login/registration:', error);
        return false;
    }
}

function proceedToGame() {
    const loginContainer = document.getElementById('login-container');
    if (loginContainer) {
        loginContainer.innerHTML = '';
        loginContainer.style.display = 'none';
    }
    
    // Loading screen is already showing from login
    // Initialize the game
    if (typeof setupUI === 'function') {
        setupUI();
    } else {
        console.error('setupUI function not found!');
        hideLoadingScreen();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const storedUsername = localStorage.getItem('username');
    const storedHashedPassword = localStorage.getItem('hashedPassword');
    
    if (storedUsername && storedHashedPassword) {
        // Show loading screen for auto-login
        showLoadingScreen("Auto Login");
        
        attemptLogin(storedUsername, storedHashedPassword).then(success => {
            if (success) {
                proceedToGame();
            } else {
                localStorage.removeItem('username');
                localStorage.removeItem('hashedPassword');
                hideLoadingScreen();
                displayLoginForm();
            }
        }).catch(error => {
            handleApiError('auto-login', error);
            hideLoadingScreen();
            displayLoginForm();
        });
    } else {
        displayLoginForm();
    }
});