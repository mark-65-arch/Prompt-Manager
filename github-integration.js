// GitHub Integration Module for AI Prompt Manager

// GitHub Client Management
class GitHubManager {
    constructor() {
        this.settings = this.loadSettings();
        this.lastBackupDate = localStorage.getItem('aiPromptManager_lastBackup');
        this.initializeBackupReminders();
    }

    // Load GitHub settings from localStorage
    loadSettings() {
        const stored = localStorage.getItem('aiPromptManager_githubSettings');
        return stored ? JSON.parse(stored) : {
            enabled: false,
            repositoryName: '',
            branch: 'main',
            autoBackup: false,
            backupFrequency: 'weekly', // daily, weekly, monthly
            lastBackupReminder: null
        };
    }

    // Save GitHub settings
    saveSettings() {
        localStorage.setItem('aiPromptManager_githubSettings', JSON.stringify(this.settings));
    }

    // Get GitHub client with environment detection
    async getGitHubClient() {
        try {
            const { getUncachableGitHubClient, getEnvironmentInfo } = await import('./octokit-client.js');
            const envInfo = await getEnvironmentInfo();
            
            if (!envInfo.hasOctokit) {
                throw new Error('GitHub integration not available. Octokit library not loaded.');
            }
            
            return await getUncachableGitHubClient();
        } catch (error) {
            console.error('GitHub client creation failed:', error);
            
            if (error.message.includes('Personal Access Token required')) {
                throw new Error('GitHub Personal Access Token required. Please add one in Settings → GitHub Integration.');
            } else if (error.message.includes('Replit environment')) {
                throw new Error('GitHub connection not set up. Please connect your GitHub account in the Replit interface.');
            } else {
                throw new Error(`GitHub connection failed: ${error.message}`);
            }
        }
    }

    // Check if GitHub is available and properly configured
    async isGitHubConfigured() {
        try {
            const { getEnvironmentInfo } = await import('./octokit-client.js');
            const envInfo = await getEnvironmentInfo();
            
            if (!envInfo.hasOctokit) return false;
            
            if (envInfo.requiresToken) {
                const settings = JSON.parse(localStorage.getItem('aiPromptManager_githubSettings') || '{}');
                return !!settings.personalAccessToken;
            }
            
            return true;
        } catch (error) {
            return false;
        }
    }

    // Get user's GitHub repositories
    async getUserRepositories() {
        try {
            const client = await this.getGitHubClient();
            const { data } = await client.rest.repos.listForAuthenticatedUser({
                sort: 'updated',
                per_page: 100
            });
            return data.map(repo => ({
                name: repo.name,
                fullName: repo.full_name,
                private: repo.private,
                defaultBranch: repo.default_branch
            }));
        } catch (error) {
            console.error('Failed to fetch repositories:', error);
            
            // Provide more specific error messages
            if (error.message.includes('401')) {
                throw new Error('GitHub authentication failed. Please check your Personal Access Token.');
            } else if (error.message.includes('403')) {
                throw new Error('GitHub access denied. Please ensure your token has "repo" scope permissions.');
            } else if (error.message.includes('network') || error.message.includes('fetch')) {
                throw new Error('Network error while connecting to GitHub. Please check your internet connection.');
            } else {
                throw new Error(`Failed to fetch GitHub repositories: ${error.message}`);
            }
        }
    }

    // Create backup data structure
    createBackupData() {
        const prompts = window.promptManager ? window.promptManager.getAllPrompts() : [];
        const categories = window.categoryManager ? window.categoryManager.getAllCategories() : {};
        const settings = {
            theme: window.themeManager ? window.themeManager.getCurrentTheme() : 'light',
            githubSettings: this.settings
        };

        return {
            exportDate: new Date().toISOString(),
            version: '1.0',
            appVersion: 'AI Prompt Manager v2.0',
            data: {
                prompts,
                categories,
                settings
            },
            metadata: {
                promptCount: prompts.length,
                categoryCount: Object.keys(categories).length,
                exportedBy: 'AI Prompt Manager GitHub Integration'
            }
        };
    }

