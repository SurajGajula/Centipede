import Account from "./account.js";
import Ally from "./ally.js";
import Enemy from "./enemy.js";
import Recruitment from "./recruitment.js";
import { handleApiError } from './error.js';
import { showLoadingScreen, hideLoadingScreen } from "./loading.js";
export async function initialize(username, hashedPassword) {
    showLoadingScreen("Initializing Game");
    console.log("Initializing with fresh data from API");    
    try {
        sessionStorage.removeItem('accountData');        
        const accountPromise = fetch("https://l6ct9b9z8g.execute-api.us-west-2.amazonaws.com/loadaccount", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                username, 
                password: hashedPassword,
                passwordIsHashed: true 
            }),
            cache: 'no-cache'
        }).then(response => {
            if (!response.ok) {
                throw new Error(`Load Account API failed with status ${response.status}`);
            }
            return response.json();
        });
        const alliesPromise = fetch("https://l6ct9b9z8g.execute-api.us-west-2.amazonaws.com/loadallies", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                username, 
                password: hashedPassword,
                passwordIsHashed: true 
            })
        }).then(response => {
            if (!response.ok) {
                throw new Error(`Load Allies API failed with status ${response.status}`);
            }
            return response.json();
        });        
        const enemiesPromise = fetch("https://l6ct9b9z8g.execute-api.us-west-2.amazonaws.com/loadnewenemies", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                username, 
                password: hashedPassword,
                passwordIsHashed: true 
            })
        }).then(response => {
            if (!response.ok) {
                throw new Error(`Load New Enemies API failed with status ${response.status}`);
            }
            return response.json();
        });
        const recruitmentsPromise = fetch("https://l6ct9b9z8g.execute-api.us-west-2.amazonaws.com/loadrecruitments", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                username, 
                password: hashedPassword,
                passwordIsHashed: true 
            })
        }).then(response => {
            if (!response.ok) {
                throw new Error(`Load Recruitments API failed with status ${response.status}`);
            }
            return response.json();
        });
        const [accountData, alliesData, enemiesData, recruitmentsData] = await Promise.all([accountPromise, alliesPromise, enemiesPromise, recruitmentsPromise]);
        console.log("Received account data:", accountData);
        const alliesList = Array.isArray(alliesData) ? alliesData : [];
        const enemiesList = Array.isArray(enemiesData) ? enemiesData : [];
        const recruitmentsList = Array.isArray(recruitmentsData) ? recruitmentsData : [];
        const account = new Account(accountData.Level, accountData.Marbles);
        try {
            sessionStorage.setItem('accountData', JSON.stringify({
                level: account.level,
                marbles: account.marbles
            }));
            console.log("Stored fresh account data in session storage:", account);
        } catch (e) {
            console.error("Failed to store account data in session storage:", e);
        }
        const allies = alliesList.map(ally => new Ally(ally.Name, ally.Level, ally.Attack, ally.Health, ally.SkillName, ally.SkillStatus, ally.SkillCount, ally.SkillHits));
        const enemies = enemiesList.map(enemy => new Enemy(enemy.Name, enemy.Level, enemy.Attack, enemy.Health, enemy.SkillName, enemy.SkillStatus, enemy.SkillCount, enemy.SkillHits));
        const recruitments = recruitmentsList.map(recruitment => new Recruitment(recruitment.Name));        
        hideLoadingScreen();
        return { account, allies, enemies, recruitments };
    } catch (error) {
        handleApiError('initializing game data', error);
        hideLoadingScreen();
        return null;
    }
}