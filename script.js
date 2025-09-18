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

// Prompt Management Data Structure
class PromptManager {
    constructor() {
        this.prompts = this.loadPrompts();
        this.initializeDefaultPrompts();
    }

    // Load prompts from localStorage
    loadPrompts() {
        const stored = localStorage.getItem('aiPrompts');
        const prompts = stored ? JSON.parse(stored) : [];
        
        // Add backward compatibility for prompts without usageHistory and versions
        prompts.forEach(prompt => {
            if (!prompt.usageHistory) {
                prompt.usageHistory = [];
            }
            if (!prompt.versions) {
                prompt.versions = [];
            }
            if (typeof prompt.version === 'undefined') {
                prompt.version = 1;
            }
        });
        
        return prompts;
    }

    // Save prompts to localStorage
    savePrompts() {
        localStorage.setItem('aiPrompts', JSON.stringify(this.prompts));
    }

    // Initialize default prompts if none exist
    initializeDefaultPrompts() {
        if (this.prompts.length === 0) {
            this.prompts = [
                {
                    id: this.generateId(),
                    title: 'Welcome to AI Prompt Manager',
                    content: 'This is your prompt management dashboard. Use the sidebar to organize your prompts by categories, and click "Add New Prompt" to get started.',
                    category: 'all',
                    subcategory: null,
                    aiModel: 'ChatGPT',
                    tags: ['welcome', 'intro'],
                    starRating: 5,
                    usageHistory: [],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    id: this.generateId(),
                    title: 'Code Review Assistant',
                    content: 'Please review the following code for best practices, potential bugs, and improvements. Focus on code quality, performance, and maintainability. Provide specific recommendations with examples.',
                    category: 'coding',
                    subcategory: 'debugging',
                    aiModel: 'Claude',
                    tags: ['code-review', 'debugging', 'best-practices'],
                    starRating: 4,
                    usageHistory: [],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    id: this.generateId(),
                    title: 'Creative Writing Starter',
                    content: 'Generate 5 creative story ideas for [GENRE] fiction. Each idea should include a compelling protagonist, conflict, and unique setting. Focus on originality and emotional depth.',
                    category: 'writing',
                    subcategory: 'blog-posts',
                    aiModel: 'ChatGPT',
                    tags: ['creative-writing', 'story-ideas', 'fiction'],
                    starRating: 5,
                    usageHistory: [],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            ];
            this.savePrompts();
        }
    }

    // Create new prompt
    createPrompt(promptData) {
        const prompt = {
            id: this.generateId(),
            title: promptData.title,
            content: promptData.content,
            category: promptData.category,
            subcategory: promptData.subcategory || null,
            aiModel: promptData.aiModel,
            tags: promptData.tags || [],
            starRating: parseInt(promptData.starRating) || 0,
            usageHistory: [],
            version: 1,
            versions: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.prompts.push(prompt);
        this.savePrompts();
        
        // Refresh search manager if available
        if (window.searchFilterManager) {
            window.searchFilterManager.refreshData();
        }
        
        return prompt;
    }

    // Update prompt
    updatePrompt(id, promptData) {
        const index = this.prompts.findIndex(p => p.id === id);
        if (index !== -1) {
            const currentPrompt = this.prompts[index];
            
            // Check if any core content has changed
            const hasChanges = 
                promptData.title !== currentPrompt.title ||
                promptData.content !== currentPrompt.content ||
                promptData.category !== currentPrompt.category ||
                promptData.subcategory !== currentPrompt.subcategory ||
                promptData.aiModel !== currentPrompt.aiModel ||
                JSON.stringify(promptData.tags) !== JSON.stringify(currentPrompt.tags);
            
            if (hasChanges) {
                // Save current version to history
                const versionSnapshot = {
                    id: this.generateVersionId(),
                    version: currentPrompt.version,
                    title: currentPrompt.title,
                    content: currentPrompt.content,
                    category: currentPrompt.category,
                    subcategory: currentPrompt.subcategory,
                    aiModel: currentPrompt.aiModel,
                    tags: [...currentPrompt.tags],
                    starRating: currentPrompt.starRating,
                    savedAt: currentPrompt.updatedAt,
                    changes: this.generateChangeIndicators(currentPrompt, promptData)
                };
                
                if (!currentPrompt.versions) {
                    currentPrompt.versions = [];
                }
                currentPrompt.versions.push(versionSnapshot);
                
                // Increment version number
                const newVersion = (currentPrompt.version || 1) + 1;
                
                this.prompts[index] = {
                    ...currentPrompt,
                    ...promptData,
                    version: newVersion,
                    starRating: parseInt(promptData.starRating) || currentPrompt.starRating || 0,
                    updatedAt: new Date().toISOString()
                };
            } else {
                // Only update non-content fields (like star rating)
                this.prompts[index] = {
                    ...currentPrompt,
                    starRating: parseInt(promptData.starRating) || currentPrompt.starRating || 0,
                    updatedAt: new Date().toISOString()
                };
            }
            
            this.savePrompts();
            
            // Refresh search manager if available
            if (window.searchFilterManager) {
                window.searchFilterManager.refreshData();
            }
            
            return this.prompts[index];
        }
        return null;
    }

    // Delete prompt
    deletePrompt(id) {
        const index = this.prompts.findIndex(p => p.id === id);
        if (index !== -1) {
            this.prompts.splice(index, 1);
            this.savePrompts();
            
            // Refresh search manager if available
            if (window.searchFilterManager) {
                window.searchFilterManager.refreshData();
            }
            
            return true;
        }
        return false;
    }

    // Get prompts by category
    getPromptsByCategory(categoryId, subcategoryId = null) {
        if (categoryId === 'all') {
            return this.prompts;
        }
        
        return this.prompts.filter(prompt => {
            if (subcategoryId) {
                return prompt.category === categoryId && prompt.subcategory === subcategoryId;
            }
            return prompt.category === categoryId;
        });
    }

    // Get prompt by ID
    getPrompt(id) {
        return this.prompts.find(p => p.id === id) || null;
    }

    // Search prompts
    searchPrompts(query) {
        const lowerQuery = query.toLowerCase();
        return this.prompts.filter(prompt => 
            prompt.title.toLowerCase().includes(lowerQuery) ||
            prompt.content.toLowerCase().includes(lowerQuery) ||
            prompt.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
        );
    }

    // Generate unique ID
    generateId() {
        return 'prompt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Get all prompts
    getAllPrompts() {
        return this.prompts;
    }

    // Log usage for a prompt
    logUsage(promptId, usageData) {
        const prompt = this.getPrompt(promptId);
        if (prompt) {
            if (!prompt.usageHistory) {
                prompt.usageHistory = [];
            }
            
            const usageEntry = {
                id: this.generateUsageId(),
                useCase: usageData.useCase,
                outcomeNotes: usageData.outcomeNotes,
                effectivenessRating: parseInt(usageData.effectivenessRating) || 0,
                usedAt: new Date().toISOString()
            };
            
            prompt.usageHistory.push(usageEntry);
            prompt.updatedAt = new Date().toISOString();
            this.savePrompts();
            
            return usageEntry;
        }
        return null;
    }

    // Update prompt rating
    updatePromptRating(promptId, rating) {
        const prompt = this.getPrompt(promptId);
        if (prompt) {
            prompt.starRating = parseInt(rating) || 0;
            prompt.updatedAt = new Date().toISOString();
            this.savePrompts();
            
            // Refresh search manager if available
            if (window.searchFilterManager) {
                window.searchFilterManager.refreshData();
            }
            
            return prompt;
        }
        return null;
    }

    // Get usage statistics for a prompt
    getUsageStats(promptId) {
        const prompt = this.getPrompt(promptId);
        if (prompt && prompt.usageHistory) {
            const usageCount = prompt.usageHistory.length;
            const avgEffectiveness = usageCount > 0 
                ? prompt.usageHistory.reduce((sum, usage) => sum + usage.effectivenessRating, 0) / usageCount 
                : 0;
            
            return {
                usageCount,
                avgEffectiveness: Math.round(avgEffectiveness * 10) / 10,
                lastUsed: usageCount > 0 ? prompt.usageHistory[usageCount - 1].usedAt : null
            };
        }
        return { usageCount: 0, avgEffectiveness: 0, lastUsed: null };
    }

    // Generate unique usage ID
    generateUsageId() {
        return 'usage_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Generate unique version ID
    generateVersionId() {
        return 'version_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Generate change indicators between two prompt versions
    generateChangeIndicators(oldPrompt, newPrompt) {
        const changes = [];
        
        if (oldPrompt.title !== newPrompt.title) {
            changes.push('title');
        }
        if (oldPrompt.content !== newPrompt.content) {
            changes.push('content');
        }
        if (oldPrompt.category !== newPrompt.category) {
            changes.push('category');
        }
        if (oldPrompt.subcategory !== newPrompt.subcategory) {
            changes.push('subcategory');
        }
        if (oldPrompt.aiModel !== newPrompt.aiModel) {
            changes.push('aiModel');
        }
        if (JSON.stringify(oldPrompt.tags) !== JSON.stringify(newPrompt.tags)) {
            changes.push('tags');
        }
        
        return changes;
    }

    // Get version history for a prompt
    getVersionHistory(promptId) {
        const prompt = this.getPrompt(promptId);
        if (prompt && prompt.versions) {
            return prompt.versions.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
        }
        return [];
    }

    // Get specific version of a prompt
    getPromptVersion(promptId, versionId) {
        const prompt = this.getPrompt(promptId);
        if (prompt && prompt.versions) {
            return prompt.versions.find(v => v.id === versionId) || null;
        }
        return null;
    }

    // Restore a previous version
    restorePromptVersion(promptId, versionId) {
        const prompt = this.getPrompt(promptId);
        const version = this.getPromptVersion(promptId, versionId);
        
        if (prompt && version) {
            // Save current state as a version before restoring
            const currentVersionSnapshot = {
                id: this.generateVersionId(),
                version: prompt.version,
                title: prompt.title,
                content: prompt.content,
                category: prompt.category,
                subcategory: prompt.subcategory,
                aiModel: prompt.aiModel,
                tags: [...prompt.tags],
                starRating: prompt.starRating,
                savedAt: prompt.updatedAt,
                changes: ['restored']
            };
            
            prompt.versions.push(currentVersionSnapshot);
            
            // Restore the selected version
            prompt.title = version.title;
            prompt.content = version.content;
            prompt.category = version.category;
            prompt.subcategory = version.subcategory;
            prompt.aiModel = version.aiModel;
            prompt.tags = [...version.tags];
            prompt.starRating = version.starRating;
            prompt.version = (prompt.version || 1) + 1;
            prompt.updatedAt = new Date().toISOString();
            
            this.savePrompts();
            
            // Refresh search manager if available
            if (window.searchFilterManager) {
                window.searchFilterManager.refreshData();
            }
            
            return prompt;
        }
        return null;
    }

    // Compare two versions
    compareVersions(promptId, versionId1, versionId2) {
        const prompt = this.getPrompt(promptId);
        if (!prompt) return null;
        
        let version1, version2;
        
        // Handle current version comparison
        if (versionId1 === 'current') {
            version1 = prompt;
        } else {
            version1 = this.getPromptVersion(promptId, versionId1);
        }
        
        if (versionId2 === 'current') {
            version2 = prompt;
        } else {
            version2 = this.getPromptVersion(promptId, versionId2);
        }
        
        if (!version1 || !version2) return null;
        
        const comparison = {
            version1: {
                id: versionId1,
                version: version1.version || 'current',
                title: version1.title,
                content: version1.content,
                category: version1.category,
                subcategory: version1.subcategory,
                aiModel: version1.aiModel,
                tags: version1.tags,
                date: version1.savedAt || version1.updatedAt
            },
            version2: {
                id: versionId2,
                version: version2.version || 'current',
                title: version2.title,
                content: version2.content,
                category: version2.category,
                subcategory: version2.subcategory,
                aiModel: version2.aiModel,
                tags: version2.tags,
                date: version2.savedAt || version2.updatedAt
            },
            differences: this.generateChangeIndicators(version1, version2)
        };
        
        return comparison;
    }
}

// Global manager instances
let categoryManager;
let promptManager;
let currentVersionHistoryPromptId = null;
let selectedVersions = [];

document.addEventListener('DOMContentLoaded', function() {
    // Initialize managers
    categoryManager = new CategoryManager();
    promptManager = new PromptManager();
    
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
    
    // Initialize search and filter functionality first
    initializeSearch();
    
    // Button event listeners
    initializeButtons();
    
    // Prompt modal event listeners
    initializePromptModal();
    
    // Usage modal event listeners
    initializeUsageModal();
    
    // Version history modal event listeners
    initializeVersionHistoryModal();
    
    // Ensure initial display shows all prompts
    if (searchFilterManager) {
        searchFilterManager.updateDisplay();
    }
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

function updatePromptsDisplay(categoryName) {
    // Use SearchFilterManager if available, otherwise fallback to old method
    if (searchFilterManager) {
        // Clear category filter and apply category-based filtering
        searchFilterManager.activeFilters.category = '';
        
        // Apply category filtering based on active selection
        const activeCategory = document.querySelector('.category-main.active');
        const activeSubcategory = document.querySelector('.subcategory-item.active');
        
        if (activeSubcategory) {
            const parentId = activeSubcategory.dataset.parentId;
            const categoryObj = categoryManager.getCategory(parentId);
            if (categoryObj) {
                searchFilterManager.activeFilters.category = categoryObj.name;
            }
        } else if (activeCategory && activeCategory.dataset.categoryId !== 'all') {
            const categoryId = activeCategory.dataset.categoryId;
            const categoryObj = categoryManager.getCategory(categoryId);
            if (categoryObj) {
                searchFilterManager.activeFilters.category = categoryObj.name;
            }
        }
        
        searchFilterManager.applyFilters();
        return;
    }
    
    // Fallback to old method
    const promptsGrid = document.querySelector('.prompts-grid');
    if (!promptsGrid) return;
    
    promptsGrid.innerHTML = '';
    
    let prompts = [];
    const activeCategory = document.querySelector('.category-main.active');
    const activeSubcategory = document.querySelector('.subcategory-item.active');
    
    if (activeSubcategory) {
        const subcategoryId = activeSubcategory.dataset.subcategoryId;
        const parentId = activeSubcategory.dataset.parentId;
        prompts = promptManager.getPromptsByCategory(parentId, subcategoryId);
    } else if (activeCategory) {
        const categoryId = activeCategory.dataset.categoryId;
        prompts = promptManager.getPromptsByCategory(categoryId);
    }
    
    if (prompts.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = `
            <div class="empty-state-content">
                <h3>No prompts in this category</h3>
                <p>Add your first prompt to get started!</p>
                <button class="btn-primary" onclick="addNewPrompt()">Add New Prompt</button>
            </div>
        `;
        promptsGrid.appendChild(emptyState);
    } else {
        prompts.forEach(prompt => {
            const promptCard = createPromptCard(prompt);
            promptsGrid.appendChild(promptCard);
        });
    }
}

// Enhanced Search and Filter Management
class SearchFilterManager {
    constructor() {
        this.activeFilters = {
            search: '',
            aiModel: '',
            category: '',
            starRating: '',
            dateRange: '',
            tags: []
        };
        this.allPrompts = [];
        this.filteredPrompts = [];
    }

    // Initialize all search and filter functionality
    init() {
        this.loadPrompts();
        this.setupSearchInput();
        this.setupFilterDropdowns();
        this.setupTagCloud();
        this.setupClearFilters();
        this.populateFilterOptions();
        this.updateDisplay();
    }

    // Load prompts from PromptManager
    loadPrompts() {
        if (!promptManager) return;
        
        this.allPrompts = promptManager.getAllPrompts();
        // Normalize star ratings for existing prompts that might not have them
        this.allPrompts.forEach(prompt => {
            if (prompt.starRating === undefined || prompt.starRating === null) {
                prompt.starRating = 0;
            }
        });
        this.filteredPrompts = [...this.allPrompts];
    }

    // Refresh data when prompts are updated
    refreshData() {
        this.loadPrompts();
        this.populateFilterOptions();
        this.applyFilters();
    }

    // Setup real-time search input
    setupSearchInput() {
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.querySelector('.search-btn');
        
        if (!searchInput) return;

        // Real-time search with debounce
        const debouncedSearch = debounce(() => {
            this.activeFilters.search = searchInput.value.trim();
            this.applyFilters();
        }, 300);

        searchInput.addEventListener('input', debouncedSearch);
        
        // Search on button click
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                this.activeFilters.search = searchInput.value.trim();
                this.applyFilters();
            });
        }

        // Search on Enter key
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.activeFilters.search = searchInput.value.trim();
                this.applyFilters();
            }
        });
    }

    // Setup filter dropdown controls
    setupFilterDropdowns() {
        const aiModelFilter = document.getElementById('aiModelFilter');
        const categoryFilter = document.getElementById('categoryFilter');
        const starRatingFilter = document.getElementById('starRatingFilter');
        const dateRangeFilter = document.getElementById('dateRangeFilter');

        if (aiModelFilter) {
            aiModelFilter.addEventListener('change', (e) => {
                this.activeFilters.aiModel = e.target.value;
                this.applyFilters();
            });
        }

        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.activeFilters.category = e.target.value;
                this.applyFilters();
            });
        }

        if (starRatingFilter) {
            starRatingFilter.addEventListener('change', (e) => {
                this.activeFilters.starRating = e.target.value;
                this.applyFilters();
            });
        }

        if (dateRangeFilter) {
            dateRangeFilter.addEventListener('change', (e) => {
                this.activeFilters.dateRange = e.target.value;
                this.applyFilters();
            });
        }
    }

    // Setup tag cloud functionality
    setupTagCloud() {
        this.renderTagCloud();
    }

    // Setup clear filters button
    setupClearFilters() {
        const clearBtn = document.getElementById('clearFiltersBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearAllFilters();
            });
        }
    }

    // Populate filter dropdown options
    populateFilterOptions() {
        if (!promptManager) return;
        
        this.allPrompts = promptManager.getAllPrompts();
        
        // Populate AI Model filter
        const aiModels = [...new Set(this.allPrompts.map(p => p.aiModel).filter(Boolean))];
        this.populateSelect('aiModelFilter', aiModels);

        // Populate Category filter
        if (categoryManager) {
            const categories = categoryManager.getAllCategories();
            const categoryOptions = Object.values(categories)
                .filter(cat => cat.id !== 'all')
                .map(cat => cat.name);
            this.populateSelect('categoryFilter', categoryOptions);
        }
    }

    // Helper function to populate select options
    populateSelect(selectId, options) {
        const select = document.getElementById(selectId);
        if (!select) return;

        // Keep the first option (All ...)
        const firstOption = select.querySelector('option');
        select.innerHTML = '';
        if (firstOption) select.appendChild(firstOption);

        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = option;
            select.appendChild(optionElement);
        });
    }

    // Apply all active filters
    applyFilters() {
        this.loadPrompts(); // Ensure we have the latest data
        this.filteredPrompts = this.allPrompts.filter(prompt => {
            // Search filter
            if (this.activeFilters.search) {
                const searchLower = this.activeFilters.search.toLowerCase();
                const matchesSearch = 
                    prompt.title.toLowerCase().includes(searchLower) ||
                    prompt.content.toLowerCase().includes(searchLower) ||
                    prompt.tags.some(tag => tag.toLowerCase().includes(searchLower));
                if (!matchesSearch) return false;
            }

            // AI Model filter
            if (this.activeFilters.aiModel && prompt.aiModel !== this.activeFilters.aiModel) {
                return false;
            }

            // Category filter
            if (this.activeFilters.category) {
                const categoryName = this.getCategoryName(prompt.category);
                if (categoryName !== this.activeFilters.category) return false;
            }

            // Star rating filter
            if (this.activeFilters.starRating) {
                const rating = prompt.starRating || 0;
                const minRating = parseInt(this.activeFilters.starRating);
                if (rating < minRating) return false;
            }

            // Date range filter
            if (this.activeFilters.dateRange) {
                if (!this.isInDateRange(prompt.createdAt, this.activeFilters.dateRange)) {
                    return false;
                }
            }

            // Tag filters
            if (this.activeFilters.tags.length > 0) {
                const hasMatchingTag = this.activeFilters.tags.some(filterTag =>
                    prompt.tags.some(promptTag => promptTag.toLowerCase() === filterTag.toLowerCase())
                );
                if (!hasMatchingTag) return false;
            }

            return true;
        });

        this.updateDisplay();
    }

    // Get category name by ID
    getCategoryName(categoryId) {
        const categories = categoryManager.getAllCategories();
        return categories[categoryId]?.name || '';
    }

    // Check if date is in specified range
    isInDateRange(dateString, range) {
        const date = new Date(dateString);
        const now = new Date();
        
        switch (range) {
            case 'today':
                return date.toDateString() === now.toDateString();
            case 'week':
                const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
                return date >= weekAgo;
            case 'month':
                const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                return date >= monthAgo;
            case 'year':
                const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
                return date >= yearAgo;
            default:
                return true;
        }
    }

    // Render tag cloud
    renderTagCloud() {
        const tagCloudContainer = document.getElementById('tagCloud');
        if (!tagCloudContainer) return;

        const allPrompts = promptManager.getAllPrompts();
        const tagCounts = {};

        // Count tag occurrences
        allPrompts.forEach(prompt => {
            prompt.tags.forEach(tag => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
        });

        // Sort tags by count (descending)
        const sortedTags = Object.entries(tagCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 20); // Show top 20 tags

        tagCloudContainer.innerHTML = '';

        sortedTags.forEach(([tag, count]) => {
            const tagElement = document.createElement('span');
            tagElement.className = 'tag-cloud-item';
            tagElement.innerHTML = `${tag} <span class="tag-count">${count}</span>`;
            
            // Check if tag is active
            if (this.activeFilters.tags.includes(tag)) {
                tagElement.classList.add('active');
            }

            tagElement.addEventListener('click', () => {
                this.toggleTagFilter(tag);
            });

            tagCloudContainer.appendChild(tagElement);
        });
    }

    // Toggle tag filter
    toggleTagFilter(tag) {
        const index = this.activeFilters.tags.indexOf(tag);
        if (index > -1) {
            this.activeFilters.tags.splice(index, 1);
        } else {
            this.activeFilters.tags.push(tag);
        }
        this.applyFilters();
    }

    // Update display with filtered results
    updateDisplay() {
        this.renderPrompts();
        this.updateResultsCount();
        this.updateActiveFilters();
        this.renderTagCloud();
    }

    // Render filtered prompts
    renderPrompts() {
        const promptsGrid = document.querySelector('.prompts-grid');
        if (!promptsGrid) return;

        promptsGrid.innerHTML = '';

        if (this.filteredPrompts.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.innerHTML = `
                <div class="empty-state-content">
                    <h3>No prompts found</h3>
                    <p>Try adjusting your search or filters, or add a new prompt.</p>
                    <button class="btn-primary" onclick="addNewPrompt()">Add New Prompt</button>
                </div>
            `;
            promptsGrid.appendChild(emptyState);
        } else {
            this.filteredPrompts.forEach(prompt => {
                const promptCard = createPromptCard(prompt);
                promptsGrid.appendChild(promptCard);
            });
        }
    }

    // Update results count
    updateResultsCount() {
        const resultsCount = document.getElementById('resultsCount');
        if (resultsCount) {
            const count = this.filteredPrompts.length;
            resultsCount.textContent = `${count} prompt${count !== 1 ? 's' : ''}`;
        }

        // Update content title
        const contentTitle = document.querySelector('.content-title');
        if (contentTitle) {
            if (this.hasActiveFilters()) {
                contentTitle.textContent = 'Filtered Results';
            } else {
                contentTitle.textContent = 'All Prompts';
            }
        }
    }

    // Update active filters display
    updateActiveFilters() {
        const activeFiltersSection = document.getElementById('activeFiltersSection');
        const activeFiltersContainer = document.getElementById('activeFilters');
        
        if (!activeFiltersSection || !activeFiltersContainer) return;

        const hasFilters = this.hasActiveFilters();
        activeFiltersSection.style.display = hasFilters ? 'block' : 'none';

        if (!hasFilters) return;

        activeFiltersContainer.innerHTML = '';

        // Add search filter chip
        if (this.activeFilters.search) {
            this.addFilterChip('Search', this.activeFilters.search, () => {
                document.getElementById('searchInput').value = '';
                this.activeFilters.search = '';
                this.applyFilters();
            });
        }

        // Add AI model filter chip
        if (this.activeFilters.aiModel) {
            this.addFilterChip('AI Model', this.activeFilters.aiModel, () => {
                document.getElementById('aiModelFilter').value = '';
                this.activeFilters.aiModel = '';
                this.applyFilters();
            });
        }

        // Add category filter chip
        if (this.activeFilters.category) {
            this.addFilterChip('Category', this.activeFilters.category, () => {
                document.getElementById('categoryFilter').value = '';
                this.activeFilters.category = '';
                this.applyFilters();
            });
        }

        // Add star rating filter chip
        if (this.activeFilters.starRating) {
            this.addFilterChip('Rating', `${this.activeFilters.starRating}+ stars`, () => {
                document.getElementById('starRatingFilter').value = '';
                this.activeFilters.starRating = '';
                this.applyFilters();
            });
        }

        // Add date range filter chip
        if (this.activeFilters.dateRange) {
            this.addFilterChip('Date', this.activeFilters.dateRange, () => {
                document.getElementById('dateRangeFilter').value = '';
                this.activeFilters.dateRange = '';
                this.applyFilters();
            });
        }

        // Add tag filter chips
        this.activeFilters.tags.forEach(tag => {
            this.addFilterChip('Tag', tag, () => {
                this.toggleTagFilter(tag);
            });
        });
    }

    // Add filter chip element
    addFilterChip(type, value, removeCallback) {
        const activeFiltersContainer = document.getElementById('activeFilters');
        if (!activeFiltersContainer) return;

        const chip = document.createElement('div');
        chip.className = 'filter-chip';
        chip.innerHTML = `
            <span>${type}: ${value}</span>
            <button class="filter-chip-remove" title="Remove filter">×</button>
        `;

        const removeBtn = chip.querySelector('.filter-chip-remove');
        removeBtn.addEventListener('click', removeCallback);

        activeFiltersContainer.appendChild(chip);
    }

    // Check if any filters are active
    hasActiveFilters() {
        return !!(
            this.activeFilters.search ||
            this.activeFilters.aiModel ||
            this.activeFilters.category ||
            this.activeFilters.starRating ||
            this.activeFilters.dateRange ||
            this.activeFilters.tags.length > 0
        );
    }

    // Clear all filters
    clearAllFilters() {
        // Clear filter values
        this.activeFilters = {
            search: '',
            aiModel: '',
            category: '',
            starRating: '',
            dateRange: '',
            tags: []
        };

        // Clear form inputs
        const searchInput = document.getElementById('searchInput');
        if (searchInput) searchInput.value = '';

        const selects = ['aiModelFilter', 'categoryFilter', 'starRatingFilter', 'dateRangeFilter'];
        selects.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (select) select.value = '';
        });

        // Apply filters (which will show all prompts)
        this.applyFilters();
    }
}

