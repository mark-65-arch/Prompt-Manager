// Octokit Client with Environment Detection

// Detect if we're in a Replit environment
function isReplitEnvironment() {
    return typeof window !== 'undefined' && (
        window.location.hostname.includes('replit.') ||
        window.location.hostname.includes('repl.co') ||
        (typeof process !== 'undefined' && process.env?.REPLIT_CONNECTORS_HOSTNAME)
    );
}

// Global Octokit reference for different environments
async function getOctokitClass() {
    // Try CDN version first (Skypack)
    if (typeof window !== 'undefined') {
        try {
            // Try global Octokit first (UMD builds)
            if (window.Octokit) {
                return window.Octokit;
            }
            
            // Try dynamic import for ES modules (Skypack)
            const { Octokit } = await import('https://cdn.skypack.dev/@octokit/rest');
            return Octokit;
        } catch (e) {
            console.warn('CDN Octokit not available:', e);
        }
    }
    
    // Try Node.js require
    if (typeof require !== 'undefined') {
        try {
            return require('@octokit/rest').Octokit;
        } catch (e) {
            console.warn('Octokit not available via require');
        }
    }
    
    throw new Error('Octokit not available');
}

let connectionSettings;

// Get access token based on environment
async function getAccessToken() {
    try {
        if (isReplitEnvironment()) {
            // In Replit, try the connector first, but fallback to user token if it fails
            try {
                return await getReplitAccessToken();
            } catch (replitError) {
                console.warn('Replit connector failed, falling back to user token:', replitError);
                return getUserProvidedToken();
            }
        } else {
            return getUserProvidedToken();
        }
    } catch (error) {
        console.error('Token retrieval failed:', error);
        throw new Error(`Authentication failed: ${error.message}`);
    }
}

// Replit-specific token retrieval
async function getReplitAccessToken() {
    if (connectionSettings && connectionSettings.settings.expires_at && 
        new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
        return connectionSettings.settings.access_token;
    }
    
    // Check if we're in browser or server context
    let hostname, xReplitToken;
    
    if (typeof process !== 'undefined' && process.env) {
        // Server context
        hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
        xReplitToken = process.env.REPL_IDENTITY 
            ? 'repl ' + process.env.REPL_IDENTITY 
            : process.env.WEB_REPL_RENEWAL 
            ? 'depl ' + process.env.WEB_REPL_RENEWAL 
            : null;
    } else if (typeof window !== 'undefined') {
        // Browser context - get from meta tags or global variables if set
        const metaHostname = document.querySelector('meta[name="replit-connectors-hostname"]');
        const metaToken = document.querySelector('meta[name="replit-token"]');
        
        hostname = metaHostname?.content || window.REPLIT_CONNECTORS_HOSTNAME;
        xReplitToken = metaToken?.content || window.REPLIT_TOKEN;
    }

    if (!xReplitToken || !hostname) {
        throw new Error('Replit environment detected but authentication tokens not available');
    }

    try {
        connectionSettings = await fetch(
            `https://${hostname}/api/v2/connection?include_secrets=true&connector_names=github`,
            {
                headers: {
                    'Accept': 'application/json',
                    'X_REPLIT_TOKEN': xReplitToken
                }
            }
        ).then(res => {
            if (!res.ok) {
                throw new Error(`Failed to fetch connection: ${res.status}`);
            }
            return res.json();
        }).then(data => data.items?.[0]);

        const accessToken = connectionSettings?.settings?.access_token || 
                          connectionSettings?.settings?.oauth?.credentials?.access_token;

        if (!connectionSettings || !accessToken) {
            throw new Error('GitHub connection not found or invalid');
        }
        
        return accessToken;
    } catch (error) {
        throw new Error(`Failed to get Replit GitHub token: ${error.message}`);
    }
}

// User-provided token (for GitHub Pages or other environments)
function getUserProvidedToken() {
    try {
        // Try to get from settings
        const settings = JSON.parse(localStorage.getItem('aiPromptManager_githubSettings') || '{}');
        const token = settings.personalAccessToken || sessionStorage.getItem('github_pat');
        
        if (!token || token.trim() === '') {
            throw new Error('GitHub Personal Access Token required. Please add one in Settings.');
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

// Main function to get GitHub client
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
        
        // Ensure we always throw a proper Error object
        if (error instanceof Error) {
            throw error;
        } else {
            throw new Error(`GitHub client creation failed: ${JSON.stringify(error)}`);
        }
    }
}

// Check if GitHub is available in current environment
export async function isGitHubAvailable() {
    try {
        await getOctokitClass();
        return true;
    } catch (error) {
        return false;
    }
}

// Get environment type for UI display
export async function getEnvironmentInfo() {
    return {
        isReplit: isReplitEnvironment(),
        hasOctokit: await isGitHubAvailable(),
        requiresToken: !isReplitEnvironment()
    };
}