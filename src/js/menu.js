import { setupBattleButtons } from './battle.js';
import { setupRecruitButtons } from './recruitment.js';
import { showLoadingScreen, hideLoadingScreen } from './loading.js';
import { handleApiError } from './error.js';
import Account from './account.js';
import Ally from './ally.js';
import { showRecruitment } from './recruitment.js';

function getStoredAccountInfo() {
    try {
        const storedAccount = JSON.parse(sessionStorage.getItem('accountData'));
        if (storedAccount && storedAccount.marbles !== undefined) {
            const account = new Account(storedAccount.marbles);
            if (storedAccount.marbles) {
                account.marbles = storedAccount.marbles;
            }
            return account;
        }
    } catch (error) {
        console.error("Error parsing stored account data:", error);
    }
    return null;
}

function updateAccountInfo(marbles) {
    const accountInfo = document.getElementById("account-info");
    if (accountInfo) {
        accountInfo.innerHTML = `
            <h2>Account Information</h2>
            <p><strong>Marbles:</strong> ${marbles}</p>
        `;
    }
}

export function loadAccount(account){
    try {
        const storedAccount = JSON.parse(sessionStorage.getItem('accountData'));
        if (storedAccount && storedAccount.marbles !== undefined) {
            account.marbles = storedAccount.marbles;
        }
    } catch (e) {
        console.error("Failed to retrieve session storage account data:", e);
    }
    const leftUI = document.getElementById("leftUI");
    leftUI.innerHTML = `
    <h1>Account</h1>
    <div class="info-panel account-info">
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

function createSectionHTML(sectionType, items, party = []) {
    return items.map((item, index) => {
        const imageName = `${item.name}.svg`;
        const imagePath = `../assets/images/${imageName}`;
        const partyIndex = party.indexOf(item.name);
        const isInParty = partyIndex !== -1;
        const partyPosition = isInParty ? partyIndex + 1 : null;
        const isLastPartyMember = isInParty && party.length === 1;
        return `
            <div class="info-panel ${sectionType}-section ${isInParty ? 'in-party' : ''}">
                <div class="${sectionType}-details-content">
                    <img src="${imagePath}" alt="${item.name} Front Image" class="${sectionType}-image">
                    <h2>${item.name}</h2>
                    ${isInParty ? `<div class="party-position">Position ${partyPosition}</div>` : ''}
                    <div class="${sectionType}-buttons">
                        <button class="${sectionType === 'ally' ? 'party' : 'battle'}-button" 
                            data-${sectionType}-index="${index}" 
                            data-character-name="${item.name}"
                            ${isLastPartyMember ? 'disabled' : ''}>
                            ${sectionType === 'ally' ? (isInParty ? 'Remove from Party' : 'Add to Party') : 'Battle'}
                        </button>
                    </div>
                </div>
                <div class="${sectionType}-expanded-info">
                    <h2>${item.name} Details</h2>
                    <div class="${sectionType}-stats">
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

export function displayAllies(allies, party = []) {
    const leftUI = document.getElementById("leftUI");
    leftUI.innerHTML = `
        <h2>Allies</h2>
        <div class="ally-items-container">
            ${createSectionHTML('ally', allies, party)}
        </div>
    `;
    
    setupPartyButtons(allies);
    
    const allySections = document.querySelectorAll('.ally-section');
    setupInfoPanels(allySections);
}

export function displayEnemies(enemies) {
    const leftUI = document.getElementById("leftUI");
    leftUI.innerHTML = `
        <h2>Enemies</h2>
        <div class="enemy-items-container">
            ${createSectionHTML('enemy', enemies)}
        </div>
    `;
    
    setupBattleButtons(enemies);
    
    const enemySections = document.querySelectorAll('.enemy-section');
    setupInfoPanels(enemySections);
}

function setupInfoPanels(sections) {
    sections.forEach(section => {
        section.addEventListener('click', function(event) {
            if (event.target === this || this.contains(event.target) && !event.target.closest('button')) {
                const infoPanel = this.querySelector('.expanded-info');
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

export function displayRecruitments(recruitments) {
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
        <h2>Recruitments</h2>
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
                    const account = new Account(accountData.Marbles);
                    loadAccount(account);
                    try {
                        sessionStorage.setItem('accountData', JSON.stringify({
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

async function updateParty(characterName) {
    try {
        const username = localStorage.getItem('username');
        const hashedPassword = localStorage.getItem('hashedPassword');
        if (!username || !hashedPassword) {
            throw new Error("User credentials not found. Please log in again.");
        }
        showLoadingScreen("Updating party...");
        const response = await fetch("https://l6ct9b9z8g.execute-api.us-west-2.amazonaws.com/addparty", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username,
                password: hashedPassword,
                passwordIsHashed: true,
                characterName
            })
        });
        const data = await response.json();
        if (response.status >= 400 || data.statusCode >= 400) {
            throw new Error(data.message || "Failed to update party");
        }
        hideLoadingScreen();
        return data;
    } catch (error) {
        hideLoadingScreen();
        handleApiError("Error updating party", error);
        throw error;
    }
}

function setupPartyButtons(allies) {
    const partyButtons = document.querySelectorAll('.party-button');
    partyButtons.forEach(button => {
        button.addEventListener('click', async function(event) {
            event.stopPropagation();
            const characterName = this.getAttribute('data-character-name');
            const originalText = this.textContent;
            this.textContent = "Processing...";
            this.disabled = true;
            try {
                const data = await updateParty(characterName);
                const isInParty = data.party.includes(characterName);
                const isLastMember = isInParty && data.party.length === 1;
                this.textContent = isInParty ? "Remove from Party" : "Add to Party";
                this.disabled = isLastMember;
                const allySection = this.closest('.ally-section');
                if (isInParty) {
                    allySection.classList.add('in-party');
                    const position = data.party.indexOf(characterName) + 1;
                    let positionDiv = allySection.querySelector('.party-position');
                    if (!positionDiv) {
                        positionDiv = document.createElement('div');
                        positionDiv.className = 'party-position';
                        const detailsContent = allySection.querySelector('.ally-details-content');
                        detailsContent.insertBefore(positionDiv, this.parentElement);
                    }
                    positionDiv.textContent = `Position ${position}`;
                    if (data.party.length > 1) {
                        document.querySelectorAll('.ally-section.in-party').forEach(section => {
                            const button = section.querySelector('.party-button');
                            button.disabled = false;
                        });
                    }
                } else {
                    allySection.classList.remove('in-party');
                    const positionDiv = allySection.querySelector('.party-position');
                    if (positionDiv) {
                        positionDiv.remove();
                    }
                    if (data.removedIndex !== null) {
                        document.querySelectorAll('.ally-section.in-party').forEach(section => {
                            const button = section.querySelector('.party-button');
                            const charName = button.getAttribute('data-character-name');
                            const newPosition = data.party.indexOf(charName) + 1;
                            const positionDiv = section.querySelector('.party-position');
                            if (positionDiv) {
                                positionDiv.textContent = `Position ${newPosition}`;
                            }
                            button.disabled = data.party.length === 1;
                        });
                    }
                }
            } catch (error) {
                console.error("Party update error:", error);
                this.textContent = originalText;
                this.disabled = false;
                alert(`Failed to update party: ${error.message}`);
            }
        });
    });
}

async function loadAccountFromAPI() {
    try {
        const username = localStorage.getItem('username');
        const hashedPassword = localStorage.getItem('hashedPassword');
        
        if (!username || !hashedPassword) {
            throw new Error("User credentials not found");
        }

        const response = await fetch("https://l6ct9b9z8g.execute-api.us-west-2.amazonaws.com/loadaccount", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username,
                password: hashedPassword,
                passwordIsHashed: true
            })
        });

        if (!response.ok) {
            throw new Error(`Failed to load account: ${response.status}`);
        }

        const accountData = await response.json();
        console.log("Loaded fresh account data from API:", accountData);

        const account = new Account(accountData.Marbles);

        sessionStorage.setItem('accountData', JSON.stringify({
            marbles: account.marbles
        }));

        return account;
    } catch (error) {
        console.error("Error loading account from API:", error);
        throw error;
    }
}

export async function showMainMenu() {
    const container = document.getElementById('game-container');
    container.innerHTML = '';

    const menuDiv = document.createElement('div');
    menuDiv.className = 'menu-container';

    const title = document.createElement('h1');
    title.textContent = 'Centipede';
    menuDiv.appendChild(title);

    const alliesButton = document.createElement('button');
    alliesButton.textContent = 'Show Allies';
    alliesButton.onclick = () => displayAllies();
    menuDiv.appendChild(alliesButton);

    const enemiesButton = document.createElement('button');
    enemiesButton.textContent = 'Show Enemies';
    enemiesButton.onclick = () => displayEnemies();
    menuDiv.appendChild(enemiesButton);

    const recruitButton = document.createElement('button');
    recruitButton.textContent = 'Recruit';
    recruitButton.onclick = async () => {
        try {
            const recruitments = await loadRecruitments();
            if (recruitments && recruitments.length > 0) {
                showRecruitment(recruitments[0].Name);
            }
        } catch (error) {
            console.error('Error loading recruitments:', error);
        }
    };
    menuDiv.appendChild(recruitButton);

    container.appendChild(menuDiv);

    // Add menu styles
    const style = document.createElement('style');
    style.textContent = `
        .menu-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            padding: 20px;
        }

        .menu-container h1 {
            color: #333;
            margin-bottom: 30px;
            font-size: 2.5em;
        }

        .menu-container button {
            background: #4CAF50;
            color: white;
            border: none;
            padding: 15px 30px;
            margin: 10px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 1.1em;
            width: 200px;
            transition: background 0.3s;
        }

        .menu-container button:hover {
            background: #45a049;
        }
    `;
    document.head.appendChild(style);
}