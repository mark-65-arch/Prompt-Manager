// AI Prompt Manager - Main JavaScript

// Category Management Data Structure
class CategoryManager {
    constructor() {
        this.categories = this.loadCategories();
        this.initializeDefaultCategories();
    }

    // Load categories from localStorage
    loadCategories() {
        const stored = localStorage.getItem('promptCategories');
        return stored ? JSON.parse(stored) : {};
    }

    // Save categories to localStorage
    saveCategories() {
        localStorage.setItem('promptCategories', JSON.stringify(this.categories));
    }

    // Initialize default categories if none exist
    initializeDefaultCategories() {
        if (Object.keys(this.categories).length === 0) {
            this.categories = {
                'all': {
                    id: 'all',
                    name: 'All Prompts',
                    subcategories: {},
                    isExpanded: true,
                    isDefault: true
                },
                'writing': {
                    id: 'writing',
                    name: 'Writing',
                    subcategories: {
                        'blog-posts': { id: 'blog-posts', name: 'Blog Posts', parentId: 'writing' },
                        'emails': { id: 'emails', name: 'Emails', parentId: 'writing' }
                    },
                    isExpanded: false,
                    isDefault: true
                },
                'coding': {
                    id: 'coding',
                    name: 'Coding',
                    subcategories: {
                        'debugging': { id: 'debugging', name: 'Debugging', parentId: 'coding' },
                        'documentation': { id: 'documentation', name: 'Documentation', parentId: 'coding' }
                    },
                    isExpanded: false,
                    isDefault: true
                },
                'business': {
                    id: 'business',
                    name: 'Business',
                    subcategories: {
                        'analysis': { id: 'analysis', name: 'Analysis', parentId: 'business' },
                        'proposals': { id: 'proposals', name: 'Proposals', parentId: 'business' }
                    },
                    isExpanded: false,
                    isDefault: true
                },
                'creative': {
                    id: 'creative',
                    name: 'Creative',
                    subcategories: {
                        'branding': { id: 'branding', name: 'Branding', parentId: 'creative' },
                        'social-media': { id: 'social-media', name: 'Social Media', parentId: 'creative' }
                    },
                    isExpanded: false,
                    isDefault: true
                },
                'analysis-main': {
                    id: 'analysis-main',
                    name: 'Analysis',
                    subcategories: {
                        'data-insights': { id: 'data-insights', name: 'Data Insights', parentId: 'analysis-main' },
                        'competitive': { id: 'competitive', name: 'Competitive Analysis', parentId: 'analysis-main' }
                    },
                    isExpanded: false,
                    isDefault: true
                }
            };
            this.saveCategories();
        }
    }

    // Create new category
    createCategory(name, parentId = null) {
        const id = this.generateId(name);
        
        if (parentId) {
            // Creating subcategory
            if (this.categories[parentId]) {
                this.categories[parentId].subcategories[id] = {
                    id: id,
                    name: name,
                    parentId: parentId,
                    isDefault: false
                };
            }
        } else {
            // Creating main category
            this.categories[id] = {
                id: id,
                name: name,
                subcategories: {},
                isExpanded: false,
                isDefault: false
            };
        }
        
        this.saveCategories();
        return id;
    }

    // Update category
    updateCategory(id, newName, parentId = null) {
        if (parentId && this.categories[parentId] && this.categories[parentId].subcategories[id]) {
            this.categories[parentId].subcategories[id].name = newName;
        } else if (!parentId && this.categories[id]) {
            this.categories[id].name = newName;
        }
        this.saveCategories();
    }

    // Delete category
    deleteCategory(id, parentId = null) {
        if (parentId && this.categories[parentId] && this.categories[parentId].subcategories[id]) {
            // Deleting subcategory
            if (!this.categories[parentId].subcategories[id].isDefault) {
                delete this.categories[parentId].subcategories[id];
            }
        } else if (!parentId && this.categories[id] && !this.categories[id].isDefault) {
            // Deleting main category
            delete this.categories[id];
        }
        this.saveCategories();
    }

    // Toggle category expansion
    toggleExpansion(id) {
        if (this.categories[id]) {
            this.categories[id].isExpanded = !this.categories[id].isExpanded;
            this.saveCategories();
        }
    }

