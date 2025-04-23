import Account from "./account.js";
import Ally from "./ally.js";
import Enemy from "./enemy.js";
import Recruitment from "./recruitment.js";
import { handleApiError } from './error.js';
export async function initialize(username, password) {
    try {
        const accountPromise = fetch("https://l6ct9b9z8g.execute-api.us-west-2.amazonaws.com/loadaccount", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        }).then(response => {
            if (!response.ok) {
                throw new Error(`Load Account API failed with status ${response.status}`);
            }
            return response.json();
        });
        const alliesPromise = fetch("https://l6ct9b9z8g.execute-api.us-west-2.amazonaws.com/loadallies", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        }).then(response => {
            if (!response.ok) {
                throw new Error(`Load Allies API failed with status ${response.status}`);
            }
            return response.json();
        });
        const enemiesPromise = fetch("https://l6ct9b9z8g.execute-api.us-west-2.amazonaws.com/loadnewenemies", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        }).then(response => {
            if (!response.ok) {
                throw new Error(`Load New Enemies API failed with status ${response.status}`);
            }
            return response.json();
        });
        const [accountData, alliesData, enemiesData] = await Promise.all([accountPromise, alliesPromise, enemiesPromise]);
        const alliesList = Array.isArray(alliesData) ? alliesData : [];
        const enemiesList = Array.isArray(enemiesData) ? enemiesData : [];
        const account = new Account(accountData.Level, accountData.Marbles);
        const allies = alliesList.map(ally => new Ally(ally.Name, ally.Level, ally.Attack, ally.Health, ally.Skill));
        const enemies = enemiesList.map(enemy => new Enemy(enemy.Name, enemy.Level, enemy.Attack, enemy.Health, enemy.Skill));
        const recruitments  = [
            new Recruitment("RecruitmentName", ["AllyName", "AllyName", "AllyName"]),
            new Recruitment("RecruitmentName", ["AllyName", "AllyName", "AllyName"]),
            new Recruitment("RecruitmentName", ["AllyName", "AllyName", "AllyName"])
        ];
        return { account, allies, enemies, recruitments };
    } catch (error) {
        handleApiError('initializing game data', error);
        return null;
    }
}