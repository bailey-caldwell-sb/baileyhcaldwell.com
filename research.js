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
        const footer = document.getElementById('footer');
        
        if (researchPortal) researchPortal.style.display = 'block';
        if (researchHistory) researchHistory.style.display = 'block';
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
            // Get selected provider (no auto option - user must choose)
            const provider = document.getElementById('research-provider')?.value || 'perplexity';
            
            // Start research session
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
            
            // Start progress monitoring
            this.startProgressMonitoring();
            
        } catch (error) {
            console.error('Research start error:', error);
            this.showError('Failed to start research. Please check your connection and try again.');
            this.isResearching = false;
            this.hideProgressSection();
        }
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
        const researchCompanies = [
            'OpenAI', 'Anthropic', 'Perplexity', 'Google', 'Microsoft',
            'Meta', 'Amazon', 'IBM', 'NVIDIA', 'Databricks',
            'Hugging Face', 'Cohere', 'Stability AI', 'Midjourney'
        ];

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
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.numberOneResearch = new NumberOneResearch();
});

// Export for global access
window.NumberOneResearch = NumberOneResearch;
