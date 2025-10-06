// Utilitaires
function escapeHtml(s) {
    return String(s ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}
function normalize(s) {
    return String(s ?? '')
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // enlève les accents
        .toLowerCase().trim();
}
function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}
function pickField(row, candidates) {
    for (const name of candidates) {
        if (row[name] != null && String(row[name]).trim() !== '') return row[name];
    }
    return null;
}

// État du quiz
let items = [];     // { original, translation }
let index = 0;
let score = 0;
let locked = false; // empêche double soumission

// DOM
const progressEl = () => document.getElementById('progress');
const scoreEl = () => document.getElementById('score');
const promptEl = () => document.getElementById('prompt');
const feedbackEl = () => document.getElementById('feedback');
const formEl = () => document.getElementById('quiz-form');
const answerEl = () => document.getElementById('answer');
const validateBtn = () => document.getElementById('validateBtn');
const nextBtn = () => document.getElementById('nextBtn');
const revealBtn = () => document.getElementById('revealBtn');

async function loadData() {
    const res = await fetch('/api/words', { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();

    // Normalise en {original, translation} quel que soit le nom réel des colonnes
    const mapped = data.map(r => {
        const original = pickField(r, ['original', 'mot', 'word', 'source', 'term']);
        const translation = pickField(r, ['translation', 'traduction', 'meaning', 'target']);
        return original && translation ? { original, translation } : null;
    }).filter(Boolean);

    items = shuffle(mapped);
    index = 0;
    score = 0;
    updateHUD();
    showCurrent();
}

function updateHUD() {
    progressEl().textContent = `${Math.min(index + 1, items.length)} / ${items.length}`;
    scoreEl().textContent = `Score : ${score}`;
}

function showCurrent() {
    if (index >= items.length) {
        // fin du quiz
        promptEl().innerHTML = '🎉 Terminé !';
        feedbackEl().innerHTML = `Score final : <strong>${score} / ${items.length}</strong>`;
        formEl().style.display = 'none';
        return;
    }

    const current = items[index];
    promptEl().innerHTML = escapeHtml(current.translation);
    feedbackEl().textContent = '';
    answerEl().value = '';
    answerEl().disabled = false;
    locked = false;
    validateBtn().disabled = false;
    nextBtn().disabled = true;
    answerEl().focus();
    updateHUD();
}

function checkAnswer() {
    if (locked) return;
    const current = items[index];
    const expected = normalize(current.original);
    const given = normalize(answerEl().value);

    locked = true;
    answerEl().disabled = true;
    validateBtn().disabled = true;
    nextBtn().disabled = false;

    const ok = given === expected;
    if (ok) {
        score++;
        feedbackEl().innerHTML = `✔ Correct ! (<em>${escapeHtml(current.original)}</em>)`;
    } else {
        feedbackEl().innerHTML = `✘ Faux. Réponse attendue : <strong>${escapeHtml(current.original)}</strong>`;
    }
    updateHUD();
}

function revealAnswer() {
    if (locked) return;
    const current = items[index];
    feedbackEl().innerHTML = `💡 Réponse : <strong>${escapeHtml(current.original)}</strong>`;
    locked = true;
    answerEl().disabled = true;
    validateBtn().disabled = true;
    nextBtn().disabled = false;
}

function nextQuestion() {
    if (index < items.length) index++;
    showCurrent();
}

function restart() {
    // relance un nouveau quiz mélangé
    items = shuffle(items);
    index = 0;
    score = 0;
    formEl().style.display = '';
    showCurrent();
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    loadData().catch(e => {
        promptEl().textContent = 'Erreur de chargement.';
        feedbackEl().textContent = e.message;
    });

    formEl().addEventListener('submit', (e) => {
        e.preventDefault();
        checkAnswer();
    });
    nextBtn().addEventListener('click', nextQuestion);
    revealBtn().addEventListener('click', revealAnswer);

    // Raccourcis clavier: Enter valide, Ctrl+Enter suivant
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.ctrlKey && !locked) {
            e.preventDefault();
            checkAnswer();
        } else if ((e.key === 'Enter' && e.ctrlKey) || e.key === 'ArrowRight') {
            nextQuestion();
        }
    });
});