    // Backup to GitHub repository
    async backupToGitHub(manual = false) {
        // Check if GitHub is configured
        const isConfigured = await this.isGitHubConfigured();
        if (!isConfigured) {
            throw new Error('GitHub connection is not set up. Please configure your GitHub token and test the connection first.');
        }
        
        if (!this.settings.enabled || !this.settings.repositoryName) {
            throw new Error('GitHub backup is not properly configured. Please select a repository in Settings → GitHub Integration.');
        }

        try {
            const client = await this.getGitHubClient();
            const backupData = this.createBackupData();
            const fileName = `ai-prompt-manager-backup-${new Date().toISOString().split('T')[0]}.json`;
            const content = JSON.stringify(backupData, null, 2);
            
            // Get repository info
            const [owner, repo] = this.settings.repositoryName.split('/');
            
            try {
                // Check if file already exists
                const existingFile = await client.rest.repos.getContent({
                    owner,
                    repo,
                    path: fileName,
                    ref: this.settings.branch
                });

                // Update existing file
                await client.rest.repos.createOrUpdateFileContents({
                    owner,
                    repo,
                    path: fileName,
                    message: `Update AI Prompt Manager backup - ${manual ? 'Manual' : 'Automatic'} backup`,
                    content: btoa(content),
                    sha: existingFile.data.sha,
                    branch: this.settings.branch
                });
            } catch (error) {
                if (error.status === 404) {
                    // Create new file
                    await client.rest.repos.createOrUpdateFileContents({
                        owner,
                        repo,
                        path: fileName,
                        message: `Create AI Prompt Manager backup - ${manual ? 'Manual' : 'Automatic'} backup`,
                        content: btoa(content),
                        branch: this.settings.branch
                    });
                } else {
                    throw error;
                }
            }

            // Update last backup date
            this.lastBackupDate = new Date().toISOString();
            localStorage.setItem('aiPromptManager_lastBackup', this.lastBackupDate);

            return {
                success: true,
                fileName,
                message: 'Backup completed successfully',
                url: `https://github.com/${this.settings.repositoryName}/blob/${this.settings.branch}/${fileName}`
            };

        } catch (error) {
            console.error('GitHub backup failed:', error);
            throw new Error(`Backup failed: ${error.message}`);
        }
    }

    // Restore from GitHub backup
    async restoreFromGitHub(fileName) {
        if (!this.settings.enabled || !this.settings.repositoryName) {
            throw new Error('GitHub backup is not properly configured.');
        }

        try {
            const client = await this.getGitHubClient();
            const [owner, repo] = this.settings.repositoryName.split('/');
            
            const { data } = await client.rest.repos.getContent({
                owner,
                repo,
                path: fileName,
                ref: this.settings.branch
            });

            const content = JSON.parse(atob(data.content));
            
            // Validate backup data
            if (!content.data || !content.data.prompts || !content.data.categories) {
                throw new Error('Invalid backup file format');
            }

            // Restore data
            if (window.promptManager && content.data.prompts) {
                window.promptManager.prompts = content.data.prompts;
                window.promptManager.savePrompts();
            }

            if (window.categoryManager && content.data.categories) {
                window.categoryManager.categories = content.data.categories;
                window.categoryManager.saveCategories();
            }

            // Apply theme if available
            if (window.themeManager && content.data.settings?.theme) {
                window.themeManager.applyTheme(content.data.settings.theme);
                window.themeManager.saveTheme(content.data.settings.theme);
            }

            return {
                success: true,
                message: 'Data restored successfully',
                metadata: content.metadata
            };

        } catch (error) {
            console.error('GitHub restore failed:', error);
            throw new Error(`Restore failed: ${error.message}`);
        }
    }

    // Get available backup files
    async getBackupFiles() {
        if (!this.settings.enabled || !this.settings.repositoryName) {
            return [];
        }

        try {
            const client = await this.getGitHubClient();
            const [owner, repo] = this.settings.repositoryName.split('/');
            
            const { data } = await client.rest.repos.getContent({
                owner,
                repo,
                path: '',
                ref: this.settings.branch
            });

            const backupFiles = data
                .filter(file => file.name.startsWith('ai-prompt-manager-backup-') && file.name.endsWith('.json'))
                .map(file => ({
                    name: file.name,
                    downloadUrl: file.download_url,
                    size: file.size,
                    lastModified: file.name.match(/\d{4}-\d{2}-\d{2}/)?.[0] || 'Unknown'
                }))
                .sort((a, b) => b.lastModified.localeCompare(a.lastModified));

            return backupFiles;
        } catch (error) {
            console.error('Failed to fetch backup files:', error);
            return [];
        }
    }

