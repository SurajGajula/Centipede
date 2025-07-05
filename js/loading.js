export function showLoadingScreen(message = 'Loading') {
    let loadingScreen = document.getElementById('loading-screen');
    if (!loadingScreen) {
        loadingScreen = document.createElement('div');
        loadingScreen.id = 'loading-screen';
        loadingScreen.className = 'loading-screen';
        const loadingIcon = document.createElement('div');
        loadingIcon.className = 'loading-icon';
        for (let i = 0; i < 3; i++) {
            const leg = document.createElement('div');
            leg.className = 'loading-legs';
            loadingIcon.appendChild(leg);
        }
        const loadingText = document.createElement('div');
        loadingText.className = 'loading-text';
        loadingText.innerHTML = `${message}<span class="loading-dots"></span>`;
        loadingScreen.appendChild(loadingIcon);
        loadingScreen.appendChild(loadingText);
        document.body.appendChild(loadingScreen);
    } else {
        const loadingText = loadingScreen.querySelector('.loading-text');
        if (loadingText) {
            loadingText.innerHTML = `${message}<span class="loading-dots"></span>`;
        }
        loadingScreen.style.display = 'flex';
        loadingScreen.style.opacity = '1';
    }
    return loadingScreen;
}
export function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 300);
    }
}
export async function withLoading(asyncTask, message = 'Loading') {
    showLoadingScreen(message);
    
    try {
        const result = await asyncTask();
        hideLoadingScreen();
        return result;
    } catch (error) {
        hideLoadingScreen();
        throw error;
    }
}
