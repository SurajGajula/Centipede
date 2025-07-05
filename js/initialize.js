import Account from "./account.js";
import Ally from "./ally.js";
import Enemy from "./enemy.js";
import Recruitment from "./recruitment.js";
import { handleApiError } from './error.js';
import { showLoadingScreen, hideLoadingScreen } from "./loading.js";
import { makeApiCall } from './config.js';

export async function initialize(username, hashedPassword) {
    showLoadingScreen("Initializing Game");
    try {
        sessionStorage.removeItem('accountData');        
        const accountPromise = makeApiCall('LOAD_ACCOUNT', {
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

        const alliesPromise = makeApiCall('LOAD_ALLIES', {
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

        const enemiesPromise = makeApiCall('LOAD_ENEMIES', {
            body: JSON.stringify({ 
                username, 
                password: hashedPassword,
                passwordIsHashed: true 
            })
        }).then(response => {
            if (!response.ok) {
                throw new Error(`Load Enemies API failed with status ${response.status}`);
            }
            return response.json();
        });

        const recruitmentsPromise = makeApiCall('LOAD_RECRUITMENTS', {
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

        const alliesList = Array.isArray(alliesData) ? alliesData : [];
        const enemiesList = Array.isArray(enemiesData) ? enemiesData : [];
        const recruitmentsList = Array.isArray(recruitmentsData) ? recruitmentsData : [];

        const account = new Account(accountData.Marbles);

        try {
            sessionStorage.setItem('accountData', JSON.stringify({
                marbles: account.marbles
            }));
        } catch (e) {
            console.error("Failed to store account data in session storage:", e);
        }

        const allies = alliesList.map(ally => new Ally(
            ally.Name,
            ally.Attack,
            ally.Health,
            ally.SkillCount,
            ally.SkillHits,
            ally.SkillStatus
        ));
        const enemies = enemiesList.map(enemy => new Enemy(enemy.Name, enemy.Attack, enemy.Health, enemy.SkillName, enemy.SkillStatus, enemy.SkillCount, enemy.SkillHits));
        const recruitments = recruitmentsList.map(recruitment => new Recruitment(recruitment.Name));        

        hideLoadingScreen();
        return { account, allies, enemies, recruitments };
    } catch (error) {
        handleApiError('initializing game data', error);
        hideLoadingScreen();
        return null;
    }
}