    // Initialize backup reminders
    initializeBackupReminders() {
        if (!this.settings.autoBackup) return;

        const checkBackupReminder = () => {
            const now = new Date();
            const lastBackup = this.lastBackupDate ? new Date(this.lastBackupDate) : null;
            
            if (!lastBackup) {
                this.showBackupReminder('No backup found. Would you like to create your first backup?');
                return;
            }

            const daysSinceBackup = Math.floor((now - lastBackup) / (1000 * 60 * 60 * 24));
            let shouldRemind = false;

            switch (this.settings.backupFrequency) {
                case 'daily':
                    shouldRemind = daysSinceBackup >= 1;
                    break;
                case 'weekly':
                    shouldRemind = daysSinceBackup >= 7;
                    break;
                case 'monthly':
                    shouldRemind = daysSinceBackup >= 30;
                    break;
            }

            if (shouldRemind) {
                this.showBackupReminder(`It's been ${daysSinceBackup} days since your last backup. Would you like to backup now?`);
            }
        };

        // Check on page load
        setTimeout(checkBackupReminder, 5000);

        // Check periodically (every hour)
        setInterval(checkBackupReminder, 60 * 60 * 1000);
    }

    // Show backup reminder notification
    showBackupReminder(message) {
        // Prevent multiple reminders in the same session
        const lastReminder = localStorage.getItem('aiPromptManager_lastBackupReminder');
        const now = new Date().toISOString().split('T')[0]; // Today's date
        
        if (lastReminder === now) return;

        const notification = this.createNotification(
            '🔄 Backup Reminder',
            message,
            [
                {
                    text: 'Backup Now',
                    action: () => this.triggerManualBackup(),
                    primary: true
                },
                {
                    text: 'Remind Later',
                    action: () => this.dismissReminder()
                },
                {
                    text: 'Disable Reminders',
                    action: () => this.disableReminders()
                }
            ]
        );

        document.body.appendChild(notification);
        
        // Auto-dismiss after 10 seconds if no action
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 10000);

        localStorage.setItem('aiPromptManager_lastBackupReminder', now);
    }

    // Create notification element
    createNotification(title, message, actions) {
        const notification = document.createElement('div');
        notification.className = 'backup-reminder-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-header">
                    <h4 class="notification-title">${title}</h4>
                    <button class="notification-close" onclick="this.closest('.backup-reminder-notification').remove()">×</button>
                </div>
                <p class="notification-message">${message}</p>
                <div class="notification-actions">
                    ${actions.map(action => `
                        <button class="notification-btn ${action.primary ? 'primary' : 'secondary'}" 
                                onclick="${action.action.toString().replace('function', 'window.githubManager.' + action.action.name)}">${action.text}</button>
                    `).join('')}
                </div>
            </div>
        `;
        return notification;
    }

    // Trigger manual backup
    async triggerManualBackup() {
        try {
            document.querySelector('.backup-reminder-notification')?.remove();
            const result = await this.backupToGitHub(true);
            this.showSuccessMessage(`Backup completed! <a href="${result.url}" target="_blank">View on GitHub</a>`);
        } catch (error) {
            this.showErrorMessage(`Backup failed: ${error.message}`);
        }
    }

    // Dismiss reminder
    dismissReminder() {
        document.querySelector('.backup-reminder-notification')?.remove();
    }

    // Disable reminders
    disableReminders() {
        this.settings.autoBackup = false;
        this.saveSettings();
        document.querySelector('.backup-reminder-notification')?.remove();
        this.showSuccessMessage('Backup reminders have been disabled.');
    }

    // Show success message
    showSuccessMessage(message) {
        this.showMessage(message, 'success');
    }

    // Show error message
    showErrorMessage(message) {
        this.showMessage(message, 'error');
    }

    // Show generic message
    showMessage(message, type = 'info') {
        const messageEl = document.createElement('div');
        messageEl.className = `backup-message ${type}`;
        messageEl.innerHTML = `
            <span class="message-text">${message}</span>
            <button class="message-close" onclick="this.closest('.backup-message').remove()">×</button>
        `;
        
        document.body.appendChild(messageEl);
        
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.remove();
            }
        }, 5000);
    }
}

// Initialize GitHub Manager
window.githubManager = null;

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GitHubManager;
}