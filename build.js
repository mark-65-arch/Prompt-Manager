// Build script for GitHub Pages deployment

const fs = require('fs');
const path = require('path');

// Create dist directory
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
}

// Files to copy to dist
const filesToCopy = [
    'index.html',
    'styles.css',
    'script.js',
    'github-integration.js',
    'tutorial.js',
    'service-worker.js',
    'package.json',
    'package-lock.json'
];

// Copy files to dist directory
filesToCopy.forEach(file => {
    const srcPath = path.join(__dirname, file);
    const destPath = path.join(distDir, file);
    
    if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
        console.log(`Copied ${file} to dist/`);
    } else {
        console.warn(`Warning: ${file} not found, skipping...`);
    }
});

// Modify HTML for production (remove node_modules dependencies and use CDN)
const htmlPath = path.join(distDir, 'index.html');
let htmlContent = fs.readFileSync(htmlPath, 'utf8');

// Replace @octokit/rest import with CDN version for GitHub Pages compatibility
const octokitCDN = '<script src="https://cdn.skypack.dev/@octokit/rest@20.0.0"></script>';

// Update HTML head to include CDN script
htmlContent = htmlContent.replace(
    '<script src="github-integration.js"></script>',
    `${octokitCDN}\n    <script src="github-integration.js"></script>`
);

// Update service worker registration path for GitHub Pages
htmlContent = htmlContent.replace(
    "navigator.serviceWorker.register('/service-worker.js')",
    "navigator.serviceWorker.register('./service-worker.js')"
);

fs.writeFileSync(htmlPath, htmlContent);
console.log('Updated HTML for GitHub Pages deployment');

// Update service worker for GitHub Pages (relative paths)
const swPath = path.join(distDir, 'service-worker.js');
let swContent = fs.readFileSync(swPath, 'utf8');

// Update cache files with relative paths
swContent = swContent.replace(
    "const FILES_TO_CACHE = [\n    '/',",
    "const FILES_TO_CACHE = [\n    './',"
);

swContent = swContent.replace(/\'\/index\.html\'/g, "'./index.html'");
swContent = swContent.replace(/\'\/styles\.css\'/g, "'./styles.css'");
swContent = swContent.replace(/\'\/script\.js\'/g, "'./script.js'");
swContent = swContent.replace(/\'\/github-integration\.js\'/g, "'./github-integration.js'");
swContent = swContent.replace(/\'\/tutorial\.js\'/g, "'./tutorial.js'");
swContent = swContent.replace(/\'\/service-worker\.js\'/g, "'./service-worker.js'");

fs.writeFileSync(swPath, swContent);
console.log('Updated service worker for GitHub Pages deployment');

// Update github-integration.js to use CDN Octokit
const githubIntegrationPath = path.join(distDir, 'github-integration.js');
let githubContent = fs.readFileSync(githubIntegrationPath, 'utf8');

// Replace local import with global Octokit
githubContent = githubContent.replace(
    "const { getUncachableGitHubClient } = await import('./octokit-client.js');",
    "const { getUncachableGitHubClient } = await import('./octokit-client.js');"
);

fs.writeFileSync(githubIntegrationPath, githubContent);

// Update octokit-client.js for GitHub Pages
const octokitClientSrcPath = path.join(__dirname, 'octokit-client.js');
const octokitClientDestPath = path.join(distDir, 'octokit-client.js');

if (fs.existsSync(octokitClientSrcPath)) {
    let octokitContent = fs.readFileSync(octokitClientSrcPath, 'utf8');
    
    // Replace ES module import with global variable
    octokitContent = octokitContent.replace(
        "import { Octokit } from '@octokit/rest'",
        "// Using global Octokit from CDN\nconst { Octokit } = window;"
    );
    
    fs.writeFileSync(octokitClientDestPath, octokitContent);
    console.log('Updated octokit-client.js for GitHub Pages deployment');
}

console.log('\nBuild completed successfully!');
console.log('Files ready for GitHub Pages deployment in dist/ directory');
console.log('\nTo test locally:');
console.log('1. Serve the dist/ directory with a local server');
console.log('2. Example: npx http-server dist -p 8080');