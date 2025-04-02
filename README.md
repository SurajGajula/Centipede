# Centipede RPG Homepage

A stylish and interactive homepage for a tactical RPG game called "Centipede" with an Arknights-inspired UI design. Built with vanilla JavaScript and Three.js.

## Features

- Modern UI with angular, futuristic design elements
- Character display that can toggle between allies and enemies
- Interactive Three.js background with network visualization
- Hexagonal patterns and angular clip-path design elements
- Animated UI elements with sequence animations
- Interactive buttons with ripple effects and visual feedback
- Notification system resembling game notifications
- Responsive layout that works on mobile devices

## Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Local web server (optional but recommended)

### Installation

1. Clone this repository or download the files
2. If you have Python installed, you can start a simple local server:
   
   ```bash
   # Python 3
   python -m http.server
   
   # Python 2
   python -m SimpleHTTPServer
   ```
   
3. Or use the provided shell script:
   ```bash
   chmod +x start.sh
   ./start.sh
   ```
   
4. Open your browser and navigate to `http://localhost:8000`

## File Structure

- `index.html` - Main HTML structure
- `style.css` - All styling including angular design elements
- `main.js` - JavaScript functionality with Three.js network visualization
- `start.sh` - Utility script to start a local server

## Game UI Elements

The Centipede UI incorporates several key features:

- **Character Display**: Large character profile on the left side
- **Action Buttons**: Allies, Enemies, Recruitment buttons on the right
- **Status Panel**: Shows agent stats like Rank, Loyalty, Neurocores and Credits
- **Intel Briefing**: News panel with latest updates and events
- **Angular Panels**: UI elements with slanted edges using clip-path
- **Technical Aesthetic**: Blue and orange color scheme with hexagonal patterns

## Customization

### Changing Colors

The color scheme can be easily modified by updating the CSS variables in the `:root` selector in `style.css`:

```css
:root {
    --primary-color: #0097e6;
    --secondary-color: #00a8ff;
    --accent-color: #ff9900;
    --dark-bg: #121212;
    --medium-bg: #1e1e22;
    --light-bg: #2a2a32;
    --text-light: #e4e4e4;
    --text-dim: #8a8a9a;
    --border-glow: rgba(0, 151, 230, 0.5);
    --panel-border: #00a8ff;
}
```

### Interactive Elements

The project includes several interactive elements:

- **Ally/Enemy Toggle**: Click the ALLIES or ENEMIES buttons to switch the character display
- **Recruitment Button**: Simulates character recruitment functionality
- **Notification System**: Shows status messages when buttons are clicked
- **Sequential Animations**: UI elements fade in when the page loads
- **Network Visualization**: Background that responds to mouse movement

## Browser Compatibility

This project uses modern JavaScript and CSS features and is compatible with:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

[MIT License](LICENSE)

## Acknowledgements

- [Three.js](https://threejs.org/) - 3D JavaScript library
- Arknights - UI design inspiration 