    // Get all categories
    getAllCategories() {
        return this.categories;
    }

    // Get category by ID
    getCategory(id) {
        return this.categories[id] || null;
    }

    // Get subcategory by parent ID and subcategory ID
    getSubcategory(parentId, subcategoryId) {
        return this.categories[parentId]?.subcategories?.[subcategoryId] || null;
    }

    // Generate unique ID from name
    generateId(name) {
        const base = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
        let id = base;
        let counter = 1;
        
        // Check if ID exists in main categories or any subcategories
        while (this.idExists(id)) {
            id = `${base}-${counter}`;
            counter++;
        }
        
        return id;
    }

    // Check if ID exists anywhere in the category structure
    idExists(id) {
        if (this.categories[id]) return true;
        
        for (const category of Object.values(this.categories)) {
            if (category.subcategories && category.subcategories[id]) {
                return true;
            }
        }
        
        return false;
    }
}

// Global category manager instance
let categoryManager;

document.addEventListener('DOMContentLoaded', function() {
    // Initialize category manager
    categoryManager = new CategoryManager();
    
    // Initialize the application
    initializeApp();
});

function initializeApp() {
    // Mobile menu functionality
    initializeMobileMenu();
    
    // Render category tree
    renderCategoryTree();
    
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

// Category Tree Rendering
function renderCategoryTree() {
    const categoryTree = document.getElementById('categoryTree');
    if (!categoryTree) return;

    const categories = categoryManager.getAllCategories();
    categoryTree.innerHTML = '';

    // Render each main category
    Object.values(categories).forEach(category => {
        const categoryElement = createCategoryElement(category);
        categoryTree.appendChild(categoryElement);
    });

    // Set first category as active if none is active
    const activeCategory = categoryTree.querySelector('.category-main.active');
    if (!activeCategory) {
        const firstCategory = categoryTree.querySelector('.category-main');
        if (firstCategory) {
            firstCategory.classList.add('active');
            const categoryName = firstCategory.querySelector('.category-button').textContent;
            updateContentTitle(categoryName);
            updatePromptsDisplay(categoryName);
        }
    }
}

function createCategoryElement(category) {
    const categoryItem = document.createElement('div');
    categoryItem.className = 'category-item';
    categoryItem.dataset.categoryId = category.id;

    // Create main category row
    const categoryMain = document.createElement('div');
    categoryMain.className = `category-main ${category.id === 'all' ? 'active' : ''}`;
    categoryMain.dataset.categoryId = category.id;

    // Expand/collapse toggle
    const toggle = document.createElement('button');
    toggle.className = `category-toggle ${category.isExpanded ? 'expanded' : ''}`;
    toggle.innerHTML = '▶';
    toggle.disabled = Object.keys(category.subcategories).length === 0;
    toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleCategoryExpansion(category.id);
    });

    // Category button
    const button = document.createElement('button');
    button.className = 'category-button';
    button.textContent = category.name;
    button.addEventListener('click', (e) => {
        e.stopPropagation();
        selectCategory(category.id, category.name, false);
    });

    // Category actions
    const actions = document.createElement('div');
    actions.className = 'category-item-actions';

    // Add subcategory button
    const addSubBtn = document.createElement('button');
    addSubBtn.className = 'action-btn add-sub-btn';
    addSubBtn.innerHTML = '+';
    addSubBtn.title = 'Add Subcategory';
    addSubBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showCategoryModal('add-subcategory', null, category.id);
    });

    // Edit button (only for non-default categories)
    if (!category.isDefault) {
        const editBtn = document.createElement('button');
        editBtn.className = 'action-btn edit-btn';
        editBtn.innerHTML = '✎';
        editBtn.title = 'Edit Category';
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showCategoryModal('edit', category.id);
        });
        actions.appendChild(editBtn);
    }

    // Delete button (only for non-default categories)
    if (!category.isDefault) {
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'action-btn delete-btn';
        deleteBtn.innerHTML = '×';
        deleteBtn.title = 'Delete Category';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            confirmDeleteCategory(category.id);
        });
        actions.appendChild(deleteBtn);
    }

    actions.appendChild(addSubBtn);

    // Assemble category main
    categoryMain.appendChild(toggle);
    categoryMain.appendChild(button);
    categoryMain.appendChild(actions);
    categoryItem.appendChild(categoryMain);

    // Create subcategories container
    if (Object.keys(category.subcategories).length > 0) {
        const subcategoriesContainer = document.createElement('div');
        subcategoriesContainer.className = `subcategories ${category.isExpanded ? '' : 'collapsed'}`;
        
        Object.values(category.subcategories).forEach(subcategory => {
            const subItem = createSubcategoryElement(subcategory, category.id);
            subcategoriesContainer.appendChild(subItem);
        });
        
        categoryItem.appendChild(subcategoriesContainer);
    }

    return categoryItem;
}

