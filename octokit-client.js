// GitHub Client for Browser Environment
// Uses vanilla fetch() API instead of Octokit for better reliability

let connectionSettings;

// Detect if we're in a Replit environment
function isReplitEnvironment() {
    return typeof window !== 'undefined' && (
        window.location.hostname.includes('replit.') ||
        window.location.hostname.includes('repl.co') ||
        window.location.hostname.includes('replit.dev')
    );
}

// GitHub API base URL
const GITHUB_API_BASE = 'https://api.github.com';

// Custom GitHub API client using fetch()
class GitHubAPIClient {
    constructor(token) {
        this.token = token;
        this.headers = {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json'
        };
    }

    // Generic API request method
    async request(endpoint, options = {}) {
        const url = `${GITHUB_API_BASE}${endpoint}`;
        const headers = { ...this.headers };
        
        // Only set Content-Type for requests with a body
        if (options.body) {
            headers['Content-Type'] = 'application/json';
        }
        
        const config = {
            ...options,
            headers: {
                ...headers,
                ...options.headers
            }
        };

        try {
            const response = await fetch(url, config);
            
            // Handle non-200 responses
            if (!response.ok) {
                const errorBody = await response.text();
                let errorMessage;
                
                try {
                    const errorJson = JSON.parse(errorBody);
                    errorMessage = errorJson.message || response.statusText;
                } catch {
                    errorMessage = response.statusText;
                }

                const error = new Error(errorMessage);
                error.status = response.status;
                error.response = response;
                throw error;
            }

            // Return parsed JSON for successful responses
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            }
            
            return await response.text();
        } catch (error) {
            // Network or parsing errors
            if (error.status) {
                throw error; // Re-throw HTTP errors
            }
            
            // Handle network errors
            throw new Error(`Network error: ${error.message}`);
        }
    }

    // Repositories API
    repos = {
        // List user repositories
        listForAuthenticatedUser: async (params = {}) => {
            const queryParams = new URLSearchParams({
                sort: params.sort || 'updated',
                per_page: params.per_page || 100
            });
            
            const data = await this.request(`/user/repos?${queryParams}`);
            return { data };
        },

        // Get repository contents
        getContent: async (params) => {
            const { owner, repo, path, ref } = params;
            const queryParams = ref ? `?ref=${ref}` : '';
            const data = await this.request(`/repos/${owner}/${repo}/contents/${path}${queryParams}`);
            return { data };
        },

        // Create or update file contents
        createOrUpdateFileContents: async (params) => {
            const { owner, repo, path, message, content, sha, branch } = params;
            const endpoint = `/repos/${owner}/${repo}/contents/${path}`;
            
            const body = {
                message,
                content,
                ...(sha && { sha }),
                ...(branch && { branch })
            };

            const data = await this.request(endpoint, {
                method: 'PUT',
                body: JSON.stringify(body)
            });
            
            return { data };
        }
    };

    // Test GitHub API connectivity and token validity
    async testConnection() {
        try {
            const data = await this.request('/user');
            return { success: true, data };
        } catch (error) {
            return { success: false, error };
        }
    }
}

// Get access token - prioritize user-provided token
async function getAccessToken() {
    // Try user-provided Personal Access Token
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

// Create GitHub API client using fetch()
export async function getUncachableGitHubClient() {
    try {
        const accessToken = await getAccessToken();
        
        if (!accessToken) {
            throw new Error('Access token is required but was not provided');
        }
        
        // Return our custom fetch-based client with Octokit-like interface
        return {
            rest: new GitHubAPIClient(accessToken)
        };
    } catch (error) {
        console.error('Failed to create GitHub client:', error);
        throw error;
    }
}

// Check if GitHub is available in current environment
export async function isGitHubAvailable() {
    try {
        const client = await getUncachableGitHubClient();
        const testResult = await client.rest.testConnection();
        return testResult.success;
    } catch (error) {
        console.warn('GitHub availability check failed:', error);
        return false;
    }
}

// Get environment type for UI display
export async function getEnvironmentInfo() {
    const isReplit = isReplitEnvironment();
    let hasOctokit = true; // We now have our own fetch-based implementation
    let requiresToken = true;
    
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