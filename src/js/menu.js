import { startBattle } from "./battle.js";
export function loadAccount(account){
    const leftUI = document.getElementById("leftUI");
    leftUI.innerHTML = `
    <h1>Account</h1>
    <div class="info-panel">
    <p><strong>Level:</strong> ${account.level}</p>
    <p><strong>Marbles:</strong> ${account.marbles}</p>
    <button id="logout-button">Logout</button>
    </div>
    `;
    const logoutButton = document.getElementById("logout-button");
    if (logoutButton) {
        logoutButton.addEventListener("click", () => {
            localStorage.removeItem('username');
            localStorage.removeItem('password');
            window.location.href = 'index.html';
        });
    }
}
export function loadAllies(allies){
    const leftUI = document.getElementById("leftUI");
    const allySections = allies.map((ally, index) => {
        const imageName = `${ally.name}.svg`;
        const imagePath = `../assets/images/${imageName}`;
        return `
            <div class="info-panel ally-section">
                <div class="ally-details-content">
                    <img src="${imagePath}" alt="${ally.name} Front Image" class="ally-image">
                    <h2>${ally.name}</h2>
                    <div class="ally-buttons">
                        <button class="party-button" data-ally-index="${index}">Party</button>
                        <button class="info-button" data-ally-index="${index}">Info</button>
                    </div>
                </div>
                <div class="ally-expanded-info">
                    <p class="ally-stats">
                        Level: ${ally.level}<br>
                        Attack: ${ally.attack}<br>
                        Health: ${ally.health}<br>
                        SkillName: ${ally.skillname}<br>
                        SkillStatus: ${ally.skillstatus}<br>
                        SkillCount: ${ally.skillcount}<br>
                        SkillHits: ${ally.skillhits}
                    </p>
                </div>
            </div>
        `;
    }).join('');
    leftUI.innerHTML = `
    <h1>Allies</h1>
    <div class="ally-items-container">
        ${allySections}
    </div>
    `;
    const infoButtons = document.querySelectorAll('.info-button');
    infoButtons.forEach(button => {
        button.addEventListener('click', function() {
            const infoPanel = this.closest('.ally-section').querySelector('.ally-expanded-info');
            infoPanel.classList.toggle('visible');
        });
    });
}
export function loadEnemies(enemies){
    const leftUI = document.getElementById("leftUI");
    const enemySections = enemies.map((enemy, index) => {
        const imageName = `${enemy.name}.svg`;
        const imagePath = `../assets/images/${imageName}`;
        return `
            <div class="info-panel enemy-section">
                <div class="enemy-details-content">
                    <img src="${imagePath}" alt="${enemy.name} Front Image" class="enemy-image">
                    <h2>${enemy.name}</h2>
                    <div class="enemy-buttons">
                        <button class="battle-button" data-enemy-index="${index}">Battle</button>
                        <button class="info-button" data-enemy-index="${index}">Info</button>
                    </div>
                </div>
                <div class="enemy-expanded-info">
                    <p class="enemy-stats">
                        Level: ${enemy.level}<br>
                        Attack: ${enemy.attack}<br>
                        Health: ${enemy.health}<br>
                        SkillName: ${enemy.skillname}<br>
                        SkillStatus: ${enemy.skillstatus}<br>
                        SkillCount: ${enemy.skillcount}<br>
                        SkillHits: ${enemy.skillhits}
                    </p>
                </div>
            </div>
        `;
    }).join('');
    leftUI.innerHTML = `
    <h1>Enemies</h1>
    <div class="enemy-items-container">
        ${enemySections}
    </div>
    `;
    const battleButtons = document.querySelectorAll('.battle-button');
    battleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const enemyIndex = parseInt(this.getAttribute('data-enemy-index'));
            import('./initialize.js').then(module => {
                module.initialize(
                    localStorage.getItem('username'), 
                    localStorage.getItem('password')
                ).then(data => {
                    if (data && data.allies && data.allies.length > 0) {
                        const firstAlly = data.allies[0];
                        const selectedEnemy = enemies[enemyIndex];
                        startBattle(firstAlly, selectedEnemy);
                    } else {
                        console.error("No allies found!");
                    }
                });
            });
        });
    });    
    const infoButtons = document.querySelectorAll('.info-button');
    infoButtons.forEach(button => {
        button.addEventListener('click', function() {
            const infoPanel = this.closest('.enemy-section').querySelector('.enemy-expanded-info');
            infoPanel.classList.toggle('visible');
        });
    });
}
export function loadRecruitments(recruitments){
    const leftUI = document.getElementById("leftUI");
    leftUI.innerHTML = `
    `;
}