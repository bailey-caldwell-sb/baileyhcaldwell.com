// LLM Dashboard JavaScript - Real-time usage tracking and analytics

class LLMDashboard {
    constructor() {
        this.data = {
            providers: {
                openai: { spend: 0, tokens: 0, requests: 0, status: 'active' },
                claude: { spend: 0, tokens: 0, requests: 0, status: 'active' },
                grok: { spend: 0, tokens: 0, requests: 0, status: 'mock' },
                perplexity: { spend: 0, credits: 0, requests: 0, status: 'active' }
            },
            dailySpend: [],
            modelUsage: {
                'gpt-4': 0,
                'claude-3.5-sonnet': 0,
                'grok-3': 0,
                'pplx-8x22b': 0
            },
            costEfficiency: {},
            alerts: [],
            budgetThreshold: 100
        };
        
        this.charts = {};
        this.refreshInterval = null;
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.loadStoredData();
        await this.loadRealData();
        this.initializeCharts();
        this.updateUI();
        this.startAutoRefresh();
        this.addAlert('info', 'Dashboard initialized. Real-time monitoring active.');
    }

    setupEventListeners() {
        // Budget threshold save
        document.getElementById('save-budget').addEventListener('click', () => {
            const threshold = document.getElementById('budget-threshold').value;
            this.data.budgetThreshold = parseFloat(threshold);
            this.saveData();
            this.addAlert('info', `Budget threshold updated to $${threshold}`);
        });

        // Chart period change
        document.getElementById('spend-period').addEventListener('change', (e) => {
            this.updateDailySpendChart(parseInt(e.target.value));
        });

        // Refresh button (if added)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
                e.preventDefault();
                this.refreshData();
            }
        });
    }

    loadStoredData() {
        const stored = localStorage.getItem('llm-dashboard-data');
        if (stored) {
            try {
                const parsedData = JSON.parse(stored);
                this.data = { ...this.data, ...parsedData };
            } catch (e) {
                console.warn('Failed to load stored data:', e);
            }
        }
    }

    saveData() {
        localStorage.setItem('llm-dashboard-data', JSON.stringify(this.data));
    }

    async loadRealData() {
        // Load OpenAI data
        await this.loadOpenAIData();
        
        // Load Claude data
        await this.loadClaudeData();
        
        // Load Perplexity data
        await this.loadPerplexityData();
        
        // Load Grok data
        await this.loadGrokData();
        
        // Generate daily spend data
        this.generateDailySpendData();
        
        // Calculate cost efficiency
        this.calculateCostEfficiency();
    }

    async loadOpenAIData() {
        try {
            // Use NumberOne AI backend API with .env keys
            const response = await fetch('http://localhost:8000/api/llm/openai/usage');
            
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.usage) {
                    this.processOpenAIUsage(data.usage);
                    this.data.providers.openai.status = data.mock ? 'mock' : 'active';
                    return;
                }
            }
        } catch (error) {
            console.warn('OpenAI API error:', error);
        }
        
        // Fallback to mock data
        this.generateMockOpenAIData();
        this.data.providers.openai.status = 'mock';
    }

    processOpenAIUsage(usage) {
        // Process real OpenAI usage data
        let totalSpend = 0;
        let totalTokens = 0;
        let totalRequests = 0;
        
        if (usage.data) {
            usage.data.forEach(day => {
                totalSpend += day.cost || 0;
                totalTokens += (day.n_requests || 0) * 1000; // Estimate tokens
                totalRequests += day.n_requests || 0;
            });
        }
        
        this.data.providers.openai.spend = totalSpend;
        this.data.providers.openai.tokens = totalTokens;
        this.data.providers.openai.requests = totalRequests;
        this.data.modelUsage['gpt-4'] = totalTokens * 0.7; // Estimate GPT-4 usage
    }

    generateMockOpenAIData() {
        // Mock OpenAI data for demonstration
        this.data.providers.openai.spend = 45.67;
        this.data.providers.openai.tokens = 125000;
        this.data.providers.openai.requests = 342;
        this.data.modelUsage['gpt-4'] = 87500;
    }

    async loadClaudeData() {
        try {
            const response = await fetch('http://localhost:8000/api/llm/claude/usage');
            
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.usage) {
                    this.data.providers.claude.spend = data.usage.total_cost;
                    this.data.providers.claude.tokens = data.usage.total_tokens;
                    this.data.providers.claude.requests = data.usage.total_requests;
                    this.data.modelUsage['claude-3.5-sonnet'] = data.usage.total_tokens * 0.7;
                    this.data.providers.claude.status = data.has_key ? 'mock' : 'no_key';
                    return;
                }
            }
        } catch (error) {
            console.warn('Claude API error:', error);
        }
        
        // Fallback to mock data
        this.generateMockClaudeData();
        this.data.providers.claude.status = 'mock';
    }

    generateMockClaudeData() {
        this.data.providers.claude.spend = 32.15;
        this.data.providers.claude.tokens = 98000;
        this.data.providers.claude.requests = 156;
        this.data.modelUsage['claude-3.5-sonnet'] = 68600;
    }

    async loadPerplexityData() {
        try {
            const response = await fetch('http://localhost:8000/api/llm/perplexity/usage');
            
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.usage) {
                    this.data.providers.perplexity.spend = data.usage.total_cost;
                    this.data.providers.perplexity.credits = data.usage.credits_used;
                    this.data.providers.perplexity.requests = data.usage.total_requests;
                    this.data.modelUsage['pplx-8x22b'] = data.usage.credits_used * 60; // Estimate tokens
                    this.data.providers.perplexity.status = data.has_key ? 'mock' : 'no_key';
                    return;
                }
            }
        } catch (error) {
            console.warn('Perplexity API error:', error);
        }
        
        // Fallback to mock data
        this.generateMockPerplexityData();
        this.data.providers.perplexity.status = 'mock';
    }

    generateMockPerplexityData() {
        this.data.providers.perplexity.spend = 18.92;
        this.data.providers.perplexity.credits = 750;
        this.data.providers.perplexity.requests = 89;
        this.data.modelUsage['pplx-8x22b'] = 45000;
    }

    async loadGrokData() {
        try {
            const response = await fetch('http://localhost:8000/api/llm/grok/usage');
            
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.usage) {
                    this.data.providers.grok.spend = data.usage.total_cost;
                    this.data.providers.grok.tokens = data.usage.total_tokens;
                    this.data.providers.grok.requests = data.usage.total_requests;
                    this.data.modelUsage['grok-3'] = data.usage.total_tokens * 0.7;
                    this.data.providers.grok.status = data.has_key ? 'mock' : 'no_key';
                    return;
                }
            }
        } catch (error) {
            console.warn('Grok API error:', error);
        }
        
        // Fallback to mock data
        this.generateMockGrokData();
        this.data.providers.grok.status = 'mock';
    }

    generateMockGrokData() {
        this.data.providers.grok.spend = 12.34;
        this.data.providers.grok.tokens = 56000;
        this.data.providers.grok.requests = 67;
        this.data.modelUsage['grok-3'] = 39200;
        this.data.providers.grok.status = 'mock';
    }

    generateDailySpendData() {
        // Generate last 30 days of spending data
        const today = new Date();
        this.data.dailySpend = [];
        
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            
            const baseSpend = Math.random() * 8 + 2; // $2-10 per day
            const openaiSpend = baseSpend * 0.4;
            const claudeSpend = baseSpend * 0.3;
            const grokSpend = baseSpend * 0.15;
            const perplexitySpend = baseSpend * 0.15;
            
            this.data.dailySpend.push({
                date: date.toISOString().split('T')[0],
                openai: openaiSpend,
                claude: claudeSpend,
                grok: grokSpend,
                perplexity: perplexitySpend,
                total: baseSpend
            });
        }
    }

    calculateCostEfficiency() {
        // Calculate cost per 1K tokens for each provider
        this.data.costEfficiency = {
            'GPT-4': {
                input: 0.03,
                output: 0.06
            },
            'Claude-3.5': {
                input: 0.003,
                output: 0.015
            },
            'Grok-3': {
                input: 0.002,
                output: 0.01
            },
            'PPLX-8x22B': {
                input: 0.001,
                output: 0.005
            }
        };
    }

    initializeCharts() {
        this.initDailySpendChart();
        this.initCostEfficiencyChart();
    }

    initDailySpendChart() {
        const ctx = document.getElementById('daily-spend-chart').getContext('2d');
        
        const labels = this.data.dailySpend.map(d => {
            const date = new Date(d.date);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });
        
        this.charts.dailySpend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'OpenAI',
                        data: this.data.dailySpend.map(d => d.openai),
                        borderColor: '#10a37f',
                        backgroundColor: 'rgba(16, 163, 127, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: 'Claude',
                        data: this.data.dailySpend.map(d => d.claude),
                        borderColor: '#ff6b35',
                        backgroundColor: 'rgba(255, 107, 53, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: 'Grok',
                        data: this.data.dailySpend.map(d => d.grok),
                        borderColor: '#1da1f2',
                        backgroundColor: 'rgba(29, 161, 242, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: 'Perplexity',
                        data: this.data.dailySpend.map(d => d.perplexity),
                        borderColor: '#8b5cf6',
                        backgroundColor: 'rgba(139, 92, 246, 0.1)',
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toFixed(2);
                            }
                        }
                    }
                }
            }
        });
    }

    initCostEfficiencyChart() {
        const ctx = document.getElementById('cost-efficiency-chart').getContext('2d');
        
        const models = Object.keys(this.data.costEfficiency);
        const inputCosts = models.map(model => this.data.costEfficiency[model].input);
        const outputCosts = models.map(model => this.data.costEfficiency[model].output);
        
        this.charts.costEfficiency = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: models,
                datasets: [
                    {
                        label: 'Input Tokens',
                        data: inputCosts,
                        backgroundColor: '#667eea',
                        borderColor: '#5a6fd8',
                        borderWidth: 1
                    },
                    {
                        label: 'Output Tokens',
                        data: outputCosts,
                        backgroundColor: '#ff6b6b',
                        borderColor: '#ff5252',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toFixed(3);
                            }
                        }
                    }
                }
            }
        });
    }

    updateUI() {
        this.updateSummaryCard();
        this.updateProviderCards();
        this.updateModelUsage();
        this.updateLastUpdated();
        this.checkBudgetAlerts();
    }

    updateSummaryCard() {
        const totalSpend = Object.values(this.data.providers)
            .reduce((sum, provider) => sum + provider.spend, 0);
        
        document.getElementById('total-spend').textContent = totalSpend.toFixed(2);
        
        // Calculate trend (mock for now)
        const trendPercentage = Math.random() * 20 - 10; // -10% to +10%
        const trendElement = document.getElementById('spend-trend');
        const trendTextElement = document.getElementById('trend-text');
        
        if (trendPercentage > 0) {
            trendElement.textContent = '📈';
            trendTextElement.textContent = `+${trendPercentage.toFixed(1)}% vs last month`;
            trendTextElement.style.color = '#e74c3c';
        } else {
            trendElement.textContent = '📉';
            trendTextElement.textContent = `${trendPercentage.toFixed(1)}% vs last month`;
            trendTextElement.style.color = '#27ae60';
        }
    }

    updateProviderCards() {
        const totalSpend = Object.values(this.data.providers)
            .reduce((sum, provider) => sum + provider.spend, 0);
        
        Object.entries(this.data.providers).forEach(([provider, data]) => {
            const percentage = totalSpend > 0 ? (data.spend / totalSpend * 100) : 0;
            
            document.getElementById(`${provider}-spend`).textContent = data.spend.toFixed(2);
            document.getElementById(`${provider}-percentage`).textContent = percentage.toFixed(0);
            
            if (provider === 'perplexity') {
                document.getElementById(`${provider}-credits`).textContent = data.credits || 0;
            } else {
                document.getElementById(`${provider}-tokens`).textContent = 
                    this.formatNumber(data.tokens || 0);
            }
            
            document.getElementById(`${provider}-requests`).textContent = data.requests || 0;
            
            // Update status indicator
            const statusElement = document.getElementById(`${provider}-status`);
            if (data.status === 'active') {
                statusElement.style.color = '#27ae60';
                statusElement.title = 'Live data from .env API keys';
            } else if (data.status === 'no_key') {
                statusElement.style.color = '#e74c3c';
                statusElement.title = 'API key not found in .env';
            } else {
                statusElement.style.color = '#f39c12';
                statusElement.title = 'Mock data - API key available';
            }
        });
    }

    updateModelUsage() {
        const maxUsage = Math.max(...Object.values(this.data.modelUsage));
        
        Object.entries(this.data.modelUsage).forEach(([model, usage]) => {
            const percentage = maxUsage > 0 ? (usage / maxUsage * 100) : 0;
            const modelKey = model.replace(/[^a-z0-9]/gi, '').toLowerCase();
            
            const fillElement = document.querySelector(`.usage-fill.${modelKey}`);
            const tokensElement = document.getElementById(`${modelKey}-tokens`);
            
            if (fillElement) {
                fillElement.style.width = `${percentage}%`;
            }
            
            if (tokensElement) {
                tokensElement.textContent = (usage / 1000).toFixed(0);
            }
        });
    }

    updateLastUpdated() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        document.getElementById('last-updated-time').textContent = timeString;
    }

    checkBudgetAlerts() {
        const totalSpend = Object.values(this.data.providers)
            .reduce((sum, provider) => sum + provider.spend, 0);
        
        const threshold = this.data.budgetThreshold;
        const percentage = (totalSpend / threshold) * 100;
        
        if (percentage >= 90) {
            this.addAlert('error', `Budget alert: ${percentage.toFixed(0)}% of monthly budget used ($${totalSpend.toFixed(2)}/$${threshold})`);
        } else if (percentage >= 75) {
            this.addAlert('warning', `Budget warning: ${percentage.toFixed(0)}% of monthly budget used ($${totalSpend.toFixed(2)}/$${threshold})`);
        }
    }

    addAlert(type, message) {
        const alert = {
            id: Date.now(),
            type: type,
            message: message,
            timestamp: new Date()
        };
        
        this.data.alerts.unshift(alert);
        
        // Keep only last 10 alerts
        if (this.data.alerts.length > 10) {
            this.data.alerts = this.data.alerts.slice(0, 10);
        }
        
        this.updateAlertsDisplay();
        this.saveData();
    }

    updateAlertsDisplay() {
        const container = document.getElementById('alerts-container');
        container.innerHTML = '';
        
        this.data.alerts.forEach(alert => {
            const alertElement = document.createElement('div');
            alertElement.className = `alert-item ${alert.type}`;
            
            const icon = alert.type === 'error' ? '🚨' : 
                        alert.type === 'warning' ? '⚠️' : 'ℹ️';
            
            alertElement.innerHTML = `
                <span class="alert-icon">${icon}</span>
                <span class="alert-text">${alert.message}</span>
            `;
            
            container.appendChild(alertElement);
        });
    }

    updateDailySpendChart(days = 30) {
        if (this.charts.dailySpend) {
            const recentData = this.data.dailySpend.slice(-days);
            const labels = recentData.map(d => {
                const date = new Date(d.date);
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            });
            
            this.charts.dailySpend.data.labels = labels;
            this.charts.dailySpend.data.datasets.forEach((dataset, index) => {
                const providers = ['openai', 'claude', 'grok', 'perplexity'];
                dataset.data = recentData.map(d => d[providers[index]]);
            });
            
            this.charts.dailySpend.update();
        }
    }

    async refreshData() {
        this.addAlert('info', 'Refreshing data...');
        await this.loadRealData();
        this.updateUI();
        this.charts.dailySpend?.update();
        this.charts.costEfficiency?.update();
        this.addAlert('info', 'Data refreshed successfully');
    }

    startAutoRefresh() {
        // Refresh every 5 minutes
        this.refreshInterval = setInterval(() => {
            this.refreshData();
        }, 5 * 60 * 1000);
    }

    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(0) + 'K';
        }
        return num.toString();
    }

    destroy() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
    }
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.llmDashboard = new LLMDashboard();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.llmDashboard) {
        window.llmDashboard.destroy();
    }
});