function createSubcategoryElement(subcategory, parentId) {
    const subItem = document.createElement('div');
    subItem.className = 'subcategory-item';
    subItem.dataset.subcategoryId = subcategory.id;
    subItem.dataset.parentId = parentId;

    // Subcategory button
    const button = document.createElement('button');
    button.className = 'subcategory-button';
    button.textContent = subcategory.name;
    button.addEventListener('click', (e) => {
        e.stopPropagation();
        selectCategory(subcategory.id, subcategory.name, true, parentId);
    });

    // Subcategory actions
    const actions = document.createElement('div');
    actions.className = 'subcategory-actions';

    // Edit button (only for non-default subcategories)
    if (!subcategory.isDefault) {
        const editBtn = document.createElement('button');
        editBtn.className = 'action-btn edit-btn';
        editBtn.innerHTML = '✎';
        editBtn.title = 'Edit Subcategory';
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showCategoryModal('edit', subcategory.id, parentId);
        });
        actions.appendChild(editBtn);
    }

    // Delete button (only for non-default subcategories)
    if (!subcategory.isDefault) {
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'action-btn delete-btn';
        deleteBtn.innerHTML = '×';
        deleteBtn.title = 'Delete Subcategory';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            confirmDeleteCategory(subcategory.id, parentId);
        });
        actions.appendChild(deleteBtn);
    }

    subItem.appendChild(button);
    subItem.appendChild(actions);

    return subItem;
}

function toggleCategoryExpansion(categoryId) {
    categoryManager.toggleExpansion(categoryId);
    const categoryItem = document.querySelector(`[data-category-id="${categoryId}"]`);
    const toggle = categoryItem.querySelector('.category-toggle');
    const subcategories = categoryItem.querySelector('.subcategories');
    
    if (subcategories) {
        const isExpanded = !subcategories.classList.contains('collapsed');
        
        if (isExpanded) {
            subcategories.classList.add('collapsed');
            toggle.classList.remove('expanded');
        } else {
            subcategories.classList.remove('collapsed');
            toggle.classList.add('expanded');
        }
    }
}

function selectCategory(categoryId, categoryName, isSubcategory = false, parentId = null) {
    // Remove active class from all categories and subcategories
    document.querySelectorAll('.category-main.active, .subcategory-item.active').forEach(item => {
        item.classList.remove('active');
    });

    // Add active class to selected category
    if (isSubcategory && parentId) {
        const subItem = document.querySelector(`[data-subcategory-id="${categoryId}"][data-parent-id="${parentId}"]`);
        if (subItem) subItem.classList.add('active');
    } else {
        const mainItem = document.querySelector(`[data-category-id="${categoryId}"]`);
        if (mainItem) mainItem.classList.add('active');
    }

    // Update content title and prompts
    updateContentTitle(categoryName);
    updatePromptsDisplay(categoryName);

    // Close mobile menu if open
    if (window.innerWidth <= 768) {
        closeMobileMenu();
    }
}

function updateContentTitle(categoryName) {
    const contentTitle = document.querySelector('.content-title');
    if (contentTitle) {
        contentTitle.textContent = categoryName;
    }
}

