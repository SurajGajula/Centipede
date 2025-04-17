export function loadAccount(account){
    const leftUI = document.getElementById("leftUI");
    leftUI.innerHTML = `
    <h1>Account</h1>
    <div class="info-panel">
    <p><strong>Level:</strong> ${account.level}</p>
    </div>
    `;
}
export function loadAllies(allies){
    const leftUI = document.getElementById("leftUI");
    leftUI.innerHTML = `
    <h1>Allies</h1>
    <div class="info-panel">
    <p>You have 3 active allies:</p>
    <ul>
    <li>${allies[0].name} - Level ${allies[0].level}</li>
    <li>${allies[1].name} - Level ${allies[1].level}</li>
    <li>${allies[2].name} - Level ${allies[2].level}</li>
    </ul>
    </div>
    `;
}
export function loadEnemies(enemies){
    const leftUI = document.getElementById("leftUI");
    leftUI.innerHTML = `
    <h1>Enemies</h1>
    <div class="info-panel">
    <p>Detected enemies:</p>
    <ul>
    <li>${enemies[0].name} - Level ${enemies[0].level}</li>
    <li>${enemies[1].name} - Level ${enemies[1].level}</li>
    </ul>
    </div>
    `;
}
export function loadRecruitments(recruitments){
    const leftUI = document.getElementById("leftUI");
    leftUI.innerHTML = `
    <h1>Recruit</h1>
    <div class="info-panel">
    <p>Available recruits:</p>
    <ul>
    <li>${recruitments[0].name} - Featured: ${recruitments[0].featured}</li>
    <li>${recruitments[1].name} - Featured: ${recruitments[1].featured}</li>
    <li>${recruitments[2].name} - Featured: ${recruitments[2].featured}</li>
    </ul>
    </div>
    `;
}