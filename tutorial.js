// Tutorial and Help System for AI Prompt Manager

class TutorialManager {
    constructor() {
        this.currentStep = 0;
        this.isActive = false;
        this.tutorialSteps = this.defineTutorialSteps();
        this.overlay = null;
        this.tooltip = null;
        this.init();
    }

    init() {
        this.createTutorialElements();
        this.setupKeyboardShortcuts();
        
        // Check if user needs tutorial (first time)
        const hasSeenTutorial = localStorage.getItem('aiPromptManager_tutorialCompleted');
        if (!hasSeenTutorial) {
            setTimeout(() => {
                this.showWelcomeMessage();
            }, 2000);
        }
    }

    defineTutorialSteps() {
        return [
            {
                id: 'welcome',
                title: 'Welcome to AI Prompt Manager! 🎉',
                content: 'Let\'s take a quick tour to help you get started with organizing your AI prompts.',
                target: '.app-title',
                placement: 'bottom',
                showNext: true,
                showPrev: false
            },
            {
                id: 'add-prompt',
                title: 'Add Your First Prompt',
                content: 'Click here to create your first AI prompt. You can organize them by category, add tags, and rate them.',
                target: '.add-prompt-btn',
                placement: 'bottom-left',
                showNext: true,
                showPrev: true,
                action: 'highlight'
            },
            {
                id: 'categories',
                title: 'Organize with Categories',
                content: 'Use categories to organize your prompts. Click the + button to create new categories and subcategories.',
                target: '.add-category-btn',
                placement: 'right',
                showNext: true,
                showPrev: true,
                action: 'highlight'
            },
            {
                id: 'search',
                title: 'Search and Filter',
                content: 'Use the search bar to quickly find prompts by title, content, or tags. Filter by AI model, rating, or date.',
                target: '.search-input',
                placement: 'bottom',
                showNext: true,
                showPrev: true
            },
            {
                id: 'data-management',
                title: 'Export and Import',
                content: 'Backup your prompts or import from other sources using the data management panel.',
                target: '.data-management-btn',
                placement: 'bottom-left',
                showNext: true,
                showPrev: true,
                action: 'pulse'
            },
            {
                id: 'settings',
                title: 'Settings and GitHub Backup',
                content: 'Configure GitHub backup, performance settings, and more in the settings panel.',
                target: '.settings-btn',
                placement: 'bottom-left',
                showNext: true,
                showPrev: true,
                action: 'pulse'
            },
            {
                id: 'keyboard-shortcuts',
                title: 'Keyboard Shortcuts',
                content: 'Press "?" to see all keyboard shortcuts. Use "n" for new prompt, "f" for search, and more!',
                target: 'body',
                placement: 'center',
                showNext: true,
                showPrev: true
            },
            {
                id: 'complete',
                title: 'You\'re All Set! 🚀',
                content: 'You now know the basics of AI Prompt Manager. Start creating and organizing your prompts!',
                target: 'body',
                placement: 'center',
                showNext: false,
                showPrev: true,
                isLast: true
            }
        ];
    }