// Category Navigation
function initializeCategoryNavigation() {
    // Category navigation is now handled by the tree rendering functions
    // This function can be used for additional navigation setup if needed
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
        // Main category prompts
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
            },
            {
                title: 'Market Research Assistant',
                category: 'Business',
                description: 'Conduct thorough market research and competitor analysis.'
            },
            {
                title: 'Brand Strategy Creator',
                category: 'Creative',
                description: 'Develop comprehensive brand strategies and positioning.'
            },
            {
                title: 'Data Analysis Helper',
                category: 'Analysis',
                description: 'Extract insights from complex datasets and create reports.'
            }
        ],
        
        // Writing category and subcategories
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
            },
            {
                title: 'Content Calendar Planner',
                category: 'Writing',
                description: 'Plan and organize content creation across multiple platforms.'
            }
        ],
        'Blog Posts': [
            {
                title: 'SEO Blog Post Generator',
                category: 'Blog Posts',
                description: 'Create SEO-optimized blog posts that rank well in search engines.'
            },
            {
                title: 'Technical Blog Writer',
                category: 'Blog Posts',
                description: 'Write clear technical articles for developer audiences.'
            }
        ],
        'Emails': [
            {
                title: 'Professional Email Templates',
                category: 'Emails',
                description: 'Create professional email templates for business communication.'
            },
            {
                title: 'Newsletter Content Creator',
                category: 'Emails',
                description: 'Generate engaging content for email newsletters.'
            }
        ],
        
        // Coding category and subcategories
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
            },
            {
                title: 'Code Architecture Reviewer',
                category: 'Coding',
                description: 'Review system architecture and suggest improvements.'
            }
        ],
        'Debugging': [
            {
                title: 'JavaScript Error Analyzer',
                category: 'Debugging',
                description: 'Identify and fix JavaScript errors and performance issues.'
            },
            {
                title: 'SQL Query Optimizer',
                category: 'Debugging',
                description: 'Optimize SQL queries for better performance.'
            }
        ],
        'Documentation': [
            {
                title: 'API Reference Generator',
                category: 'Documentation',
                description: 'Create comprehensive API reference documentation.'
            },
            {
                title: 'Code Comment Generator',
                category: 'Documentation',
                description: 'Generate clear and helpful code comments.'
            }
        ],
        
        // Business category and subcategories
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
            },
            {
                title: 'Business Plan Creator',
                category: 'Business',
                description: 'Develop detailed business plans for startups and expansions.'
            }
        ],
        'Analysis': [
            {
                title: 'SWOT Analysis Generator',
                category: 'Analysis',
                description: 'Create detailed SWOT analyses for strategic planning.'
            },
            {
                title: 'Financial Report Analyzer',
                category: 'Analysis',
                description: 'Analyze financial reports and identify key insights.'
            }
        ],
        'Proposals': [
            {
                title: 'Project Proposal Writer',
                category: 'Proposals',
                description: 'Write compelling project proposals that win business.'
            },
            {
                title: 'Grant Proposal Assistant',
                category: 'Proposals',
                description: 'Create effective grant proposals for funding applications.'
            }
        ],
        
        // Creative category and subcategories
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
            },
            {
                title: 'Marketing Campaign Creator',
                category: 'Creative',
                description: 'Develop creative marketing campaigns that engage audiences.'
            }
        ],
        'Branding': [
            {
                title: 'Brand Identity Creator',
                category: 'Branding',
                description: 'Develop comprehensive brand identities and guidelines.'
            },
            {
                title: 'Logo Concept Generator',
                category: 'Branding',
                description: 'Generate creative logo concepts and design briefs.'
            }
        ],
        'Social Media': [
            {
                title: 'Instagram Caption Writer',
                category: 'Social Media',
                description: 'Create engaging Instagram captions that drive engagement.'
            },
            {
                title: 'Twitter Thread Creator',
                category: 'Social Media',
                description: 'Develop compelling Twitter threads that go viral.'
            }
        ],
        
        // Analysis main category and subcategories
        'Analysis Main': [
            {
                title: 'Data Insights Extractor',
                category: 'Analysis Main',
                description: 'Extract meaningful insights from complex datasets.'
            },
            {
                title: 'Competitive Analysis Framework',
                category: 'Analysis Main',
                description: 'Analyze competitors and market positioning systematically.'
            },
            {
                title: 'Performance Metrics Analyzer',
                category: 'Analysis Main',
                description: 'Analyze key performance metrics and create actionable reports.'
            }
        ],
        'Data Insights': [
            {
                title: 'Customer Data Analyzer',
                category: 'Data Insights',
                description: 'Analyze customer behavior data and identify trends.'
            },
            {
                title: 'Sales Performance Tracker',
                category: 'Data Insights',
                description: 'Track and analyze sales performance across metrics.'
            }
        ],
        'Competitive Analysis': [
            {
                title: 'Competitor Research Assistant',
                category: 'Competitive Analysis',
                description: 'Research competitors and analyze their strategies.'
            },
            {
                title: 'Market Position Analyzer',
                category: 'Competitive Analysis',
                description: 'Analyze market positioning and competitive advantages.'
            }
        ]
    };
    
    // Map category names to handle both display names and IDs
    const categoryMappings = {
        'Analysis': 'Analysis Main'
    };
    
    const mappedCategory = categoryMappings[category] || category;
    return promptData[mappedCategory] || promptData['All Prompts'];
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

