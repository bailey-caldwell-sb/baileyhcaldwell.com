/**
 * Universal Market Intelligence System
 * Automatically detects market segment and loads appropriate intelligence
 * Works across all analysis pages: FinOps, Kubernetes, Linux OS
 */

class UniversalMarketIntelligence {
    constructor() {
        this.apiBaseUrl = 'https://00b2890bd272.ngrok-free.app'; // NumberOne AI backend
        this.currentSegment = this.detectMarketSegment();
        this.isBackendAvailable = false;
        this.useDemoData = false; // Force demo data for production deployment
    }

    /**
     * Detect market segment based on current page
     */
    detectMarketSegment() {
        const path = window.location.pathname.toLowerCase();
        const title = document.title.toLowerCase();
        const body = document.body.textContent.toLowerCase();

        // Check URL path first
        if (path.includes('finops') || path.includes('cost')) {
            return 'finops';
        }
        if (path.includes('k8s') || path.includes('kubernetes')) {
            if (path.includes('linux') || path.includes('os')) {
                return 'linux_os';
            }
            return 'kubernetes';
        }
        if (path.includes('linux') || path.includes('os')) {
            return 'linux_os';
        }

        // Check page title and content
        if (title.includes('finops') || title.includes('cost management')) {
            return 'finops';
        }
        if (title.includes('kubernetes') && (title.includes('linux') || title.includes('os'))) {
            return 'linux_os';
        }
        if (title.includes('kubernetes') || title.includes('k8s')) {
            return 'kubernetes';
        }
        if (title.includes('linux') || title.includes('container os')) {
            return 'linux_os';
        }

        // Check for data attributes
        const container = document.querySelector('[data-analysis-type]');
        if (container) {
            return container.getAttribute('data-analysis-type');
        }

        // Default fallback
        return 'finops';
    }

    /**
     * Check if NumberOne AI backend is available
     */
    async checkBackendAvailability() {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);

            const response = await fetch(`${this.apiBaseUrl}/api/health`, {
                method: 'GET',
                signal: controller.signal,
                headers: {
                    'ngrok-skip-browser-warning': 'true'
                }
            });

