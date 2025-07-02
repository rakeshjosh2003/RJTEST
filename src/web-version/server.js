/**
 * Simple HTTP server for the Code Migrator web application
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const PROJECT_ROOT = path.join(__dirname, '../..');

// MIME types for different file extensions
const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
};

// Create HTTP server
const server = http.createServer((req, res) => {
    console.log(`${req.method} ${req.url}`);
    
    // Handle only GET requests
    if (req.method !== 'GET') {
        res.statusCode = 405;
        res.end('Method Not Allowed');
        return;
    }
    
    // Normalize URL to prevent directory traversal attacks
    let url = req.url;
    
    // Redirect root to web-version/index.html
    if (url === '/' || url === '') {
        url = '/src/web-version/index.html';
    }
    
    // Resolve file path
    const filePath = path.join(PROJECT_ROOT, url);
    
    // Check if path is within project directory (security check)
    if (!filePath.startsWith(PROJECT_ROOT)) {
        res.statusCode = 403;
        res.end('Forbidden');
        return;
    }
    
    // Get file extension to determine content type
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    
    // Read file
    fs.readFile(filePath, (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // File not found
                res.statusCode = 404;
                res.end('File Not Found');
            } else {
                // Server error
                res.statusCode = 500;
                res.end('Internal Server Error');
                console.error(err);
            }
            return;
        }
        
        // Serve file with appropriate content type
        res.setHeader('Content-Type', contentType);
        res.end(data);
    });
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log(`Open http://localhost:${PORT}/ in your browser to use the Code Migrator`);
});