// API Configuration
// Update this file with your actual API Gateway endpoints
export const API_CONFIG = {
    BASE_URL: 'https://l6ct9b9z8g.execute-api.us-west-2.amazonaws.com',
    ENDPOINTS: {
        LOGIN: '/login',
        REGISTER: '/register',
        LOAD_ACCOUNT: '/loadaccount',
        LOAD_ALLIES: '/loadallies',
        LOAD_ENEMIES: '/loadenemies',
        LOAD_RECRUITMENTS: '/loadrecruitments',
        LOAD_PARTY: '/loadparty',
        ADD_PARTY: '/addparty',
        STORE_BATTLE: '/storebattle',
        PULL_RECRUITMENT: '/pullrecruitment',
        LOAD_ITEMS: '/loaditems'
    }
};

// Helper function to get full API URL
export function getApiUrl(endpoint) {
    return `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS[endpoint]}`;
}

// Helper function for making API calls
export async function makeApiCall(endpoint, options = {}) {
    const url = getApiUrl(endpoint);
    const defaultOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        ...options
    };
    
    return fetch(url, defaultOptions);
} 