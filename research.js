/**
 * NumberOne AI Research Interface
 * Integrates with baileyhcaldwell.com design and NumberOne AI backend
 */

class NumberOneResearch {
    constructor() {
        this.apiBaseUrl = 'http://localhost:8000/api'; // NumberOne AI API endpoint
        this.currentSessionId = null;
        this.progressInterval = null;
        this.isResearching = false;
        this.accessGranted = false;
        this.accessCode = 'bailey'; // Access code
        
        this.init();
    }

    init() {
        this.bindAccessEvents();
        this.checkStoredAccess();
        
        // Only initialize research functionality if access is granted
        if (this.accessGranted) {
            this.showResearchPortal();
            this.initializeResearch();
        }
    }

    bindAccessEvents() {
        // Access code form
        const accessSubmit = document.getElementById('access-submit');
        const accessInput = document.getElementById('access-code');

        accessSubmit?.addEventListener('click', () => this.checkAccessCode());
        accessInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.checkAccessCode();
            }
        });
    }

    checkStoredAccess() {
        // Check if access was previously granted (session storage)
        const storedAccess = sessionStorage.getItem('research_access_granted');
        if (storedAccess === 'true') {
            this.accessGranted = true;
        }
    }

    checkAccessCode() {
        const accessInput = document.getElementById('access-code');
        const accessError = document.getElementById('access-error');
        
        if (!accessInput) return;
        
        const enteredCode = accessInput.value.trim().toLowerCase();
        
        if (enteredCode === this.accessCode) {
            // Access granted
            this.accessGranted = true;
            sessionStorage.setItem('research_access_granted', 'true');
            
            this.showResearchPortal();
            this.initializeResearch();
            
            // Clear the input
            accessInput.value = '';
            if (accessError) accessError.style.display = 'none';
            
        } else {
            // Access denied
            if (accessError) {
                accessError.style.display = 'block';
                setTimeout(() => {
                    accessError.style.display = 'none';
                }, 3000);
            }
            
            // Clear the input and shake effect
            accessInput.value = '';
            accessInput.style.animation = 'shake 0.5s ease-in-out';
            setTimeout(() => {
                accessInput.style.animation = '';
            }, 500);
        }
    }

    showResearchPortal() {
        // Hide access gate
        const accessGate = document.getElementById('access-gate');
        if (accessGate) accessGate.style.display = 'none';
        
        // Show research portal
        const researchPortal = document.getElementById('research-portal');
        const researchHistory = document.getElementById('research-history');
        const marketIntelligence = document.getElementById('market-intelligence');
        const footer = document.getElementById('footer');
        
        if (researchPortal) researchPortal.style.display = 'block';
        if (researchHistory) researchHistory.style.display = 'block';
        if (marketIntelligence) marketIntelligence.style.display = 'block';
        if (footer) footer.style.display = 'block';
    }

    initializeResearch() {
        this.bindEvents();
        this.loadResearchHistory();
        this.setupAdvancedOptions();
        
        // Initialize news ticker with research-specific companies
        this.initializeNewsTicker();
    }

    bindEvents() {
        // Main research form
        const startButton = document.getElementById('start-research');
        const researchInput = document.getElementById('research-topic');
        const toggleOptions = document.getElementById('toggle-options');

        startButton?.addEventListener('click', () => this.startResearch());
        researchInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !this.isResearching) {
                this.startResearch();
            }
        });
        toggleOptions?.addEventListener('click', () => this.toggleAdvancedOptions());

        // Export buttons
        document.getElementById('export-pdf')?.addEventListener('click', () => this.exportToPDF());
        document.getElementById('export-markdown')?.addEventListener('click', () => this.exportToMarkdown());
        document.getElementById('share-results')?.addEventListener('click', () => this.shareResults());
    }

    setupAdvancedOptions() {
        // Set default values based on user preferences
        const depthSelect = document.getElementById('research-depth');
        const providerSelect = document.getElementById('research-provider');
        
        // Load saved preferences from localStorage
        const savedPrefs = this.loadUserPreferences();
        if (savedPrefs) {
            if (depthSelect) depthSelect.value = savedPrefs.depth || '5';
            if (providerSelect) providerSelect.value = savedPrefs.provider || 'perplexity';
        }
    }

    toggleAdvancedOptions() {
        const options = document.getElementById('advanced-options');
        const toggle = document.getElementById('toggle-options');
        
        if (options && toggle) {
            const isVisible = options.classList.contains('show');
            
            if (isVisible) {
                options.classList.remove('show');
                toggle.classList.remove('active');
            } else {
                options.classList.add('show');
                toggle.classList.add('active');
            }
        }
    }

    async startResearch() {
        if (this.isResearching) return;

        const topic = document.getElementById('research-topic')?.value?.trim();
        if (!topic) {
            this.showError('Please enter a research topic');
            return;
        }

        this.isResearching = true;
        this.saveUserPreferences();
        
        // Show progress section
        this.showProgressSection();
        
        // Hide results section if visible
        const resultsSection = document.getElementById('research-results');
        if (resultsSection) resultsSection.style.display = 'none';

        try {
            // Always use demo mode for now since backend isn't deployed
            console.log('Starting demo research for:', topic);
            await this.startDemoResearch(topic);
            
        } catch (error) {
            console.error('Research start error:', error);
            this.showError('Failed to start research. Please try again.');
            this.isResearching = false;
            this.hideProgressSection();
        }
    }

    async checkBackendAvailability() {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);
            
            const response = await fetch(`${this.apiBaseUrl}/health`, { 
                method: 'GET',
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            return response.ok;
        } catch (error) {
            console.log('Backend unavailable, using demo mode:', error.message);
            return false;
        }
    }

    async startRealResearch(topic) {
        const provider = document.getElementById('research-provider')?.value || 'perplexity';
        
        const sessionData = await this.callAPI('/research/start', {
            method: 'POST',
            body: JSON.stringify({
                topic: topic,
                depth: parseInt(document.getElementById('research-depth')?.value || '5'),
                provider: provider,
                custom_sources: document.getElementById('custom-sources')?.value?.split(',').map(s => s.trim()).filter(s => s) || []
            })
        });

        this.currentSessionId = sessionData.session_id;
        this.startProgressMonitoring();
    }

    async startDemoResearch(topic) {
        this.currentSessionId = 'demo-' + Date.now();
        
        // Simulate research progress
        let progress = 0;
        const steps = [
            { step: 1, progress: 25, message: 'Analyzing topic...' },
            { step: 2, progress: 50, message: 'Collecting sources...' },
            { step: 3, progress: 75, message: 'AI analysis in progress...' },
            { step: 4, progress: 100, message: 'Generating report...' }
        ];

        for (const stepData of steps) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            this.updateProgress(stepData.progress, stepData.message);
            this.updateProgressSteps(stepData.step);
        }

        // Show demo results
        await new Promise(resolve => setTimeout(resolve, 1000));
        this.displayDemoResults(topic);
        this.isResearching = false;
        this.hideProgressSection();
    }

    displayDemoResults(topic) {
        const demoResults = {
            report: `# Research Report: ${topic}

## Executive Summary
This is a demonstration of the NumberOne AI Research Portal. In a live environment with backend connectivity, this would contain comprehensive research findings powered by Perplexity AI or SerpApi+Firecrawl.

## Key Findings
- **Market Overview**: Detailed analysis would appear here
- **Trends & Insights**: Current market trends and projections  
- **Competitive Landscape**: Key players and market positioning
- **Recommendations**: Strategic recommendations based on research

## Methodology
This research would typically involve:
1. Multi-source data collection
2. AI-powered analysis and synthesis
3. Citation verification and credibility scoring
4. Professional report generation

*Note: This is demo content. Connect the NumberOne AI backend for live research capabilities.*`,
            sources: [
                {
                    title: "Demo Source 1 - Industry Report",
                    url: "https://example.com/source1",
                    credibility_score: 9
                },
                {
                    title: "Demo Source 2 - Market Analysis", 
                    url: "https://example.com/source2",
                    credibility_score: 8
                }
            ],
            duration: 180,
            provider: "Demo Mode"
        };

        this.displayResults(demoResults);
    }

    showProgressSection() {
        const progressSection = document.getElementById('research-progress');
        if (progressSection) {
            progressSection.style.display = 'block';
            progressSection.scrollIntoView({ behavior: 'smooth' });
        }

        // Reset progress indicators
        this.updateProgress(0, 'Initializing research...');
        this.resetProgressSteps();
    }

    hideProgressSection() {
        const progressSection = document.getElementById('research-progress');
        if (progressSection) {
            progressSection.style.display = 'none';
        }
    }

    startProgressMonitoring() {
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
        }

        this.progressInterval = setInterval(async () => {
            if (!this.currentSessionId) return;

            try {
                const status = await this.callAPI(`/research/status/${this.currentSessionId}`);
                
                this.updateProgress(status.progress, status.status_message);
                this.updateProgressSteps(status.current_step);

                if (status.completed) {
                    clearInterval(this.progressInterval);
                    this.progressInterval = null;
                    await this.handleResearchComplete(status);
                }
                
                if (status.error) {
                    clearInterval(this.progressInterval);
                    this.progressInterval = null;
                    this.showError(status.error);
                    this.isResearching = false;
                    this.hideProgressSection();
                }
                
            } catch (error) {
                console.error('Progress monitoring error:', error);
                // Continue monitoring unless it's a critical error
            }
        }, 2000); // Check every 2 seconds
    }

    updateProgress(percentage, statusMessage) {
        const progressFill = document.getElementById('progress-fill');
        const progressPercentage = document.getElementById('progress-percentage');
        const progressStatus = document.getElementById('progress-status');

        if (progressFill) progressFill.style.width = `${percentage}%`;
        if (progressPercentage) progressPercentage.textContent = `${Math.round(percentage)}%`;
        if (progressStatus) progressStatus.textContent = statusMessage;
    }

    resetProgressSteps() {
        const steps = document.querySelectorAll('.step');
        steps.forEach(step => {
            step.classList.remove('active', 'completed');
        });
    }

    updateProgressSteps(currentStep) {
        const steps = document.querySelectorAll('.step');
        
        steps.forEach((step, index) => {
            const stepNumber = index + 1;
            
            if (stepNumber < currentStep) {
                step.classList.remove('active');
                step.classList.add('completed');
            } else if (stepNumber === currentStep) {
                step.classList.remove('completed');
                step.classList.add('active');
            } else {
                step.classList.remove('active', 'completed');
            }
        });
    }

    async handleResearchComplete(status) {
        this.isResearching = false;
        
        try {
            // Get full research results
            const results = await this.callAPI(`/research/results/${this.currentSessionId}`);
            
            // Hide progress section
            this.hideProgressSection();
            
            // Show results section
            this.displayResults(results);
            
            // Update research history
            this.loadResearchHistory();
            
        } catch (error) {
            console.error('Failed to load research results:', error);
            this.showError('Research completed but failed to load results. Please try refreshing.');
        }
    }

    displayResults(results) {
        const resultsSection = document.getElementById('research-results');
        const reportContainer = document.getElementById('research-report');
        const citationsContainer = document.getElementById('citations-list');
        const resultsMeta = document.getElementById('results-meta');

        if (!resultsSection || !reportContainer || !citationsContainer) return;

        // Show results section
        resultsSection.style.display = 'block';
        resultsSection.scrollIntoView({ behavior: 'smooth' });

        // Update metadata
        if (resultsMeta) {
            const duration = results.duration ? `${Math.round(results.duration / 60)} minutes` : 'Unknown duration';
            const sourceCount = results.sources?.length || 0;
            const provider = results.provider || 'Unknown';
            
            resultsMeta.innerHTML = `
                <div>Research completed in ${duration}</div>
                <div>${sourceCount} sources analyzed • Provider: ${provider}</div>
            `;
        }

        // Display research report
        reportContainer.innerHTML = this.formatResearchReport(results.report);

        // Display citations
        if (results.sources && results.sources.length > 0) {
            citationsContainer.innerHTML = results.sources.map((source, index) => `
                <div class="citation-item">
                    <div class="citation-title">${source.title || `Source ${index + 1}`}</div>
                    <a href="${source.url}" target="_blank" class="citation-url">${source.url}</a>
                    ${source.credibility_score ? `<div class="citation-credibility">Credibility: ${source.credibility_score}/10</div>` : ''}
                </div>
            `).join('');
        } else {
            citationsContainer.innerHTML = '<div class="citation-item">No sources available</div>';
        }

        // Store results for export
        this.currentResults = results;
    }

    formatResearchReport(report) {
        if (!report) return '<p>No report content available.</p>';
        
        // Convert markdown-like formatting to HTML
        let formatted = report
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/^\* (.*$)/gim, '<li>$1</li>')
            .replace(/^(\d+)\. (.*$)/gim, '<li>$1. $2</li>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/^(?!<[h|l|p])/gim, '<p>')
            .replace(/(?<![h|l|p]>)$/gim, '</p>');

        // Wrap consecutive list items in ul tags
        formatted = formatted.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
        
        return formatted;
    }

    async loadResearchHistory() {
        try {
            const history = await this.callAPI('/research/history?limit=6');
            const historyGrid = document.getElementById('history-grid');
            
            if (!historyGrid || !history.sessions) return;

            if (history.sessions.length === 0) {
                historyGrid.innerHTML = '<div class="history-item"><div class="history-topic">No research history yet</div><div class="history-preview">Start your first research session above!</div></div>';
                return;
            }

            historyGrid.innerHTML = history.sessions.map(session => `
                <div class="history-item" onclick="window.numberOneResearch.loadHistorySession('${session.session_id}')">
                    <div class="history-topic">${session.topic}</div>
                    <div class="history-meta">
                        <span>${new Date(session.created_at).toLocaleDateString()}</span>
                        <span>${session.provider || 'Unknown'}</span>
                    </div>
                    <div class="history-preview">${session.preview || 'Click to view full research results...'}</div>
                </div>
            `).join('');
            
        } catch (error) {
            console.error('Failed to load research history:', error);
        }
    }

    async loadHistorySession(sessionId) {
        try {
            const results = await this.callAPI(`/research/results/${sessionId}`);
            this.displayResults(results);
        } catch (error) {
            console.error('Failed to load historical session:', error);
            this.showError('Failed to load research session');
        }
    }

    async exportToPDF() {
        if (!this.currentResults) {
            this.showError('No research results to export');
            return;
        }

        try {
            const response = await this.callAPI(`/research/export/${this.currentSessionId}/pdf`, {
                method: 'GET',
                headers: { 'Accept': 'application/pdf' }
            });
            
            // Create download link
            const blob = new Blob([response], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `research-${this.currentSessionId}.pdf`;
            a.click();
            window.URL.revokeObjectURL(url);
            
        } catch (error) {
            console.error('PDF export error:', error);
            this.showError('Failed to export PDF');
        }
    }

    async exportToMarkdown() {
        if (!this.currentResults) {
            this.showError('No research results to export');
            return;
        }

        try {
            const response = await this.callAPI(`/research/export/${this.currentSessionId}/markdown`);
            
            // Create download link
            const blob = new Blob([response.content], { type: 'text/markdown' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `research-${this.currentSessionId}.md`;
            a.click();
            window.URL.revokeObjectURL(url);
            
        } catch (error) {
            console.error('Markdown export error:', error);
            this.showError('Failed to export Markdown');
        }
    }

    async shareResults() {
        if (!this.currentResults) {
            this.showError('No research results to share');
            return;
        }

        try {
            const shareData = await this.callAPI(`/research/share/${this.currentSessionId}`, {
                method: 'POST'
            });
            
            // Copy share URL to clipboard
            await navigator.clipboard.writeText(shareData.share_url);
            this.showSuccess('Share link copied to clipboard!');
            
        } catch (error) {
            console.error('Share error:', error);
            this.showError('Failed to create share link');
        }
    }

    initializeNewsTicker() {
        // Define research-related companies for news ticker
        let researchCompanies = [
            'OpenAI', 'Anthropic', 'Perplexity', 'Google', 'Microsoft',
            'Meta', 'Amazon', 'IBM', 'NVIDIA', 'Databricks',
            'Hugging Face', 'Cohere', 'Stability AI', 'Midjourney'
        ];

        // Check if this is the MCP analysis page and use MCP-specific companies
        if (document.body.getAttribute('data-analysis-type') === 'mcp') {
            researchCompanies = [
                'Anthropic', 'Microsoft', 'OpenAI', 'Cloudflare', 'Obot AI',
                'Block', 'MongoDB', 'Stripe', 'Alpic', 'Archestra',
                'Google', 'Salesforce', 'Zapier', 'Notion', 'FastMCP'
            ];
        }

        // Set up news ticker if available
        if (typeof setNewsTickerApiKeys === 'function' && typeof window.newsTickerCompanies === 'undefined') {
            window.newsTickerCompanies = researchCompanies;
        }
    }

    saveUserPreferences() {
        const preferences = {
            depth: document.getElementById('research-depth')?.value,
            provider: document.getElementById('research-provider')?.value,
            custom_sources: document.getElementById('custom-sources')?.value
        };
        
        localStorage.setItem('numberone_research_prefs', JSON.stringify(preferences));
    }

    loadUserPreferences() {
        const saved = localStorage.getItem('numberone_research_prefs');
        return saved ? JSON.parse(saved) : null;
    }

    async callAPI(endpoint, options = {}) {
        const url = `${this.apiBaseUrl}${endpoint}`;
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };

        const response = await fetch(url, { ...defaultOptions, ...options });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
            throw new Error(errorData.error || `HTTP ${response.status}`);
        }

        // Handle different response types
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        } else if (contentType && contentType.includes('application/pdf')) {
            return await response.arrayBuffer();
        } else {
            return await response.text();
        }
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️'}</span>
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        // Add styles if not already present
        if (!document.getElementById('notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 10000;
                    max-width: 400px;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                    animation: slideInRight 0.3s ease;
                }
                .notification-error { border-left: 4px solid #ff6b6b; }
                .notification-success { border-left: 4px solid #51cf66; }
                .notification-info { border-left: 4px solid #339af0; }
                .notification-content {
                    display: flex;
                    align-items: center;
                    padding: 1rem;
                    gap: 0.75rem;
                }
                .notification-message { flex: 1; color: #495057; }
                .notification-close {
                    background: none;
                    border: none;
                    font-size: 1.2rem;
                    cursor: pointer;
                    color: #868e96;
                }
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(styles);
        }

        document.body.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    async loadMarketIntelligence(segment = 'finops') {
        const loadingElement = document.getElementById('intelligence-loading');
        const contentElement = document.getElementById('intelligence-content');
        
        if (loadingElement) loadingElement.style.display = 'block';
        if (contentElement) contentElement.style.display = 'none';
        
        try {
            // Try to fetch from NumberOne AI backend with segment parameter
            const response = await fetch(`${this.apiBaseUrl}/api/research/market-intelligence?segment=${segment}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.intelligence) {
                    this.displayMarketIntelligence(data.intelligence);
                    return;
                }
            }
        } catch (error) {
            console.log('Backend unavailable, using demo data');
        }
        
        // Fallback to demo data with segment support
        const demoIntelligence = this.getDemoMarketIntelligence(segment);
        this.displayMarketIntelligence(demoIntelligence);
    }

    getDemoMarketIntelligence(segment = 'finops') {
        const demoData = {
            'finops': {
                'market_segment': 'finops',
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
                        'technology_approach': 'Traditional rule-based optimization with new AI/ML capabilities for anomaly detection',
                        'confidence_score': 8.5,
                        'sources': 12,
                        'url': 'https://www.flexera.com/'
                    },
                    {
                        'name': 'Pay-i',
                        'category': 'visionaries',
                        'recent_developments': 'Raised $15M Series A, launched agentic AI cost management platform',
                        'market_positioning': 'AI-native FinOps focused on autonomous agent economics and LLM cost optimization',
                        'technology_approach': 'Purpose-built for agentic AI with real-time cost attribution and agent-to-agent billing',
                        'confidence_score': 7.2,
                        'sources': 8,
                        'url': 'https://www.pay-i.com/'
                    },
                    {
                        'name': 'Datadog',
                        'category': 'challengers',
                        'recent_developments': 'Enhanced cloud cost management with AI insights, expanded multi-cloud support',
                        'market_positioning': 'Infrastructure monitoring leader expanding into FinOps with integrated observability',
                        'technology_approach': 'Leveraging existing monitoring infrastructure for cost visibility and optimization',
                        'confidence_score': 8.8,
                        'sources': 15,
                        'url': 'https://www.datadoghq.com/'
                    },
                    {
                        'name': 'Revenium',
                        'category': 'visionaries',
                        'recent_developments': 'Launched API cost management platform, focusing on AI/ML workload optimization',
                        'market_positioning': 'Specialized in API and AI cost management with real-time usage tracking',
                        'technology_approach': 'API-first architecture with advanced analytics for AI workload cost optimization',
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
                'market_segment': 'kubernetes',
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
                        'technology_approach': 'Cloud-native with integrated AI/ML services and predictive scaling',
                        'confidence_score': 9.2,
                        'sources': 15,
                        'url': 'https://aws.amazon.com/eks/'
                    },
                    {
                        'name': 'IBM Turbonomic',
                        'category': 'leaders',
                        'recent_developments': 'AI-powered automation enhancements, expanded Kubernetes optimization',
                        'market_positioning': 'Enterprise application resource management with predictive analytics',
                        'technology_approach': 'AI-driven resource optimization with real-time workload analysis',
                        'confidence_score': 8.7,
                        'sources': 12,
                        'url': 'https://www.ibm.com/products/turbonomic'
                    },
                    {
                        'name': 'RealTheory.ai',
                        'category': 'visionaries',
                        'recent_developments': 'Launched autonomous Kubernetes optimization platform, raised $8M seed round',
                        'market_positioning': 'AI-first Kubernetes management focused on autonomous operations',
                        'technology_approach': 'Machine learning-driven resource optimization and predictive scaling',
                        'confidence_score': 6.8,
                        'sources': 6,
                        'url': 'https://realtheory.ai/'
                    },
                    {
                        'name': 'K8sGPT',
                        'category': 'visionaries',
                        'recent_developments': 'Open-source AI diagnostics for Kubernetes, growing enterprise adoption',
                        'market_positioning': 'AI-powered Kubernetes troubleshooting and optimization',
                        'technology_approach': 'LLM-based cluster analysis and automated problem resolution',
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
                'market_segment': 'linux_os',
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
                        'technology_approach': 'Zero SSH, immutable filesystem, Kubernetes-native architecture',
                        'confidence_score': 8.8,
                        'sources': 10,
                        'url': 'https://www.siderolabs.com/'
                    },
                    {
                        'name': 'Flatcar Container Linux',
                        'category': 'leaders',
                        'recent_developments': 'Microsoft acquisition integration, enhanced enterprise support',
                        'market_positioning': 'Enterprise-grade immutable OS with automatic updates',
                        'technology_approach': 'Immutable filesystem with transactional updates and container focus',
                        'confidence_score': 8.5,
                        'sources': 12,
                        'url': 'https://flatcar-linux.org/'
                    },
                    {
                        'name': 'Kairos',
                        'category': 'visionaries',
                        'recent_developments': 'Launched meta-immutable OS platform, expanded edge computing focus',
                        'market_positioning': 'Community-driven immutable OS with zero-touch provisioning',
                        'technology_approach': 'Meta-immutable architecture with QR code provisioning and k3s integration',
                        'confidence_score': 6.5,
                        'sources': 5,
                        'url': 'https://kairos.io/'
                    },
                    {
                        'name': 'Bottlerocket',
                        'category': 'challengers',
                        'recent_developments': 'AWS integration enhancements, expanded container runtime support',
                        'market_positioning': 'AWS-native container OS optimized for cloud workloads',
                        'technology_approach': 'Minimal attack surface with read-only root filesystem',
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
            },
            'mcp': {
                'market_segment': 'mcp',
                'market_trends': [
                    {
                        'icon': '🤖',
                        'title': 'AI Agent Orchestration',
                        'description': 'Growing demand for multi-agent systems driving MCP adoption for context sharing and tool discovery across enterprise AI deployments.'
                    },
                    {
                        'icon': '🔒',
                        'title': 'Enterprise Security Focus',
                        'description': 'Security, compliance, and governance becoming table stakes for enterprise MCP adoption with 300% growth in security-first implementations.'
                    },
                    {
                        'icon': '🌐',
                        'title': 'Protocol Standardization',
                        'description': 'Industry moving toward standardized MCP implementations for interoperability, with Anthropic leading protocol development.'
                    }
                ],
                'companies': [
                    {
                        'name': 'Anthropic',
                        'category': 'leaders',
                        'recent_developments': 'Released MCP 1.0 with enhanced security features, maintains protocol leadership',
                        'market_positioning': 'Protocol creator with market-defining influence and technical excellence across AI ecosystem',
                        'technology_approach': 'Foundational protocol development with focus on safety and enterprise adoption',
                        'confidence_score': 9.5,
                        'sources': 25,
                        'url': 'https://www.anthropic.com/'
                    },
                    {
                        'name': 'Microsoft',
                        'category': 'leaders',
                        'recent_developments': 'Integrated MCP across Azure AI services and Windows 11, comprehensive enterprise platform',
                        'market_positioning': 'Comprehensive enterprise platform integration with proven deployment capabilities',
                        'technology_approach': 'Full-stack integration across cloud, desktop, and enterprise AI services',
                        'confidence_score': 8.2,
                        'sources': 18,
                        'url': 'https://www.microsoft.com/'
                    },
                    {
                        'name': 'Obot AI',
                        'category': 'leaders',
                        'recent_developments': 'Raised $35M Series A for enterprise MCP platform, comprehensive solution approach',
                        'market_positioning': 'Enterprise-focused MCP platform with comprehensive agent management capabilities',
                        'technology_approach': 'Purpose-built enterprise MCP platform with security and governance focus',
                        'confidence_score': 8.4,
                        'sources': 12,
                        'url': 'https://www.obot.ai/'
                    },
                    {
                        'name': 'Alpic',
                        'category': 'visionaries',
                        'recent_developments': 'Secured $6M for first MCP-native cloud platform with innovative architecture',
                        'market_positioning': 'First MCP-native cloud platform addressing infrastructure and deployment challenges',
                        'technology_approach': 'Cloud-native MCP infrastructure with focus on scalability and developer experience',
                        'confidence_score': 8.7,
                        'sources': 8,
                        'url': 'https://www.alpic.com/'
                    }
                ],
                'key_insights': [
                    'Market maturity indicated by average scores of 7.2 for both execution and vision',
                    'Anthropic maintains dominant positioning as protocol creator and technical leader',
                    'Enterprise adoption driven by security, compliance, and governance requirements',
                    'Network effects creating winner-take-most scenarios in infrastructure segments',
                    '$44M+ in recent funding rounds indicates strong investor confidence in ecosystem'
                ]
            }
        };

        return demoData[segment] || demoData['finops'];
    }

    displayMarketIntelligence(intelligence) {
        const contentElement = document.getElementById('intelligence-content');
        const loadingElement = document.getElementById('intelligence-loading');
        
        if (!contentElement) return;
        
        contentElement.style.display = 'block';
        if (loadingElement) loadingElement.style.display = 'none';
        
        const marketSegment = intelligence.market_segment;
        const marketTrends = intelligence.market_trends;
        const companies = intelligence.companies;
        const keyInsights = intelligence.key_insights;
        
        contentElement.innerHTML = `
            <h2>Market Intelligence: ${marketSegment}</h2>
            <div class="market-trends">
                ${marketTrends.map(trend => `
                    <div class="trend-item">
                        <div class="trend-icon">${trend.icon}</div>
                        <div class="trend-title">${trend.title}</div>
                        <div class="trend-description">${trend.description}</div>
                    </div>
                `).join('')}
            </div>
            <div class="companies">
                ${companies.map(company => `
                    <div class="company-item">
                        <div class="company-name">${company.name}</div>
                        <div class="company-category">${company.category}</div>
                        <div class="company-recent-developments">${company.recent_developments}</div>
                        <div class="company-market-positioning">${company.market_positioning}</div>
                        <div class="company-technology-approach">${company.technology_approach}</div>
                        <div class="company-confidence-score">${company.confidence_score}/10</div>
                        <div class="company-sources">${company.sources} sources</div>
                        <a href="${company.url}" target="_blank" class="company-url">${company.url}</a>
                    </div>
                `).join('')}
            </div>
            <div class="key-insights">
                ${keyInsights.map(insight => `
                    <div class="insight-item">${insight}</div>
                `).join('')}
            </div>
        `;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.numberOneResearch = new NumberOneResearch();
});

// Export for global access
window.NumberOneResearch = NumberOneResearch;
