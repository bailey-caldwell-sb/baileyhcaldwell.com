# Market Analysis News Ticker

A standalone news intelligence system for baileyhcaldwell.com market analysis pages that provides real-time news tracking for companies using SerpApi and Firecrawl.

## Features

- **Real-time News Tracking**: Monitors news for all companies in each market analysis
- **Impact Scoring**: AI-powered algorithm prioritizes news by market significance
- **Daily Caching**: 24-hour cache with automatic refresh
- **Multi-source Intelligence**: SerpApi for discovery + Firecrawl for full content
- **Responsive Design**: Works across desktop and mobile devices
- **Independent Operation**: Runs standalone without dependencies on NumberOne AI

## Quick Setup

### 1. Include Files
Add to your analysis page `<head>`:
```html
<link rel="stylesheet" href="news-ticker.css">
<script src="api-keys-config.js"></script>
```

Add before closing `</body>`:
```html
<script src="news-ticker.js"></script>
```

### 2. Add HTML Structure
Insert news ticker in your page body:
```html
<div class="news-ticker" id="news-ticker">
    <div class="ticker-container">
        <div class="ticker-label">MARKET NEWS</div>
        <div class="ticker-content">
            <div class="ticker-loading">
                <div class="loading-spinner"></div>
                Loading latest market intelligence...
            </div>
        </div>
        <div class="ticker-controls">
            <button class="refresh-button" onclick="window.newsTicker?.refresh()">Refresh</button>
            <div class="last-update" id="news-last-update">Initializing...</div>
        </div>
    </div>
</div>
```

### 3. Configure API Keys
Set your API keys in browser console or via JavaScript:
```javascript
setNewsTickerApiKeys('your_serpapi_key', 'your_firecrawl_key');
```

### 4. Set Analysis Type
Add `data-analysis-type` to your main container:
```html
<main id="main-content" class="main-container" data-analysis-type="finops">
```

Analysis types:
- `finops` - FinOps market analysis
- `kubernetes` - Kubernetes fleet management analysis  
- `linux-os` - Linux OS distributions analysis

## API Requirements

### SerpApi
- **Free Tier**: 250 searches/month
- **Developer**: $75/month for 5,000 searches
- **Usage**: Google News search for company mentions

### Firecrawl
- **Free Tier**: 500 credits/month
- **Hobby**: $16/month for 3,000 credits
- **Usage**: Full article content extraction for high-impact stories

## How It Works

1. **Company Detection**: Extracts company list from existing `companies` JavaScript array
2. **News Discovery**: Uses SerpApi to search Google News for each company
3. **Content Extraction**: Firecrawl fetches full article content for high-impact stories (score > 7)
4. **Impact Scoring**: Algorithm analyzes headlines for funding, partnerships, leadership changes
5. **Caching**: Results cached in localStorage for 24 hours
6. **Display**: Top 20 stories displayed with impact indicators and company attribution

## Impact Scoring Algorithm

- **High Impact (8-10)**: Funding rounds, acquisitions, IPOs, major partnerships
- **Medium Impact (5-7)**: Product launches, integrations, customer wins
- **Low Impact (2-4)**: Leadership changes, minor announcements
- **Company Tier Multiplier**: Leaders get 1.5x, Visionaries get 1.3x boost
- **Recency Decay**: Exponential decay over 24 hours

## Customization

### Visual Styling
Modify `news-ticker.css` for custom appearance:
- Impact indicator colors (red/yellow/green)
- Animation speed and direction
- Mobile responsive breakpoints

### News Filtering
Update `NewsTickerConfig` in `api-keys-config.js`:
```javascript
MAX_NEWS_ITEMS: 20,        // Max stories to display
MIN_IMPACT_SCORE: 3,       // Minimum score threshold
CACHE_DURATION_HOURS: 24,  // Cache refresh interval
```

### Search Queries
Modify search terms in `fetchCompanyNews()` method:
```javascript
const searchQuery = `"${companyName}" (funding OR acquisition OR product OR partnership OR announcement)`;
```

## Troubleshooting

### No News Displaying
1. Check API keys are configured: `areApiKeysConfigured()`
2. Verify `companies` array exists on page
3. Check browser console for API errors
4. Ensure `data-analysis-type` is set correctly

### Rate Limiting
- SerpApi: 250 free searches/month (1 search per company per refresh)
- Firecrawl: 500 free credits/month (1 credit per full article)
- Cache prevents excessive API calls

### CORS Issues
APIs are called directly from browser. If CORS issues occur, consider:
- Using a proxy server
- Moving to server-side implementation
- Using JSONP alternatives where available

## File Structure

```
baileyhcaldwell.com/
├── news-ticker.js          # Main ticker logic
├── news-ticker.css         # Styling and animations
├── api-keys-config.js      # API configuration
└── README-news-ticker.md   # This documentation
```

## Security Notes

- API keys stored in localStorage (client-side)
- For production, consider server-side proxy
- Keys visible in browser developer tools
- Rate limiting prevents abuse

## Performance

- **Initial Load**: ~2-3 seconds for first news fetch
- **Cache Hit**: Instant display from localStorage
- **Memory Usage**: ~50KB per analysis page cache
- **Network**: Minimal after initial load (24hr cache)

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- Mobile browsers with ES6 support

## Future Enhancements

- Server-side caching with Redis
- WebSocket real-time updates
- Cross-analysis news correlation
- Sentiment analysis integration
- Custom news source configuration
- Email/Slack notifications for high-impact news
