# Centipede

A turn-based browser game featuring account creation, user authentication, battle mechanics, and enemy defeat tracking.

## Game Mechanics

### Authentication System
- Secure login and registration via email/username and password
- Password hashing for enhanced security (SHA-256)
- Client-side and server-side password validation
- Token-based session management using localStorage

### Battle System
- Turn-based combat between player allies and enemies
- Health and attack attribute management during battles
- Special skills with status effects (Thorns, etc.)
- Animated battle notifications for damage and status effects
- Action locking to prevent multiple simultaneous actions

### Economy
- Marble currency system awarded upon enemy defeats
- One-time rewards for first-time enemy defeats
- Account-based progression and currency tracking

### Game Flow
- Menu-based navigation between account, allies, enemies, and recruitment sections
- Victory/defeat conditions with appropriate visual feedback
- Battle results recorded in database for persistent progress
- Loading screens to enhance user experience during transitions

## Technical Architecture

### Frontend
- Pure vanilla JavaScript without frameworks
- ES6 module system for code organization
- CSS for styled UI components and animations
- SVG images for characters and enemies
- Async/await pattern for handling asynchronous operations
- Local storage for client-side credential caching

### Backend (AWS)
- AWS Lambda for serverless functions
- API Gateway for REST endpoints
- DynamoDB for NoSQL data storage
- Key-value pair and document-based data model
- Separation of concerns across multiple Lambda functions:
  - Authentication (login, loadaccount)
  - Game data (loadallies, loadnewenemies)
  - Game progress (defeatenemy)
  - New user setup (register)

### Data Model
- User authentication data with hashed passwords
- Character attributes (Attack, Health, Skills)
- Game progress tracking via user-enemy associations
- Currency (Marbles) system for rewards

### Security Features
- Password hashing using SHA-256
- Salted passwords for enhanced security
- Client-side and server-side validation
- Defensive error handling throughout

## Project Structure
- `src/` - Frontend source code
  - `js/` - JavaScript modules
  - `css/` - Styling and animations
- `assets/` - Game assets including character images
- `lambda/` - AWS Lambda functions for backend services

## API Endpoints
- `/login` - User authentication
- `/loadaccount` - Retrieve user account data
- `/loadallies` - Get user's allies
- `/loadnewenemies` - Get available enemies
- `/defeatenemy` - Record enemy defeat and award marbles