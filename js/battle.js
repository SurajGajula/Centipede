import State from "./state.js";
import { initializeStatusDisplay, updateStatusDisplay } from "./status.js";
import { showLoadingScreen, hideLoadingScreen } from "./loading.js";
import { showStatusNotification } from "./notifications.js";
import { makeApiCall } from "./config.js";
import { showAlert } from "./alert.js";

let actionInProgress = false;
let actionQueue = [];
let nextActionNumber = 1;
let selectedSkill = false;
let cardOverlayActive = false;

let partyMemberHealthStates = {};

function addToQueue(type, data) {
    if (nextActionNumber <= 9) {
        actionQueue.push({ type, data, number: nextActionNumber });
        nextActionNumber++;
        return true;
    }
    return false;
}

function clearQueue() {
    actionQueue = [];
    nextActionNumber = 1;
    const container = document.querySelector('.action-numbers-container');
    if (container) {
        container.innerHTML = '';
    }
    document.querySelectorAll('[data-action-number]').forEach(button => {
        delete button.dataset.actionNumber;
    });
}

export async function showCardOverlay() {
    return new Promise(async (resolve) => {
        const existingOverlay = document.querySelector('.card-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }
        
        const overlay = document.createElement('div');
        overlay.className = 'card-overlay';
        
        const container = document.createElement('div');
        container.className = 'card-container';
        
        let items = [];
        try {
            const username = localStorage.getItem('username');
            const hashedPassword = localStorage.getItem('hashedPassword');
            
            if (username && hashedPassword) {
                const response = await makeApiCall('LOAD_ITEMS', {
                    body: JSON.stringify({
                        rarity: '1'
                    })
                });
                
                if (response.status >= 400) {
                    const { handleApiError } = await import('./error.js');
                    handleApiError('Failed to load items', new Error(`HTTP ${response.status}`));
                    return;
                }
                
                const data = await response.json();
                if (data.success && data.items) {
                    items = data.items;
                }
            }
        } catch (error) {
            console.error('Error loading items:', error);
            const { handleApiError } = await import('./error.js');
            handleApiError('Failed to load items', error);
            return;
        }
        
        for (let i = 0; i < 3; i++) {
            const card = document.createElement('div');
            card.className = 'battle-card';
            
            if (items[i]) {
                const item = items[i];
                card.innerHTML = `
                    <div class="card-content">
                        <h3 class="card-title">${item.name}</h3>
                        <p class="card-description">${item.description}</p>
                        <div class="card-rarity">${item.rarity}</div>
                    </div>
                `;
            } else {
                card.innerHTML = `
                    <div class="card-content">
                        <h3 class="card-title">Mystery Item</h3>
                        <p class="card-description">A mysterious item awaits...</p>
                        <div class="card-rarity">unknown</div>
                    </div>
                `;
            }
            
            card.addEventListener('click', () => {
                card.classList.add('selected');
                
                overlay.classList.add('fade-out');
                
                setTimeout(() => {
                    if (overlay && overlay.parentNode) {
                        overlay.remove();
                    }
                    cardOverlayActive = false;
                    resolve();
                }, 300);
            });
            container.appendChild(card);
        }
        
        overlay.appendChild(container);
        document.body.appendChild(overlay);
        cardOverlayActive = true;
    });
}

async function executeQueue(state) {
    if (actionInProgress || actionQueue.length === 0) return;
    
    actionInProgress = true;
    const executeButton = document.getElementById("execute-button");
    if (executeButton) {
        executeButton.style.opacity = "0.6";
        executeButton.style.cursor = "not-allowed";
    }
    
    for (const action of actionQueue) {
        if (action.type === 'skill') {
            await useSkill(state);
        } else if (action.type === 'switch') {
            await switchPartyMember(state, action.data.newAlly, action.data.allAllies, action.data.partyMembers);
        }
        
        if (state.checkBattleEnd()) break;
    }
    
    clearQueue();
    
    actionInProgress = false;
    if (executeButton) {
        executeButton.style.opacity = "1";
        executeButton.style.cursor = "pointer";
    }
}

function addNumberIndicator(button, number) {
    let container = document.querySelector('.action-numbers-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'action-numbers-container';
        document.querySelector('.battle-container').appendChild(container);
    }
    
    const buttonRect = button.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    
    const horizontalOffset = (number - 1) * 20;
    
    const indicator = document.createElement('div');
    indicator.className = 'action-number';
    indicator.textContent = number;
    indicator.style.left = `${buttonRect.left - containerRect.left + horizontalOffset}px`;
    indicator.style.top = `${buttonRect.top - containerRect.top - 30}px`;
    container.appendChild(indicator);
    
    button.dataset.actionNumber = number;
}

export async function startBattle(ally, enemy) {
    showLoadingScreen("Preparing Battle");
    actionInProgress = false;
    selectedSkill = false;
    clearQueue();
    
    partyMemberHealthStates = {};
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const state = new State(ally, enemy);
    const leftUI = document.getElementById("leftUI");
    const rightUI = document.getElementById("rightUI");
    
    const allyImagePath = `assets/images/${ally.name}.svg`;
    const enemyImagePath = `assets/images/${enemy.name}.svg`;
    
    ally.clearStatuses();
    enemy.clearStatuses();
    
    leftUI.innerHTML = `
        <div class="battle-container">
            <div class="health-bars">
                <div class="ally-health-container">
                    <div class="health-bar-background">
                        <div class="health-bar ally-health-bar" style="width: 100%"></div>
                    </div>
                    <div class="ally-name">${ally.name}</div>
                </div>
                <div class="round-display">Round ${state.round}/${state.totalRounds}</div>
                <div class="enemy-health-container">
                    <div class="health-bar-background">
                        <div class="health-bar enemy-health-bar" style="width: 100%"></div>
                    </div>
                    <div class="enemy-name">${enemy.name}</div>
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
    
    let partyMembers = [];
    let allAllies = [];
    try {
        const username = localStorage.getItem('username');
        const hashedPassword = localStorage.getItem('hashedPassword');
        
        if (username && hashedPassword) {
            const [partyResponse, alliesResponse] = await Promise.all([
                makeApiCall('LOAD_PARTY', {
                    body: JSON.stringify({
                        username,
                        password: hashedPassword,
                        passwordIsHashed: true
                    })
                }),
                makeApiCall('LOAD_ALLIES', {
                    body: JSON.stringify({
                        username,
                        password: hashedPassword,
                        passwordIsHashed: true
                    })
                })
            ]);
            
            const [partyData, alliesData] = await Promise.all([
                partyResponse.json(),
                alliesResponse.json()
            ]);
            
            if (partyResponse.status < 400 && (!partyData.statusCode || partyData.statusCode < 400)) {
                partyMembers = partyData.party || [];
            }
            
            if (alliesResponse.status < 400 && Array.isArray(alliesData)) {
                const { default: Ally } = await import('./ally.js');
                allAllies = alliesData.map(allyData => {
                    return new Ally(
                    allyData.Name,
                    allyData.Attack,
                    allyData.Health,
                    allyData.SkillCount,
                    allyData.SkillHits,
                    allyData.SkillStatus
                )});
                
                partyMembers.forEach(memberName => {
                    const memberAlly = allAllies.find(a => a.name === memberName);
                    if (memberAlly && !partyMemberHealthStates[memberName]) {
                        partyMemberHealthStates[memberName] = {
                            currentHealth: memberAlly.health,
                            maxHealth: memberAlly.health,
                            statuses: {}
                        };
                    }
                });
                
                if (partyMemberHealthStates[ally.name]) {
                    ally.health = partyMemberHealthStates[ally.name].currentHealth;
                    ally.maxHealth = partyMemberHealthStates[ally.name].maxHealth;
                    ally.statuses = { ...partyMemberHealthStates[ally.name].statuses };
                } else {
                    partyMemberHealthStates[ally.name] = {
                        currentHealth: ally.health,
                        maxHealth: ally.health,
                        statuses: { ...ally.statuses }
                    };
                }
            }
        }
    } catch (error) {
        console.error("Error loading party/allies data:", error);
        partyMembers = [ally.name];
        allAllies = [ally];
        partyMemberHealthStates[ally.name] = {
            currentHealth: ally.health,
            maxHealth: ally.health,
            statuses: { ...ally.statuses }
        };
    }
    
    let rightUIContent = `
        <button id="skill-button">SKILL</button>
        <button id="execute-button" class="execute-button">EXECUTE</button>
    `;
    
    if (partyMembers.length > 1) {
        rightUIContent += `<div class="party-members-section">`;
        
        partyMembers.forEach((memberName, index) => {
            if (memberName !== ally.name) {
                rightUIContent += `<button class="party-member-button" data-member-name="${memberName}" data-member-index="${index}">${memberName.toUpperCase()}</button>`;
            }
        });
        rightUIContent += `</div>`;
    }
    
    rightUI.innerHTML = rightUIContent;
    
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
    
    const skillButton = document.getElementById("skill-button");
    const executeButton = document.getElementById("execute-button");
    
    skillButton.addEventListener("click", () => {
        if (!actionInProgress && nextActionNumber <= 9) {
            if (addToQueue('skill', {})) {
                addNumberIndicator(skillButton, nextActionNumber - 1);
            }
        }
    });
    
    executeButton.addEventListener("click", () => {
        if (!actionInProgress && actionQueue.length > 0) {
            executeQueue(state);
        }
    });
    
    const partyMemberButtons = document.querySelectorAll('.party-member-button');
    partyMemberButtons.forEach(button => {
        button.addEventListener("click", () => {
            if (!actionInProgress && nextActionNumber <= 9) {
                const memberName = button.getAttribute('data-member-name');
                
                const newAlly = allAllies.find(a => a.name === memberName);
                if (!newAlly) {
                    console.error(`Could not find ally: ${memberName}`);
                    return;
                }
                
                if (addToQueue('switch', { newAlly, allAllies, partyMembers })) {
                    addNumberIndicator(button, nextActionNumber - 1);
                }
            }
        });
    });
    
    hideLoadingScreen();
    return state;
}

function switchPartyMember(state, newAlly, allAllies, partyMembers) {
    return new Promise((resolve) => {
        try {
            actionInProgress = true;
            
            const oldAlly = state.ally;
            
            partyMemberHealthStates[oldAlly.name] = {
                currentHealth: oldAlly.health,
                maxHealth: oldAlly.maxHealth,
                statuses: { ...oldAlly.statuses }
            };
            
            if (partyMemberHealthStates[newAlly.name]) {
                newAlly.health = partyMemberHealthStates[newAlly.name].currentHealth;
                newAlly.maxHealth = partyMemberHealthStates[newAlly.name].maxHealth;
                newAlly.statuses = { ...partyMemberHealthStates[newAlly.name].statuses };
            } else {
                partyMemberHealthStates[newAlly.name] = {
                    currentHealth: newAlly.health,
                    maxHealth: newAlly.health,
                    statuses: { ...newAlly.statuses }
                };
            }
            
            state.ally = newAlly;
            
            const allyImage = document.querySelector('.battle-ally img');
            const skillButton = document.getElementById('skill-button');
            
            if (allyImage) {
                allyImage.src = `assets/images/${newAlly.name}.svg`;
                allyImage.alt = newAlly.name;
            }
            
            if (skillButton) {
                skillButton.textContent = "SKILL";
            }
            
            updateHealthBars(state);
            
            updateStatusDisplay(state.ally, state.enemy);
            
            const rightUI = document.getElementById("rightUI");
            let rightUIContent = `
                <button id="skill-button">SKILL</button>
                <button id="execute-button" class="execute-button">EXECUTE</button>
            `;
            
            if (partyMembers.length > 1) {
                rightUIContent += `<div class="party-members-section">`;
                
                partyMembers.forEach((memberName, index) => {
                    if (memberName !== newAlly.name) {
                        rightUIContent += `<button class="party-member-button" data-member-name="${memberName}" data-member-index="${index}">${memberName.toUpperCase()}</button>`;
                    }
                });
                rightUIContent += `</div>`;
            }
            
            rightUI.innerHTML = rightUIContent;
            
            const newSkillButton = document.getElementById("skill-button");
            const executeButton = document.getElementById("execute-button");
            
            newSkillButton.addEventListener("click", () => {
                if (!actionInProgress && nextActionNumber <= 9) {
                    if (addToQueue('skill', {})) {
                        addNumberIndicator(newSkillButton, nextActionNumber - 1);
                    }
                }
            });
            
            executeButton.addEventListener("click", () => {
                if (!actionInProgress && actionQueue.length > 0) {
                    executeQueue(state);
                }
            });
            
            const partyMemberButtons = document.querySelectorAll('.party-member-button');
            partyMemberButtons.forEach(button => {
                button.addEventListener("click", () => {
                    if (!actionInProgress && nextActionNumber <= 9) {
                        const memberName = button.getAttribute('data-member-name');
                        const memberToSwitchTo = allAllies.find(a => a.name === memberName);
                        if (memberToSwitchTo) {
                            if (addToQueue('switch', { newAlly: memberToSwitchTo, allAllies, partyMembers })) {
                                addNumberIndicator(button, nextActionNumber - 1);
                            }
                        }
                    }
                });
            });
            
            resolve();
        } catch (error) {
            console.error("Error during party member switch:", error);
            resolve();
        } finally {
            actionInProgress = false;
        }
    });
}

async function useSkill(state) {
    try {
        const skillButton = document.getElementById("skill-button");
        
        if (skillButton) {
            skillButton.style.opacity = "0.6";
            skillButton.style.cursor = "not-allowed";
        }
        
        partyMemberHealthStates[state.ally.name] = {
            currentHealth: state.ally.health,
            maxHealth: state.ally.maxHealth,
            statuses: { ...state.ally.statuses }
        };
        
        await state.allyAttack();
        updateHealthBars(state);
        if (state.checkBattleEnd()) {
            return;
        }
        await state.enemyAttack();
        
        partyMemberHealthStates[state.ally.name] = {
            currentHealth: state.ally.health,
            maxHealth: state.ally.maxHealth,
            statuses: { ...state.ally.statuses }
        };
        
        updateHealthBars(state);
        if (state.checkBattleEnd()) {
            return;
        }        
        state.nextTurn();
    } catch (error) {
        console.error("Error during battle sequence:", error);
    } finally {
        const skillButton = document.getElementById("skill-button");
        if (skillButton) {
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
                const partyResponse = await makeApiCall('LOAD_PARTY', {
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
                showAlert(error.message || "Failed to start battle");
            } finally {
                hideLoadingScreen();
            }
        });
    });
}