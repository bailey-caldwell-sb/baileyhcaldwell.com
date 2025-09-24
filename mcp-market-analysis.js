// MCP Market Analysis JavaScript - Matching FinOps format exactly

// Access control system
const ACCESS_CODES = ['bailey', 'mcp2025', 'protocol', 'anthropic'];

// Initialize access control
document.addEventListener('DOMContentLoaded', function() {
    initializeAccessControl();
    initializeStarField();
});

function initializeAccessControl() {
    const accessGate = document.getElementById('access-gate');
    const researchPortal = document.getElementById('research-portal');
    const accessInput = document.getElementById('access-code');
    const accessSubmit = document.getElementById('access-submit');
    const accessError = document.getElementById('access-error');

    // Check if user already has access
    if (sessionStorage.getItem('mcpAnalysisAccess') === 'granted') {
        showResearchPortal();
        return;
    }

    function checkAccess() {
        const code = accessInput.value.trim().toLowerCase();

        if (ACCESS_CODES.includes(code)) {
            sessionStorage.setItem('mcpAnalysisAccess', 'granted');
            showResearchPortal();
        } else {
            accessError.style.display = 'block';
            accessInput.value = '';
            accessInput.focus();
        }
    }

    function showResearchPortal() {
        if (accessGate) accessGate.style.display = 'none';
        if (researchPortal) researchPortal.style.display = 'block';

        // Initialize market intelligence after showing portal
        setTimeout(() => {
            if (typeof initializeMarketIntelligence === 'function') {
                initializeMarketIntelligence('mcp');
            }
        }, 500);
    }

    // Event listeners
    if (accessSubmit) {
        accessSubmit.addEventListener('click', checkAccess);
    }

    if (accessInput) {
        accessInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                checkAccess();
            }
        });

        accessInput.addEventListener('input', function() {
            if (accessError) {
                accessError.style.display = 'none';
            }
        });
    }
}

// Star field animation (matching FinOps format)
function initializeStarField() {
    const starsContainer = document.getElementById('stars');
    if (!starsContainer) return;

    const numStars = 100;

    for (let i = 0; i < numStars; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 3 + 's';
        star.style.animationDuration = (Math.random() * 3 + 2) + 's';
        starsContainer.appendChild(star);
    }
}

