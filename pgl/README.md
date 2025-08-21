# Fantasy Football Dashboard

A modern web application to display live data from your Yahoo Fantasy Football league, including live scores, standings, and team information.

## Features

- **Live League Data**: View current standings, scores, and team information
- **Modern UI**: Clean, responsive design with a beautiful gradient background
- **Real-time Updates**: Refresh buttons to get the latest data from Yahoo
- **Mobile Friendly**: Responsive design that works on all devices

## Setup Instructions

### 1. Yahoo Developer Account Setup

1. Go to [Yahoo Developer Console](https://developer.yahoo.com/apps/create/)
2. Create a new application with the following settings:
   - **Application Name**: Your Fantasy Dashboard
   - **Application Type**: Web Application
   - **API Permissions**: Fantasy Sports (Read or Read/Write)
   - **Redirect URI**: `http://localhost:3000/callback` (or your domain)

3. Note down your **Client ID** and **Client Secret**

### 2. Get Your Access Token

Since this is a client-side application, you'll need to complete the OAuth flow manually to get an access token. You can use tools like:

- **Postman**: Create OAuth 2.0 requests to Yahoo's endpoints
- **curl**: Use command line to make OAuth requests
- **Online OAuth tools**: Various web-based OAuth testing tools

#### OAuth Endpoints:
- **Authorization URL**: `https://api.login.yahoo.com/oauth2/request_auth`
- **Token URL**: `https://api.login.yahoo.com/oauth2/get_token`

#### Required Parameters:
- `client_id`: Your Yahoo app's Client ID
- `redirect_uri`: Your registered redirect URI
- `response_type`: `code`
- `scope`: `fspt-r` (for read access) or `fspt-w` (for read/write)

### 3. Find Your League Key

Your league key follows the format: `{game_id}.l.{league_id}`

- **Game ID**: For NFL, it's typically the year (e.g., `414` for 2024)
- **League ID**: Found in your Yahoo Fantasy league URL

Example: If your league URL is `https://football.fantasysports.yahoo.com/f1/123456`, your league key would be `414.l.123456`

### 4. Running the Application

1. Open `index.html` in your web browser
2. Click "Connect to Yahoo"
3. Enter your access token and league key
4. Enjoy your fantasy football dashboard!

## File Structure

```
├── index.html          # Main HTML file
├── styles.css          # CSS styles and responsive design
├── app.js             # JavaScript application logic
└── README.md          # This file
```

## API Endpoints Used

- **League Info**: `/fantasy/v2/league/{league_key}`
- **Standings**: `/fantasy/v2/league/{league_key}/standings`
- **Live Scores**: `/fantasy/v2/league/{league_key}/scoreboard`
- **Team Roster**: `/fantasy/v2/team/{team_key}/roster`

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Troubleshooting

### Common Issues

1. **CORS Errors**: Yahoo's API may block direct browser requests. Consider using a proxy server for production.

2. **Access Token Expired**: Access tokens typically expire after 1 hour. You'll need to refresh them using your refresh token.

3. **League Key Format**: Make sure your league key follows the exact format: `{game_id}.l.{league_id}`

4. **API Rate Limits**: Yahoo has rate limits on their API. Avoid making too many requests in a short time.

### Getting Help

- [Yahoo Fantasy Sports API Documentation](https://developer.yahoo.com/fantasysports/guide/)
- [Yahoo OAuth 2.0 Guide](https://developer.yahoo.com/oauth2/guide/)

## Future Enhancements

- Server-side OAuth flow for better security
- Automatic token refresh
- Player statistics and projections
- Trade analysis tools
- Mobile app version
- Push notifications for score updates

## License

This project is open source and available under the MIT License.
