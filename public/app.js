// public/app.js (nettoyé)

function escapeHtml(s) {
    return String(s ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

// Récupère un champ parmi plusieurs alias possibles
function pick(row, names) {
    for (const n of names) {
        const v = row?.[n];
        if (v != null && String(v).trim() !== '') return v;
    }
    return null;
}

// Normalise n'importe quelle ligne en { original, translation }
function toNormalizedRow(row) {
    const original = pick(row, ['original', 'word_original', 'mot', 'word', 'source', 'term']);
    const translation = pick(row, ['translation', 'word_translation', 'traduction', 'meaning', 'target']);
    if (!original || !translation) return null;
    return { original, translation };
}

function renderRows(rows) {
    const tbody = document.getElementById('tbody-words');
    if (!Array.isArray(rows) || rows.length === 0) {
        tbody.innerHTML = '<tr><td colspan="2">Aucune donnée</td></tr>';
        return;
    }
    tbody.innerHTML = rows.map(r => `
    <tr>
      <td>${escapeHtml(r.original)}</td>
      <td>${escapeHtml(r.translation)}</td>
    </tr>
  `).join('');
}

async function loadWords() {
    const tbody = document.getElementById('tbody-words');
    tbody.innerHTML = '<tr><td colspan="2">Chargement…</td></tr>';
    try {
        const res = await fetch('/api/words', { headers: { 'Accept': 'application/json' } });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        const normalized = data.map(toNormalizedRow).filter(Boolean);
        renderRows(normalized);
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="2">Erreur: ${escapeHtml(e.message)}</td></tr>`;
    }
}

async function onSubmit(e) {
    e.preventDefault();
    const mot = document.getElementById('mot').value.trim();
    const traduction = document.getElementById('traduction').value.trim();
    const lessonId = Number(document.getElementById('lessonId').value) || 1;
    const msg = document.getElementById('msg');

    if (!mot || !traduction) {
        msg.textContent = 'Veuillez remplir les deux champs.';
        return;
    }

    msg.textContent = 'Ajout en cours…';
    try {
        const res = await fetch('/api/words', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            // On envoie fk_lesson pour coller à la contrainte NOT NULL de la table
            body: JSON.stringify({ mot, traduction, lessonId })
        });
        const payload = await res.json().catch(() => ({}));
        if (!res.ok || payload.error) throw new Error(payload.error || ('HTTP ' + res.status));

        document.getElementById('form-add').reset();
        document.getElementById('lessonId').value = String(lessonId);
        msg.textContent = 'Ajouté ✔';
        await loadWords();
    } catch (e) {
        msg.textContent = 'Erreur: ' + e.message;
    } finally {
        setTimeout(() => (msg.textContent = ''), 2000);
    }
}

function init() {
    const form = document.getElementById('form-add');
    if (form) form.addEventListener('submit', onSubmit);
    loadWords();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
