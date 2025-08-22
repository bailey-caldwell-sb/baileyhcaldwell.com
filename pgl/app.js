class FantasyFootballApp {
    constructor() {
        this.accessToken = localStorage.getItem('yahoo_access_token');
        this.refreshToken = localStorage.getItem('yahoo_refresh_token');
        this.leagueKey = localStorage.getItem('league_key');
        this.init();
    }

    init() {
        this.bindEvents();
        this.handleOAuthCallback();
        this.checkAuthStatus();
    }

    bindEvents() {
        // Auth buttons
        document.getElementById('loginBtn').addEventListener('click', () => this.initiateAuth());
        document.getElementById('connectBtn').addEventListener('click', () => this.initiateAuth());
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());

        // Refresh buttons
        document.getElementById('refreshStandings').addEventListener('click', () => this.loadStandings());
        document.getElementById('refreshScores').addEventListener('click', () => this.loadLiveScores());
        document.getElementById('refreshTeam').addEventListener('click', () => this.loadMyTeam());
    }

    handleOAuthCallback() {
        const urlParams = new URLSearchParams(window.location.search);
        const authCode = urlParams.get('code');
        
        if (authCode) {
            this.exchangeCodeForToken(authCode);
        }
    }

    async exchangeCodeForToken(code) {
        try {
            this.showLoading();
            
            const clientId = 'dj0yJmk8TmV4OVl1MFlWQ3FsJmQ5WVd4OVZGVnNaRmRpYVkwbWNHbzlNY29jVlZXZWNyZXNWNyZzPWNvbnN1bWVyc2VjcmV0Jng9PTAz';
            const clientSecret = '5e41d85885b637f03d795dc29f06174ceb702ce';
            const redirectUri = 'https://baileyhcaldwell.com/pgl';
            
            const response = await fetch('https://api.login.yahoo.com/oauth2/get_token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`
                },
                body: new URLSearchParams({
                    grant_type: 'authorization_code',
                    code: code,
                    redirect_uri: redirectUri
                })
            });

            if (!response.ok) {
                throw new Error('Failed to exchange code for token');
            }

            const tokenData = await response.json();
            
            this.accessToken = tokenData.access_token;
            this.refreshToken = tokenData.refresh_token;
            
            localStorage.setItem('yahoo_access_token', this.accessToken);
            localStorage.setItem('yahoo_refresh_token', this.refreshToken);
            
            // Clear the code from URL
            window.history.replaceState({}, document.title, window.location.pathname);
            
            this.showDashboard();
            this.loadDashboardData();
            
        } catch (error) {
            console.error('OAuth token exchange failed:', error);
            this.showError('Authentication failed. Please try again.');
        }
    }

    checkAuthStatus() {
        if (this.accessToken) {
            this.showDashboard();
            this.loadDashboardData();
        } else {
            this.showLoginPrompt();
        }
    }

    initiateAuth() {
        // Show manual token entry option due to OAuth issues
        this.showAuthInstructions();
    }

    showAuthInstructions() {
        const modal = document.createElement('div');
        modal.className = 'auth-modal';
        modal.innerHTML = `
            <div class="auth-modal-content">
                <div class="auth-modal-header">
                    <h2><i class="fab fa-yahoo"></i> Yahoo Fantasy API Setup</h2>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="auth-modal-body">
                    <div class="setup-step">
                        <h3>Demo Mode Setup</h3>
                        <p>Since Yahoo's OAuth is having issues, let's set up your league in demo mode:</p>
                        <input type="text" id="leagueKeyInput" placeholder="Enter your league key (e.g., 414.l.123456)" class="token-input">
                        <button id="saveTokenBtn" class="btn btn-primary">Continue in Demo Mode</button>
                        <p><small>This will show your league structure with sample data until OAuth is resolved</small></p>
                    </div>
                    <div class="setup-help">
                        <h4>Finding Your League Key</h4>
                        <p>Your league key is in your Yahoo Fantasy URL: <br>
                        <code>https://football.fantasysports.yahoo.com/f1/123456</code><br>
                        Format: <code>414.l.123456</code> (414 = current NFL season)</p>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Add modal styles
        const modalStyles = `
            <style>
                .auth-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.8);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                }
                .auth-modal-content {
                    background: white;
                    border-radius: 16px;
                    max-width: 600px;
                    width: 90%;
                    max-height: 80vh;
                    overflow-y: auto;
                }
                .auth-modal-header {
                    padding: 24px 30px;
                    border-bottom: 1px solid #e2e8f0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .auth-modal-header h2 {
                    color: #2d3748;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .close-modal {
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #718096;
                }
                .auth-modal-body {
                    padding: 30px;
                }
                .setup-step {
                    margin-bottom: 24px;
                    padding: 20px;
                    background: #f7fafc;
                    border-radius: 8px;
                }
                .setup-step h3 {
                    color: #2d3748;
                    margin-bottom: 8px;
                }
                .setup-step p {
                    color: #4a5568;
                    line-height: 1.6;
                }
                .setup-step a {
                    color: #667eea;
                    text-decoration: none;
                }
                .token-input {
                    width: 100%;
                    padding: 12px;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    margin: 8px 0;
                    font-family: 'Inter', sans-serif;
                }
                .setup-help {
                    background: #edf2f7;
                    padding: 16px;
                    border-radius: 8px;
                    margin-top: 16px;
                }
                .setup-help h4 {
                    color: #2d3748;
                    margin-bottom: 8px;
                }
                .setup-help p {
                    color: #4a5568;
                    font-size: 14px;
                }
                .setup-help code {
                    background: #f7fafc;
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-family: monospace;
                }
            </style>
        `;
        document.head.insertAdjacentHTML('beforeend', modalStyles);

        // Event listeners
        modal.querySelector('.close-modal').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });

        document.getElementById('saveTokenBtn').addEventListener('click', () => {
            const leagueKey = document.getElementById('leagueKeyInput').value.trim();
            
            if (leagueKey) {
                this.leagueKey = leagueKey;
                this.accessToken = 'demo_mode'; // Demo mode flag
                localStorage.setItem('league_key', leagueKey);
                localStorage.setItem('yahoo_access_token', 'demo_mode');
                document.body.removeChild(modal);
                this.showDashboard();
                this.loadDemoData();
            } else {
                alert('Please enter your league key');
            }
        });
    }

    logout() {
        localStorage.removeItem('yahoo_access_token');
        localStorage.removeItem('yahoo_refresh_token');
        localStorage.removeItem('league_key');
        this.accessToken = null;
        this.refreshToken = null;
        this.leagueKey = null;
        this.showLoginPrompt();
    }

    showLoginPrompt() {
        document.getElementById('loginPrompt').style.display = 'block';
        document.getElementById('dashboardContent').style.display = 'none';
        document.getElementById('loadingSpinner').style.display = 'none';
        document.getElementById('errorMessage').style.display = 'none';
        document.getElementById('userInfo').style.display = 'none';
        document.getElementById('loginBtn').style.display = 'inline-flex';
    }

    showDashboard() {
        document.getElementById('loginPrompt').style.display = 'none';
        document.getElementById('dashboardContent').style.display = 'block';
        document.getElementById('loadingSpinner').style.display = 'none';
        document.getElementById('errorMessage').style.display = 'none';
        document.getElementById('userInfo').style.display = 'flex';
        document.getElementById('loginBtn').style.display = 'none';
        document.getElementById('userName').textContent = 'Connected to Yahoo';
    }

    showLoading() {
        document.getElementById('loadingSpinner').style.display = 'flex';
        document.getElementById('errorMessage').style.display = 'none';
    }

    showError(message) {
        document.getElementById('errorMessage').style.display = 'flex';
        document.getElementById('errorText').textContent = message;
        document.getElementById('loadingSpinner').style.display = 'none';
    }

    async makeYahooRequest(endpoint) {
        try {
            // Direct API call - CORS handled by server configuration
            const response = await fetch(`https://fantasysports.yahooapis.com/fantasy/v2/${endpoint}`, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const text = await response.text();
            
            // Yahoo API returns XML, so we'll need to parse it
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(text, 'text/xml');
            
            return xmlDoc;
        } catch (error) {
            console.error('Yahoo API request failed:', error);
            
            // If CORS proxy fails, show helpful error message
            if (error.message.includes('CORS') || error.message.includes('fetch')) {
                throw new Error('CORS error: Please enable CORS proxy or use a server-side solution for production');
            }
            
            throw error;
        }
    }

    async loadDashboardData() {
        if (this.accessToken === 'demo_mode') {
            this.loadDemoData();
            return;
        }
        
        try {
            await Promise.all([
                this.loadLeagueInfo(),
                this.loadStandings(),
                this.loadLiveScores(),
                this.loadMyTeam()
            ]);
        } catch (error) {
            this.showError('Failed to load dashboard data. Please check your access token and league key.');
        }
    }

    loadDemoData() {
        // Demo league info
        document.getElementById('leagueName').textContent = 'Demo Fantasy League';
        document.getElementById('currentWeek').textContent = '3';
        document.getElementById('numTeams').textContent = '12';
        document.getElementById('draftStatus').textContent = 'Postdraft';

        // Demo standings
        const standingsHtml = `
            <table>
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Team</th>
                        <th>W-L</th>
                        <th>Points For</th>
                        <th>Points Against</th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td>1</td><td>Team Thunder</td><td>3-0</td><td>387.2</td><td>298.1</td></tr>
                    <tr><td>2</td><td>Gridiron Giants</td><td>2-1</td><td>356.8</td><td>312.4</td></tr>
                    <tr><td>3</td><td>End Zone Eagles</td><td>2-1</td><td>341.5</td><td>329.7</td></tr>
                    <tr><td>4</td><td>Touchdown Titans</td><td>2-1</td><td>334.2</td><td>318.9</td></tr>
                    <tr><td>5</td><td>Field Goal Foxes</td><td>1-2</td><td>298.7</td><td>345.3</td></tr>
                    <tr><td>6</td><td>Blitz Bombers</td><td>1-2</td><td>287.4</td><td>356.8</td></tr>
                </tbody>
            </table>
        `;
        document.getElementById('standingsTable').innerHTML = standingsHtml;

        // Demo live scores
        const scoresHtml = `
            <div class="matchup">
                <div class="team">
                    <div class="team-name">Team Thunder</div>
                    <div class="team-score">124.3</div>
                </div>
                <div class="vs">VS</div>
                <div class="team">
                    <div class="team-name">Gridiron Giants</div>
                    <div class="team-score">98.7</div>
                </div>
            </div>
            <div class="matchup">
                <div class="team">
                    <div class="team-name">End Zone Eagles</div>
                    <div class="team-score">112.1</div>
                </div>
                <div class="vs">VS</div>
                <div class="team">
                    <div class="team-name">Touchdown Titans</div>
                    <div class="team-score">89.4</div>
                </div>
            </div>
        `;
        document.getElementById('liveScores').innerHTML = scoresHtml;

        // Demo team roster
        const teamHtml = `
            <div class="player-row">
                <div class="player-info">
                    <div class="player-name">Josh Allen</div>
                    <div class="player-position">QB - BUF</div>
                </div>
                <div class="player-points">24.3 pts</div>
            </div>
            <div class="player-row">
                <div class="player-info">
                    <div class="player-name">Christian McCaffrey</div>
                    <div class="player-position">RB - SF</div>
                </div>
                <div class="player-points">18.7 pts</div>
            </div>
            <div class="player-row">
                <div class="player-info">
                    <div class="player-name">Tyreek Hill</div>
                    <div class="player-position">WR - MIA</div>
                </div>
                <div class="player-points">15.2 pts</div>
            </div>
            <div class="player-row">
                <div class="player-info">
                    <div class="player-name">Travis Kelce</div>
                    <div class="player-position">TE - KC</div>
                </div>
                <div class="player-points">12.8 pts</div>
            </div>
        `;
        document.getElementById('myTeam').innerHTML = teamHtml;
    }

    async loadLeagueInfo() {
        try {
            const xmlDoc = await this.makeYahooRequest(`league/${this.leagueKey}`);
            
            const league = xmlDoc.querySelector('league');
            if (league) {
                const name = league.querySelector('name')?.textContent || 'Unknown League';
                const currentWeek = league.querySelector('current_week')?.textContent || '-';
                const numTeams = league.querySelector('num_teams')?.textContent || '0';
                const draftStatus = league.querySelector('draft_status')?.textContent || '-';

                document.getElementById('leagueName').textContent = name;
                document.getElementById('currentWeek').textContent = currentWeek;
                document.getElementById('numTeams').textContent = numTeams;
                document.getElementById('draftStatus').textContent = draftStatus.charAt(0).toUpperCase() + draftStatus.slice(1);
            }
        } catch (error) {
            console.error('Failed to load league info:', error);
        }
    }

    async loadStandings() {
        try {
            const xmlDoc = await this.makeYahooRequest(`league/${this.leagueKey}/standings`);
            
            const teams = xmlDoc.querySelectorAll('team');
            let standingsHtml = `
                <table>
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Team</th>
                            <th>W-L</th>
                            <th>Points For</th>
                            <th>Points Against</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            teams.forEach((team, index) => {
                const name = team.querySelector('name')?.textContent || 'Unknown Team';
                const wins = team.querySelector('team_standings wins')?.textContent || '0';
                const losses = team.querySelector('team_standings losses')?.textContent || '0';
                const pointsFor = team.querySelector('team_points total')?.textContent || '0';
                const pointsAgainst = team.querySelector('team_standings points_against')?.textContent || '0';

                standingsHtml += `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${name}</td>
                        <td>${wins}-${losses}</td>
                        <td>${parseFloat(pointsFor).toFixed(1)}</td>
                        <td>${parseFloat(pointsAgainst).toFixed(1)}</td>
                    </tr>
                `;
            });

            standingsHtml += '</tbody></table>';
            document.getElementById('standingsTable').innerHTML = standingsHtml;
        } catch (error) {
            console.error('Failed to load standings:', error);
            document.getElementById('standingsTable').innerHTML = '<div class="loading-placeholder">Failed to load standings</div>';
        }
    }

    async loadLiveScores() {
        try {
            const xmlDoc = await this.makeYahooRequest(`league/${this.leagueKey}/scoreboard`);
            
            const matchups = xmlDoc.querySelectorAll('matchup');
            let scoresHtml = '';

            if (matchups.length === 0) {
                scoresHtml = '<div class="loading-placeholder">No live games this week</div>';
            } else {
                matchups.forEach(matchup => {
                    const teams = matchup.querySelectorAll('team');
                    if (teams.length >= 2) {
                        const team1Name = teams[0].querySelector('name')?.textContent || 'Team 1';
                        const team1Score = teams[0].querySelector('team_points total')?.textContent || '0';
                        const team2Name = teams[1].querySelector('name')?.textContent || 'Team 2';
                        const team2Score = teams[1].querySelector('team_points total')?.textContent || '0';

                        scoresHtml += `
                            <div class="matchup">
                                <div class="team">
                                    <div class="team-name">${team1Name}</div>
                                    <div class="team-score">${parseFloat(team1Score).toFixed(1)}</div>
                                </div>
                                <div class="vs">VS</div>
                                <div class="team">
                                    <div class="team-name">${team2Name}</div>
                                    <div class="team-score">${parseFloat(team2Score).toFixed(1)}</div>
                                </div>
                            </div>
                        `;
                    }
                });
            }

            document.getElementById('liveScores').innerHTML = scoresHtml;
        } catch (error) {
            console.error('Failed to load live scores:', error);
            document.getElementById('liveScores').innerHTML = '<div class="loading-placeholder">Failed to load live scores</div>';
        }
    }

    async loadMyTeam() {
        try {
            // First get the user's team
            const userXml = await this.makeYahooRequest(`users;use_login=1/games;game_keys=nfl/leagues`);
            const userTeams = userXml.querySelectorAll('team');
            
            if (userTeams.length === 0) {
                document.getElementById('myTeam').innerHTML = '<div class="loading-placeholder">No team found</div>';
                return;
            }

            // Get the first team's roster
            const teamKey = userTeams[0].querySelector('team_key')?.textContent;
            if (!teamKey) {
                document.getElementById('myTeam').innerHTML = '<div class="loading-placeholder">Team key not found</div>';
                return;
            }

            const rosterXml = await this.makeYahooRequest(`team/${teamKey}/roster`);
            const players = rosterXml.querySelectorAll('player');
            
            let teamHtml = '';
            
            players.forEach(player => {
                const name = player.querySelector('name full')?.textContent || 'Unknown Player';
                const position = player.querySelector('eligible_positions position')?.textContent || 'N/A';
                const points = player.querySelector('player_points total')?.textContent || '0';

                teamHtml += `
                    <div class="player-row">
                        <div class="player-info">
                            <div class="player-name">${name}</div>
                            <div class="player-position">${position}</div>
                        </div>
                        <div class="player-points">${parseFloat(points).toFixed(1)} pts</div>
                    </div>
                `;
            });

            document.getElementById('myTeam').innerHTML = teamHtml || '<div class="loading-placeholder">No players found</div>';
        } catch (error) {
            console.error('Failed to load team:', error);
            document.getElementById('myTeam').innerHTML = '<div class="loading-placeholder">Failed to load team data</div>';
        }
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new FantasyFootballApp();
});
