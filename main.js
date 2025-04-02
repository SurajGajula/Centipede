document.addEventListener('DOMContentLoaded', () => {
    initThreeJsBackground();
    initButtonEffects();
    initHexagonalPattern();
    animateUIElements();
    initThemeSwitcher();
});

function initButtonEffects() {
    const buttons = document.querySelectorAll('.menu-button');
    
    buttons.forEach(button => {
        button.addEventListener('mouseover', () => {
            button.style.backgroundColor = 'var(--medium-bg)';
            button.style.boxShadow = '0 0 15px rgba(0, 151, 230, 0.3)';
            const afterElement = document.createElement('style');
            afterElement.textContent = `.menu-button:hover::after { background-color: var(--accent-color); }`;
            document.head.appendChild(afterElement);
            
            // Ripple effect on hover
            createRippleEffect(button);
        });
        
        button.addEventListener('mouseout', () => {
            if (!button.classList.contains('active')) {
                button.style.backgroundColor = 'var(--light-bg)';
                button.style.boxShadow = '';
            }
            const afterElements = document.querySelectorAll('style');
            afterElements.forEach(el => {
                if(el.textContent.includes('.menu-button:hover::after')) {
                    document.head.removeChild(el);
                }
            });
        });
        
        button.addEventListener('mousedown', () => {
            button.style.transform = 'translateY(1px)';
            button.style.boxShadow = '0 0 8px rgba(0, 151, 230, 0.2)';
        });
        
        button.addEventListener('mouseup', () => {
            button.style.transform = '';
            button.style.boxShadow = '0 0 15px rgba(0, 151, 230, 0.3)';
        });
        
        button.addEventListener('click', (e) => {
            // Remove active class from all buttons
            buttons.forEach(btn => {
                btn.classList.remove('active');
                btn.style.backgroundColor = 'var(--light-bg)';
                btn.style.boxShadow = '';
            });
            
            // Add active class to clicked button
            button.classList.add('active');
            button.style.backgroundColor = 'var(--medium-bg)';
            button.style.boxShadow = '0 0 15px rgba(0, 151, 230, 0.3)';
            
            const action = e.target.getAttribute('data-action');
            handleMenuAction(action);
        });
    });
}

function initThemeSwitcher() {
    const themeOptions = document.querySelectorAll('.theme-option');
    
    // Check for saved theme in localStorage
    const savedTheme = localStorage.getItem('centipedeTheme');
    if (savedTheme) {
        const theme = JSON.parse(savedTheme);
        updateThemeColors(theme.primary, theme.accent);
        
        // Set active class on the saved theme option
        themeOptions.forEach(option => {
            option.classList.remove('active');
            if (option.dataset.primary === theme.primary && option.dataset.accent === theme.accent) {
                option.classList.add('active');
            }
        });
    }
    
    themeOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Remove active class from all options
            themeOptions.forEach(opt => opt.classList.remove('active'));
            
            // Add active class to selected option
            option.classList.add('active');
            
            // Get color values from data attributes
            const primaryColor = option.dataset.primary;
            const accentColor = option.dataset.accent;
            
            // Update colors
            updateThemeColors(primaryColor, accentColor);
            
            // Save theme to localStorage
            saveTheme(primaryColor, accentColor);
            
            // Show notification
            showNotification("Color theme updated");
        });
    });
}

function updateThemeColors(primaryColor, accentColor) {
    document.documentElement.style.setProperty('--primary-color', primaryColor);
    document.documentElement.style.setProperty('--secondary-color', adjustColorBrightness(primaryColor, 10));
    document.documentElement.style.setProperty('--accent-color', accentColor);
    document.documentElement.style.setProperty('--panel-border', adjustColorBrightness(primaryColor, 10));
    document.documentElement.style.setProperty('--border-glow', `${primaryColor}80`); // 50% opacity
    
    // Update particle colors in Three.js
    updateThreeJsColors(primaryColor);
}

