import State from "./state.js";
import { initializeStatusDisplay, updateStatusDisplay } from "./status.js";
import { showLoadingScreen, hideLoadingScreen } from "./loading.js";
let actionInProgress = false;

// Global variable to track health states of all party members
let partyMemberHealthStates = {};

export async function startBattle(ally, enemy) {
    // Initialize battle with party member buttons when multiple members are present
    showLoadingScreen("Preparing Battle");
    actionInProgress = false;
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const state = new State(ally, enemy);
    const leftUI = document.getElementById("leftUI");
    const rightUI = document.getElementById("rightUI");
    
    const allyImagePath = `../assets/images/${ally.name}.svg`;
    const enemyImagePath = `../assets/images/${enemy.name}.svg`;
    
    ally.clearStatuses();
    enemy.clearStatuses();
    
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
    
    // Load party data and ally data to get all party members
    let partyMembers = [];
    let allAllies = [];
    try {
        const username = localStorage.getItem('username');
        const hashedPassword = localStorage.getItem('hashedPassword');
        
        if (username && hashedPassword) {
            // Load party and allies data in parallel
            const [partyResponse, alliesResponse] = await Promise.all([
                fetch("https://l6ct9b9z8g.execute-api.us-west-2.amazonaws.com/loadparty", {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username,
                        password: hashedPassword,
                        passwordIsHashed: true
                    })
                }),
                fetch("https://l6ct9b9z8g.execute-api.us-west-2.amazonaws.com/loadallies", {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
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
                console.log(`Loaded party members: ${partyMembers.join(', ')}`);
            }
            
            if (alliesResponse.status < 400 && Array.isArray(alliesData)) {
                // Convert allies data to Ally objects
                const { default: Ally } = await import('./ally.js');
                allAllies = alliesData.map(allyData => new Ally(
                    allyData.Name, 
                    allyData.Attack, 
                    allyData.Health, 
                    allyData.SkillName, 
                    allyData.SkillStatus, 
                    allyData.SkillCount, 
                    allyData.SkillHits
                ));
                console.log(`Loaded ${allAllies.length} allies`);
                
                // Initialize health states for all party members if not already done
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
                
                // Apply stored health state to current ally
                if (partyMemberHealthStates[ally.name]) {
                    ally.health = partyMemberHealthStates[ally.name].currentHealth;
                    ally.maxHealth = partyMemberHealthStates[ally.name].maxHealth;
                    ally.statuses = { ...partyMemberHealthStates[ally.name].statuses };
                } else {
                    // Initialize health state for current ally
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
        partyMembers = [ally.name]; // Fallback to current ally only
        allAllies = [ally];
        // Initialize health state for fallback
        partyMemberHealthStates[ally.name] = {
            currentHealth: ally.health,
            maxHealth: ally.health,
            statuses: { ...ally.statuses }
        };
    }
    
    // Create battle menu with skill button and party member buttons (excluding current ally)
    let rightUIContent = `<button id="skill-button">${ally.skillname.toUpperCase()}</button>`;
    
    if (partyMembers.length > 1) {
        console.log(`Creating buttons for ${partyMembers.length} party members`);
        rightUIContent += `<div class="party-members-section">`;
        
        // Only show buttons for party members that are NOT currently active
        partyMembers.forEach((memberName, index) => {
            if (memberName !== ally.name) {
                rightUIContent += `<button class="party-member-button" data-member-name="${memberName}" data-member-index="${index}">${memberName.toUpperCase()}</button>`;
            }
        });
        rightUIContent += `</div>`;
    } else {
        console.log(`Only ${partyMembers.length} party member(s), not creating additional buttons`);
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
    
    document.getElementById("skill-button").addEventListener("click", () => {
        if (!actionInProgress) {
            useSkill(state);
        }
    });
    
    // Add event listeners for party member buttons - implement switching functionality
    const partyMemberButtons = document.querySelectorAll('.party-member-button');
    partyMemberButtons.forEach(button => {
        button.addEventListener("click", () => {
            if (!actionInProgress) {
                const memberName = button.getAttribute('data-member-name');
                console.log(`Switching to party member: ${memberName}`);
                
                // Find the ally to switch to
                const newAlly = allAllies.find(a => a.name === memberName);
                if (!newAlly) {
                    console.error(`Could not find ally: ${memberName}`);
                    return;
                }
                
                // Perform the switch
                switchPartyMember(state, newAlly, allAllies, partyMembers);
            }
        });
    });
    
    hideLoadingScreen();
    return state;
}

// Function to handle party member switching with health persistence
function switchPartyMember(state, newAlly, allAllies, partyMembers) {
    try {
        actionInProgress = true;
        
        // Store the current ally's state before switching
        const oldAlly = state.ally;
        console.log(`Switching from ${oldAlly.name} to ${newAlly.name}`);
        
        // Save current ally's health and status state
        partyMemberHealthStates[oldAlly.name] = {
            currentHealth: oldAlly.health,
            maxHealth: oldAlly.maxHealth,
            statuses: { ...oldAlly.statuses }
        };
        
        // Restore the new ally's health and status state
        if (partyMemberHealthStates[newAlly.name]) {
            newAlly.health = partyMemberHealthStates[newAlly.name].currentHealth;
            newAlly.maxHealth = partyMemberHealthStates[newAlly.name].maxHealth;
            newAlly.statuses = { ...partyMemberHealthStates[newAlly.name].statuses };
        } else {
            // Initialize if this is the first time using this ally
            partyMemberHealthStates[newAlly.name] = {
                currentHealth: newAlly.health,
                maxHealth: newAlly.health,
                statuses: { ...newAlly.statuses }
            };
        }
        
        // Update the state with the new ally
        state.ally = newAlly;
        
        // Update the UI elements
        const allyImage = document.querySelector('.battle-ally img');
        const skillButton = document.getElementById('skill-button');
        
        if (allyImage) {
            allyImage.src = `../assets/images/${newAlly.name}.svg`;
            allyImage.alt = newAlly.name;
        }
        
        if (skillButton) {
            skillButton.textContent = newAlly.skillname.toUpperCase();
        }
        
        // Update health bar to reflect new ally's current health
        updateHealthBars(state);
        
        // Update status displays
        updateStatusDisplay(state.ally, state.enemy);
        
        // Update the party member buttons to show the old ally and hide the new one
        const rightUI = document.getElementById("rightUI");
        let rightUIContent = `<button id="skill-button">${newAlly.skillname.toUpperCase()}</button>`;
        
        if (partyMembers.length > 1) {
            rightUIContent += `<div class="party-members-section">`;
            
            // Show all party members except the currently active one
            partyMembers.forEach((memberName, index) => {
                if (memberName !== newAlly.name) {
                    rightUIContent += `<button class="party-member-button" data-member-name="${memberName}" data-member-index="${index}">${memberName.toUpperCase()}</button>`;
                }
            });
            rightUIContent += `</div>`;
        }
        
        rightUI.innerHTML = rightUIContent;
        
        // Re-add event listeners
        document.getElementById("skill-button").addEventListener("click", () => {
            if (!actionInProgress) {
                useSkill(state);
            }
        });
        
        const partyMemberButtons = document.querySelectorAll('.party-member-button');
        partyMemberButtons.forEach(button => {
            button.addEventListener("click", () => {
                if (!actionInProgress) {
                    const memberName = button.getAttribute('data-member-name');
                    const memberToSwitchTo = allAllies.find(a => a.name === memberName);
                    if (memberToSwitchTo) {
                        switchPartyMember(state, memberToSwitchTo, allAllies, partyMembers);
                    }
                }
            });
        });
        
        console.log(`Successfully switched to ${newAlly.name} with ${newAlly.health}/${newAlly.maxHealth} health`);
        
    } catch (error) {
        console.error("Error during party member switch:", error);
    } finally {
        actionInProgress = false;
    }
}

async function useSkill(state) {
    try {
        actionInProgress = true;
        const skillButton = document.getElementById("skill-button");
        if (skillButton) {
            skillButton.disabled = true;
            skillButton.style.opacity = "0.6";
            skillButton.style.cursor = "not-allowed";
        }
        
        // Save current ally's state before attack (in case they take damage from enemy retaliation)
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
        
        // Update stored health state after potential damage from enemy
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
        actionInProgress = false;
        const skillButton = document.getElementById("skill-button");
        if (skillButton) {
            skillButton.disabled = false;
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
                const partyResponse = await fetch("https://l6ct9b9z8g.execute-api.us-west-2.amazonaws.com/loadparty", {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
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
                alert(error.message || "Failed to start battle");
            } finally {
                hideLoadingScreen();
            }
        });
    });
}