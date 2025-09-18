// GitHub Client for Browser Environment
// Supports both Replit integration and Personal Access Token fallback

let connectionSettings;

// Detect if we're in a Replit environment
function isReplitEnvironment() {
    return typeof window !== 'undefined' && (
        window.location.hostname.includes('replit.') ||
        window.location.hostname.includes('repl.co') ||
        window.location.hostname.includes('replit.dev')
    );
}

// Get the Octokit class from global scope
async function getOctokitClass() {
    // Wait a bit for the CDN to load if needed
    if (typeof window !== 'undefined' && !window.OctokitLibraryLoaded) {
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    if (typeof window !== 'undefined') {
        // Try different ways Octokit might be exposed
        if (window.Octokit && typeof window.Octokit === 'function') {
            return window.Octokit;
        }
        if (window.Octokit && window.Octokit.Octokit) {
            return window.Octokit.Octokit;
        }
        if (window.OctokitRest && window.OctokitRest.Octokit) {
            return window.OctokitRest.Octokit;
        }
        if (window.OctokitRest) {
            return window.OctokitRest;
        }
    }
    
    console.error('Available globals:', typeof window !== 'undefined' ? Object.keys(window).filter(k => k.toLowerCase().includes('octokit')) : 'window not available');
    
    // For now, provide a helpful error message to users
    throw new Error('GitHub backup feature requires internet connection and modern browser. Please try refreshing the page or use the manual export/import features in Data Management.');
}

// Get access token - prioritize user-provided token since server-side Replit integration requires backend
async function getAccessToken() {
    // First try user-provided Personal Access Token
    try {
        return getUserProvidedToken();
    } catch (userTokenError) {
        // If in Replit environment, inform user about the limitation
        if (isReplitEnvironment()) {
            throw new Error('GitHub backup requires a Personal Access Token. Please add one in Settings → GitHub Integration, or use the built-in Replit Git features.');
        } else {
            throw userTokenError;
        }
    }
}

// User-provided token (works in all environments)
function getUserProvidedToken() {
    try {
        const settings = JSON.parse(localStorage.getItem('aiPromptManager_githubSettings') || '{}');
        const token = settings.personalAccessToken || sessionStorage.getItem('github_pat');
        
        if (!token || token.trim() === '') {
            throw new Error('GitHub Personal Access Token required. Please add one in Settings → GitHub Integration.');
        }
        
        return token.trim();
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        } else {
            throw new Error('Failed to retrieve GitHub token from settings');
        }
    }
}

// WARNING: Never cache this client.
// Access tokens may expire, so create a fresh client each time.
export async function getUncachableGitHubClient() {
    try {
        const OctokitClass = await getOctokitClass();
        const accessToken = await getAccessToken();
        
        if (!accessToken) {
            throw new Error('Access token is required but was not provided');
        }
        
        return new OctokitClass({ 
            auth: accessToken,
            userAgent: 'AI-Prompt-Manager/2.0'
        });
    } catch (error) {
        console.error('Failed to create GitHub client:', error);
        throw error;
    }
}

// Check if GitHub is available in current environment
export async function isGitHubAvailable() {
    try {
        await getOctokitClass(); // Check if Octokit is loaded
        await getAccessToken(); // Check if we have a token
        return true;
    } catch (error) {
        console.warn('GitHub availability check failed:', error);
        return false;
    }
}

// Get environment type for UI display
export async function getEnvironmentInfo() {
    const isReplit = isReplitEnvironment();
    let hasOctokit = false;
    let requiresToken = true;
    
    try {
        getOctokitClass();
        hasOctokit = true;
    } catch (error) {
        console.warn('Octokit not available:', error);
    }
    
    // Check if we already have a token configured
    try {
        getUserProvidedToken();
        requiresToken = false;
    } catch (error) {
        requiresToken = true;
    }
    
    // Also check if Octokit is available
    try {
        await getOctokitClass();
    } catch (error) {
        hasOctokit = false;
    }
    
    console.log('Environment info:', { isReplit, hasOctokit, requiresToken });
    
    return {
        isReplit,
        hasOctokit,
        requiresToken
    };
}