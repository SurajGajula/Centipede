import { setupBattleButtons } from './battle.js';
import { setupRecruitButtons } from './recruitment.js';
export function loadAccount(account){
    try {
        const storedAccount = JSON.parse(sessionStorage.getItem('accountData'));
        if (storedAccount && storedAccount.marbles !== undefined) {
            account.marbles = storedAccount.marbles;
            if (storedAccount.level) {
                account.level = storedAccount.level;
            }
        }
    } catch (e) {
        console.error("Failed to retrieve session storage account data:", e);
    }
    const leftUI = document.getElementById("leftUI");
    leftUI.innerHTML = `
    <h1>Account</h1>
    <div class="info-panel account-info">
    <p><strong>Level:</strong> ${account.level}</p>
    <p><strong>Marbles:</strong> <span class="marble-display">${account.marbles}</span></p>
    <button id="logout-button">Logout</button>
    </div>
    `;
    const logoutButton = document.getElementById("logout-button");
    if (logoutButton) {
        logoutButton.addEventListener("click", () => {
            localStorage.removeItem('username');
            localStorage.removeItem('hashedPassword');
            sessionStorage.removeItem('accountData');
            window.location.href = 'index.html';
        });
    }
}
function createSectionHTML(sectionType, items) {
    return items.map((item, index) => {
        const imageName = `${item.name}.svg`;
        const imagePath = `../assets/images/${imageName}`;
        return `
            <div class="info-panel ${sectionType}-section">
                <div class="${sectionType}-details-content">
                    <img src="${imagePath}" alt="${item.name} Front Image" class="${sectionType}-image">
                    <h2>${item.name}</h2>
                    <div class="${sectionType}-buttons">
                        <button class="${sectionType === 'ally' ? 'party' : 'battle'}-button" data-${sectionType}-index="${index}">${sectionType === 'ally' ? 'Party' : 'Battle'}</button>
                    </div>
                </div>
                <div class="${sectionType}-expanded-info">
                    <h2>${item.name} Details</h2>
                    <div class="${sectionType}-stats">
                        <div class="stat-row"><span class="stat-label">Level:</span> <span class="stat-value">${item.level}</span></div>
                        <div class="stat-row"><span class="stat-label">Attack:</span> <span class="stat-value">${item.attack}</span></div>
                        <div class="stat-row"><span class="stat-label">Health:</span> <span class="stat-value">${item.health}</span></div>
                        <div class="stat-row"><span class="stat-label">Skill:</span> <span class="stat-value">${item.skillname}</span></div>
                        <div class="stat-row"><span class="stat-label">Skill Status:</span> <span class="stat-value">${item.skillstatus}</span></div>
                        <div class="stat-row"><span class="stat-label">Skill Count:</span> <span class="stat-value">${item.skillcount}</span></div>
                        <div class="stat-row"><span class="stat-label">Skill Hits:</span> <span class="stat-value">${item.skillhits}</span></div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}
export function loadAllies(allies){
    const leftUI = document.getElementById("leftUI");
    leftUI.innerHTML = `
    <h1>Allies</h1>
    <div class="ally-items-container">
        ${createSectionHTML('ally', allies)}
    </div>
    `;
    setupInfoPanels('.ally-section', '.ally-expanded-info');
}
export function loadEnemies(enemies){
    const leftUI = document.getElementById("leftUI");
    leftUI.innerHTML = `
    <h1>Enemies</h1>
    <div class="enemy-items-container">
        ${createSectionHTML('enemy', enemies)}
    </div>
    `;
    setupBattleButtons(enemies);
    setupInfoPanels('.enemy-section', '.enemy-expanded-info');
}
function setupInfoPanels(sectionSelector, panelSelector) {
    document.querySelectorAll(sectionSelector).forEach(section => {
        section.addEventListener('click', function(event) {
            if (event.target === this || this.contains(event.target) && !event.target.closest('button')) {
                const infoPanel = this.querySelector(panelSelector);
                const isCurrentlyVisible = infoPanel.classList.contains('visible');
                toggleInfoPanel(this, infoPanel, !isCurrentlyVisible);
            }
        });
    });
    function toggleInfoPanel(parentSection, infoPanel, shouldShow) {
        if (shouldShow) {
            infoPanel.classList.add('visible');
        } else {
            infoPanel.classList.remove('visible');
            const detailsContent = parentSection.querySelector('.ally-details-content, .enemy-details-content, .recruitment-details-content');
            if (detailsContent) {
                detailsContent.style.display = 'flex';
            }
        }
    }
}
export function loadRecruitments(recruitments){
    const leftUI = document.getElementById("leftUI");
    const recruitmentSections = recruitments.map((recruitment, index) => {
        const imageName = `${recruitment.name}.svg`;
        const imagePath = `../assets/images/${imageName}`;
        return `
            <div class="info-panel recruitment-section">
                <div class="recruitment-details-content">
                    <img src="${imagePath}" alt="${recruitment.name} Front Image" class="recruitment-image">
                    <h2>${recruitment.name}</h2>
                    <div class="recruitment-buttons">
                        <button class="recruit-button" data-recruitment-index="${index}">Recruit</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    leftUI.innerHTML = `
    <h1>Recruitments</h1>
    <div class="recruitment-items-container">
        ${recruitmentSections}
    </div>
    `;
    const accountButton = document.getElementById("accountButton");
    if (accountButton) {
        accountButton.addEventListener("click", () => {
            const username = localStorage.getItem('username');
            const hashedPassword = localStorage.getItem('hashedPassword');            
            fetch("https://l6ct9b9z8g.execute-api.us-west-2.amazonaws.com/loadaccount", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    username, 
                    password: hashedPassword,
                    passwordIsHashed: true 
                })
            })
            .then(response => response.json())
            .then(accountData => {
                import('./account.js').then(accountModule => {
                    const Account = accountModule.default;
                    const account = new Account(accountData.Level, accountData.Marbles);
                    loadAccount(account);
                    try {
                        sessionStorage.setItem('accountData', JSON.stringify({
                            level: account.level,
                            marbles: account.marbles
                        }));
                    } catch (e) {
                        console.error("Failed to store account data:", e);
                    }
                });
            })
            .catch(error => {
                console.error("Error refreshing account data:", error);
                alert("Failed to refresh account data. Please try again.");
            });
        });
    }
    setupRecruitButtons(recruitments);
}