function adjustColorBrightness(hex, percent) {
    // Remove the hash if present
    hex = hex.replace('#', '');
    
    // Parse the hex color to RGB
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // Adjust the RGB values
    const adjustedR = Math.min(255, Math.max(0, r + (r * percent / 100)));
    const adjustedG = Math.min(255, Math.max(0, g + (g * percent / 100)));
    const adjustedB = Math.min(255, Math.max(0, b + (b * percent / 100)));
    
    // Convert back to hex and return
    return `#${Math.round(adjustedR).toString(16).padStart(2, '0')}${Math.round(adjustedG).toString(16).padStart(2, '0')}${Math.round(adjustedB).toString(16).padStart(2, '0')}`;
}

function saveTheme(primaryColor, accentColor) {
    const theme = {
        primary: primaryColor,
        accent: accentColor
    };
    localStorage.setItem('centipedeTheme', JSON.stringify(theme));
}

function updateThreeJsColors(primaryColor) {
    // This would update the Three.js background colors dynamically
    // For simplicity, we'll just update the line material color
    const linesMesh = scene?.children?.find(child => child instanceof THREE.LineSegments);
    if (linesMesh && linesMesh.material) {
        // Convert hex to decimal
        const colorHex = primaryColor.replace('#', '0x');
        linesMesh.material.color.setHex(parseInt(colorHex, 16));
    }
}

function createRippleEffect(button) {
    const ripple = document.createElement('span');
    ripple.classList.add('ripple');
    button.appendChild(ripple);
    
    const size = Math.max(button.clientWidth, button.clientHeight);
    const rect = button.getBoundingClientRect();
    
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = '0';
    ripple.style.top = '0';
    
    ripple.style.backgroundColor = 'rgba(0, 151, 230, 0.2)';
    ripple.style.borderRadius = '50%';
    ripple.style.position = 'absolute';
    ripple.style.transform = 'scale(0)';
    ripple.style.animation = 'ripple 0.8s linear';
    
    setTimeout(() => {
        ripple.remove();
    }, 800);
}

function handleMenuAction(action) {
    console.log(`Menu action triggered: ${action}`);
    
    // Show notification
    showNotification(`${action.toUpperCase()} interface activated`);
    
    // For now, we're only implementing the account panel
    // Future functionality for other buttons will be added later
    
    // Hide all panels
    const panels = document.querySelectorAll('.interface-panel');
    panels.forEach(panel => {
        panel.classList.remove('active');
    });
    
    // Show the account panel by default
    const accountPanel = document.getElementById('account-panel');
    if (accountPanel) {
        accountPanel.classList.add('active');
    }
    
    // Add flash effect to the interface
    flashUI();
}

function flashUI() {
    const gamePanel = document.querySelector('.game-panel');
    
    // Create a flash overlay
    const flash = document.createElement('div');
    flash.style.position = 'absolute';
    flash.style.top = '0';
    flash.style.left = '0';
    flash.style.width = '100%';
    flash.style.height = '100%';
    flash.style.backgroundColor = 'rgba(0, 151, 230, 0.2)';
    flash.style.zIndex = '10';
    flash.style.pointerEvents = 'none';
    flash.style.opacity = '0';
    
    gamePanel.appendChild(flash);
    
    // Animation
    let opacity = 0;
    const fadeIn = setInterval(() => {
        if (opacity >= 0.5) {
            clearInterval(fadeIn);
            const fadeOut = setInterval(() => {
                opacity -= 0.1;
                flash.style.opacity = opacity;
                if (opacity <= 0) {
                    clearInterval(fadeOut);
                    gamePanel.removeChild(flash);
                }
            }, 30);
        } else {
            opacity += 0.1;
            flash.style.opacity = opacity;
        }
    }, 30);
}

