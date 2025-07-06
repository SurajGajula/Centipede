# LoadItems Implementation

## Overview

Created a complete system to load and display items from the `centipede-items` DynamoDB table on the card overlay that appears after each battle round.

## Backend Implementation

### File: `lambda/loaditems/index.js`

**Function**: Loads 3 random items from the `centipede-items` table based on rarity

**Features**:
- Takes `rarity` parameter in request body
- Scans DynamoDB table with rarity filter
- Returns 3 randomly selected items (with duplicates if fewer than 3 exist)
- Handles errors gracefully
- Returns standardized response format

**Request Format**:
```json
{
  "rarity": "common"
}
```

**Response Format**:
```json
{
  "success": true,
  "rarity": "common",
  "items": [
    {
      "name": "Item Name",
      "description": "Item description text",
      "rarity": "common",
      "id": "item-id"
    }
  ]
}
```

**Error Handling**:
- 400: Missing rarity parameter
- 404: No items found with specified rarity
- 500: Server/database errors

## Frontend Integration

### File: `js/config.js`
- Added `LOAD_ITEMS: '/loaditems'` endpoint to API configuration

### File: `js/battle.js`

**Updated `showCardOverlay()` function**:
- Now async function that loads items from API
- Calls loaditems endpoint with rarity parameter
- Displays item names, descriptions, and rarity on cards
- Fallback to "Mystery Item" if API fails or no items available

**Card Content Structure**:
```html
<div class="card-content">
    <h3 class="card-title">Item Name</h3>
    <p class="card-description">Item description</p>
    <div class="card-rarity">common</div>
</div>
```

### File: `css/battle.css`

**New Card Styling**:
- `.card-content`: Container for item information
- `.card-title`: Large, bold item name with text shadow
- `.card-description`: Scrollable description text
- `.card-rarity`: Badge at bottom showing rarity level

**Design Features**:
- Matches game's dark theme (grey backgrounds, white text)
- Responsive text sizing and scrolling for long descriptions
- Rarity badge positioned at bottom with gradient styling
- Proper spacing and typography hierarchy

## Database Schema

**Expected `centipede-items` table structure**:
```
{
  "Name": "Item Name",           // String
  "Description": "Description",  // String  
  "Rarity": "common",           // String (common, rare, epic, legendary, etc.)
  "ID": "unique-id"             // String
}
```

## Usage Flow

1. **Battle Round Ends**: Enemy defeated, round completed
2. **Card Overlay Triggered**: `showCardOverlay()` called from state.js
3. **Items Loaded**: API call to loaditems with rarity parameter
4. **Cards Displayed**: 3 cards showing item names, descriptions, rarity
5. **User Selection**: Player clicks a card to continue
6. **Overlay Dismissed**: Cards fade out, next round begins

## Rarity System

**Current Implementation**:
- Hardcoded to `'common'` rarity for all rounds
- Can be easily modified to use dynamic rarity based on:
  - Round number (higher rounds = better items)
  - Player progress
  - Battle difficulty
  - Random chance

**Example Dynamic Rarity**:
```javascript
const rarity = round <= 3 ? 'common' : 
               round <= 6 ? 'rare' : 
               round <= 8 ? 'epic' : 'legendary';
```

## Error Handling

**API Failures**:
- Uses error.js `handleApiError()` function for consistent error handling
- Shows user-friendly alert with error message
- Redirects to login screen after user acknowledgment
- Console error logging for debugging

**Missing Data**:
- Flexible field mapping (Name/name, Description/description)
- Default values for missing fields
- Duplicate items if fewer than 3 available

## Future Enhancements

**Possible Improvements**:
1. **Item Effects**: Add functionality when items are selected
2. **Inventory System**: Store selected items in player inventory
3. **Rarity Colors**: Different colors for different rarities
4. **Item Images**: Display item icons/images on cards
5. **Animation Effects**: Special effects for rare items
6. **Weight System**: Weighted random selection by rarity
7. **Category Filtering**: Filter by item type/category

## Testing

**Test Scenarios**:
1. **Normal Flow**: Items load successfully, cards display properly
2. **API Failure**: Network error, graceful fallback to mystery items
3. **No Items**: Empty table or no items with specified rarity
4. **Partial Data**: Items missing some fields
5. **Long Descriptions**: Text overflow handling

The implementation provides a solid foundation for an item reward system that integrates seamlessly with the existing battle flow while maintaining the game's visual consistency. 