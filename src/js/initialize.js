import Account from "./account.js";
import Ally from "./ally.js";
import Enemy from "./enemy.js";
import Recruitment from "./recruitment.js";
export async function initialize(username, password) {
    let accountData;
    try {
        const response = await fetch("https://l6ct9b9z8g.execute-api.us-west-2.amazonaws.com/loadaccount", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        accountData = await response.json();
    } catch (error) {
        console.error("Failed to load account data:", error);
        accountData = { level: "DefaultLevelOnError" };
    }
    const account = new Account(accountData.level);
    const allies = [
        new Ally("AllyName", "AllyLevel", "AllyAttack", "AllyHealth"),
        new Ally("AllyName", "AllyLevel", "AllyAttack", "AllyHealth"),
        new Ally("AllyName", "AllyLevel", "AllyAttack", "AllyHealth")
    ];
    const enemies = [
        new Enemy("EnemyName", "EnemyLevel", "EnemyAttack", "EnemyHealth"),
        new Enemy("EnemyName", "EnemyLevel", "EnemyAttack", "EnemyHealth")
    ];
    const recruitments  = [
        new Recruitment("RecruitmentName", ["AllyName", "AllyName", "AllyName"]),
        new Recruitment("RecruitmentName", ["AllyName", "AllyName", "AllyName"]),
        new Recruitment("RecruitmentName", ["AllyName", "AllyName", "AllyName"])
    ];
    return { account, allies, enemies, recruitments };
}