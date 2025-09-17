// AI Prompt Manager - Main JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initializeApp();
});

function initializeApp() {
    // Mobile menu functionality
    initializeMobileMenu();
    
    // Category functionality
    initializeCategoryNavigation();
    
    // Search functionality
    initializeSearch();
    
    // Button event listeners
    initializeButtons();
}

// Mobile Menu Functionality
function initializeMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const sidebar = document.getElementById('sidebar');
    const mobileOverlay = document.getElementById('mobileOverlay');
    
    if (!hamburger || !sidebar || !mobileOverlay) return;
    
    hamburger.addEventListener('click', toggleMobileMenu);
    mobileOverlay.addEventListener('click', closeMobileMenu);
    
    // Close menu when clicking on a category (mobile)
    const categoryButtons = sidebar.querySelectorAll('.category-button');
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                closeMobileMenu();
            }
        });
    });
    
    // Handle resize events
    window.addEventListener('resize', handleResize);
}

function toggleMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const sidebar = document.getElementById('sidebar');
    const mobileOverlay = document.getElementById('mobileOverlay');
    
    hamburger.classList.toggle('active');
    sidebar.classList.toggle('open');
    mobileOverlay.classList.toggle('show');
    
    // Prevent body scroll when menu is open
    document.body.style.overflow = sidebar.classList.contains('open') ? 'hidden' : '';
}

function closeMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const sidebar = document.getElementById('sidebar');
    const mobileOverlay = document.getElementById('mobileOverlay');
    
    hamburger.classList.remove('active');
    sidebar.classList.remove('open');
    mobileOverlay.classList.remove('show');
    document.body.style.overflow = '';
}

function handleResize() {
    if (window.innerWidth > 768) {
        closeMobileMenu();
    }
}

// Category Navigation
function initializeCategoryNavigation() {
    const categoryButtons = document.querySelectorAll('.category-button');
    const contentTitle = document.querySelector('.content-title');
    
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Update content title
            if (contentTitle) {
                contentTitle.textContent = this.textContent;
            }
            
            // Update prompts display
            updatePromptsDisplay(this.textContent);
        });
    });
}

function updatePromptsDisplay(category) {
    const promptsGrid = document.querySelector('.prompts-grid');
    if (!promptsGrid) return;
    
    // Clear current prompts
    promptsGrid.innerHTML = '';
    
    // Sample prompt data based on category
    const prompts = getSamplePrompts(category);
    
    // Create and append prompt cards
    prompts.forEach(prompt => {
        const promptCard = createPromptCard(prompt);
        promptsGrid.appendChild(promptCard);
    });
}

function getSamplePrompts(category) {
    const promptData = {
        'All Prompts': [
            {
                title: 'Welcome to AI Prompt Manager',
                category: 'General',
                description: 'This is your prompt management dashboard. Use the sidebar to organize your prompts by categories, and click "Add New Prompt" to get started.'
            },
            {
                title: 'Code Review Assistant',
                category: 'Coding',
                description: 'Help review code for best practices, bugs, and improvements.'
            },
            {
                title: 'Creative Writing Starter',
                category: 'Writing',
                description: 'Generate creative story ideas and writing prompts for fiction.'
            }
        ],
        'Writing': [
            {
                title: 'Blog Post Outline',
                category: 'Writing',
                description: 'Create structured outlines for engaging blog posts on any topic.'
            },
            {
                title: 'Email Template Creator',
                category: 'Writing',
                description: 'Generate professional email templates for different business scenarios.'
            }
        ],
        'Coding': [
            {
                title: 'Code Debugging Helper',
                category: 'Coding',
                description: 'Analyze code and suggest fixes for common programming issues.'
            },
            {
                title: 'API Documentation Writer',
                category: 'Coding',
                description: 'Create clear and comprehensive API documentation.'
            }
        ],
        'Business': [
            {
                title: 'Market Analysis Report',
                category: 'Business',
                description: 'Generate comprehensive market analysis for business decisions.'
            },
            {
                title: 'Project Proposal Template',
                category: 'Business',
                description: 'Create professional project proposals that win clients.'
            }
        ],
        'Creative': [
            {
                title: 'Brand Name Generator',
                category: 'Creative',
                description: 'Generate unique and memorable brand names for startups.'
            },
            {
                title: 'Social Media Content Ideas',
                category: 'Creative',
                description: 'Create engaging social media content ideas and captions.'
            }
        ],
        'Analysis': [
            {
                title: 'Data Insights Extractor',
                category: 'Analysis',
                description: 'Extract meaningful insights from complex datasets.'
            },
            {
                title: 'Competitive Analysis Framework',
                category: 'Analysis',
                description: 'Analyze competitors and market positioning systematically.'
            }
        ]
    };
    
    return promptData[category] || promptData['All Prompts'];
}

