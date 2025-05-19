import { updateStatusDisplay } from "./status.js";
import { showLoadingScreen, hideLoadingScreen } from "./loading.js";
import { showStatusNotification, showDamageNotification } from "./notifications.js";
class State {
    constructor(ally, enemy) {
        this.ally = ally;
        this.enemy = enemy;
        this.ally.maxHealth = this.ally.health;
        this.enemy.maxHealth = this.enemy.health;
        this.state = 0;
        this.turn = 0;
    }
    nextTurn() {
        this.turn++;
        this.state = (this.state + 1) % 4;
    }
    async allyAttack() {
        return new Promise(resolve => {
            setTimeout(() => {
                this.enemy.health -= this.ally.attack;
                const enemyElement = document.querySelector('.battle-enemy');
                if (enemyElement) {
                    showDamageNotification(this.ally.attack, enemyElement);
                }
                if (this.ally.skillstatus) {
                    const isNewStatus = !this.enemy.statuses[this.ally.skillstatus];
                    this.enemy.addStatus(this.ally.skillstatus, this.ally.skillcount);
                    updateStatusDisplay(this.ally, this.enemy);
                    if (isNewStatus && enemyElement) {
                        showStatusNotification(this.ally.skillstatus, enemyElement);
                    }
                }                
                resolve();
            }, 1000);
        });
    }
    async enemyAttack() {
        return new Promise(resolve => {
            setTimeout(() => {
                this.ally.health -= this.enemy.attack;
                const allyElement = document.querySelector('.battle-ally');
                if (allyElement) {
                    showDamageNotification(this.enemy.attack, allyElement);
                }
                if (this.enemy.skillstatus) {
                    const isNewStatus = !this.ally.statuses[this.enemy.skillstatus];
                    this.ally.addStatus(this.enemy.skillstatus, this.enemy.skillcount);
                    updateStatusDisplay(this.ally, this.enemy);
                    if (isNewStatus && allyElement) {
                        showStatusNotification(this.enemy.skillstatus, allyElement);
                    }
                }                
                resolve();
            }, 1000);
        });
    }
    checkBattleEnd() {
        if (this.enemy.health <= 0) {
            this.returnToMenuWithVictory();
            return true;
        } else if (this.ally.health <= 0) {
            this.returnToMenuWithDefeat();
            return true;
        }
        return false;
    }
    async returnToMenuWithVictory() {
        showLoadingScreen("Victory!");
        const username = localStorage.getItem('username');
        const hashedPassword = localStorage.getItem('hashedPassword');
        const enemyName = this.enemy.name;
        try {
            const response = await fetch("https://l6ct9b9z8g.execute-api.us-west-2.amazonaws.com/defeatenemy", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    username, 
                    password: hashedPassword,
                    enemyname: enemyName,
                    passwordIsHashed: true 
                })
            });
            if (!response.ok) {
                const errorData = await response.json();
                console.error("Failed to record enemy defeat:", errorData);
            } else {
                const data = await response.json();
                if (data.alreadyDefeated) {
                    showLoadingScreen(`Victory! (Already Defeated)`);
                } else {
                    showLoadingScreen(`Victory! +100 Marbles (Total: ${data.marbles})`);
                }
            }
        } catch (error) {
            console.error("Error calling defeatenemy API:", error);
        }        
        const leftUI = document.getElementById("leftUI");
        const rightUI = document.getElementById("rightUI");
        await new Promise(resolve => setTimeout(resolve, 1000));
        leftUI.innerHTML = "";
        rightUI.innerHTML = "";
        await this.restoreMenu();
    }
    async returnToMenuWithDefeat() {
        showLoadingScreen("Defeat!");
        const leftUI = document.getElementById("leftUI");
        const rightUI = document.getElementById("rightUI");
        await new Promise(resolve => setTimeout(resolve, 1000));
        leftUI.innerHTML = "";
        rightUI.innerHTML = "";
        await this.restoreMenu();
    }
    async restoreMenu() {
        const rightUI = document.getElementById("rightUI");
        rightUI.innerHTML = `
            <button id="accountButton">Account</button>
            <button id="alliesButton">Allies</button>
            <button id="enemiesButton">Enemies</button>
            <button id="recruitButton">Recruit</button>
        `;
        const username = localStorage.getItem('username');
        const hashedPassword = localStorage.getItem('hashedPassword');        
        try {
            localStorage.removeItem('currentMarbles');
            showLoadingScreen("Refreshing game data...");
            const module = await import('./initialize.js');
            const data = await module.initialize(username, hashedPassword);
            hideLoadingScreen();            
            if (data) {
                const { account, allies, enemies, recruitments } = data;
                try {
                    sessionStorage.setItem('accountData', JSON.stringify({
                        level: account.level,
                        marbles: account.marbles
                    }));
                } catch (e) {
                    console.error("Failed to store account data in session storage:", e);
                }
                document.getElementById("accountButton").addEventListener("click", () => {
                    import('./menu.js').then(menuModule => {
                        try {
                            const storedAccount = JSON.parse(sessionStorage.getItem('accountData'));
                            if (storedAccount) {
                                account.level = storedAccount.level;
                                account.marbles = storedAccount.marbles;
                            }
                        } catch (e) {
                            console.error("Failed to retrieve stored account data:", e);
                        }
                        menuModule.loadAccount(account);
                    });
                });                
                document.getElementById("alliesButton").addEventListener("click", () => {
                    import('./menu.js').then(menuModule => menuModule.loadAllies(allies));
                });                
                document.getElementById("enemiesButton").addEventListener("click", () => {
                    import('./menu.js').then(menuModule => menuModule.loadEnemies(enemies));
                });
                document.getElementById("recruitButton").addEventListener("click", () => {
                    import('./menu.js').then(menuModule => menuModule.loadRecruitments(recruitments));
                });
                const menuModule = await import('./menu.js');
                menuModule.loadEnemies(enemies);
            } else {
                console.error("Failed to reload game data after battle");
                hideLoadingScreen();
            }
        } catch (error) {
            console.error("Error restoring menu:", error);
            hideLoadingScreen();
        }
    }
    showMenuUI() {
        const menuUI = document.getElementById("menuUI");
        if (menuUI) {
            menuUI.style.display = "block";
        }
    }
}
export default State;