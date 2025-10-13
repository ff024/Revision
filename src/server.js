// src/server.js
const http = require('http');
const { send, serveStatic } = require('./http');
const { PORT } = require('./config');
const { getWords, postWords } = require('./routes/words');

const server = http.createServer(async (req, res) => {
    try {
        // Statique
        if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html'))
            return serveStatic(res, 'index.html', 'text/html');
        if (req.method === 'GET' && req.url === '/style.css')
            return serveStatic(res, 'style.css', 'text/css');
        if (req.method === 'GET' && req.url === '/words.html')
            return serveStatic(res, 'words.html', 'text/html');
        if (req.method === 'GET' && req.url === '/app.js')
            return serveStatic(res, 'app.js', 'application/javascript');
        if (req.method === 'GET' && req.url === '/quiz.html')
            return serveStatic(res, 'quiz.html', 'text/html');
        if (req.method === 'GET' && req.url === '/quiz.js')
            return serveStatic(res, 'quiz.js', 'application/javascript');

        // Aliases
        if (req.method === 'GET' && req.url === '/words') {
            res.writeHead(302, { Location: '/words.html' });
            return res.end();
        }
        if (req.method === 'GET' && req.url === '/quiz') {
            res.writeHead(302, { Location: '/quiz.html' });
            return res.end();
        }

        // API
        if (req.url === '/api/words' && req.method === 'GET') return getWords(req, res);
        if (req.url === '/api/words' && req.method === 'POST') return postWords(req, res);

        // 404
        return send(res, 404, 'text/plain', 'Page non trouvée');
    } catch (err) {
        console.error('[SERVER] Uncaught error:', err);
        return send(res, 500, 'text/plain', 'Erreur serveur (voir la console)');
    }
});

function start() {
    server.listen(PORT, () => console.log(`Serveur lancé sur http://localhost:${PORT}`));
}

module.exports = { start, server };
