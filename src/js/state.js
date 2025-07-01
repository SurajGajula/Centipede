import { updateStatusDisplay } from "./status.js";
import { showLoadingScreen, hideLoadingScreen } from "./loading.js";
import { showStatusNotification, showDamageNotification } from "./notifications.js";
import { displayAllies, displayEnemies } from "./menu.js";

export async function showAllies() {
    try {
        const username = localStorage.getItem('username');
        const hashedPassword = localStorage.getItem('hashedPassword');
        
        if (!username || !hashedPassword) {
            throw new Error("User credentials not found");
        }

        showLoadingScreen("Loading allies...");
        const response = await fetch("/api/loadallies", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username,
                password: hashedPassword,
                passwordIsHashed: true
            })
        });

        if (!response.ok) {
            throw new Error(`Failed to load allies: ${response.status}`);
        }

        const allies = await response.json();
        hideLoadingScreen();
        displayAllies(allies);
    } catch (error) {
        console.error("Error loading allies:", error);
        hideLoadingScreen();
    }
}

export async function showEnemies() {
    try {
        const username = localStorage.getItem('username');
        const hashedPassword = localStorage.getItem('hashedPassword');
        
        if (!username || !hashedPassword) {
            throw new Error("User credentials not found");
        }

        showLoadingScreen("Loading enemies...");
        const response = await fetch("/api/loadenemies", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username,
                password: hashedPassword,
                passwordIsHashed: true
            })
        });

        if (!response.ok) {
            throw new Error(`Failed to load enemies: ${response.status}`);
        }

        const enemies = await response.json();
        hideLoadingScreen();
        displayEnemies(enemies);
    } catch (error) {
        console.error("Error loading enemies:", error);
        hideLoadingScreen();
    }
}

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
        if (this.ally.health <= 0) {
            document.getElementById("leftUI").innerHTML = "<h1>You Lost!</h1>";
            return true;
        } else if (this.enemy.health <= 0) {
            this.victory();
            return true;
        }
        return false;
    }
    async victory() {
        document.getElementById("leftUI").innerHTML = `
            <h1>Victory!</h1>
            <p>You defeated ${this.enemy.name}!</p>
        `;
    }
    async returnToMenuWithVictory() {
        showLoadingScreen("Victory!");
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
                                account.marbles = storedAccount.marbles;
                            }
                        } catch (e) {
                            console.error("Failed to retrieve stored account data:", e);
                        }
                        menuModule.loadAccount(account);
                    });
                });                
                document.getElementById("alliesButton").addEventListener("click", () => {
                    import('./menu.js').then(menuModule => menuModule.showAllies(allies));
                });                
                document.getElementById("enemiesButton").addEventListener("click", () => {
                    import('./menu.js').then(menuModule => menuModule.showEnemies(enemies));
                });
                document.getElementById("recruitButton").addEventListener("click", () => {
                    import('./menu.js').then(menuModule => menuModule.displayRecruitments(recruitments));
                });
                const menuModule = await import('./menu.js');
                menuModule.showEnemies(enemies);
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