// Modal Management
function showCategoryModal(mode, categoryId = null, parentId = null) {
    const modal = document.getElementById('categoryModal');
    const overlay = document.getElementById('modalOverlay');
    const form = document.getElementById('categoryForm');
    const modalTitle = document.getElementById('modalTitle');
    const categoryNameInput = document.getElementById('categoryName');
    const parentCategoryGroup = document.getElementById('parentCategoryGroup');
    const parentCategorySelect = document.getElementById('parentCategory');
    
    // Reset form
    form.reset();
    
    // Configure modal based on mode
    switch (mode) {
        case 'add':
            modalTitle.textContent = 'Add Category';
            parentCategoryGroup.style.display = 'none';
            break;
            
        case 'add-subcategory':
            modalTitle.textContent = 'Add Subcategory';
            parentCategoryGroup.style.display = 'block';
            populateParentCategorySelect(parentId);
            break;
            
        case 'edit':
            if (parentId) {
                modalTitle.textContent = 'Edit Subcategory';
                const subcategory = categoryManager.getSubcategory(parentId, categoryId);
                categoryNameInput.value = subcategory ? subcategory.name : '';
                parentCategoryGroup.style.display = 'block';
                populateParentCategorySelect(parentId);
            } else {
                modalTitle.textContent = 'Edit Category';
                const category = categoryManager.getCategory(categoryId);
                categoryNameInput.value = category ? category.name : '';
                parentCategoryGroup.style.display = 'none';
            }
            break;
    }
    
    // Store modal state
    modal.dataset.mode = mode;
    modal.dataset.categoryId = categoryId || '';
    modal.dataset.parentId = parentId || '';
    
    // Show modal
    modal.classList.add('show');
    overlay.classList.add('show');
    
    // Focus on name input
    setTimeout(() => categoryNameInput.focus(), 100);
}

function populateParentCategorySelect(selectedParentId = null) {
    const select = document.getElementById('parentCategory');
    const categories = categoryManager.getAllCategories();
    
    // Clear existing options except the first one
    select.innerHTML = '<option value="">Select parent category...</option>';
    
    // Add category options
    Object.values(categories).forEach(category => {
        if (category.id !== 'all') { // Don't allow "All Prompts" as parent
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            option.selected = category.id === selectedParentId;
            select.appendChild(option);
        }
    });
}

function hideCategoryModal() {
    const modal = document.getElementById('categoryModal');
    const overlay = document.getElementById('modalOverlay');
    
    modal.classList.remove('show');
    overlay.classList.remove('show');
    
    // Clear dataset
    delete modal.dataset.mode;
    delete modal.dataset.categoryId;
    delete modal.dataset.parentId;
}

function showConfirmModal(message, onConfirm) {
    const modal = document.getElementById('confirmModal');
    const overlay = document.getElementById('modalOverlay');
    const messageEl = document.getElementById('confirmMessage');
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    
    messageEl.textContent = message;
    
    // Remove old event listeners and add new one
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    
    newConfirmBtn.addEventListener('click', () => {
        onConfirm();
        hideConfirmModal();
    });
    
    modal.classList.add('show');
    overlay.classList.add('show');
}

function hideConfirmModal() {
    const modal = document.getElementById('confirmModal');
    const overlay = document.getElementById('modalOverlay');
    
    modal.classList.remove('show');
    overlay.classList.remove('show');
}

