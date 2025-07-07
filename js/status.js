export function updateStatusDisplay(ally, enemy) {
    updateEntityStatusDisplay(ally, 'ally');
    updateEntityStatusDisplay(enemy, 'enemy');
}

function updateEntityStatusDisplay(entity, entityType) {
    let statusContainer = document.querySelector(`.${entityType}-status-container`);
    if (!statusContainer) {
        const healthContainer = document.querySelector(`.${entityType}-health-container`);        
        if (!healthContainer) {
            console.error(`${entityType} health container not found!`);
            return;
        }        
        statusContainer = document.createElement('div');
        statusContainer.className = `${entityType}-status-container`;
        healthContainer.appendChild(statusContainer);
    }
    statusContainer.innerHTML = '';
    if (Object.keys(entity.statuses).length === 0) {
        statusContainer.style.display = 'none';
        return;
    } else {
        statusContainer.style.display = 'flex';
    }    
    Object.entries(entity.statuses).forEach(([status, count]) => {
        const statusIndicator = document.createElement('div');
        statusIndicator.className = 'status-indicator';        
        const svgPath = `assets/images/${status}.svg`;
        statusIndicator.style.backgroundImage = `url('${svgPath}')`;
        statusIndicator.style.filter = 'brightness(1.3) contrast(1.2)';
        const countSpan = document.createElement('span');
        countSpan.textContent = count;
        statusIndicator.appendChild(countSpan);
        statusIndicator.title = status;
        statusContainer.appendChild(statusIndicator);
    });
}