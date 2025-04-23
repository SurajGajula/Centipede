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
    const allySections = allies.map(ally => {
        const imageName = `${ally.name}Front.png`;
        const imagePath = `../assets/images/${imageName}`;
        return `
            <div class="info-panel ally-section">
                <div class="ally-details-content">
                    <img src="${imagePath}" alt="${ally.name} Front Image" class="ally-image">
                    <div class="ally-stats-container">
                        <h2>${ally.name}</h2>
                        <p class="ally-stats">
                            Level: ${ally.level}<br>
                            Attack: ${ally.attack}<br>
                            Health: ${ally.health}<br>
                            Skill: ${ally.skill}
                        </p>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    leftUI.innerHTML = `
    <h1>Allies</h1>
    ${allySections}
    `;
}
export function loadEnemies(enemies){
    const leftUI = document.getElementById("leftUI");
    const enemySections = enemies.map(enemy => {
        const imageName = `${enemy.name}Front.png`;
        const imagePath = `../assets/images/${imageName}`;
        return `
            <div class="info-panel enemy-section">
                <div class="enemy-details-content">
                    <img src="${imagePath}" alt="${enemy.name} Front Image" class="enemy-image">
                    <div class="enemy-stats-container">
                        <h2>${enemy.name}</h2>
                        <p class="enemy-stats">
                            Level: ${enemy.level}<br>
                            Attack: ${enemy.attack}<br>
                            Health: ${enemy.health}<br>
                            Skill: ${enemy.skill}
                        </p>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    leftUI.innerHTML = `
    <h1>Enemies</h1>
    ${enemySections}
    `;
}
export function loadRecruitments(recruitments){
    const leftUI = document.getElementById("leftUI");
    leftUI.innerHTML = `
    `;
}