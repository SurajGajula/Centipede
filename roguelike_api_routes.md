# Roguelike Battle Mode API Routes

Based on the current battle system analysis, here are the API routes you'll need to implement a roguelike battle mode with 10 sequential battles and item selection between battles.

## Current System Analysis

The existing system has these endpoints:
- `POST /loadaccount` - Load user account data
- `POST /loadallies` - Load user's allies
- `POST /loadnewenemies` - Load available enemies
- `POST /loadparty` - Load user's current party
- `POST /defeatenemy` - Record enemy defeat and award marbles
- `POST /addparty` - Modify party composition
- `POST /pullrecruitment` - Handle recruitment mechanics

## New API Routes for Roguelike Mode

### 1. Run Management

#### `POST /roguelike/start-run`
**Purpose**: Initialize a new roguelike run
**Request Body**:
```json
{
  "username": "string",
  "password": "string", 
  "passwordIsHashed": "boolean",
  "selectedAlly": "string" // ally name to use for the run
}
```
**Response**:
```json
{
  "runId": "string", // unique identifier for this run
  "currentBattle": 1,
  "totalBattles": 10,
  "ally": {
    "name": "string",
    "baseStats": { /* original stats */ },
    "currentStats": { /* current stats with items applied */ },
    "appliedItems": []
  },
  "nextEnemy": { /* enemy data for battle 1 */ }
}
```

#### `POST /roguelike/get-run-status`
**Purpose**: Get current run progress and state
**Request Body**:
```json
{
  "username": "string",
  "password": "string",
  "passwordIsHashed": "boolean",
  "runId": "string"
}
```
**Response**:
```json
{
  "runId": "string",
  "isActive": "boolean",
  "currentBattle": "number",
  "totalBattles": "number",
  "ally": { /* current ally state */ },
  "appliedItems": [ /* list of items acquired this run */ ],
  "battlesWon": "number",
  "isComplete": "boolean"
}
```

#### `POST /roguelike/abandon-run`
**Purpose**: Abandon current run (forfeit progress)
**Request Body**:
```json
{
  "username": "string", 
  "password": "string",
  "passwordIsHashed": "boolean",
  "runId": "string"
}
```

### 2. Battle Management

#### `POST /roguelike/complete-battle`
**Purpose**: Record battle completion and get next state
**Request Body**:
```json
{
  "username": "string",
  "password": "string", 
  "passwordIsHashed": "boolean",
  "runId": "string",
  "battleNumber": "number",
  "victory": "boolean",
  "battleStats": {
    "turnsElapsed": "number",
    "damageDealt": "number", 
    "damageTaken": "number"
  }
}
```
**Response** (if victory and not final battle):
```json
{
  "battleComplete": true,
  "runComplete": false,
  "nextBattle": "number",
  "availableItems": [
    {
      "id": "string",
      "name": "string", 
      "description": "string",
      "type": "attack|health|skill", // item category
      "effect": {
        "attack": "number", // stat bonus (can be 0)
        "health": "number",
        "maxHealth": "number", 
        "skillEnhancement": "string" // optional skill modification
      },
      "rarity": "common|rare|legendary"
    }
    // ... 2 more items for choice
  ]
}
```
**Response** (if victory and final battle):
```json
{
  "battleComplete": true,
  "runComplete": true,
  "reward": {
    "marbles": "number",
    "experienceGained": "number",
    "completionBonus": "number"
  },
  "runStats": {
    "battlesWon": "number",
    "totalTurns": "number", 
    "itemsCollected": "number",
    "finalAllyStats": { /* ally stats at run end */ }
  }
}
```

### 3. Item Management

#### `POST /roguelike/select-item`
**Purpose**: Choose an item after winning a battle
**Request Body**:
```json
{
  "username": "string",
  "password": "string",
  "passwordIsHashed": "boolean", 
  "runId": "string",
  "itemId": "string",
  "battleNumber": "number"
}
```
**Response**:
```json
{
  "itemApplied": true,
  "updatedAlly": {
    "name": "string",
    "currentStats": { /* new stats with item applied */ },
    "appliedItems": [ /* updated item list */ ]
  },
  "nextEnemy": { /* enemy data for next battle */ },
  "nextBattleNumber": "number"
}
```