function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.backgroundColor = 'var(--light-bg)';
    notification.style.color = 'var(--text-light)';
    notification.style.padding = '18px 25px';
    notification.style.fontFamily = 'Jura, sans-serif';
    notification.style.fontSize = '16px';
    notification.style.fontWeight = '600';
    notification.style.zIndex = '1000';
    notification.style.transition = 'all 0.3s ease';
    notification.style.transform = 'translateX(100%)';
    notification.style.opacity = '0';
    notification.style.clipPath = 'polygon(0% 0%, 100% 0%, 100% 70%, 95% 100%, 0% 100%)';
    notification.style.borderLeft = '4px solid var(--accent-color)';
    notification.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.3)';
    notification.style.letterSpacing = '1px';
    
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
        notification.style.opacity = '1';
    }, 10);
    
    // Remove after delay
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        notification.style.opacity = '0';
        
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function initHexagonalPattern() {
    const panels = document.querySelectorAll('.game-panel, .news-panel');
    
    panels.forEach(panel => {
        // Create canvas for hexagonal pattern
        const canvas = document.createElement('canvas');
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.opacity = '0.05';
        canvas.style.pointerEvents = 'none';
        
        const panelContent = panel.querySelector('.panel-content');
        if (panelContent) {
            panelContent.style.position = 'relative';
            panelContent.appendChild(canvas);
            
            // Make canvas size match element
            canvas.width = panelContent.offsetWidth;
            canvas.height = panelContent.offsetHeight;
            
            // Draw hexagonal pattern
            const ctx = canvas.getContext('2d');
            drawHexagonalPattern(ctx, canvas.width, canvas.height);
        }
    });
}

function drawHexagonalPattern(ctx, width, height) {
    const hexSize = 20;
    const hexWidth = hexSize * 2;
    const hexHeight = Math.sqrt(3) * hexSize;
    
    ctx.strokeStyle = 'rgba(0, 151, 230, 0.5)';
    ctx.lineWidth = 1;
    
    for (let y = 0; y < height + hexHeight; y += hexHeight * 0.75) {
        const offset = (Math.floor(y / (hexHeight * 0.75)) % 2) * (hexWidth * 0.5);
        
        for (let x = -hexWidth; x < width + hexWidth; x += hexWidth) {
            drawHexagon(ctx, x + offset, y, hexSize);
        }
    }
}

function drawHexagon(ctx, x, y, size) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const angle = 2 * Math.PI / 6 * i;
        const xPos = x + size * Math.cos(angle);
        const yPos = y + size * Math.sin(angle);
        
        if (i === 0) {
            ctx.moveTo(xPos, yPos);
        } else {
            ctx.lineTo(xPos, yPos);
        }
    }
    ctx.closePath();
    ctx.stroke();
}

function animateUIElements() {
    // Animate menu buttons
    const menuButtons = document.querySelectorAll('.menu-button');
    menuButtons.forEach((button, index) => {
        button.style.opacity = '0';
        button.style.transform = 'translateY(20px)';
        button.style.transition = 'all 0.3s ease';
        
        setTimeout(() => {
            button.style.opacity = '1';
            button.style.transform = 'translateY(0)';
        }, 400 + (index * 100));
    });
}

// Global variable to store the scene reference
let scene;