function createPromptCard(prompt) {
    const card = document.createElement('div');
    card.className = 'prompt-card';
    
    card.innerHTML = `
        <div class="prompt-header">
            <h3 class="prompt-title">${prompt.title}</h3>
            <span class="prompt-category">${prompt.category}</span>
        </div>
        <p class="prompt-description">${prompt.description}</p>
        <div class="prompt-actions">
            <button class="btn-secondary" onclick="editPrompt('${prompt.title}')">Edit</button>
            <button class="btn-primary" onclick="usePrompt('${prompt.title}')">Use Prompt</button>
        </div>
    `;
    
    return card;
}

// Search Functionality
function initializeSearch() {
    const searchInput = document.querySelector('.search-input');
    const searchBtn = document.querySelector('.search-btn');
    
    if (searchInput && searchBtn) {
        searchInput.addEventListener('input', handleSearch);
        searchBtn.addEventListener('click', handleSearch);
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleSearch();
            }
        });
    }
}

function handleSearch() {
    const searchInput = document.querySelector('.search-input');
    const query = searchInput.value.toLowerCase().trim();
    const promptCards = document.querySelectorAll('.prompt-card');
    
    promptCards.forEach(card => {
        const title = card.querySelector('.prompt-title').textContent.toLowerCase();
        const description = card.querySelector('.prompt-description').textContent.toLowerCase();
        
        if (title.includes(query) || description.includes(query) || query === '') {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Button Event Handlers
function initializeButtons() {
    const addPromptBtn = document.querySelector('.add-prompt-btn');
    const addCategoryBtn = document.querySelector('.add-category-btn');
    
    if (addPromptBtn) {
        addPromptBtn.addEventListener('click', addNewPrompt);
    }
    
    if (addCategoryBtn) {
        addCategoryBtn.addEventListener('click', addNewCategory);
    }
}

function addNewPrompt() {
    alert('Add New Prompt feature would open a modal or new page to create a prompt.');
    // Future implementation: Open modal or navigate to create prompt page
}

function addNewCategory() {
    const categoryName = prompt('Enter new category name:');
    if (categoryName && categoryName.trim()) {
        addCategoryToSidebar(categoryName.trim());
    }
}

function addCategoryToSidebar(categoryName) {
    const categoryList = document.querySelector('.category-list');
    if (!categoryList) return;
    
    const listItem = document.createElement('li');
    listItem.className = 'category-item';
    
    const button = document.createElement('button');
    button.className = 'category-button';
    button.textContent = categoryName;
    
    // Add click event listener
    button.addEventListener('click', function() {
        document.querySelectorAll('.category-button').forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        document.querySelector('.content-title').textContent = this.textContent;
        updatePromptsDisplay(this.textContent);
        
        // Close mobile menu if open
        if (window.innerWidth <= 768) {
            closeMobileMenu();
        }
    });
    
    listItem.appendChild(button);
    categoryList.appendChild(listItem);
}

// Prompt Action Handlers
function editPrompt(title) {
    alert(`Edit functionality for "${title}" would open an edit modal or form.`);
    // Future implementation: Open edit modal with prompt details
}

function usePrompt(title) {
    alert(`Use functionality for "${title}" would copy prompt or open it in a workspace.`);
    // Future implementation: Copy to clipboard or open in prompt workspace
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Export functions for global access if needed
window.editPrompt = editPrompt;
window.usePrompt = usePrompt;