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
                resolve();
            }, 1000);
        });
    }
    async enemyAttack() {
        return new Promise(resolve => {
            setTimeout(() => {
                this.ally.health -= this.enemy.attack;
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
    returnToMenuWithVictory() {
        console.log("Battle won!");
        const leftUI = document.getElementById("leftUI");
        const rightUI = document.getElementById("rightUI");
        leftUI.innerHTML = "";
        rightUI.innerHTML = "";
        this.restoreMenu();
    }
    returnToMenuWithDefeat() {
        console.log("Battle lost!");
        const leftUI = document.getElementById("leftUI");
        const rightUI = document.getElementById("rightUI");
        leftUI.innerHTML = "";
        rightUI.innerHTML = "";
        this.restoreMenu();
    }
    restoreMenu() {
        const rightUI = document.getElementById("rightUI");
        rightUI.innerHTML = `
            <button id="accountButton">Account</button>
            <button id="alliesButton">Allies</button>
            <button id="enemiesButton">Enemies</button>
            <button id="recruitButton">Recruit</button>
        `;
        
        // Reinitialize the game data and reload the last viewed menu
        const username = localStorage.getItem('username');
        const password = localStorage.getItem('password');
        
        import('./initialize.js').then(module => {
            module.initialize(username, password).then(data => {
                if (data) {
                    const { account, allies, enemies, recruitments } = data;
                    
                    // Set up event listeners for menu buttons
                    document.getElementById("accountButton").addEventListener("click", () => {
                        import('./menu.js').then(menuModule => menuModule.loadAccount(account));
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
                    
                    // Show the enemies screen by default after battle
                    import('./menu.js').then(menuModule => menuModule.loadEnemies(enemies));
                } else {
                    console.error("Failed to reload game data after battle");
                }
            });
        });
    }
    showMenuUI() {
        const menuUI = document.getElementById("menuUI");
        if (menuUI) {
            menuUI.style.display = "block";
        }
    }
}
export default State;