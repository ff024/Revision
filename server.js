// server.js
const http = require('http');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

const PORT = Number(process.env.PORT || 3000);

// Pool MySQL/MariaDB
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
});

const PUBLIC_DIR = path.join(__dirname, 'public');

function send(res, status, type, body) {
    res.writeHead(status, {
        'Content-Type': type + '; charset=utf-8',
        'X-Content-Type-Options': 'nosniff'
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

const server = http.createServer(async (req, res) => {
    try {
        // ------- FICHIERS STATIQUES -------
        if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html'))
            return serveStatic(res, 'index.html', 'text/html');
        if (req.method === 'GET' && req.url === '/style.css')
            return serveStatic(res, 'style.css', 'text/css');
        if (req.method === 'GET' && req.url === '/words.html')
            return serveStatic(res, 'words.html', 'text/html');
        if (req.method === 'GET' && req.url === '/app.js')
            return serveStatic(res, 'app.js', 'application/javascript');

        // Aliases pratiques
        if (req.method === 'GET' && req.url === '/words') {
            res.writeHead(302, { Location: '/words.html' });
            return res.end();
        }
        if (req.method === 'GET' && req.url === '/quiz') {
            res.writeHead(302, { Location: '/quiz.html' });
            return res.end();
        }
        if (req.method === 'GET' && req.url === '/quiz.html')
            return serveStatic(res, 'quiz.html', 'text/html');
        if (req.method === 'GET' && req.url === '/quiz.js')
            return serveStatic(res, 'quiz.js', 'application/javascript');

        // ------- API JSON -------
        if (req.method === 'GET' && req.url === '/api/words') {
            const [rows] = await pool.query(`
                SELECT word_original AS original, word_translation AS translation
                FROM word
                ORDER BY id_word ASC
            `);

            return send(res, 200, 'application/json', JSON.stringify(rows));
        }

        if (req.method === 'POST' && req.url === '/api/words') {
            const ct = req.headers['content-type'] || '';
            if (!ct.includes('application/json')) {
                return send(res, 415, 'application/json', JSON.stringify({ error: 'Content-Type application/json requis' }));
            }
            let raw = '';
            req.on('data', chunk => {
                raw += chunk;
                if (raw.length > 1e6) req.socket.destroy(); // 1MB max
            });
            req.on('end', async () => {
                try {
                    const data = JSON.parse(raw || '{}');
                    const mot = (data.mot || '').trim();
                    const traduction = (data.traduction || '').trim();
                    const lessonId = Number(data.lessonId) || 1; // valeur par défaut 1

                    if (!mot || !traduction) {
                        return send(res, 400, 'application/json', JSON.stringify({ error: 'Champs requis: mot, traduction' }));
                    }

                    await pool.execute(
                        'INSERT INTO word (word_original, word_translation, fk_lesson) VALUES (?, ?, ?)',
                        [mot, traduction, lessonId]
                    );
                    return send(res, 201, 'application/json', JSON.stringify({ success: true }));
                } catch (e) {
                    console.error('[POST /api/words] error:', e);
                    return send(res, 500, 'application/json', JSON.stringify({ error: 'Erreur serveur' }));
                }
            });
            return;
        }

        // 404
        send(res, 404, 'text/plain', 'Page non trouvée');
    } catch (err) {
        console.error('[SERVER] Uncaught error:', err);
        send(res, 500, 'text/plain', 'Erreur serveur (voir la console)');
    }
});

server.listen(PORT, () => {
    console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