// MCP Analysis object (matching FinOps structure)
const mcpAnalysis = {
    currentTab: 'methodology',

    showTab: function(tabName) {
        // Hide all tabs
        const tabs = document.querySelectorAll('.tab-content');
        tabs.forEach(tab => {
            tab.style.display = 'none';
            tab.classList.remove('active');
        });

        // Remove active class from all buttons
        const buttons = document.querySelectorAll('.tab-button');
        buttons.forEach(button => {
            button.classList.remove('active');
        });

        // Show selected tab
        const selectedTab = document.getElementById(tabName + '-tab');
        if (selectedTab) {
            selectedTab.style.display = 'block';
            selectedTab.classList.add('active');
        }

        // Add active class to clicked button
        const selectedButton = document.querySelector(`[onclick="mcpAnalysis.showTab('${tabName}')"]`);
        if (selectedButton) {
            selectedButton.classList.add('active');
        }

        this.currentTab = tabName;

        // Load content for the tab
        this.loadTabContent(tabName);
    },

    loadTabContent: function(tabName) {
        const tabContent = document.getElementById(tabName + '-tab');
        if (!tabContent) return;

        switch(tabName) {
            case 'quadrants':
                this.loadQuadrantAnalysis(tabContent);
                break;
            case 'insights':
                this.loadMarketInsights(tabContent);
                break;
            case 'recommendations':
                this.loadRecommendations(tabContent);
                break;
        }
    },

    loadQuadrantAnalysis: function(container) {
        container.innerHTML = `
            <h3>Quadrant Analysis: MCP Market Positioning</h3>
            <div class="quadrant-analysis">
                <div class="quadrant-section">
                    <h4>Leaders (26.7%)</h4>
                    <p><strong>Anthropic (#1, 18.7), Microsoft (#2, 17.2), Obot AI (#3, 16.0), Cloudflare (#4, 15.9)</strong></p>
                    <p>These companies demonstrate both high vision and strong execution capabilities in the MCP infrastructure ecosystem. They control critical infrastructure, drive protocol development, and have comprehensive go-to-market strategies.</p>
                </div>
                <div class="quadrant-section">
                    <h4>Challengers (13.3%)</h4>
                    <p><strong>K2view (#6, 14.7), Rapid Innovation (#8, 14.6)</strong></p>
                    <p>Strong execution capabilities with proven enterprise deployment experience, but following rather than leading MCP ecosystem development. Well-positioned for rapid adoption once strategic direction crystallizes.</p>
                </div>
                <div class="quadrant-section">
                    <h4>Visionaries (26.7%)</h4>
                    <p><strong>Alpic (#5, 15.5), Speakeasy (#7, 14.7), FastMCP (#9, 14.4), Archestra (#10, 14.3)</strong></p>
                    <p>High vision for MCP-native solutions but still developing execution capabilities. These companies understand the transformative potential of MCP and are building for an MCP-first future.</p>
                </div>
                <div class="quadrant-section">
                    <h4>Niche Players (33.3%)</h4>
                    <p><strong>Stainless (#11, 14.1), MCP Market (#12, 13.4), Mintlify (#13, 13.2), Smithery (#14, 12.7), Taghash (#15, 12.0)</strong></p>
                    <p>Developing specialized MCP infrastructure and tooling. This segment represents companies focusing on specific use cases and vertical applications within the MCP ecosystem.</p>
                </div>
            </div>
        `;
    },

    loadMarketInsights: function(container) {
        container.innerHTML = `
            <h3>Key Market Insights</h3>
            <div class="insights-grid">
                <div class="insight-item">
                    <h4>Infrastructure Market Maturity</h4>
                    <p>15 core MCP infrastructure companies with average scores of 7.1 (execution) and 7.7 (vision) indicate a rapidly maturing ecosystem. Anthropic leads with the highest total score of 18.7.</p>
                </div>
                <div class="insight-item">
                    <h4>Balanced Competitive Landscape</h4>
                    <p>The distribution across quadrants (26.7% Leaders, 26.7% Visionaries, 33.3% Niche, 13.3% Challengers) shows a healthy, competitive market with opportunities across all segments.</p>
                </div>
                <div class="insight-item">
                    <h4>Protocol Leadership Concentration</h4>
                    <p>Top 4 companies (Anthropic, Microsoft, Obot AI, Cloudflare) control critical infrastructure and protocol development, creating strong barriers to entry for new players.</p>
                </div>
                <div class="insight-item">
                    <h4>Specialized Infrastructure Focus</h4>
                    <p>Strong representation in niche players (33.3%) indicates significant opportunities for specialized MCP infrastructure components, developer tools, and vertical solutions.</p>
                </div>
            </div>
        `;
    },

    loadRecommendations: function(container) {
        container.innerHTML = `
            <h3>Strategic Recommendations</h3>
            <div class="recommendations-grid">
                <div class="recommendation-item">
                    <h4>For Enterprise Buyers</h4>
                    <ul>
                        <li>Adopt a "protocol-first" strategy for AI tooling decisions</li>
                        <li>Pilot MCP-native solutions for new AI initiatives</li>
                        <li>Prepare for ecosystem consolidation around MCP standards</li>
                        <li>Invest in MCP governance and security frameworks</li>
                    </ul>
                </div>
                <div class="recommendation-item">
                    <h4>For Technology Vendors</h4>
                    <ul>
                        <li>Develop MCP compatibility for existing AI products</li>
                        <li>Consider MCP-native architectures for new solutions</li>
                        <li>Focus on enterprise security and governance capabilities</li>
                        <li>Build developer-friendly MCP integration tools</li>
                    </ul>
                </div>
                <div class="recommendation-item">
                    <h4>For Investors</h4>
                    <ul>
                        <li>Target companies with strong MCP protocol expertise</li>
                        <li>Focus on enterprise security and compliance solutions</li>
                        <li>Consider developer tooling and framework opportunities</li>
                        <li>Evaluate network effect potential in portfolio companies</li>
                    </ul>
                </div>
                <div class="recommendation-item">
                    <h4>For Startups</h4>
                    <ul>
                        <li>Build MCP-native from day one</li>
                        <li>Focus on specific vertical or use case specialization</li>
                        <li>Contribute to open-source MCP ecosystem</li>
                        <li>Develop enterprise-grade security capabilities early</li>
                    </ul>
                </div>
            </div>
        `;
    },

    exportReport: function() {
        // Create a comprehensive report
        const reportData = {
            title: 'MCP Infrastructure Market Analysis Report',
            date: new Date().toISOString().split('T')[0],
            companies: 15,
            averageExecution: '7.1/10',
            averageVision: '7.7/10',
            marketMaturity: '7.4/10',
            topCompanies: ['Anthropic (18.7)', 'Microsoft (17.2)', 'Obot AI (16.0)'],
            distribution: {
                leaders: '26.7%',
                challengers: '13.3%',
                visionaries: '26.7%',
                nichePlayers: '33.3%'
            },
            keyInsights: [
                'Infrastructure market shows strong maturity with balanced competitive landscape',
                'Protocol leadership concentrated in top 4 companies',
                'Significant opportunities in specialized infrastructure components',
                'Healthy distribution across all strategic quadrants'
            ]
        };

        // Convert to JSON and download
        const dataStr = JSON.stringify(reportData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'mcp-market-analysis-report.json';
        link.click();
        URL.revokeObjectURL(url);
    }
};

// Initialize tabs when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Set default tab
    setTimeout(() => {
        if (typeof mcpAnalysis !== 'undefined') {
            mcpAnalysis.showTab('methodology');
        }
    }, 1000);
});
