// src/routes/words.js
const { pool } = require('../db');
const { send } = require('../http');

async function getWords(req, res) {
    const [rows] = await pool.query(`
    SELECT word_original AS original, word_translation AS translation
    FROM word
    ORDER BY id_word ASC
  `);
    return send(res, 200, 'application/json', JSON.stringify(rows));
}

function postWords(req, res) {
    const ct = req.headers['content-type'] || '';
    if (!ct.includes('application/json')) {
        return send(res, 415, 'application/json', JSON.stringify({ error: 'Content-Type application/json requis' }));
    }
    let raw = '';
    req.on('data', chunk => {
        raw += chunk;
        if (raw.length > 1e6) req.socket.destroy();
    });
    req.on('end', async () => {
        try {
            const data = JSON.parse(raw || '{}');
            const mot = (data.mot || '').trim();
            const traduction = (data.traduction || '').trim();
            const lessonId = Number(data.lessonId) || 1;
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
}

module.exports = { getWords, postWords };
