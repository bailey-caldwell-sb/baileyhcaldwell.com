// Standalone News Ticker for Market Analysis Pages
// Uses SerpApi + Firecrawl for daily news updates

class MarketNewsTicker {
    constructor(analysisType, companies) {
        this.analysisType = analysisType;
        this.companies = companies;
        this.newsCache = [];
        this.lastUpdate = null;
        this.updateInterval = 24 * 60 * 60 * 1000; // 24 hours
        
        // API configuration from config file
        this.serpApiKey = window.NewsTickerConfig?.SERPAPI_KEY || this.getEnvVar('SERPAPI_KEY');
        this.firecrawlKey = window.NewsTickerConfig?.FIRECRAWL_API_KEY || this.getEnvVar('FIRECRAWL_API_KEY');
        
        this.init();
    }
    
    areKeysValid() {
        return this.serpApiKey && this.serpApiKey.length > 10 &&
               this.firecrawlKey && this.firecrawlKey.length > 10;
    }
    
    getEnvVar(name) {
        // Fallback for API keys if config not loaded
        return localStorage.getItem(name) || 'YOUR_' + name;
    }
    
    async init() {
        // Check if API keys are configured
        if (!this.areKeysValid()) {
            this.showApiKeyError();
            return;
        }
        
        await this.loadCachedNews();
        this.renderTicker();
        this.startAutoUpdate();
    }
    
    showApiKeyError() {
        const tickerContainer = document.getElementById('news-ticker');
        if (tickerContainer) {
            const tickerContent = tickerContainer.querySelector('.ticker-content');
            tickerContent.innerHTML = `
                <div class="api-key-error">
                    <strong>✅ Ready to Load News</strong><br>
                    API keys configured from NumberOne AI project.<br>
                    <small>News will load automatically...</small>
                </div>
            `;
        }
    }
    
    async loadCachedNews() {
        const cacheKey = `news_${this.analysisType}`;
        const cached = localStorage.getItem(cacheKey);
        
        if (cached) {
            const data = JSON.parse(cached);
            this.newsCache = data.news || [];
            this.lastUpdate = new Date(data.timestamp);
            
            // Check if cache is stale (older than 24 hours)
            if (Date.now() - this.lastUpdate.getTime() > this.updateInterval) {
                await this.fetchFreshNews();
            }
        } else {
            await this.fetchFreshNews();
        }
    }
    
    async fetchFreshNews() {
        console.log('Fetching fresh news for', this.analysisType);
        const allNews = [];
        
        // Fetch news for each company
        for (const company of this.companies) {
            try {
                const companyNews = await this.fetchCompanyNews(company);
                allNews.push(...companyNews);
            } catch (error) {
                console.warn(`Failed to fetch news for ${company.name}:`, error);
            }
        }
        
        // Sort by impact score and recency
        this.newsCache = allNews
            .sort((a, b) => (b.impactScore * b.recencyScore) - (a.impactScore * a.recencyScore))
            .slice(0, 20); // Keep top 20 stories
        
        // Cache the results
        this.cacheNews();
        this.lastUpdate = new Date();
    }
    
    async fetchCompanyNews(company) {
        const companyName = company.name.replace(/\s*\([^)]*\)/g, ''); // Remove parentheses
        const searchQuery = `"${companyName}" (funding OR acquisition OR product OR partnership OR announcement)`;
        
