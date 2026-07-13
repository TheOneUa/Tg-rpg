// ============================================================
//  SAVE — публичное API (localStorage I/O)
// ============================================================
// Сама схема данных живёт в SaveSchema.js, миграции — в SaveMigrations.js.
// Этот файл ничего не знает про структуру сохранения, только про
// то, как его записать/прочитать/показать индикатор.

function hasSave() {
    try { return localStorage.getItem(SAVE_KEY) !== null; } catch(e) { return false; }
}

function saveGame(show = true) {
    try {
        const data = getSaveData();
        localStorage.setItem(SAVE_KEY, JSON.stringify(data));
        if (show) showSaveIndicator('💾 Сохранено');
        return true;
    } catch(e) {
        console.error('[Save] Ошибка сохранения:', e);
        return false;
    }
}

function loadGame() {
    try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (!raw) return false;
        const data = JSON.parse(raw);
        // BUG-056: проверяем результат applySaveData
        const ok = applySaveData(data);
        if (!ok) {
            console.warn('[Save] applySaveData вернул false — данные повреждены');
            return false;
        }
        return true;
    } catch(e) {
        console.error('[Save] Ошибка загрузки:', e);
        return false;
    }
}

function resetSave() {
    try { localStorage.removeItem(SAVE_KEY); } catch(e) {}
}

function showSaveIndicator(text) {
    const el = document.getElementById('save-indicator');
    if (!el) return;
    el.textContent = text;
    el.classList.add('show');
    clearTimeout(window._saveTimer);
    window._saveTimer = setTimeout(() => el.classList.remove('show'), 1500);
}

window.addEventListener('beforeunload', () => saveGame(false));
