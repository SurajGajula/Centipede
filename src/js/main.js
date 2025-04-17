import { loadAccount, loadAllies, loadEnemies, loadRecruitments } from "./menu.js";
import { initialize } from "./initialize.js";
const accountButton = document.getElementById("accountButton");
const alliesButton = document.getElementById("alliesButton");
const enemiesButton = document.getElementById("enemiesButton");
const recruitButton = document.getElementById("recruitButton");
window.setupUI = async function() {
    const username = localStorage.getItem('username');
    const password = localStorage.getItem('password');
    if (!username || !password) {
        console.error("Cannot setup UI without credentials in localStorage.");
        return;
    }
    try {
        const { account, allies, enemies, recruitments } = await initialize(username, password);
        loadAccount(account);
        accountButton.addEventListener("click", () => loadAccount(account));
        alliesButton.addEventListener("click", () => loadAllies(allies));
        enemiesButton.addEventListener("click", () => loadEnemies(enemies));
        recruitButton.addEventListener("click", () => loadRecruitments(recruitments));
        const gameContainer = document.getElementById('game-container');
        if (gameContainer) {
            gameContainer.style.display = 'flex';
        } else {
            console.error("Game container not found!");
        }
    } catch (error) {
        console.error("Failed to initialize game data:", error);
    }
}