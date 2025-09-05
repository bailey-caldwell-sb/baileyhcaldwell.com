// API Keys Configuration for News Ticker
// This file should be included before news-ticker.js and kept secure

// Configuration object for API keys
const NewsTickerConfig = {
    // Set your API keys here or via localStorage
    SERPAPI_KEY: localStorage.getItem('SERPAPI_KEY') || 'YOUR_SERPAPI_KEY_HERE',
    FIRECRAWL_API_KEY: localStorage.getItem('FIRECRAWL_API_KEY') || 'YOUR_FIRECRAWL_KEY_HERE',
    
    // Rate limiting configuration
    MAX_REQUESTS_PER_HOUR: 50,
    CACHE_DURATION_HOURS: 24,
    
    // News filtering settings
    MAX_NEWS_ITEMS: 20,
    MIN_IMPACT_SCORE: 3,
    
    // Update intervals
    UPDATE_CHECK_INTERVAL: 60 * 60 * 1000, // 1 hour
    CACHE_REFRESH_INTERVAL: 24 * 60 * 60 * 1000, // 24 hours
};

// Helper function to set API keys programmatically
function setNewsTickerApiKeys(serpApiKey, firecrawlKey) {
    localStorage.setItem('SERPAPI_KEY', serpApiKey);
    localStorage.setItem('FIRECRAWL_API_KEY', firecrawlKey);
    
    // Update the config object
    NewsTickerConfig.SERPAPI_KEY = serpApiKey;
    NewsTickerConfig.FIRECRAWL_API_KEY = firecrawlKey;
    
    console.log('News ticker API keys updated');
}

// Helper function to check if API keys are configured
function areApiKeysConfigured() {
    return NewsTickerConfig.SERPAPI_KEY !== 'YOUR_SERPAPI_KEY_HERE' && 
           NewsTickerConfig.FIRECRAWL_API_KEY !== 'YOUR_FIRECRAWL_KEY_HERE' &&
           NewsTickerConfig.SERPAPI_KEY && 
           NewsTickerConfig.FIRECRAWL_API_KEY;
}

// Make config available globally
window.NewsTickerConfig = NewsTickerConfig;
window.setNewsTickerApiKeys = setNewsTickerApiKeys;
window.areApiKeysConfigured = areApiKeysConfigured;
