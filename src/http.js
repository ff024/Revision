// src/http.js
const fs = require('fs');
const path = require('path');
const { PUBLIC_DIR } = require('./config');

function send(res, status, type, body) {
    res.writeHead(status, {
        'Content-Type': `${type}; charset=utf-8`,
        'X-Content-Type-Options': 'nosniff',
    });
    res.end(body);
}

function serveStatic(res, relPath, type) {
    const filePath = path.join(PUBLIC_DIR, relPath);
    fs.readFile(filePath, (err, data) => {
        if (err) return send(res, 404, 'text/plain', 'Fichier introuvable');
        send(res, 200, type, data);
    });
}

module.exports = { send, serveStatic };