            clearTimeout(timeoutId);
            this.isBackendAvailable = response.ok;
            return this.isBackendAvailable;
        } catch (error) {
            this.isBackendAvailable = false;
            return false;
        }
    }

    /**
     * Load market intelligence for current segment
     */
    async loadMarketIntelligence() {
        const loadingElement = document.getElementById('intelligence-loading');
        const contentElement = document.getElementById('intelligence-content');
        
        if (loadingElement) loadingElement.style.display = 'block';
        if (contentElement) contentElement.style.display = 'none';

        // Check backend availability first
        await this.checkBackendAvailability();

        try {
            if (this.isBackendAvailable) {
                const response = await fetch(`${this.apiBaseUrl}/api/research/market-intelligence?segment=${this.currentSegment}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'ngrok-skip-browser-warning': 'true'
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.intelligence) {
                        this.displayMarketIntelligence(data.intelligence);
                        return;
                    }
                }
            }
        } catch (error) {
            console.log('Backend unavailable, using demo data');
        }
        
        // Fallback to demo data
        const demoIntelligence = this.getDemoMarketIntelligence(this.currentSegment);
        this.displayMarketIntelligence(demoIntelligence);
    }

    /**
     * Get demo market intelligence data for segment
     */
    getDemoMarketIntelligence(segment) {
        const demoData = {
            'finops': {
                'market_segment': 'FinOps/Cloud Cost Management',
                'market_trends': [
                    {
                        'icon': '🤖',
                        'title': 'AI-Native FinOps Evolution',
                        'description': 'Traditional FinOps platforms rapidly integrating AI capabilities, with 70% of vendors adding autonomous cost optimization features in 2024.'
                    },
                    {
                        'icon': '💰', 
                        'title': 'Agentic AI Cost Management',
                        'description': 'New category emerging for managing AI agent economics, with specialized tools for LLM cost tracking and multi-agent resource allocation.'
                    },
                    {
                        'icon': '⚡',
                        'title': 'Real-time Optimization',
                        'description': 'Shift from reactive cost management to proactive, real-time resource optimization using machine learning and predictive analytics.'
                    }
                ],
                'companies': [
                    {
                        'name': 'Flexera',
                        'category': 'leaders',
                        'recent_developments': 'Launched AI-powered cost optimization engine, acquired cloud security startup for $150M',
                        'market_positioning': 'Leading enterprise FinOps platform with 2000+ customers, focusing on hybrid cloud cost management',
                        'confidence_score': 8.5,
                        'sources': 12,
                        'url': 'https://www.flexera.com/'
                    },
                    {
                        'name': 'Pay-i',
                        'category': 'visionaries',
                        'recent_developments': 'Raised $15M Series A, launched agentic AI cost management platform',
                        'market_positioning': 'AI-native FinOps focused on autonomous agent economics and LLM cost optimization',
                        'confidence_score': 7.2,
                        'sources': 8,
                        'url': 'https://www.pay-i.com/'
                    },
                    {
                        'name': 'Datadog',
                        'category': 'challengers',
                        'recent_developments': 'Enhanced cloud cost management with AI insights, expanded multi-cloud support',
                        'market_positioning': 'Infrastructure monitoring leader expanding into FinOps with integrated observability',
                        'confidence_score': 8.8,
                        'sources': 15,
                        'url': 'https://www.datadoghq.com/'
                    },
                    {
                        'name': 'Revenium',
                        'category': 'visionaries',
                        'recent_developments': 'Launched API cost management platform, focusing on AI/ML workload optimization',
                        'market_positioning': 'Specialized in API and AI cost management with real-time usage tracking',
                        'confidence_score': 6.9,
                        'sources': 6,
                        'url': 'https://www.revenium.io/'
                    }
                ],
                'key_insights': [
                    'Market consolidation expected with 5-8 major acquisitions in next 24 months',
                    'Regulatory pressure driving demand for autonomous AI system financial accountability',
                    'Convergence creating $200B+ opportunity in agentic AI financial operations',
                    'Traditional FinOps vendors face disruption risk from AI-native competitors'
                ]
            },
            'kubernetes': {
                'market_segment': 'Kubernetes Fleet Management + AIOps',
                'market_trends': [
                    {
                        'icon': '🤖',
                        'title': 'Scale-Intelligence Convergence',
                        'description': 'Convergence of enterprise Kubernetes scale with AI-powered autonomous operations creating new market category.'
                    },
                    {
                        'icon': '🏢',
                        'title': 'Enterprise AIOps Adoption',
                        'description': 'Fortune 500 companies deploying AI-powered Kubernetes management at scale, with 60% adoption rate in 2024.'
                    },
                    {
                        'icon': '⚡',
                        'title': 'Autonomous Operations',
                        'description': 'Shift from manual cluster management to fully autonomous, self-healing Kubernetes infrastructure.'
                    }
                ],
                'companies': [
                    {
                        'name': 'Amazon EKS',
                        'category': 'leaders',
                        'recent_developments': 'Enhanced DevOps Guru AIOps integration, expanded multi-region support',
                        'market_positioning': 'Leading managed Kubernetes service with enterprise-scale deployments',
                        'confidence_score': 9.2,
                        'sources': 15,
                        'url': 'https://aws.amazon.com/eks/'
                    },
                    {
                        'name': 'IBM Turbonomic',
                        'category': 'leaders',
                        'recent_developments': 'AI-powered automation enhancements, expanded Kubernetes optimization',
                        'market_positioning': 'Enterprise application resource management with predictive analytics',
                        'confidence_score': 8.7,
                        'sources': 12,
                        'url': 'https://www.ibm.com/products/turbonomic'
                    },
                    {
                        'name': 'RealTheory.ai',
                        'category': 'visionaries',
                        'recent_developments': 'Launched autonomous Kubernetes optimization platform, raised $8M seed round',
                        'market_positioning': 'AI-first Kubernetes management focused on autonomous operations',
                        'confidence_score': 6.8,
                        'sources': 6,
                        'url': 'https://realtheory.ai/'
                    },
                    {
                        'name': 'K8sGPT',
                        'category': 'visionaries',
                        'recent_developments': 'Open-source AI diagnostics for Kubernetes, growing enterprise adoption',
                        'market_positioning': 'AI-powered Kubernetes troubleshooting and optimization',
                        'confidence_score': 7.1,
                        'sources': 8,
                        'url': 'https://k8sgpt.ai/'
                    }
                ],
                'key_insights': [
                    'Traditional infrastructure vendors face disruption risk from AI-native Kubernetes platforms',
                    'Market in early innovation phase with more visionaries than established leaders',
                    'Enterprise adoption driving 40% YoY growth in AIOps-enabled Kubernetes management',
                    'Autonomous operations becoming standard for large-scale Kubernetes deployments'
                ]
            },
            'linux_os': {
                'market_segment': 'Kubernetes-Optimized Linux OS',
                'market_trends': [
                    {
                        'icon': '🔒',
                        'title': 'Immutable OS Adoption',
                        'description': 'Security-first, immutable operating systems becoming standard for production Kubernetes deployments.'
                    },
                    {
                        'icon': '📦',
                        'title': 'Container-Native Design',
                        'description': 'Purpose-built container operating systems gaining enterprise traction over general-purpose distributions.'
                    },
                    {
                        'icon': '🛡️',
                        'title': 'Zero-Trust Infrastructure',
                        'description': 'API-only, SSH-free operating systems emerging as security standard for cloud-native workloads.'
                    }
                ],
                'companies': [
                    {
                        'name': 'Talos Linux',
                        'category': 'leaders',
                        'recent_developments': 'Named GigaOm Fast Mover 2025, expanded enterprise partnerships',
                        'market_positioning': 'Leading API-only immutable OS purpose-built for Kubernetes',
                        'confidence_score': 8.8,
                        'sources': 10,
                        'url': 'https://www.siderolabs.com/'
                    },
                    {
                        'name': 'Flatcar Container Linux',
                        'category': 'leaders',
                        'recent_developments': 'Microsoft acquisition integration, enhanced enterprise support',
                        'market_positioning': 'Enterprise-grade immutable OS with automatic updates',
                        'confidence_score': 8.5,
                        'sources': 12,
                        'url': 'https://flatcar-linux.org/'
                    },
                    {
                        'name': 'Kairos',
                        'category': 'visionaries',
                        'recent_developments': 'Launched meta-immutable OS platform, expanded edge computing focus',
                        'market_positioning': 'Community-driven immutable OS with zero-touch provisioning',
                        'confidence_score': 6.5,
                        'sources': 5,
                        'url': 'https://kairos.io/'
                    },
                    {
                        'name': 'Bottlerocket',
                        'category': 'challengers',
                        'recent_developments': 'AWS integration enhancements, expanded container runtime support',
                        'market_positioning': 'AWS-native container OS optimized for cloud workloads',
                        'confidence_score': 7.8,
                        'sources': 9,
                        'url': 'https://aws.amazon.com/bottlerocket/'
                    }
                ],
                'key_insights': [
                    'Purpose-built container operating systems gaining enterprise traction over general-purpose Linux',
                    'Security-first approach driving adoption of immutable, API-only operating systems',
                    'Edge computing requirements accelerating demand for lightweight, autonomous OS platforms',
                    'Traditional Linux distributions losing ground to specialized container-native alternatives'
                ]
            }
        };
        
        return demoData[segment] || demoData['finops'];
    }

    /**
     * Display market intelligence in the UI
     */
    displayMarketIntelligence(intelligence) {
        const contentElement = document.getElementById('intelligence-content');
        const loadingElement = document.getElementById('intelligence-loading');
        
        if (loadingElement) loadingElement.style.display = 'none';
        if (!contentElement) return;

        contentElement.innerHTML = `
            <div class="market-intelligence-header">
                <h2>Market Intelligence</h2>
                <div class="intelligence-controls">
                    <div class="search-box">
                        <input type="text" id="intelligence-search" placeholder="Search companies, news, partnerships..." />
                        <button id="clear-search" class="btn-clear" style="display: none;">✕</button>
                    </div>
                    <button id="refresh-intelligence" class="btn-secondary">
                        <span class="icon">🔄</span> Refresh
                    </button>
                    <button id="export-intelligence" class="btn-secondary">
                        <span class="icon">📊</span> Export
                    </button>
                </div>
            </div>

            <div class="market-trends">
                <h3>Market Trends</h3>
                <div class="trends-grid">
                    ${intelligence.market_trends.map(trend => `
                        <div class="trend-card">
                            <div class="trend-icon">${this.getTrendIcon(trend)}</div>
                            <div class="trend-content">
                                <h4>${this.getTrendTitle(trend)}</h4>
                                <p>${trend.description}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="companies-section">
                <div class="section-header">
                    <h3>Company Intelligence</h3>
                    <div class="filter-controls">
                        <select id="category-filter">
                            <option value="">All Categories</option>
                            <option value="leaders">Leaders</option>
                            <option value="challengers">Challengers</option>
                            <option value="visionaries">Visionaries</option>
                            <option value="niche">Niche Players</option>
                        </select>
                        <select id="highlight-filter">
                            <option value="">All Updates</option>
                            <option value="News">News</option>
                            <option value="Product">Product</option>
                            <option value="Funding">Funding</option>
                            <option value="Partnership">Partnership</option>
                            <option value="Talent">Talent</option>
                            <option value="Customer">Customer</option>
                        </select>
                    </div>
                </div>
                <div class="companies-grid" id="companies-grid">
                    ${intelligence.companies.map(company => this.renderEnhancedCompanyCard(company)).join('')}
                </div>
            </div>

            <div class="key-insights">
                <h3>Key Market Insights</h3>
                <ul class="insights-list">
                    ${intelligence.key_insights.map(insight => `
                        <li class="insight-item">
                            <span class="insight-icon">💡</span>
                            ${insight}
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;

        this.attachEnhancedEventListeners();
    }

    /**
     * Attach event listeners for enhanced functionality
     */
    attachEnhancedEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('intelligence-search');
        const clearSearch = document.getElementById('clear-search');
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase();
                this.filterBySearch(query);
                
                if (clearSearch) {
                    clearSearch.style.display = query ? 'block' : 'none';
                }
            });
        }
        
        if (clearSearch) {
            clearSearch.addEventListener('click', () => {
                searchInput.value = '';
                this.filterBySearch('');
                clearSearch.style.display = 'none';
            });
        }
        
        // Category filter
        const categoryFilter = document.getElementById('category-filter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.filterByCategory(e.target.value);
            });
        }
        
        // Highlight filter
        const highlightFilter = document.getElementById('highlight-filter');
        if (highlightFilter) {
            highlightFilter.addEventListener('change', (e) => {
                this.filterByHighlight(e.target.value);
            });
        }
        
        // Refresh and export
        const refreshBtn = document.getElementById('refresh-intelligence');
        const exportBtn = document.getElementById('export-intelligence');
        
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshIntelligence());
        }
        
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportIntelligence());
        }
        
        // Company expansion
        const expandBtns = document.querySelectorAll('.btn-expand');
        expandBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const companyName = e.target.closest('[data-company]').dataset.company;
                this.expandCompanyDetails(companyName);
            });
        });
    }

    /**
     * Filter companies by search query
     */
    filterBySearch(query) {
        const companyCards = document.querySelectorAll('.company-card');
        
        companyCards.forEach(card => {
            const text = card.textContent.toLowerCase();
            const isVisible = !query || text.includes(query);
            card.style.display = isVisible ? 'block' : 'none';
        });
    }

    /**
     * Filter companies by category
     */
    filterByCategory(category) {
        const companyCards = document.querySelectorAll('.company-card');
        
        companyCards.forEach(card => {
            const cardCategory = card.dataset.category;
            const isVisible = !category || cardCategory === category;
            card.style.display = isVisible ? 'block' : 'none';
        });
    }

    /**
     * Filter companies by highlight type
     */
    filterByHighlight(highlightType) {
        const companyCards = document.querySelectorAll('.company-card');
        
        companyCards.forEach(card => {
            if (!highlightType) {
                card.style.display = 'block';
                return;
            }
            
            const highlights = card.querySelectorAll('.highlight-category');
            const hasHighlight = Array.from(highlights).some(h => h.textContent === highlightType);
            card.style.display = hasHighlight ? 'block' : 'none';
        });
    }

    /**
     * Get highlight icon for category
     */
    getHighlightIcon(category) {
        const icons = {
            'News': '📰',
            'Product': '🚀',
            'Funding': '💰',
            'Partnership': '🤝',
            'Talent': '👥',
            'Customer': '🏢',
            'Risk/Threat': '⚠️',
            'Regulatory': '⚖️',
            'Other': '📋'
        };
        return icons[category] || '📋';
    }

    /**
     * Refresh market intelligence
     */
    async refreshIntelligence() {
        const loadingElement = document.getElementById('intelligence-loading');
        if (loadingElement) {
            loadingElement.style.display = 'block';
        }
        
        try {
            await this.loadMarketIntelligence();
        } catch (error) {
            console.error('Failed to refresh intelligence:', error);
        } finally {
            if (loadingElement) {
                loadingElement.style.display = 'none';
            }
        }
        await this.loadMarketIntelligence();
    }

    /**
     * Export market intelligence report
     */
    exportIntelligence() {
        const intelligence = this.getDemoMarketIntelligence(this.currentSegment);
        const dataStr = JSON.stringify(intelligence, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `${this.currentSegment}_market_intelligence_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    }

    /**
     * Initialize market intelligence system
     */
    async initialize() {
        console.log(`Initializing Universal Market Intelligence for segment: ${this.currentSegment}`);
        
        // Check if the market intelligence section exists
        const section = document.querySelector('.market-intelligence-section');
        if (!section) {
            console.log('No market intelligence section found on this page');
            return;
        }
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.loadMarketIntelligence());
        } else {
            await this.loadMarketIntelligence();
        }
    }
}

// Global instance
let marketIntelligence;

// Auto-initialize when script loads
document.addEventListener('DOMContentLoaded', () => {
    marketIntelligence = new UniversalMarketIntelligence();
    marketIntelligence.initialize();
});
