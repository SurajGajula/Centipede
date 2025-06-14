import State from "./state.js";
import { initializeStatusDisplay, updateStatusDisplay } from "./status.js";
import { showLoadingScreen, hideLoadingScreen } from "./loading.js";
let actionInProgress = false;
export async function startBattle(ally, enemy) {
    showLoadingScreen("Preparing Battle");
    actionInProgress = false;
    await new Promise(resolve => setTimeout(resolve, 100));
    const state = new State(ally, enemy);
    const leftUI = document.getElementById("leftUI");
    const rightUI = document.getElementById("rightUI");
    const allyImagePath = `../assets/images/${ally.name}.svg`;
    const enemyImagePath = `../assets/images/${enemy.name}.svg`;
    ally.clearStatuses();
    enemy.clearStatuses();
    leftUI.innerHTML = `
        <div class="battle-container">
            <div class="health-bars">
                <div class="ally-health-container">
                    <div class="health-bar-background">
                        <div class="health-bar ally-health-bar" style="width: 100%"></div>
                    </div>
                </div>
                <div class="enemy-health-container">
                    <div class="health-bar-background">
                        <div class="health-bar enemy-health-bar" style="width: 100%"></div>
                    </div>
                </div>
            </div>
            <div class="battle-characters">
                <div class="battle-ally">
                    <div class="notification-container"></div>
                    <img src="${allyImagePath}" alt="${ally.name}">
                </div>
                <div class="battle-enemy">
                    <div class="notification-container"></div>
                    <img src="${enemyImagePath}" alt="${enemy.name}">
                </div>
            </div>
            <div class="battle-ground"></div>
        </div>
    `;
    rightUI.innerHTML = `
        <button id="skill-button">${ally.skillname.toUpperCase()}</button>
    `;
    initializeStatusDisplay();
    updateStatusDisplay(ally, enemy);
    const images = document.querySelectorAll('.battle-container img');
    await Promise.all(Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(resolve => {
            img.onload = resolve;
            img.onerror = resolve;
        });
    }));
    document.getElementById("skill-button").addEventListener("click", () => {
        if (!actionInProgress) {
            useSkill(state);
        }
    });
    hideLoadingScreen();
    return state;
}
async function useSkill(state) {
    try {
        actionInProgress = true;
        const skillButton = document.getElementById("skill-button");
        if (skillButton) {
            skillButton.disabled = true;
            skillButton.style.opacity = "0.6";
            skillButton.style.cursor = "not-allowed";
        }
        await state.allyAttack();
        updateHealthBars(state);
        if (state.checkBattleEnd()) {
            return;
        }
        await state.enemyAttack();
        updateHealthBars(state);
        if (state.checkBattleEnd()) {
            return;
        }        
        state.nextTurn();
    } catch (error) {
        console.error("Error during battle sequence:", error);
    } finally {
        actionInProgress = false;
        const skillButton = document.getElementById("skill-button");
        if (skillButton) {
            skillButton.disabled = false;
            skillButton.style.opacity = "1";
            skillButton.style.cursor = "pointer";
        }
    }
}
function updateHealthBars(state) {
    const allyHealthBar = document.querySelector('.ally-health-bar');
    const enemyHealthBar = document.querySelector('.enemy-health-bar');
    if (allyHealthBar && enemyHealthBar) {
        const allyHealthPercentage = Math.max(0, (state.ally.health / state.ally.maxHealth) * 100);
        const enemyHealthPercentage = Math.max(0, (state.enemy.health / state.enemy.maxHealth) * 100);
        allyHealthBar.style.width = `${allyHealthPercentage}%`;
        enemyHealthBar.style.width = `${enemyHealthPercentage}%`;
    }
}
export function setupBattleButtons(enemies) {
    const battleButtons = document.querySelectorAll('.battle-button');
    battleButtons.forEach(button => {
        button.addEventListener('click', async function() {
            const enemyIndex = parseInt(this.getAttribute('data-enemy-index'));
            try {
                const username = localStorage.getItem('username');
                const hashedPassword = localStorage.getItem('hashedPassword');
                if (!username || !hashedPassword) {
                    throw new Error("User credentials not found");
                }
                showLoadingScreen("Loading party...");
                const partyResponse = await fetch("https://l6ct9b9z8g.execute-api.us-west-2.amazonaws.com/loadparty", {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username,
                        password: hashedPassword,
                        passwordIsHashed: true
                    })
                });
                const partyData = await partyResponse.json();
                if (partyResponse.status >= 400 || partyData.statusCode >= 400) {
                    throw new Error(partyData.message || "Failed to load party");
                }
                const party = partyData.party || [];
                if (party.length === 0) {
                    throw new Error("No party members found");
                }
                const module = await import('./initialize.js');
                const data = await module.initialize(username, hashedPassword);
                if (!data || !data.allies || data.allies.length === 0) {
                    throw new Error("No allies found");
                }
                const selectedEnemy = enemies[enemyIndex];
                const firstPartyMember = data.allies.find(ally => ally.name === party[0]);
                if (!firstPartyMember) {
                    throw new Error("Party member not found in allies list");
                }
                startBattle(firstPartyMember, selectedEnemy);
            } catch (error) {
                console.error("Error starting battle:", error);
                alert(error.message || "Failed to start battle");
            } finally {
                hideLoadingScreen();
            }
        });
    });
}