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
        
        // Create the status container
        statusContainer = document.createElement('div');
        statusContainer.className = `${entityType}-status-container`;
        
        // Add to health container for proper positioning
        healthContainer.appendChild(statusContainer);
    }
    
    // Clear existing status indicators
    statusContainer.innerHTML = '';
    
    // Show/hide based on whether statuses exist
    if (Object.keys(entity.statuses).length === 0) {
        statusContainer.style.display = 'none';
        return;
    } else {
        statusContainer.style.display = 'flex';
    }
    
    // Create an indicator box for each status
    Object.entries(entity.statuses).forEach(([status, count]) => {
        const statusIndicator = document.createElement('div');
        statusIndicator.className = 'status-indicator';
        
        // Set the SVG image as background based on status name
        const svgPath = `../assets/images/${status}.svg`;
        statusIndicator.style.backgroundImage = `url('${svgPath}')`;
        
        // Filter to make SVG more visible against dark background
        statusIndicator.style.filter = 'brightness(1.3) contrast(1.2)';
        
        // Create a span for the count to ensure it's on top and in corner
        const countSpan = document.createElement('span');
        countSpan.textContent = count;
        statusIndicator.appendChild(countSpan);
        
        statusIndicator.title = status;
        statusContainer.appendChild(statusIndicator);
    });
}

export function initializeStatusDisplay() {
    const allyHealthContainer = document.querySelector('.ally-health-container');
    const enemyHealthContainer = document.querySelector('.enemy-health-container');    
    
    if (allyHealthContainer) {
        const allyStatusContainer = document.createElement('div');
        allyStatusContainer.className = 'ally-status-container';
        allyHealthContainer.appendChild(allyStatusContainer);
        allyStatusContainer.style.display = 'none';
    }
    
    if (enemyHealthContainer) {
        const enemyStatusContainer = document.createElement('div');
        enemyStatusContainer.className = 'enemy-status-container';
        enemyHealthContainer.appendChild(enemyStatusContainer);
        enemyStatusContainer.style.display = 'none';
    }
}