function confirmDeleteCategory(categoryId, parentId = null) {
    let categoryName;
    let message;
    
    if (parentId) {
        const subcategory = categoryManager.getSubcategory(parentId, categoryId);
        categoryName = subcategory ? subcategory.name : 'this subcategory';
        message = `Are you sure you want to delete the subcategory "${categoryName}"? This action cannot be undone.`;
    } else {
        const category = categoryManager.getCategory(categoryId);
        categoryName = category ? category.name : 'this category';
        const subcategoryCount = category ? Object.keys(category.subcategories).length : 0;
        message = subcategoryCount > 0 
            ? `Are you sure you want to delete the category "${categoryName}" and all its ${subcategoryCount} subcategories? This action cannot be undone.`
            : `Are you sure you want to delete the category "${categoryName}"? This action cannot be undone.`;
    }
    
    showConfirmModal(message, () => {
        categoryManager.deleteCategory(categoryId, parentId);
        renderCategoryTree();
    });
}

// Form Handling
function handleCategoryFormSubmit(event) {
    event.preventDefault();
    
    const modal = document.getElementById('categoryModal');
    const categoryNameInput = document.getElementById('categoryName');
    const parentCategorySelect = document.getElementById('parentCategory');
    
    const mode = modal.dataset.mode;
    const categoryId = modal.dataset.categoryId;
    const parentId = modal.dataset.parentId;
    const categoryName = categoryNameInput.value.trim();
    
    // Validation
    if (!categoryName) {
        alert('Please enter a category name.');
        categoryNameInput.focus();
        return;
    }
    
    if (categoryName.length > 50) {
        alert('Category name must be 50 characters or less.');
        categoryNameInput.focus();
        return;
    }
    
    try {
        switch (mode) {
            case 'add':
                categoryManager.createCategory(categoryName);
                break;
                
            case 'add-subcategory':
                const selectedParentId = parentCategorySelect.value || parentId;
                if (!selectedParentId) {
                    alert('Please select a parent category.');
                    return;
                }
                categoryManager.createCategory(categoryName, selectedParentId);
                break;
                
            case 'edit':
                categoryManager.updateCategory(categoryId, categoryName, parentId);
                break;
        }
        
        // Refresh the category tree
        renderCategoryTree();
        
        // Hide modal
        hideCategoryModal();
        
    } catch (error) {
        console.error('Error saving category:', error);
        alert('An error occurred while saving the category. Please try again.');
    }
}

// Button Event Handlers
function initializeButtons() {
    const addPromptBtn = document.querySelector('.add-prompt-btn');
    const addCategoryBtn = document.getElementById('addCategoryBtn');
    
    // Add prompt button
    if (addPromptBtn) {
        addPromptBtn.addEventListener('click', addNewPrompt);
    }
    
    // Add category button
    if (addCategoryBtn) {
        addCategoryBtn.addEventListener('click', () => {
            showCategoryModal('add');
        });
    }
    
    // Modal event listeners
    const categoryForm = document.getElementById('categoryForm');
    const modalClose = document.getElementById('modalClose');
    const modalOverlay = document.getElementById('modalOverlay');
    const cancelBtn = document.getElementById('cancelBtn');
    const confirmModalClose = document.getElementById('confirmModalClose');
    const confirmCancelBtn = document.getElementById('confirmCancelBtn');
    
    if (categoryForm) {
        categoryForm.addEventListener('submit', handleCategoryFormSubmit);
    }
    
    if (modalClose) {
        modalClose.addEventListener('click', hideCategoryModal);
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', hideCategoryModal);
    }
    
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                const categoryModal = document.getElementById('categoryModal');
                const confirmModal = document.getElementById('confirmModal');
                
                if (categoryModal.classList.contains('show')) {
                    hideCategoryModal();
                } else if (confirmModal.classList.contains('show')) {
                    hideConfirmModal();
                }
            }
        });
    }
    
    if (confirmModalClose) {
        confirmModalClose.addEventListener('click', hideConfirmModal);
    }
    
    if (confirmCancelBtn) {
        confirmCancelBtn.addEventListener('click', hideConfirmModal);
    }
    
    // Escape key handler
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const categoryModal = document.getElementById('categoryModal');
            const confirmModal = document.getElementById('confirmModal');
            
            if (categoryModal && categoryModal.classList.contains('show')) {
                hideCategoryModal();
            } else if (confirmModal && confirmModal.classList.contains('show')) {
                hideConfirmModal();
            }
        }
    });
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