// Global search filter manager instance
let searchFilterManager;

// Update search functionality to use real data
function initializeSearch() {
    // Create and initialize the search filter manager
    if (typeof SearchFilterManager !== 'undefined') {
        searchFilterManager = new SearchFilterManager();
        window.searchFilterManager = searchFilterManager; // Make globally accessible
        
        // Initialize after a short delay to ensure DOM is ready
        setTimeout(() => {
            searchFilterManager.init();
        }, 100);
    } else {
        console.error('SearchFilterManager class not found');
    }
}

// Legacy function - now handled by SearchFilterManager
function displaySearchResults(results, query) {
    if (searchFilterManager) {
        searchFilterManager.updateDisplay();
    }
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
    card.dataset.promptId = prompt.id;
    
    // Format creation date
    const createdDate = new Date(prompt.createdAt).toLocaleDateString();
    
    // Define tag colors for safe usage
    const tagColors = ['blue', 'green', 'purple', 'orange', 'pink', 'teal', 'red', 'indigo'];
    
    // Content truncation logic (safe)
    const shouldTruncate = prompt.content.length > 150;
    const truncatedContent = shouldTruncate 
        ? prompt.content.substring(0, 150) + '...'
        : prompt.content;
    
    // Create elements safely using DOM methods to prevent XSS
    const header = document.createElement('div');
    header.className = 'prompt-header';
    
    const title = document.createElement('h3');
    title.className = 'prompt-title';
    title.textContent = prompt.title; // Safe text insertion
    
    const meta = document.createElement('div');
    meta.className = 'prompt-meta';
    
    const modelBadge = document.createElement('span');
    modelBadge.className = `ai-model-badge ai-model-${prompt.aiModel.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    modelBadge.textContent = prompt.aiModel; // Safe text insertion
    
    const dateSpan = document.createElement('span');
    dateSpan.className = 'prompt-date';
    dateSpan.textContent = createdDate;
    
    // Add version number
    const versionSpan = document.createElement('span');
    versionSpan.className = 'prompt-version';
    versionSpan.textContent = `v${prompt.version || 1}`;
    versionSpan.title = `Version ${prompt.version || 1}`;
    
    meta.appendChild(modelBadge);
    meta.appendChild(dateSpan);
    meta.appendChild(versionSpan);
    header.appendChild(title);
    header.appendChild(meta);

    // Add interactive star rating
    const ratingDiv = document.createElement('div');
    ratingDiv.className = 'prompt-rating-interactive';
    
    const starRating = document.createElement('div');
    starRating.className = 'star-rating';
    starRating.dataset.promptId = prompt.id;
    
    for (let i = 1; i <= 5; i++) {
        const star = document.createElement('span');
        star.className = 'star';
        star.dataset.rating = i;
        star.textContent = '⭐';
        if (i <= (parseInt(prompt.starRating) || 0)) {
            star.classList.add('active');
        }
        star.addEventListener('click', () => updatePromptRating(prompt.id, i));
        star.addEventListener('mouseenter', () => highlightStars(starRating, i));
        star.addEventListener('mouseleave', () => resetStars(starRating, prompt.starRating));
        starRating.appendChild(star);
    }

    const ratingText = document.createElement('span');
    ratingText.className = 'rating-text';
    const currentRating = parseInt(prompt.starRating) || 0;
    ratingText.textContent = currentRating > 0 ? `${currentRating} star${currentRating !== 1 ? 's' : ''}` : 'No rating';
    
    ratingDiv.appendChild(starRating);
    ratingDiv.appendChild(ratingText);

    // Add usage statistics
    const usageStats = promptManager.getUsageStats(prompt.id);
    if (usageStats.usageCount > 0) {
        const usageStatsDiv = document.createElement('div');
        usageStatsDiv.className = 'usage-stats';

        const usageCountStat = document.createElement('div');
        usageCountStat.className = 'usage-stat';
        usageCountStat.innerHTML = `
            <span class="usage-stat-value">${usageStats.usageCount}</span>
            <span class="usage-stat-label">Uses</span>
        `;

        const avgEffectiveness = document.createElement('div');
        avgEffectiveness.className = 'usage-stat';
        avgEffectiveness.innerHTML = `
            <span class="usage-stat-value">${usageStats.avgEffectiveness}⭐</span>
            <span class="usage-stat-label">Avg Rating</span>
        `;

        usageStatsDiv.appendChild(usageCountStat);
        usageStatsDiv.appendChild(avgEffectiveness);
        
        if (usageStats.lastUsed) {
            const lastUsedDiv = document.createElement('div');
            lastUsedDiv.className = 'usage-history-summary';
            const lastUsedDate = new Date(usageStats.lastUsed).toLocaleDateString();
            lastUsedDiv.innerHTML = `<span class="last-used">Last used: ${lastUsedDate}</span>`;
            ratingDiv.appendChild(lastUsedDiv);
        }
        
        ratingDiv.appendChild(usageStatsDiv);
    }
    
    // Create content section safely
    const contentDiv = document.createElement('div');
    contentDiv.className = 'prompt-content';
    
    if (shouldTruncate) {
        const truncatedP = document.createElement('p');
        truncatedP.className = 'prompt-description truncated';
        truncatedP.id = `content-${prompt.id}`;
        truncatedP.textContent = truncatedContent; // Safe text insertion
        
        const fullP = document.createElement('p');
        fullP.className = 'prompt-description full';
        fullP.id = `full-content-${prompt.id}`;
        fullP.style.display = 'none';
        fullP.textContent = prompt.content; // Safe text insertion
        
        const readMoreBtn = document.createElement('button');
        readMoreBtn.className = 'read-more-btn';
        readMoreBtn.textContent = 'Read More';
        readMoreBtn.onclick = () => toggleReadMore(prompt.id);
        
        contentDiv.appendChild(truncatedP);
        contentDiv.appendChild(fullP);
        contentDiv.appendChild(readMoreBtn);
    } else {
        const contentP = document.createElement('p');
        contentP.className = 'prompt-description';
        contentP.textContent = prompt.content; // Safe text insertion
        contentDiv.appendChild(contentP);
    }
    
    // Create tags section safely
    const tagsDiv = document.createElement('div');
    if (prompt.tags.length > 0) {
        tagsDiv.className = 'prompt-tags';
        prompt.tags.forEach((tag, index) => {
            const tagSpan = document.createElement('span');
            const colorClass = tagColors[index % tagColors.length];
            tagSpan.className = `tag tag-${colorClass}`;
            tagSpan.textContent = tag; // Safe text insertion
            tagsDiv.appendChild(tagSpan);
        });
    }
    
    // Create actions section safely
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'prompt-actions';
    
    const editBtn = document.createElement('button');
    editBtn.className = 'btn-secondary';
    editBtn.title = 'Edit Prompt';
    editBtn.onclick = () => editPrompt(prompt.id);
    editBtn.innerHTML = '<span class="btn-icon">✎</span> Edit';
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-danger btn-small';
    deleteBtn.title = 'Delete Prompt';
    deleteBtn.onclick = () => confirmDeletePrompt(prompt.id);
    deleteBtn.innerHTML = '<span class="btn-icon">×</span>';
    
    const copyBtn = document.createElement('button');
    copyBtn.className = 'btn-primary';
    copyBtn.title = 'Copy to Clipboard';
    copyBtn.onclick = () => copyPrompt(prompt.id);
    copyBtn.innerHTML = '<span class="btn-icon">📋</span> Copy';

    const logUsageBtn = document.createElement('button');
    logUsageBtn.className = 'log-usage-btn';
    logUsageBtn.title = 'Log Usage';
    logUsageBtn.onclick = () => showUsageModal(prompt.id);
    logUsageBtn.innerHTML = '<span class="btn-icon">📊</span> Log Usage';
    
    // Add Version History button
    const versionHistoryBtn = document.createElement('button');
    versionHistoryBtn.className = 'btn-secondary version-history-btn';
    versionHistoryBtn.title = 'View Version History';
    versionHistoryBtn.onclick = () => showVersionHistoryModal(prompt.id);
    versionHistoryBtn.innerHTML = '<span class="btn-icon">🕒</span> History';
    
    actionsDiv.appendChild(editBtn);
    actionsDiv.appendChild(deleteBtn);
    actionsDiv.appendChild(copyBtn);
    actionsDiv.appendChild(logUsageBtn);
    actionsDiv.appendChild(versionHistoryBtn);
    
    // Assemble the card
    card.appendChild(header);
    card.appendChild(ratingDiv);
    card.appendChild(contentDiv);
    if (prompt.tags.length > 0) {
        card.appendChild(tagsDiv);
    }
    card.appendChild(actionsDiv);
    
    return card;
}

// Duplicate search function removed - using proper PromptManager-based search

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

// Prompt Management Variables
let currentEditingPromptId = null;

// Show Prompt Modal
function showPromptModal(mode = 'add', promptId = null) {
    const modal = document.getElementById('promptModal');
    const modalOverlay = document.getElementById('modalOverlay');
    const modalTitle = document.getElementById('promptModalTitle');
    const form = document.getElementById('promptForm');
    
    if (!modal || !modalOverlay) return;
    
    // Reset form
    form.reset();
    currentEditingPromptId = null;
    
    // Setup modal for add or edit mode
    if (mode === 'edit' && promptId) {
        const prompt = promptManager.getPrompt(promptId);
        if (prompt) {
            modalTitle.textContent = 'Edit Prompt';
            document.getElementById('promptTitle').value = prompt.title;
            document.getElementById('promptContent').value = prompt.content;
            document.getElementById('promptAiModel').value = prompt.aiModel;
            document.getElementById('promptTags').value = prompt.tags.join(', ');
            currentEditingPromptId = promptId;
            
            // Set category and subcategory
            populateCategoryDropdown();
            setTimeout(() => {
                document.getElementById('promptCategory').value = prompt.category;
                populateSubcategoryDropdown();
                setTimeout(() => {
                    if (prompt.subcategory) {
                        document.getElementById('promptSubcategory').value = prompt.subcategory;
                    }
                }, 50);
            }, 50);
        }
    } else {
        modalTitle.textContent = 'Add New Prompt';
        populateCategoryDropdown();
    }
    
    // Show modal
    modal.classList.add('show');
    modalOverlay.classList.add('show');
    document.body.style.overflow = 'hidden';
    
    // Focus on title field
    setTimeout(() => {
        document.getElementById('promptTitle').focus();
    }, 100);
}

// Hide Prompt Modal
function hidePromptModal() {
    const modal = document.getElementById('promptModal');
    const modalOverlay = document.getElementById('modalOverlay');
    
    modal.classList.remove('show');
    modalOverlay.classList.remove('show');
    document.body.style.overflow = '';
    currentEditingPromptId = null;
}

// Populate Category Dropdown
function populateCategoryDropdown() {
    const categorySelect = document.getElementById('promptCategory');
    const categories = categoryManager.getAllCategories();
    
    // Clear existing options except first
    categorySelect.innerHTML = '<option value="">Select category...</option>';
    
    // Add categories (exclude 'all' category for prompts)
    Object.values(categories).forEach(category => {
        if (category.id !== 'all') {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        }
    });
}

// Populate Subcategory Dropdown
function populateSubcategoryDropdown() {
    const categorySelect = document.getElementById('promptCategory');
    const subcategorySelect = document.getElementById('promptSubcategory');
    const selectedCategoryId = categorySelect.value;
    
    // Clear subcategory options
    subcategorySelect.innerHTML = '<option value="">Select subcategory...</option>';
    
    if (selectedCategoryId) {
        const category = categoryManager.getCategory(selectedCategoryId);
        if (category && category.subcategories) {
            Object.values(category.subcategories).forEach(subcategory => {
                const option = document.createElement('option');
                option.value = subcategory.id;
                option.textContent = subcategory.name;
                subcategorySelect.appendChild(option);
            });
            subcategorySelect.disabled = false;
        } else {
            subcategorySelect.disabled = true;
        }
    } else {
        subcategorySelect.disabled = true;
    }
}

// Handle Prompt Form Submission
function handlePromptFormSubmit(e) {
    e.preventDefault();
    
    const formData = {
        title: document.getElementById('promptTitle').value.trim(),
        content: document.getElementById('promptContent').value.trim(),
        category: document.getElementById('promptCategory').value,
        subcategory: document.getElementById('promptSubcategory').value || null,
        aiModel: document.getElementById('promptAiModel').value,
        tags: document.getElementById('promptTags').value
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0)
    };
    
    // Validate required fields
    if (!formData.title || !formData.content || !formData.category || !formData.aiModel) {
        alert('Please fill in all required fields.');
        return;
    }
    
    try {
        if (currentEditingPromptId) {
            // Update existing prompt
            promptManager.updatePrompt(currentEditingPromptId, formData);
        } else {
            // Create new prompt
            promptManager.createPrompt(formData);
        }
        
        // Hide modal and refresh display
        hidePromptModal();
        refreshCurrentCategoryDisplay();
        
    } catch (error) {
        console.error('Error saving prompt:', error);
        alert('Error saving prompt. Please try again.');
    }
}

function addNewPrompt() {
    showPromptModal('add');
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

// Initialize Prompt Modal Event Listeners
function initializePromptModal() {
    const promptModal = document.getElementById('promptModal');
    const promptModalClose = document.getElementById('promptModalClose');
    const promptCancelBtn = document.getElementById('promptCancelBtn');
    const promptForm = document.getElementById('promptForm');
    const promptCategory = document.getElementById('promptCategory');
    
    // Form submission
    if (promptForm) {
        promptForm.addEventListener('submit', handlePromptFormSubmit);
    }
    
    // Close modal events
    if (promptModalClose) {
        promptModalClose.addEventListener('click', hidePromptModal);
    }
    
    if (promptCancelBtn) {
        promptCancelBtn.addEventListener('click', hidePromptModal);
    }
    
    // Category change event
    if (promptCategory) {
        promptCategory.addEventListener('change', populateSubcategoryDropdown);
    }
    
    // Click outside modal to close
    if (promptModal) {
        promptModal.addEventListener('click', (e) => {
            if (e.target === promptModal) {
                hidePromptModal();
            }
        });
    }
    
    // Escape key handler for prompt modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const promptModal = document.getElementById('promptModal');
            if (promptModal && promptModal.classList.contains('show')) {
                hidePromptModal();
            }
        }
    });
}

// Refresh Current Category Display
function refreshCurrentCategoryDisplay() {
    // Update the search and filter system when category changes
    if (searchFilterManager) {
        searchFilterManager.populateFilterOptions();
        searchFilterManager.applyFilters();
    } else {
        // Fallback for when search manager not ready
        const activeSub = document.querySelector('.subcategory-item.active');
        const activeCat = document.querySelector('.category-main.active');
        let name = 'All Prompts';
        if (activeSub) name = activeSub.querySelector('.subcategory-button')?.textContent || name;
        else if (activeCat) name = activeCat.querySelector('.category-button')?.textContent || name;
        updateContentTitle(name);
        updatePromptsDisplay(name);
    }
}

// Prompt Action Handlers
function editPrompt(promptId) {
    showPromptModal('edit', promptId);
}

function usePrompt(prompt) {
    // Copy prompt content to clipboard
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(prompt.content).then(() => {
            // Show success message
            const originalTitle = prompt.title;
            alert(`Prompt "${originalTitle}" copied to clipboard!`);
        }).catch(() => {
            // Fallback for older browsers
            copyToClipboardFallback(prompt.content, prompt.title);
        });
    } else {
        copyToClipboardFallback(prompt.content, prompt.title);
    }
}

function copyToClipboardFallback(text, title) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        alert(`Prompt "${title}" copied to clipboard!`);
    } catch (err) {
        alert('Unable to copy to clipboard. Please copy manually.');
        console.error('Copy to clipboard failed:', err);
    }
    
    document.body.removeChild(textArea);
}

// Star Rating Functions
function updatePromptRating(promptId, rating) {
    promptManager.updatePromptRating(promptId, rating);
    
    // Update the visual star rating immediately
    const starRating = document.querySelector(`[data-prompt-id="${promptId}"]`);
    if (starRating) {
        const stars = starRating.querySelectorAll('.star');
        const ratingText = starRating.parentElement.querySelector('.rating-text');
        
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
        
        ratingText.textContent = rating > 0 ? `${rating} star${rating !== 1 ? 's' : ''}` : 'No rating';
    }
    
    // Refresh the entire display to ensure consistency
    if (window.searchFilterManager) {
        window.searchFilterManager.refreshData();
        window.searchFilterManager.updateDisplay();
    }
}

function highlightStars(starRating, rating) {
    const stars = starRating.querySelectorAll('.star');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('hover');
        } else {
            star.classList.remove('hover');
        }
    });
}

function resetStars(starRating, currentRating) {
    const stars = starRating.querySelectorAll('.star');
    stars.forEach((star, index) => {
        star.classList.remove('hover');
        if (index < (parseInt(currentRating) || 0)) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

// Usage Modal Functions
let currentUsagePromptId = null;

function showUsageModal(promptId) {
    const modal = document.getElementById('usageModal');
    const modalOverlay = document.getElementById('modalOverlay');
    const form = document.getElementById('usageForm');
    
    if (!modal || !modalOverlay) return;
    
    // Reset form
    form.reset();
    currentUsagePromptId = promptId;
    
    // Reset effectiveness rating
    document.getElementById('effectivenessRating').value = '0';
    document.getElementById('effectivenessRatingText').textContent = 'No rating';
    const effectivenessStars = document.querySelectorAll('#effectivenessStars .star');
    effectivenessStars.forEach(star => star.classList.remove('active'));
    
    // Show modal
    modal.classList.add('show');
    modalOverlay.classList.add('show');
    document.body.style.overflow = 'hidden';
    
    // Focus on use case field
    setTimeout(() => {
        document.getElementById('useCase').focus();
    }, 100);
}

function hideUsageModal() {
    const modal = document.getElementById('usageModal');
    const modalOverlay = document.getElementById('modalOverlay');
    const form = document.getElementById('usageForm');
    
    modal.classList.remove('show');
    modalOverlay.classList.remove('show');
    document.body.style.overflow = '';
    
    // Reset form and modal state
    if (form) {
        form.reset();
    }
    
    // Reset effectiveness rating display
    document.getElementById('effectivenessRating').value = '0';
    document.getElementById('effectivenessRatingText').textContent = 'No rating';
    const effectivenessStars = document.querySelectorAll('#effectivenessStars .star');
    effectivenessStars.forEach(star => {
        star.classList.remove('active', 'hover');
    });
    
    currentUsagePromptId = null;
}

// Version History Modal Functions
function initializeVersionHistoryModal() {
    // Close button events
    const versionHistoryClose = document.getElementById('versionHistoryModalClose');
    const versionComparisonClose = document.getElementById('versionComparisonModalClose');
    
    if (versionHistoryClose) {
        versionHistoryClose.addEventListener('click', hideVersionHistoryModal);
    }
    
    if (versionComparisonClose) {
        versionComparisonClose.addEventListener('click', hideVersionComparisonModal);
    }
    
    // Action button events
    const compareBtn = document.getElementById('compareVersionsBtn');
    const restoreBtn = document.getElementById('restoreVersionBtn');
    
    if (compareBtn) {
        compareBtn.addEventListener('click', compareSelectedVersions);
    }
    
    if (restoreBtn) {
        restoreBtn.addEventListener('click', restoreSelectedVersion);
    }
    
    // Close modal when clicking overlay
    const modalOverlay = document.getElementById('modalOverlay');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                const versionHistoryModal = document.getElementById('versionHistoryModal');
                const versionComparisonModal = document.getElementById('versionComparisonModal');
                
                if (versionHistoryModal && versionHistoryModal.classList.contains('show')) {
                    hideVersionHistoryModal();
                }
                
                if (versionComparisonModal && versionComparisonModal.classList.contains('show')) {
                    hideVersionComparisonModal();
                }
            }
        });
    }
}

function showVersionHistoryModal(promptId) {
    const modal = document.getElementById('versionHistoryModal');
    const modalOverlay = document.getElementById('modalOverlay');
    const modalTitle = document.getElementById('versionHistoryModalTitle');
    
    if (!modal || !modalOverlay) return;
    
    currentVersionHistoryPromptId = promptId;
    selectedVersions = [];
    
    const prompt = promptManager.getPrompt(promptId);
    if (!prompt) return;
    
    modalTitle.textContent = `Version History - ${prompt.title}`;
    
    renderVersionHistory(promptId);
    updateVersionActionButtons();
    
    // Show modal
    modal.classList.add('show');
    modalOverlay.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function hideVersionHistoryModal() {
    const modal = document.getElementById('versionHistoryModal');
    const modalOverlay = document.getElementById('modalOverlay');
    
    modal.classList.remove('show');
    modalOverlay.classList.remove('show');
    document.body.style.overflow = '';
    
    currentVersionHistoryPromptId = null;
    selectedVersions = [];
}

function renderVersionHistory(promptId) {
    const versionList = document.getElementById('versionList');
    if (!versionList) return;
    
    const prompt = promptManager.getPrompt(promptId);
    const versions = promptManager.getVersionHistory(promptId);
    
    versionList.innerHTML = '';
    
    // Add current version first
    const currentVersionItem = createVersionItem(prompt, true);
    versionList.appendChild(currentVersionItem);
    
    // Add historical versions
    versions.forEach(version => {
        const versionItem = createVersionItem(version, false);
        versionList.appendChild(versionItem);
    });
}

function createVersionItem(versionData, isCurrent = false) {
    const item = document.createElement('div');
    item.className = `version-item ${isCurrent ? 'current' : ''}`;
    
    const versionId = isCurrent ? 'current' : versionData.id;
    item.dataset.versionId = versionId;
    
    // Checkbox for selection
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'version-checkbox';
    checkbox.addEventListener('change', (e) => handleVersionSelection(versionId, e.target.checked));
    
    // Version details
    const details = document.createElement('div');
    details.className = 'version-details';
    
    const header = document.createElement('div');
    header.className = 'version-header';
    
    const versionNumber = document.createElement('span');
    versionNumber.className = 'version-number';
    versionNumber.textContent = isCurrent ? `v${versionData.version || 1} (Current)` : `v${versionData.version}`;
    
    const versionDate = document.createElement('span');
    versionDate.className = 'version-date';
    const date = new Date(isCurrent ? versionData.updatedAt : versionData.savedAt);
    versionDate.textContent = date.toLocaleString();
    
    header.appendChild(versionNumber);
    header.appendChild(versionDate);
    details.appendChild(header);
    
    // Show changes if not current version
    if (!isCurrent && versionData.changes && versionData.changes.length > 0) {
        const changesDiv = document.createElement('div');
        changesDiv.className = 'version-changes';
        
        versionData.changes.forEach(change => {
            const changeSpan = document.createElement('span');
            changeSpan.className = `change-indicator ${change}`;
            changeSpan.textContent = change === 'restored' ? 'Restored' : 
                                   change === 'aiModel' ? 'AI Model' :
                                   change.charAt(0).toUpperCase() + change.slice(1);
            changesDiv.appendChild(changeSpan);
        });
        
        details.appendChild(changesDiv);
    }
    
    // Version preview
    const preview = document.createElement('div');
    preview.className = 'version-preview';
    
    const title = document.createElement('div');
    title.className = 'version-title';
    title.textContent = versionData.title;
    
    const content = document.createElement('div');
    content.className = 'version-content-preview';
    content.textContent = versionData.content.length > 100 ? 
                         versionData.content.substring(0, 100) + '...' : 
                         versionData.content;
    
    preview.appendChild(title);
    preview.appendChild(content);
    details.appendChild(preview);
    
    item.appendChild(checkbox);
    item.appendChild(details);
    
    return item;
}

function handleVersionSelection(versionId, isSelected) {
    if (isSelected) {
        if (!selectedVersions.includes(versionId)) {
            selectedVersions.push(versionId);
        }
    } else {
        selectedVersions = selectedVersions.filter(id => id !== versionId);
    }
    
    updateVersionActionButtons();
    updateVersionItemStyles();
}

function updateVersionActionButtons() {
    const compareBtn = document.getElementById('compareVersionsBtn');
    const restoreBtn = document.getElementById('restoreVersionBtn');
    
    if (compareBtn) {
        compareBtn.disabled = selectedVersions.length !== 2;
    }
    
    if (restoreBtn) {
        restoreBtn.disabled = selectedVersions.length !== 1 || selectedVersions.includes('current');
    }
}

function updateVersionItemStyles() {
    const versionItems = document.querySelectorAll('.version-item');
    versionItems.forEach(item => {
        const versionId = item.dataset.versionId;
        if (selectedVersions.includes(versionId)) {
            item.classList.add('selected');
        } else {
            item.classList.remove('selected');
        }
    });
}

function compareSelectedVersions() {
    if (selectedVersions.length !== 2) return;
    
    const comparison = promptManager.compareVersions(
        currentVersionHistoryPromptId,
        selectedVersions[0],
        selectedVersions[1]
    );
    
    if (comparison) {
        showVersionComparisonModal(comparison);
    }
}

function restoreSelectedVersion() {
    if (selectedVersions.length !== 1 || selectedVersions.includes('current')) return;
    
    const versionId = selectedVersions[0];
    
    if (confirm('Are you sure you want to restore this version? This will create a new version with the restored content.')) {
        const restoredPrompt = promptManager.restorePromptVersion(
            currentVersionHistoryPromptId,
            versionId
        );
        
        if (restoredPrompt) {
            // Refresh the display
            renderVersionHistory(currentVersionHistoryPromptId);
            selectedVersions = [];
            updateVersionActionButtons();
            
            // Refresh the main prompts display
            if (window.searchFilterManager) {
                window.searchFilterManager.refreshData();
                window.searchFilterManager.updateDisplay();
            }
            
            alert('Version restored successfully!');
        } else {
            alert('Failed to restore version.');
        }
    }
}

function showVersionComparisonModal(comparison) {
    const modal = document.getElementById('versionComparisonModal');
    const modalOverlay = document.getElementById('modalOverlay');
    
    if (!modal || !modalOverlay) return;
    
    // Populate comparison data
    document.getElementById('version1Title').textContent = `Version ${comparison.version1.version}`;
    document.getElementById('version1Date').textContent = new Date(comparison.version1.date).toLocaleString();
    document.getElementById('version2Title').textContent = `Version ${comparison.version2.version}`;
    document.getElementById('version2Date').textContent = new Date(comparison.version2.date).toLocaleString();
    
    // Populate field comparisons
    populateFieldComparison('Title', comparison.version1.title, comparison.version2.title, comparison.differences.includes('title'));
    populateFieldComparison('Content', comparison.version1.content, comparison.version2.content, comparison.differences.includes('content'));
    populateFieldComparison('Category', 
        `${comparison.version1.category}${comparison.version1.subcategory ? ' / ' + comparison.version1.subcategory : ''}`,
        `${comparison.version2.category}${comparison.version2.subcategory ? ' / ' + comparison.version2.subcategory : ''}`,
        comparison.differences.includes('category') || comparison.differences.includes('subcategory')
    );
    populateFieldComparison('Model', comparison.version1.aiModel, comparison.version2.aiModel, comparison.differences.includes('aiModel'));
    populateTagsComparison(comparison.version1.tags, comparison.version2.tags, comparison.differences.includes('tags'));
    
    // Show modal
    modal.classList.add('show');
    modalOverlay.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function hideVersionComparisonModal() {
    const modal = document.getElementById('versionComparisonModal');
    const modalOverlay = document.getElementById('modalOverlay');
    
    modal.classList.remove('show');
    modalOverlay.classList.remove('show');
    document.body.style.overflow = '';
}

function populateFieldComparison(fieldName, value1, value2, hasChanged) {
    const field1 = document.getElementById(`version1${fieldName}Field`);
    const field2 = document.getElementById(`version2${fieldName}Field`);
    
    if (field1) {
        field1.textContent = value1 || 'No value';
        if (hasChanged) field1.classList.add('changed');
        else field1.classList.remove('changed');
    }
    
    if (field2) {
        field2.textContent = value2 || 'No value';
        if (hasChanged) field2.classList.add('changed');
        else field2.classList.remove('changed');
    }
}

function populateTagsComparison(tags1, tags2, hasChanged) {
    const field1 = document.getElementById('version1TagsField');
    const field2 = document.getElementById('version2TagsField');
    
    if (field1) {
        field1.innerHTML = '';
        field1.className = 'field-value tags';
        if (hasChanged) field1.classList.add('changed');
        
        if (tags1 && tags1.length > 0) {
            tags1.forEach(tag => {
                const tagSpan = document.createElement('span');
                tagSpan.className = 'tag';
                tagSpan.textContent = tag;
                field1.appendChild(tagSpan);
            });
        } else {
            field1.textContent = 'No tags';
        }
    }
    
    if (field2) {
        field2.innerHTML = '';
        field2.className = 'field-value tags';
        if (hasChanged) field2.classList.add('changed');
        
        if (tags2 && tags2.length > 0) {
            tags2.forEach(tag => {
                const tagSpan = document.createElement('span');
                tagSpan.className = 'tag';
                tagSpan.textContent = tag;
                field2.appendChild(tagSpan);
            });
        } else {
            field2.textContent = 'No tags';
        }
    }
}

function handleUsageFormSubmit(e) {
    e.preventDefault();
    
    const usageData = {
        useCase: document.getElementById('useCase').value.trim(),
        outcomeNotes: document.getElementById('outcomeNotes').value.trim(),
        effectivenessRating: document.getElementById('effectivenessRating').value
    };
    
    // Validate required fields
    if (!usageData.useCase) {
        alert('Please enter a use case.');
        return;
    }
    
    if (!usageData.effectivenessRating || usageData.effectivenessRating === '0') {
        alert('Please provide an effectiveness rating.');
        return;
    }
    
    try {
        // Log the usage
        promptManager.logUsage(currentUsagePromptId, usageData);
        
        // Hide modal and refresh display immediately
        hideUsageModal();
        
        // Force complete refresh to show updated usage statistics
        if (window.searchFilterManager) {
            window.searchFilterManager.refreshData();
            window.searchFilterManager.updateDisplay();
        } else {
            refreshCurrentCategoryDisplay();
        }
        
        // Show success message
        alert('Usage logged successfully!');
        
    } catch (error) {
        console.error('Error logging usage:', error);
        alert('Error logging usage. Please try again.');
    }
}

// Initialize Usage Modal Event Listeners
function initializeUsageModal() {
    const usageModal = document.getElementById('usageModal');
    const usageModalClose = document.getElementById('usageModalClose');
    const usageCancelBtn = document.getElementById('usageCancelBtn');
    const usageForm = document.getElementById('usageForm');
    const effectivenessStars = document.querySelectorAll('#effectivenessStars .star');
    
    // Form submission
    if (usageForm) {
        usageForm.addEventListener('submit', handleUsageFormSubmit);
    }
    
    // Close modal events
    if (usageModalClose) {
        usageModalClose.addEventListener('click', hideUsageModal);
    }
    
    if (usageCancelBtn) {
        usageCancelBtn.addEventListener('click', hideUsageModal);
    }
    
    // Click outside modal to close
    if (usageModal) {
        usageModal.addEventListener('click', (e) => {
            if (e.target === usageModal) {
                hideUsageModal();
            }
        });
    }
    
    // Effectiveness rating stars
    effectivenessStars.forEach(star => {
        star.addEventListener('click', function() {
            const rating = this.dataset.rating;
            document.getElementById('effectivenessRating').value = rating;
            document.getElementById('effectivenessRatingText').textContent = `${rating} star${rating !== '1' ? 's' : ''}`;
            
            effectivenessStars.forEach((s, index) => {
                if (index < rating) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });
        });
        
        star.addEventListener('mouseenter', function() {
            const rating = this.dataset.rating;
            effectivenessStars.forEach((s, index) => {
                if (index < rating) {
                    s.classList.add('hover');
                } else {
                    s.classList.remove('hover');
                }
            });
        });
        
        star.addEventListener('mouseleave', function() {
            effectivenessStars.forEach(s => s.classList.remove('hover'));
        });
    });
    
    // Escape key handler for usage modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const usageModal = document.getElementById('usageModal');
            if (usageModal && usageModal.classList.contains('show')) {
                hideUsageModal();
            }
        }
    });
}

// Toggle Read More/Less functionality
function toggleReadMore(promptId) {
    const truncatedContent = document.getElementById(`content-${promptId}`);
    const fullContent = document.getElementById(`full-content-${promptId}`);
    const readMoreBtn = document.querySelector(`[data-prompt-id="${promptId}"] .read-more-btn`);
    
    if (truncatedContent && fullContent && readMoreBtn) {
        if (truncatedContent.style.display !== 'none') {
            // Show full content
            truncatedContent.style.display = 'none';
            fullContent.style.display = 'block';
            readMoreBtn.textContent = 'Read Less';
        } else {
            // Show truncated content
            truncatedContent.style.display = 'block';
            fullContent.style.display = 'none';
            readMoreBtn.textContent = 'Read More';
        }
    }
}

// Enhanced copy functionality
function copyPrompt(promptId) {
    const prompt = promptManager.getPrompt(promptId);
    if (!prompt) return;
    
    // Copy prompt content to clipboard
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(prompt.content).then(() => {
            showCopySuccess(promptId, prompt.title);
        }).catch(() => {
            // Fallback for older browsers
            copyToClipboardFallback(prompt.content, prompt.title);
        });
    } else {
        copyToClipboardFallback(prompt.content, prompt.title);
    }
}

function showCopySuccess(promptId, title) {
    const copyBtn = document.querySelector(`[data-prompt-id="${promptId}"] .btn-primary`);
    if (copyBtn) {
        const originalHtml = copyBtn.innerHTML;
        copyBtn.innerHTML = '<span class="btn-icon">✓</span> Copied!';
        copyBtn.classList.add('success');
        
        setTimeout(() => {
            copyBtn.innerHTML = originalHtml;
            copyBtn.classList.remove('success');
        }, 2000);
    }
}

// Enhanced delete confirmation
function confirmDeletePrompt(promptId) {
    const prompt = promptManager.getPrompt(promptId);
    if (!prompt) return;
    
    showDeleteConfirmation(prompt);
}

function showDeleteConfirmation(prompt) {
    const modal = document.getElementById('confirmModal');
    const overlay = document.getElementById('modalOverlay');
    const message = document.getElementById('confirmMessage');
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    
    if (!modal || !overlay || !message || !confirmBtn) return;
    
    // Create delete confirmation content safely
    message.innerHTML = ''; // Clear existing content
    
    const strongText = document.createElement('strong');
    strongText.textContent = 'Are you sure you want to delete this prompt?';
    message.appendChild(strongText);
    message.appendChild(document.createElement('br'));
    message.appendChild(document.createElement('br'));
    
    const previewDiv = document.createElement('div');
    previewDiv.className = 'delete-preview';
    
    const titleDiv = document.createElement('div');
    titleDiv.className = 'delete-prompt-title';
    titleDiv.textContent = `"${prompt.title}"`; // Safe text insertion
    
    const metaDiv = document.createElement('div');
    metaDiv.className = 'delete-prompt-meta';
    
    const modelBadge = document.createElement('span');
    modelBadge.className = `ai-model-badge ai-model-${prompt.aiModel.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    modelBadge.textContent = prompt.aiModel; // Safe text insertion
    
    const dateSpan = document.createElement('span');
    dateSpan.className = 'delete-prompt-date';
    dateSpan.textContent = new Date(prompt.createdAt).toLocaleDateString();
    
    metaDiv.appendChild(modelBadge);
    metaDiv.appendChild(dateSpan);
    previewDiv.appendChild(titleDiv);
    previewDiv.appendChild(metaDiv);
    
    message.appendChild(previewDiv);
    message.appendChild(document.createElement('br'));
    
    const emText = document.createElement('em');
    emText.textContent = 'This action cannot be undone.';
    message.appendChild(emText);
    
    // Remove any existing click handlers and add new one
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    
    newConfirmBtn.addEventListener('click', () => {
        executeDeletePrompt(prompt.id);
        hideConfirmModal();
    });
    
    modal.classList.add('show');
    overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function executeDeletePrompt(promptId) {
    promptManager.deletePrompt(promptId);
    refreshCurrentCategoryDisplay();
}

function deletePrompt(promptId) {
    // Legacy function - redirect to new confirmation system
    confirmDeletePrompt(promptId);
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