    createTutorialElements() {
        // Create overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'tutorial-overlay';
        this.overlay.style.display = 'none';

        // Create tooltip
        this.tooltip = document.createElement('div');
        this.tooltip.className = 'tutorial-tooltip';
        this.tooltip.style.display = 'none';

        document.body.appendChild(this.overlay);
        document.body.appendChild(this.tooltip);
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (!this.isActive) return;

            switch (e.key) {
                case 'ArrowRight':
                case ' ':
                    e.preventDefault();
                    this.nextStep();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    this.previousStep();
                    break;
                case 'Escape':
                    e.preventDefault();
                    this.endTutorial();
                    break;
            }
        });
    }

    showWelcomeMessage() {
        const welcomeModal = document.createElement('div');
        welcomeModal.className = 'tutorial-welcome-modal';
        welcomeModal.innerHTML = `
            <div class="tutorial-modal-content">
                <h2>Welcome to AI Prompt Manager! 🎉</h2>
                <p>It looks like this is your first time here. Would you like a quick tour to get started?</p>
                <div class="tutorial-welcome-actions">
                    <button class="tutorial-btn secondary" onclick="this.closest('.tutorial-welcome-modal').remove()">
                        Skip Tour
                    </button>
                    <button class="tutorial-btn primary" onclick="window.tutorialManager.startTutorial(); this.closest('.tutorial-welcome-modal').remove()">
                        Start Tour
                    </button>
                </div>
                <label class="tutorial-checkbox-label">
                    <input type="checkbox" id="dontShowAgain">
                    <span>Don't show this again</span>
                </label>
            </div>
        `;

        document.body.appendChild(welcomeModal);

        // Handle don't show again
        const dontShowAgain = welcomeModal.querySelector('#dontShowAgain');
        welcomeModal.addEventListener('click', (e) => {
            if (e.target.classList.contains('tutorial-welcome-modal')) {
                if (dontShowAgain.checked) {
                    localStorage.setItem('aiPromptManager_tutorialCompleted', 'true');
                }
                welcomeModal.remove();
            }
        });
    }

    startTutorial(stepIndex = 0) {
        this.currentStep = stepIndex;
        this.isActive = true;
        this.overlay.style.display = 'block';
        this.tooltip.style.display = 'block';
        document.body.style.overflow = 'hidden';

        this.showStep(this.currentStep);

        // Track tutorial start
        this.trackTutorialEvent('tutorial_started');
    }

    showStep(index) {
        if (index < 0 || index >= this.tutorialSteps.length) {
            this.endTutorial();
            return;
        }

        const step = this.tutorialSteps[index];
        const target = step.target === 'body' ? document.body : document.querySelector(step.target);

        if (!target && step.target !== 'body') {
            console.warn(`Tutorial target not found: ${step.target}`);
            this.nextStep();
            return;
        }

        // Clear previous highlights
        this.clearHighlights();

        // Highlight target element
        if (target !== document.body) {
            this.highlightElement(target, step.action);
        }

        // Position and show tooltip
        this.showTooltip(step, target);

        // Update progress
        this.updateProgress();
    }

    highlightElement(element, action = 'highlight') {
        element.classList.add('tutorial-highlighted');

        if (action === 'pulse') {
            element.classList.add('tutorial-pulse');
        }

        // Scroll element into view
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'center'
        });

        // Create spotlight effect
        const rect = element.getBoundingClientRect();
        this.overlay.innerHTML = `
            <div class="tutorial-spotlight" style="
                top: ${rect.top - 10}px;
                left: ${rect.left - 10}px;
                width: ${rect.width + 20}px;
                height: ${rect.height + 20}px;
            "></div>
        `;
    }

    showTooltip(step, target) {
        this.tooltip.innerHTML = `
            <div class="tutorial-tooltip-header">
                <h3>${step.title}</h3>
                <button class="tutorial-close" onclick="window.tutorialManager.endTutorial()">×</button>
            </div>
            <div class="tutorial-tooltip-body">
                <p>${step.content}</p>
            </div>
            <div class="tutorial-tooltip-footer">
                <div class="tutorial-progress">
                    <span>Step ${this.currentStep + 1} of ${this.tutorialSteps.length}</span>
                    <div class="tutorial-progress-bar">
                        <div class="tutorial-progress-fill" style="width: ${((this.currentStep + 1) / this.tutorialSteps.length) * 100}%"></div>
                    </div>
                </div>
                <div class="tutorial-navigation">
                    ${step.showPrev ? '<button class="tutorial-btn secondary" onclick="window.tutorialManager.previousStep()">Previous</button>' : '<span></span>'}
                    ${step.showNext ? 
                        (step.isLast ? 
                            '<button class="tutorial-btn primary" onclick="window.tutorialManager.completeTutorial()">Complete Tour</button>' : 
                            '<button class="tutorial-btn primary" onclick="window.tutorialManager.nextStep()">Next</button>'
                        ) : ''}
                </div>
            </div>
        `;

        // Position tooltip
        this.positionTooltip(step, target);
    }

    positionTooltip(step, target) {
        if (step.placement === 'center' || target === document.body) {
            this.tooltip.style.position = 'fixed';
            this.tooltip.style.top = '50%';
            this.tooltip.style.left = '50%';
            this.tooltip.style.transform = 'translate(-50%, -50%)';
            this.tooltip.style.maxWidth = '500px';
            return;
        }

        const rect = target.getBoundingClientRect();
        const tooltipRect = this.tooltip.getBoundingClientRect();

        let top, left;

        switch (step.placement) {
            case 'top':
                top = rect.top - tooltipRect.height - 20;
                left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
                break;
            case 'bottom':
                top = rect.bottom + 20;
                left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
                break;
            case 'bottom-left':
                top = rect.bottom + 20;
                left = rect.left;
                break;
            case 'left':
                top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
                left = rect.left - tooltipRect.width - 20;
                break;
            case 'right':
                top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
                left = rect.right + 20;
                break;
            default:
                top = rect.bottom + 20;
                left = rect.left;
        }

        // Ensure tooltip stays within viewport
        const margin = 20;
        top = Math.max(margin, Math.min(top, window.innerHeight - tooltipRect.height - margin));
        left = Math.max(margin, Math.min(left, window.innerWidth - tooltipRect.width - margin));

        this.tooltip.style.position = 'fixed';
        this.tooltip.style.top = top + 'px';
        this.tooltip.style.left = left + 'px';
        this.tooltip.style.transform = 'none';
    }

    nextStep() {
        if (this.currentStep < this.tutorialSteps.length - 1) {
            this.currentStep++;
            this.showStep(this.currentStep);
        } else {
            this.completeTutorial();
        }
    }

    previousStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.showStep(this.currentStep);
        }
    }

    endTutorial() {
        this.isActive = false;
        this.overlay.style.display = 'none';
        this.tooltip.style.display = 'none';
        document.body.style.overflow = '';
        this.clearHighlights();

        // Track tutorial end
        this.trackTutorialEvent('tutorial_ended', { step: this.currentStep });
    }

    completeTutorial() {
        this.endTutorial();
        localStorage.setItem('aiPromptManager_tutorialCompleted', 'true');
        
        // Show completion message
        this.showCompletionMessage();

        // Track tutorial completion
        this.trackTutorialEvent('tutorial_completed');
    }

    showCompletionMessage() {
        const message = document.createElement('div');
        message.className = 'tutorial-completion-message';
        message.innerHTML = `
            <div class="tutorial-message-content">
                <h3>🎉 Tutorial Complete!</h3>
                <p>You're now ready to make the most of AI Prompt Manager. Happy prompting!</p>
                <button class="tutorial-btn primary" onclick="this.closest('.tutorial-completion-message').remove()">
                    Get Started
                </button>
            </div>
        `;

        document.body.appendChild(message);

        setTimeout(() => {
            if (message.parentNode) {
                message.remove();
            }
        }, 5000);
    }

    clearHighlights() {
        document.querySelectorAll('.tutorial-highlighted').forEach(el => {
            el.classList.remove('tutorial-highlighted');
        });

        document.querySelectorAll('.tutorial-pulse').forEach(el => {
            el.classList.remove('tutorial-pulse');
        });
    }

    updateProgress() {
        // This could update a progress indicator if needed
        const progress = ((this.currentStep + 1) / this.tutorialSteps.length) * 100;
        console.log(`Tutorial progress: ${Math.round(progress)}%`);
    }

    trackTutorialEvent(eventName, data = {}) {
        // Track tutorial events for analytics (if implemented)
        console.log('Tutorial Event:', eventName, data);
        
        // Could integrate with analytics service here
        if (window.analytics) {
            window.analytics.track(eventName, {
                tutorial_step: this.currentStep,
                tutorial_total_steps: this.tutorialSteps.length,
                ...data
            });
        }
    }

    // Public methods for external use
    showQuickTips() {
        const tips = [
            'Press "?" to see all keyboard shortcuts',
            'Use Ctrl+K (or Cmd+K) to quickly search prompts',
            'Star your favorite prompts for easy access',
            'Use templates with [VARIABLES] for reusable prompts',
            'Export your prompts regularly as backup',
            'Enable GitHub backup for automatic cloud storage'
        ];

        const randomTip = tips[Math.floor(Math.random() * tips.length)];
        
        const tipElement = document.createElement('div');
        tipElement.className = 'tutorial-quick-tip';
        tipElement.innerHTML = `
            <div class="tutorial-tip-content">
                <span class="tutorial-tip-icon">💡</span>
                <span class="tutorial-tip-text">${randomTip}</span>
                <button class="tutorial-tip-close" onclick="this.closest('.tutorial-quick-tip').remove()">×</button>
            </div>
        `;

        document.body.appendChild(tipElement);

        setTimeout(() => {
            if (tipElement.parentNode) {
                tipElement.remove();
            }
        }, 5000);
    }

    // Reset tutorial for testing
    resetTutorial() {
        localStorage.removeItem('aiPromptManager_tutorialCompleted');
        this.endTutorial();
        console.log('Tutorial reset - will show on next page load');
    }
}

