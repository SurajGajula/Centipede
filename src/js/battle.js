import State from "./state.js";
export function startBattle(ally, enemy) {
    const state = new State(ally, enemy);
    const leftUI = document.getElementById("leftUI");
    const rightUI = document.getElementById("rightUI");
    const allyImagePath = `../assets/images/${ally.name}.svg`;
    const enemyImagePath = `../assets/images/${enemy.name}.svg`;
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
                    <img src="${allyImagePath}" alt="${ally.name}">
                </div>
                <div class="battle-enemy">
                    <img src="${enemyImagePath}" alt="${enemy.name}">
                </div>
            </div>
            <div class="battle-ground"></div>
        </div>
    `;
    rightUI.innerHTML = `
        <button id="skill-button">${ally.skillname}</button>
    `;
    document.getElementById("skill-button").addEventListener("click", () => {
        useSkill(state);
    });
    console.log('Battle state created:', state);
    return state;
}
async function useSkill(state) {
    console.log('Current state:', state);
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
