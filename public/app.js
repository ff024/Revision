// public/app.js

function escapeHtml(s) {
    return String(s ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

function buildTable(data) {
    const thead = document.getElementById('thead-words');
    const tbody = document.getElementById('tbody-words');

    if (!Array.isArray(data) || data.length === 0) {
        thead.innerHTML = '';
        tbody.innerHTML = '<tr><td>Aucune donnée</td></tr>';
        return;
    }

    // Colonnes = clés du premier objet (simple et efficace)
    const cols = Object.keys(data[0]);

    thead.innerHTML = `<tr>${cols.map(c => `<th>${escapeHtml(c)}</th>`).join('')}</tr>`;

    tbody.innerHTML = data.map(row => `
    <tr>
      ${cols.map(c => `<td>${escapeHtml(row[c])}</td>`).join('')}
    </tr>
  `).join('');
}

async function loadWords() {
    const tbody = document.getElementById('tbody-words');
    tbody.innerHTML = '<tr><td>Chargement…</td></tr>';
    try {
        const res = await fetch('/api/words', { headers: { 'Accept': 'application/json' } });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        buildTable(data);
    } catch (e) {
        tbody.innerHTML = `<tr><td>Erreur: ${escapeHtml(e.message)}</td></tr>`;
    }
}

async function onSubmit(e) {
    e.preventDefault();
    const mot = document.getElementById('mot').value.trim();
    const traduction = document.getElementById('traduction').value.trim();
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
            body: JSON.stringify({ mot, traduction })
        });
        const payload = await res.json().catch(() => ({}));
        if (!res.ok || payload.error) throw new Error(payload.error || ('HTTP ' + res.status));

        // reset + rechargement des données sans refresh de page
        document.getElementById('form-add').reset();
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

// Lance init même si DOMContentLoaded est déjà passé
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