// CSS for tutorial system will be added to the main stylesheet
const tutorialCSS = `
/* Tutorial System Styles */
.tutorial-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    z-index: 15000;
    backdrop-filter: blur(2px);
}

.tutorial-spotlight {
    position: absolute;
    box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.7);
    border-radius: 8px;
    pointer-events: none;
    z-index: 15001;
}

.tutorial-tooltip {
    position: fixed;
    background: var(--bg-secondary);
    border: 1px solid var(--border-primary);
    border-radius: 12px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    max-width: 400px;
    z-index: 15002;
    font-size: 14px;
}

.tutorial-tooltip-header {
    padding: 1.5rem 1.5rem 0 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
}

.tutorial-tooltip-header h3 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-primary);
}

.tutorial-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    color: var(--text-secondary);
    cursor: pointer;
    padding: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: all 0.2s ease;
}

.tutorial-close:hover {
    background: var(--surface-hover);
    color: var(--text-primary);
}

.tutorial-tooltip-body {
    padding: 1rem 1.5rem;
}

.tutorial-tooltip-body p {
    margin: 0;
    line-height: 1.5;
    color: var(--text-secondary);
}

.tutorial-tooltip-footer {
    padding: 0 1.5rem 1.5rem 1.5rem;
    border-top: 1px solid var(--border-primary);
    margin-top: 1rem;
    padding-top: 1rem;
}

.tutorial-progress {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    font-size: 0.875rem;
    color: var(--text-secondary);
}

.tutorial-progress-bar {
    flex: 1;
    height: 4px;
    background: var(--bg-tertiary);
    border-radius: 2px;
    margin-left: 1rem;
    overflow: hidden;
}

.tutorial-progress-fill {
    height: 100%;
    background: var(--accent-blue);
    border-radius: 2px;
    transition: width 0.3s ease;
}

.tutorial-navigation {
    display: flex;
    justify-content: space-between;
    gap: 0.75rem;
}

.tutorial-btn {
    padding: 0.5rem 1rem;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid var(--border-primary);
}

.tutorial-btn.primary {
    background: var(--accent-blue);
    color: white;
    border: none;
}

.tutorial-btn.primary:hover {
    background: var(--accent-blue-hover);
    transform: translateY(-1px);
}

.tutorial-btn.secondary {
    background: var(--bg-tertiary);
    color: var(--text-secondary);
}

.tutorial-btn.secondary:hover {
    background: var(--surface-hover);
    color: var(--text-primary);
}

.tutorial-highlighted {
    position: relative;
    z-index: 15001 !important;
    box-shadow: 0 0 0 4px var(--accent-blue) !important;
    border-radius: 8px !important;
}

.tutorial-pulse {
    animation: tutorialPulse 2s infinite;
}

@keyframes tutorialPulse {
    0%, 100% { 
        box-shadow: 0 0 0 4px var(--accent-blue); 
    }
    50% { 
        box-shadow: 0 0 0 8px rgba(102, 126, 234, 0.5); 
    }
}

.tutorial-welcome-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 20000;
}

.tutorial-modal-content {
    background: var(--bg-secondary);
    border-radius: 12px;
    padding: 2rem;
    max-width: 500px;
    width: 90%;
    text-align: center;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.tutorial-modal-content h2 {
    margin: 0 0 1rem 0;
    color: var(--text-primary);
}

.tutorial-modal-content p {
    margin: 0 0 1.5rem 0;
    color: var(--text-secondary);
    line-height: 1.5;
}

.tutorial-welcome-actions {
    display: flex;
    gap: 0.75rem;
    justify-content: center;
    margin-bottom: 1rem;
}

.tutorial-checkbox-label {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: var(--text-secondary);
    cursor: pointer;
}

.tutorial-quick-tip {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--accent-blue-light);
    border: 1px solid var(--accent-blue);
    border-radius: 8px;
    padding: 0.75rem 1rem;
    z-index: 10000;
    animation: slideInFromTop 0.3s ease-out;
}

@keyframes slideInFromTop {
    from {
        transform: translate(-50%, -100%);
        opacity: 0;
    }
    to {
        transform: translate(-50%, 0);
        opacity: 1;
    }
}

.tutorial-tip-content {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: var(--accent-blue-text);
    font-size: 0.875rem;
    font-weight: 500;
}

.tutorial-tip-close {
    background: none;
    border: none;
    color: var(--accent-blue-text);
    cursor: pointer;
    font-size: 1.25rem;
    padding: 0;
    opacity: 0.7;
    transition: opacity 0.2s ease;
}

.tutorial-tip-close:hover {
    opacity: 1;
}

.tutorial-completion-message {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: var(--bg-secondary);
    border: 1px solid var(--border-primary);
    border-radius: 12px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    z-index: 15000;
    animation: tutorialBounceIn 0.5s ease-out;
}

@keyframes tutorialBounceIn {
    0% {
        transform: translate(-50%, -50%) scale(0.3);
        opacity: 0;
    }
    50% {
        transform: translate(-50%, -50%) scale(1.05);
    }
    70% {
        transform: translate(-50%, -50%) scale(0.9);
    }
    100% {
        transform: translate(-50%, -50%) scale(1);
        opacity: 1;
    }
}

.tutorial-message-content {
    padding: 2rem;
    text-align: center;
}

.tutorial-message-content h3 {
    margin: 0 0 1rem 0;
    color: var(--text-primary);
}

.tutorial-message-content p {
    margin: 0 0 1.5rem 0;
    color: var(--text-secondary);
}

@media (max-width: 768px) {
    .tutorial-tooltip {
        max-width: 90vw;
        margin: 0 20px;
    }
    
    .tutorial-modal-content {
        margin: 0 20px;
    }
    
    .tutorial-welcome-actions {
        flex-direction: column;
    }
}
`;

// Inject tutorial CSS
const tutorialStyleSheet = document.createElement('style');
tutorialStyleSheet.textContent = tutorialCSS;
document.head.appendChild(tutorialStyleSheet);

// Export for global use
if (typeof window !== 'undefined') {
    window.TutorialManager = TutorialManager;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = TutorialManager;
}