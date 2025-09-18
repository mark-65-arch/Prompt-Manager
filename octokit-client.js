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

// Get the Octokit class from global scope (UMD build)
function getOctokitClass() {
    if (typeof window !== 'undefined' && window.Octokit) {
        return window.Octokit.Octokit || window.Octokit;
    }
    throw new Error('Octokit not available from CDN');
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
        const OctokitClass = getOctokitClass();
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
        getOctokitClass(); // Check if Octokit is loaded
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
    
    console.log('Environment info:', { isReplit, hasOctokit, requiresToken });
    
    return {
        isReplit,
        hasOctokit,
        requiresToken
    };
}