#### `GET /roguelike/available-items`
**Purpose**: Get the item pool for generating choices (for admin/debug)
**Query Parameters**: `?rarity=common|rare|legendary&type=attack|health|skill`
**Response**:
```json
{
  "items": [
    {
      "id": "string",
      "name": "string",
      "description": "string", 
      "type": "string",
      "effect": { /* stat modifications */ },
      "rarity": "string"
    }
  ]
}
```

### 4. Enemy Generation

#### `POST /roguelike/get-next-enemy`
**Purpose**: Get enemy for specific battle in run (with scaling)
**Request Body**:
```json
{
  "username": "string",
  "password": "string",
  "passwordIsHashed": "boolean",
  "runId": "string", 
  "battleNumber": "number"
}
```
**Response**:
```json
{
  "enemy": {
    "name": "string",
    "level": "number", // scaled based on battle number
    "attack": "number", // scaled stats
    "health": "number",
    "maxHealth": "number",
    "skillname": "string",
    "skillstatus": "string",
    "skillcount": "number",
    "skillhits": "number"
  },
  "difficulty": "easy|medium|hard|boss" // battle 10 could be boss
}
```

### 5. Statistics & Leaderboards

#### `POST /roguelike/get-run-history`
**Purpose**: Get user's past roguelike runs
**Request Body**:
```json
{
  "username": "string",
  "password": "string",
  "passwordIsHashed": "boolean",
  "limit": "number" // optional, default 10
}
```
**Response**:
```json
{
  "runs": [
    {
      "runId": "string",
      "startTime": "ISO8601",
      "endTime": "ISO8601", 
      "battlesWon": "number",
      "totalBattles": "number",
      "completed": "boolean",
      "allyUsed": "string",
      "finalReward": "number"
    }
  ]
}
```

#### `GET /roguelike/leaderboard`
**Purpose**: Global leaderboard for roguelike runs
**Query Parameters**: `?type=completions|fastest|highest_reward&limit=50`
**Response**:
```json
{
  "leaderboard": [
    {
      "username": "string",
      "score": "number", // depends on type: completions count, time, or reward
      "allyUsed": "string",
      "date": "ISO8601"
    }
  ],
  "userRank": "number" // current user's rank in this leaderboard
}
```

## Database Schema Considerations

You'll need new tables to support this:

### `roguelike_runs`
- `run_id` (primary key)
- `username` 
- `ally_name`
- `start_time`
- `end_time`
- `current_battle`
- `is_active`
- `is_complete`
- `total_battles`
- `battles_won`

### `roguelike_run_items`
- `run_id` (foreign key)
- `item_id`
- `battle_acquired`
- `effect_data` (JSON)

### `roguelike_items`
- `item_id` (primary key)
- `name`
- `description`
- `type`
- `rarity`
- `attack_bonus`
- `health_bonus`
- `max_health_bonus`
- `skill_enhancement`

### `roguelike_run_battles`
- `run_id` (foreign key)
- `battle_number`
- `enemy_name`
- `victory`
- `turns_elapsed`
- `damage_dealt`
- `damage_taken`
- `completed_at`

## Implementation Notes

1. **Run Persistence**: Runs should be saved in the database so players can resume if they disconnect
2. **Item Balance**: Items should provide meaningful but not overpowered bonuses (10-25% stat increases)
3. **Enemy Scaling**: Each battle should have slightly stronger enemies (5-10% stat increase per battle)
4. **Battle 10 Boss**: Consider making the final battle significantly harder with a unique boss enemy
5. **Rewards**: Completed runs should give substantial marble rewards (perhaps 500-1000 marbles)
6. **Item Variety**: Include items that modify skills, not just raw stats
7. **Run Limits**: Consider limiting active runs to 1 per player to prevent abuse

This API structure maintains consistency with your existing system while adding the roguelike functionality you requested. The items only persist during a run and are lost when the run ends, as specified.