function initThreeJsBackground() {
    const container = document.getElementById('three-background');
    
    // Scene setup
    scene = new THREE.Scene();
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    
    // Particles - main system (blue network)
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 800;
    
    const posArray = new Float32Array(particlesCount * 3);
    const colorsArray = new Float32Array(particlesCount * 3);
    
    for (let i = 0; i < particlesCount * 3; i += 3) {
        // Position - creates a more grid-like formation
        const x = (Math.random() - 0.5) * 20;
        const y = (Math.random() - 0.5) * 20;
        const z = (Math.random() - 0.5) * 10;
        
        posArray[i] = x;
        posArray[i+1] = y;
        posArray[i+2] = z;
        
        // Colors (blue to cyan)
        colorsArray[i] = 0.0;                  // R - low red for blue effect
        colorsArray[i+1] = 0.5 + Math.random() * 0.3;    // G - some green for cyan
        colorsArray[i+2] = 0.8 + Math.random() * 0.2;    // B - high blue
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));
    
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.03,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
    });
    
    const particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particleSystem);
    
    // Connection lines for network effect
    const linesMaterial = new THREE.LineBasicMaterial({
        color: 0x0097e6,
        transparent: true,
        opacity: 0.2,
    });
    
    const linesGeometry = new THREE.BufferGeometry();
    const linePositions = [];
    
    // Create connections between closer particles
    const positions = particlesGeometry.attributes.position.array;
    const maxDistance = 3; // Maximum distance for connection
    
    for (let i = 0; i < particlesCount; i++) {
        const p1 = {
            x: positions[i * 3],
            y: positions[i * 3 + 1],
            z: positions[i * 3 + 2]
        };
        
        // Connect to nearest neighbors
        for (let j = i + 1; j < particlesCount; j++) {
            const p2 = {
                x: positions[j * 3],
                y: positions[j * 3 + 1],
                z: positions[j * 3 + 2]
            };
            
            const distance = Math.sqrt(
                Math.pow(p1.x - p2.x, 2) +
                Math.pow(p1.y - p2.y, 2) +
                Math.pow(p1.z - p2.z, 2)
            );
            
            if (distance < maxDistance && Math.random() > 0.7) {
                linePositions.push(p1.x, p1.y, p1.z);
                linePositions.push(p2.x, p2.y, p2.z);
            }
        }
    }
    
    linesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    const linesMesh = new THREE.LineSegments(linesGeometry, linesMaterial);
    scene.add(linesMesh);
    
    // Background distant particles
    const bgGeometry = new THREE.BufferGeometry();
    const bgCount = 500;
    
    const bgPosArray = new Float32Array(bgCount * 3);
    
    for (let i = 0; i < bgCount * 3; i += 3) {
        bgPosArray[i] = (Math.random() - 0.5) * 50;
        bgPosArray[i+1] = (Math.random() - 0.5) * 50;
        bgPosArray[i+2] = -30 + (Math.random() - 0.5) * 20;
    }
    
    bgGeometry.setAttribute('position', new THREE.BufferAttribute(bgPosArray, 3));
    
    const bgMaterial = new THREE.PointsMaterial({
        size: 0.015,
        color: 0xffffff,
        transparent: true,
        opacity: 0.4,
    });
    
    const bgSystem = new THREE.Points(bgGeometry, bgMaterial);
    scene.add(bgSystem);
    
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404080, 1);
    scene.add(ambientLight);
    
    // Mouse effect
    let mouseX = 0;
    let mouseY = 0;
    
    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
    
    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        
        // Slower, subtle rotation for a more technical look
        particleSystem.rotation.x += 0.0001;
        particleSystem.rotation.y += 0.0002;
        
        // Network lines follow the particles
        linesMesh.rotation.x = particleSystem.rotation.x;
        linesMesh.rotation.y = particleSystem.rotation.y;
        
        // Mouse influence - subtle and precise
        particleSystem.rotation.x += (mouseY * 0.0002 - particleSystem.rotation.x) * 0.03;
        particleSystem.rotation.y += (mouseX * 0.0002 - particleSystem.rotation.y) * 0.03;
        
        // Very subtle background movement
        bgSystem.rotation.x += 0.00005;
        bgSystem.rotation.y += 0.00005;
        
        renderer.render(scene, camera);
    }
    
    animate();
}

// Add styles for animations
const styleElement = document.createElement('style');
styleElement.textContent = `
@keyframes ripple {
    to {
        transform: scale(4);
        opacity: 0;
    }
}
`;
document.head.appendChild(styleElement);

// Simulate loading news items from API
setTimeout(() => {
    const newsItems = document.querySelector('.news-items');
    if (newsItems) {
        const loadingEffect = document.createElement('div');
        loadingEffect.className = 'loading-effect';
        loadingEffect.innerHTML = 'Loading intel briefing...';
        newsItems.appendChild(loadingEffect);
        
        setTimeout(() => {
            newsItems.removeChild(loadingEffect);
        }, 1000);
    }
}, 2000); 