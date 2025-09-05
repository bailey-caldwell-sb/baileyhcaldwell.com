// API Keys Configuration for News Ticker
// This file should be included before news-ticker.js and kept secure

// Configuration object for API keys
const NewsTickerConfig = {
    // API keys from NumberOne AI project
    SERPAPI_KEY: localStorage.getItem('SERPAPI_KEY') || '8b95f95ad213d8e58afaf927dc72b3a68ae61f1efa00e44d03fcc0707d9beca2',
    FIRECRAWL_API_KEY: localStorage.getItem('FIRECRAWL_API_KEY') || 'fc-662f370d6a5a41c6b4b3a7ee94c5f808',
    
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
    return NewsTickerConfig.SERPAPI_KEY && NewsTickerConfig.SERPAPI_KEY.length > 10 && 
           NewsTickerConfig.FIRECRAWL_API_KEY && NewsTickerConfig.FIRECRAWL_API_KEY.length > 10;
}

// Make config available globally
window.NewsTickerConfig = NewsTickerConfig;
window.setNewsTickerApiKeys = setNewsTickerApiKeys;
window.areApiKeysConfigured = areApiKeysConfigured;
