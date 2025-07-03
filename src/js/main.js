import { loadAccount, displayAllies, displayEnemies, displayRecruitments } from "./menu.js";
import { initialize } from './initialize.js';
import { showLoadingScreen, hideLoadingScreen } from "./loading.js";

export async function setupUI() {
    try {
        const username = localStorage.getItem('username');
        const hashedPassword = localStorage.getItem('hashedPassword');
        
        if (!username || !hashedPassword) {
            console.error("Cannot setup UI without credentials in localStorage.");
            hideLoadingScreen();
            return;
        }
        
        const data = await initialize(username, hashedPassword);
        
        if (data) {
            const { account, allies, enemies, recruitments } = data;
            
const accountButton = document.getElementById("accountButton");
const alliesButton = document.getElementById("alliesButton");
const enemiesButton = document.getElementById("enemiesButton");
const recruitButton = document.getElementById("recruitButton");

        accountButton.addEventListener("click", () => loadAccount(account));
            alliesButton.addEventListener("click", () => displayAllies(allies));
            enemiesButton.addEventListener("click", () => displayEnemies(enemies));
            recruitButton.addEventListener("click", () => displayRecruitments(recruitments));

        const gameContainer = document.getElementById('game-container');
        if (gameContainer) {
            gameContainer.style.display = 'flex';
        } else {
            console.error("Game container not found!");
            }

            displayEnemies(enemies);
        } else {
            console.error("Failed to initialize game data");
            hideLoadingScreen();
        }
    } catch (error) {
        console.error("Error in setupUI:", error);
        hideLoadingScreen();
    }
}