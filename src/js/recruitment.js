import { showLoadingScreen, hideLoadingScreen } from "./loading.js";
import { handleApiError } from "./error.js";
import { getUsername, getPassword } from './account.js';
import { showMainMenu } from './menu.js';
import { showError, showSuccess } from './notifications.js';

const MARBLE_COST = 1000;

class Recruitment {
    constructor(name) {
        this.name = name;
    }
}

export async function pullRecruitment(characterName) {
    try {
        const username = localStorage.getItem('username');
        const hashedPassword = localStorage.getItem('hashedPassword');
        if (!username || !hashedPassword) throw new Error("User credentials not found. Please log in again.");        
        showLoadingScreen("Recruiting ally...");
        await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 500));        
        const response = await fetch("https://l6ct9b9z8g.execute-api.us-west-2.amazonaws.com/pullrecruitment", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password: hashedPassword, passwordIsHashed: true, characterName })
        });        
        hideLoadingScreen();
        const data = await response.json();
        if (response.status >= 400 || data.statusCode >= 400) throw new Error(data.message || "Recruitment failed");
        return data;
    } catch (error) {
        hideLoadingScreen();
        handleApiError("Error during recruitment", error);
        throw error;
    }
}

export function showRecruitmentResults(results) {
    return new Promise((resolve) => {
        const leftUI = document.getElementById("leftUI");
        leftUI.innerHTML = '';
        const resultsContainer = document.createElement('div');
        resultsContainer.className = 'recruitment-results-container';
        leftUI.appendChild(resultsContainer);        
        if (results.currentMarbles !== undefined) {
            updateAccountInfo(results.currentMarbles);
        }                
        const resultDisplay = document.createElement('div');
        resultDisplay.className = 'recruitment-result-display';
        resultsContainer.appendChild(resultDisplay);
        let currentIndex = 0;
        const resultsArray = results.results || [];
        const hasCharacterResult = resultsArray.some(result => result.type === "character" && result.success);
        function displayResult() {
            resultDisplay.innerHTML = '';            
            if (currentIndex < resultsArray.length) {
                const result = resultsArray[currentIndex];                
                if (result.type === "marbles") {
                    const resultLabel = document.createElement('div');
                    resultLabel.className = 'result-label marbles-label';
                    resultLabel.textContent = `+${result.amount} Marbles`;
                    resultDisplay.appendChild(resultLabel);
                } else if (result.type === "character") {
                    const characterImage = document.createElement('img');
                    characterImage.src = `../assets/images/${result.name}.svg`;
                    characterImage.alt = result.name;
                    resultDisplay.appendChild(characterImage);                    
                    const resultLabel = document.createElement('div');
                    resultLabel.className = 'result-label';
                    if (result.success === false) {
                        resultLabel.classList.add('failed');
                    }
                    resultLabel.textContent = result.name + (result.success === false ? ' (Failed)' : '');
                    resultDisplay.appendChild(resultLabel);
                }
                setTimeout(() => {
                    resultDisplay.classList.add('visible');
                }, 50);
                resultDisplay.onclick = () => {
                    resultDisplay.classList.remove('visible');
                    resultDisplay.classList.add('fade-out');
                    setTimeout(() => {
                        currentIndex++;
                        currentIndex < resultsArray.length ? displayResult() : showSummary();
                    }, 300);
                };
            }
        }   
        const getCredentials = () => ({
            username: localStorage.getItem('username'),
            password: localStorage.getItem('hashedPassword'),
            passwordIsHashed: true
        });
        const createApiRequest = (endpoint, credentials) => {
            return fetch(`https://l6ct9b9z8g.execute-api.us-west-2.amazonaws.com/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials),
                cache: endpoint === 'loadaccount' ? 'no-cache' : undefined
            }).then(response => {
                if (!response.ok) {
                    throw new Error(`${endpoint} API failed with status ${response.status}`);
                }
                return response.json();
            });
        };
        function finishRecruitment() {
            resultsContainer.innerHTML = '<div>Updating game data...</div>';
            localStorage.removeItem('currentMarbles');
            showLoadingScreen("Loading latest data...");                                
            sessionStorage.removeItem('accountData');
            const credentials = getCredentials();
            Promise.all([
                createApiRequest('loadaccount', credentials),
                createApiRequest('loadallies', credentials),
                createApiRequest('loadrecruitments', credentials)
            ])
            .then(([accountData, alliesData, recruitmentsData]) => {
                hideLoadingScreen();
                const alliesList = Array.isArray(alliesData) ? alliesData : [];
                const recruitmentsList = Array.isArray(recruitmentsData) ? recruitmentsData : [];
                import('./account.js').then(({default: Account}) => {
                    const account = new Account(accountData.Marbles);
                    
                    try {
                        sessionStorage.setItem('accountData', JSON.stringify({
                            marbles: account.marbles
                        }));
                    } catch (e) {
                        console.error("Failed to store account data in session storage:", e);
                    }
                    import('./ally.js').then(({default: Ally}) => {
                        const allies = alliesList.map(ally => 
                            new Ally(ally.Name, ally.Attack, ally.Health,
                                    ally.SkillName, ally.SkillStatus, ally.SkillCount, ally.SkillHits));
                        const recruitments = recruitmentsList.map(r => new Recruitment(r.Name));
                        import('./menu.js').then(menuModule => {
                            if (hasCharacterResult) {
                                menuModule.showAllies(allies);
                            } else {
                                menuModule.loadAccount(account);
                                menuModule.displayRecruitments(recruitments);
                            }
                            resolve();
                        });
                    });
                });
            })
            .catch(error => {
                hideLoadingScreen();
                console.error("Error in recruitment data refresh:", error);
                handleApiError("Error refreshing game data", error);
            });
        }
        function showSummary() {
            resultsContainer.innerHTML = '';
            const resultsGrid = document.createElement('div');
            resultsGrid.className = 'recruitment-results-grid';
            resultsContainer.appendChild(resultsGrid);
            resultsArray.forEach(result => {
                const resultCard = document.createElement('div');
                resultCard.className = 'result-card';
                if (result.type === "marbles") {
                    const cardLabel = document.createElement('div');
                    cardLabel.className = 'card-label marbles-label';
                    cardLabel.textContent = `+${result.amount} Marbles`;
                    resultCard.appendChild(cardLabel);
                } else {
                    const cardImage = document.createElement('img');
                    cardImage.src = `../assets/images/${result.name}.svg`;
                    cardImage.alt = result.name;
                    resultCard.appendChild(cardImage);                
                    const cardLabel = document.createElement('div');
                    cardLabel.className = 'card-label';
                    if (result.success === false) {
                        cardLabel.classList.add('failed');
                    }
                    cardLabel.textContent = result.name + (result.success === false ? ' (Failed)' : '');
                    resultCard.appendChild(cardLabel);
                }
                resultCard.addEventListener('click', finishRecruitment);
                resultsGrid.appendChild(resultCard);
            });
        }        
        displayResult();
    });
}

function updateAccountInfo(marbleCount) {
    localStorage.setItem('currentMarbles', marbleCount);
    const rightUI = document.getElementById("rightUI");
    if (!rightUI) return;
    const accountInfo = rightUI.querySelector('.account-info');
    if (accountInfo) {
        const marbleDisplay = accountInfo.querySelector('.marble-display');
        if (marbleDisplay) marbleDisplay.textContent = marbleCount;
    }
}

export function setupRecruitButtons(recruitments) {
    const recruitButtons = document.querySelectorAll('.recruit-button');
    recruitButtons.forEach(button => {
        button.addEventListener('click', async function() {
            const recruitmentIndex = parseInt(this.getAttribute('data-recruitment-index'));
            const characterName = recruitments[recruitmentIndex].name;
            const originalText = this.textContent;
            this.textContent = "Processing...";
            this.disabled = true;
            try {
                const data = await pullRecruitment(characterName);
                this.textContent = originalText;
                this.disabled = false;
                if (data && data.currentMarbles !== undefined) {
                    localStorage.setItem('currentMarbles', data.currentMarbles);
                    try {
                        const accountData = {
                            marbles: data.currentMarbles
                        };
                        sessionStorage.setItem('accountData', JSON.stringify(accountData));
                    } catch (e) {
                        console.error("Failed to update account data in session storage:", e);
                    }
                }
                await showRecruitmentResults(data, characterName);
            } catch (error) {
                console.error("Recruitment error:", error);
                this.textContent = originalText;
                this.disabled = false;
                alert(`Recruitment failed: ${error.message}`);
            }
        });
    });
}

export default Recruitment;

export async function showRecruitment(allyName) {
    const container = document.getElementById('game-container');
    container.innerHTML = '';

    const recruitmentDiv = document.createElement('div');
    recruitmentDiv.className = 'recruitment-container';
    
    const card = document.createElement('div');
    card.className = 'recruitment-card';
    
    const title = document.createElement('h2');
    title.textContent = 'Recruit Ally';
    card.appendChild(title);
    
    const allyNameDisplay = document.createElement('h3');
    allyNameDisplay.textContent = allyName;
    card.appendChild(allyNameDisplay);
    
    const costInfo = document.createElement('p');
    costInfo.textContent = `Cost: ${MARBLE_COST} marbles`;
    card.appendChild(costInfo);
    
    const recruitButton = document.createElement('button');
    recruitButton.textContent = 'Recruit';
    recruitButton.onclick = async () => {
        try {
            const response = await fetch('/api/pullrecruitment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: getUsername(),
                    password: getPassword(),
                    passwordIsHashed: true,
                    characterName: allyName
                })
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                showSuccess(`Successfully recruited ${allyName}!`);
                showMainMenu();
            } else {
                showError(data.message || 'Failed to recruit ally');
            }
        } catch (error) {
            console.error('Error during recruitment:', error);
            showError('Failed to recruit ally');
        }
    };
    card.appendChild(recruitButton);
    
    const backButton = document.createElement('button');
    backButton.textContent = 'Back';
    backButton.onclick = () => showMainMenu();
    card.appendChild(backButton);
    
    recruitmentDiv.appendChild(card);
    container.appendChild(recruitmentDiv);
}

// Add some basic CSS styles
const style = document.createElement('style');
style.textContent = `
    .recruitment-container {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        padding: 20px;
    }
    
    .recruitment-card {
        background: #fff;
        border-radius: 8px;
        padding: 20px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        text-align: center;
        max-width: 400px;
        width: 100%;
    }
    
    .recruitment-card h2 {
        color: #333;
        margin-bottom: 20px;
    }
    
    .recruitment-card h3 {
        color: #666;
        margin-bottom: 15px;
    }
    
    .recruitment-card p {
        color: #888;
        margin-bottom: 20px;
    }
    
    .recruitment-card button {
        background: #4CAF50;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 4px;
        cursor: pointer;
        margin: 5px;
        transition: background 0.3s;
    }
    
    .recruitment-card button:hover {
        background: #45a049;
    }
    
    .recruitment-card button:last-child {
        background: #666;
    }
    
    .recruitment-card button:last-child:hover {
        background: #555;
    }
`;
document.head.appendChild(style);