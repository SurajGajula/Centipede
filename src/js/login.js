import { handleApiError } from './error.js';
import { showLoadingScreen, hideLoadingScreen } from "./loading.js";
import { setupUI } from './main.js';

async function hashPassword(password, salt = '') {
    const saltedPassword = password + salt;
    const encoder = new TextEncoder();
    const data = encoder.encode(saltedPassword);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

function displayAuthForms() {
    const loginContainer = document.getElementById('login-container');
    if (!loginContainer) {
        console.error('Login container not found!');
        return;
    }
    
    loginContainer.innerHTML = `
        <h1 id="game-title">Centipede</h1>
        <div id="auth-container">
            <div id="login-section" class="auth-section active">
                <h2>Login</h2>
                <form id="login-form">
                    <div>
                        <label for="login-username">USERNAME</label>
                        <input type="text" id="login-username" name="username" required>
                    </div>
                    <div>
                        <label for="login-password">PASSWORD</label>
                        <input type="password" id="login-password" name="password" required>
                    </div>
                    <button type="submit">Login</button>
                    <p id="login-error" class="error-message"></p>
                </form>
                <p class="switch-form">Don't have an account? <a href="#" id="show-register">Register here</a></p>
            </div>
            
            <div id="register-section" class="auth-section">
                <h2>Register</h2>
                <form id="register-form">
                    <div>
                        <label for="register-username">USERNAME</label>
                        <input type="text" id="register-username" name="username" required>
                    </div>
                    <div>
                        <label for="register-password">PASSWORD</label>
                        <input type="password" id="register-password" name="password" required>
                    </div>
                    <div>
                        <label for="confirm-password">CONFIRM PASSWORD</label>
                        <input type="password" id="confirm-password" name="confirmPassword" required>
                    </div>
                    <button type="submit">Register</button>
                    <p id="register-error" class="error-message"></p>
                </form>
                <p class="switch-form">Already have an account? <a href="#" id="show-login">Login here</a></p>
            </div>
        </div>
    `;
    
    // Add event listeners for form switching
    document.getElementById('show-register').addEventListener('click', (e) => {
        e.preventDefault();
        showRegisterForm();
    });
    
    document.getElementById('show-login').addEventListener('click', (e) => {
        e.preventDefault();
        showLoginForm();
    });
    
    // Add form submit listeners
    document.getElementById('login-form').addEventListener('submit', handleLoginSubmit);
    document.getElementById('register-form').addEventListener('submit', handleRegisterSubmit);
}

function showLoginForm() {
    document.getElementById('login-section').classList.add('active');
    document.getElementById('register-section').classList.remove('active');
    clearErrors();
}

function showRegisterForm() {
    document.getElementById('register-section').classList.add('active');
    document.getElementById('login-section').classList.remove('active');
    clearErrors();
}

function clearErrors() {
    document.getElementById('login-error').textContent = '';
    document.getElementById('register-error').textContent = '';
}

async function handleLoginSubmit(event) {
    event.preventDefault();
    const usernameInput = document.getElementById('login-username');
    const passwordInput = document.getElementById('login-password');
    const errorElement = document.getElementById('login-error');
    
    const username = usernameInput.value;
    const password = passwordInput.value;
    
    errorElement.textContent = '';
    showLoadingScreen("Logging In");
    
    try {
        const hashedPassword = await hashPassword(password, username);
        const success = await attemptLogin(username, hashedPassword);
        
        if (success) {
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

async function handleRegisterSubmit(event) {
    event.preventDefault();
    const usernameInput = document.getElementById('register-username');
    const passwordInput = document.getElementById('register-password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const errorElement = document.getElementById('register-error');
    
    const username = usernameInput.value;
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    
    errorElement.textContent = '';
    
    // Validate passwords match
    if (password !== confirmPassword) {
        errorElement.textContent = 'Passwords do not match.';
        return;
    }
    
    // Validate password strength
    if (password.length < 6) {
        errorElement.textContent = 'Password must be at least 6 characters long.';
        return;
    }
    
    showLoadingScreen("Creating Account");
    
    try {
        const hashedPassword = await hashPassword(password, username);
        const success = await attemptRegister(username, hashedPassword);
        
        if (success) {
            localStorage.setItem('username', username);
            localStorage.setItem('hashedPassword', hashedPassword);
            proceedToGame();
        } else {
            errorElement.textContent = 'Registration failed. Username may already exist.';
            hideLoadingScreen();
        }
    } catch (error) {
        console.error('Registration error:', error);
        errorElement.textContent = 'An error occurred during registration. Please try again.';
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
        
        if (response.status === 200) {
            return true;
        } else {
            console.error(`Login failed with status: ${response.status}`);
            try {
                const errorBody = await response.json();
                console.error('Error details:', errorBody);
            } catch (e) {
                console.error('Could not parse error response body.');
            }
            return false;
        }
    } catch (error) {
        console.error('Network or other error during login:', error);
        return false;
    }
}

async function attemptRegister(username, hashedPassword) {
    try {
        const response = await fetch("https://l6ct9b9z8g.execute-api.us-west-2.amazonaws.com/register", {
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
        
        if (response.status === 201) {
            return true;
        } else {
            console.error(`Registration failed with status: ${response.status}`);
            try {
                const errorBody = await response.json();
                console.error('Error details:', errorBody);
            } catch (e) {
                console.error('Could not parse error response body.');
            }
            return false;
        }
    } catch (error) {
        console.error('Network or other error during registration:', error);
        return false;
    }
}

function proceedToGame() {
    const loginContainer = document.getElementById('login-container');
    if (loginContainer) {
        loginContainer.innerHTML = '';
        loginContainer.style.display = 'none';
    }    
    
    try {
        setupUI();
    } catch (error) {
        console.error('setupUI function error:', error);
        hideLoadingScreen();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const storedUsername = localStorage.getItem('username');
    const storedHashedPassword = localStorage.getItem('hashedPassword');    
    
    if (storedUsername && storedHashedPassword) {
        showLoadingScreen("Auto Login");
        attemptLogin(storedUsername, storedHashedPassword).then(success => {
            if (success) {
                proceedToGame();
            } else {
                localStorage.removeItem('username');
                localStorage.removeItem('hashedPassword');
                hideLoadingScreen();
                displayAuthForms();
            }
        }).catch(error => {
            handleApiError('auto-login', error);
            hideLoadingScreen();
            displayAuthForms();
        });
    } else {
        displayAuthForms();
    }
});