        try {
            // Use SerpApi to search Google News
            const serpResponse = await fetch(`https://serpapi.com/search.json?engine=google_news&q=${encodeURIComponent(searchQuery)}&api_key=${this.serpApiKey}&num=5`);
            const serpData = await serpResponse.json();
            
            const news = [];
            
            if (serpData.news_results) {
                for (const result of serpData.news_results.slice(0, 3)) {
                    const newsItem = {
                        company: company,
                        headline: result.title,
                        url: result.link,
                        source: result.source,
                        publishedAt: new Date(result.date || Date.now()),
                        snippet: result.snippet || '',
                        impactScore: this.calculateImpactScore(result.title, result.snippet),
                        recencyScore: this.calculateRecencyScore(new Date(result.date || Date.now()))
                    };
                    
                    // Optionally fetch full content with Firecrawl for high-impact stories
                    if (newsItem.impactScore > 7) {
                        try {
                            newsItem.fullContent = await this.fetchFullContent(result.link);
                        } catch (error) {
                            console.warn('Failed to fetch full content:', error);
                        }
                    }
                    
                    news.push(newsItem);
                }
            }
            
            return news;
        } catch (error) {
            console.error(`Error fetching news for ${company.name}:`, error);
            return [];
        }
    }
    
    async fetchFullContent(url) {
        try {
            const response = await fetch('https://api.firecrawl.dev/v0/scrape', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.firecrawlKey}`
                },
                body: JSON.stringify({
                    url: url,
                    formats: ['markdown']
                })
            });
            
            const data = await response.json();
            return data.data?.markdown || '';
        } catch (error) {
            console.error('Firecrawl error:', error);
            return '';
        }
    }
    
    calculateImpactScore(headline, snippet) {
        const text = (headline + ' ' + snippet).toLowerCase();
        let score = 1;
        
        // High impact keywords
        if (text.match(/\b(funding|acquisition|merger|ipo|series [a-z]|raised|\$\d+m|\$\d+b)\b/)) score += 4;
        if (text.match(/\b(partnership|integration|launch|release|announces)\b/)) score += 2;
        if (text.match(/\b(ceo|cto|founder|leadership|executive)\b/)) score += 1;
        
        // Company tier multiplier
        const quadrant = this.getCompanyByName(text)?.quadrant;
        if (quadrant === 'leaders') score *= 1.5;
        if (quadrant === 'visionaries') score *= 1.3;
        
        return Math.min(score, 10);
    }
    
    calculateRecencyScore(publishedAt) {
        const hoursAgo = (Date.now() - publishedAt.getTime()) / (1000 * 60 * 60);
        return Math.max(0.1, Math.exp(-hoursAgo / 24)); // Exponential decay over 24 hours
    }
    
    getCompanyByName(text) {
        return this.companies.find(c => 
            text.toLowerCase().includes(c.name.toLowerCase()) ||
            text.toLowerCase().includes(c.name.split(' ')[0].toLowerCase())
        );
    }
    
    cacheNews() {
        const cacheKey = `news_${this.analysisType}`;
        const cacheData = {
            news: this.newsCache,
            timestamp: Date.now()
        };
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    }
    
    renderTicker() {
        const tickerContainer = document.getElementById('news-ticker');
        if (!tickerContainer || this.newsCache.length === 0) return;
        
        const tickerContent = tickerContainer.querySelector('.ticker-content');
        tickerContent.innerHTML = '';
        
        this.newsCache.forEach(news => {
            const newsItem = document.createElement('div');
            newsItem.className = 'news-item';
            newsItem.innerHTML = `
                <div class="impact-indicator ${this.getImpactClass(news.impactScore)}"></div>
                <div class="company-info">
                    <span class="company-name">${news.company.name}</span>
                </div>
                <div class="news-content">
                    <span class="headline">${news.headline}</span>
                    <span class="meta">${this.formatTimeAgo(news.publishedAt)} • ${news.source}</span>
                </div>
            `;
            
            newsItem.addEventListener('click', () => {
                window.open(news.url, '_blank', 'noopener,noreferrer');
            });
            
            tickerContent.appendChild(newsItem);
        });
        
        // Update last refresh indicator
        const lastUpdate = document.getElementById('news-last-update');
        if (lastUpdate) {
            lastUpdate.textContent = `Last updated: ${this.formatTimeAgo(this.lastUpdate)}`;
        }
    }
    
    getImpactClass(score) {
        if (score >= 8) return 'high';
        if (score >= 5) return 'medium';
        return 'low';
    }
    
    formatTimeAgo(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);
        
        if (diffDays > 0) return `${diffDays}d ago`;
        if (diffHours > 0) return `${diffHours}h ago`;
        return 'Just now';
    }
    
    startAutoUpdate() {
        // Check for updates every hour, but only fetch if cache is stale
        setInterval(async () => {
            if (Date.now() - this.lastUpdate.getTime() > this.updateInterval) {
                await this.fetchFreshNews();
                this.renderTicker();
            }
        }, 60 * 60 * 1000); // Check every hour
    }
    
    // Manual refresh method
    async refresh() {
        await this.fetchFreshNews();
        this.renderTicker();
    }
}

// Initialize ticker when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Extract companies from existing analysis page data
    if (typeof companies !== 'undefined') {
        const analysisType = document.body.dataset.analysisType || 'general';
        window.newsTicker = new MarketNewsTicker(analysisType, companies);
    }
});
