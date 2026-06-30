// ============================================================
//  SAVE SYSTEM
// ============================================================
const SAVE_KEY = 'tg_rpg_v4';

function getSaveData() {
    const p = G.p;
    return {
        version: VERSION,
        playerData: playerData,
        maxDepthReached: maxDepthReached,
        hp: p.hp, mp: p.mp,
        maxhp: p.maxhp, maxmp: p.maxmp,
        atk: p.atk, def: p.def,
        lv: p.lv, exp: p.exp, exn: p.exn,
        gold: p.gold, bag: p.bag,
        resources: p.resources,
        masterLevels: p.masterLevels,
        depth: G.depth,
        questState: questState,
        activeQuests: activeQuests,
        questGenerationDepth: questGenerationDepth,
        stats: stats,
        achievements: achievements
    };
}

function applySaveData(d) {
    if (!d) return false;
    const p = G.p;
    playerData = d.playerData || playerData;

    // Восстанавливаем класс (atkType/atkRange/mpCost/способность) — это
    // должно идти ДО перезаписи hp/mp/atk/def сохранёнными значениями,
    // иначе initFromClass() сбросит их на базовые значения класса.
    p.initFromClass(playerData.class || 'warrior');

    maxDepthReached = d.maxDepthReached || 0;
    p.hp = d.hp || p.maxhp;
    p.mp = d.mp || p.maxmp;
    p.maxhp = d.maxhp || p.maxhp;
    p.maxmp = d.maxmp || p.maxmp;
    p.atk = d.atk || p.atk;
    p.def = d.def || p.def;
    p.lv = d.lv || 1;
    p.exp = d.exp || 0;
    p.exn = d.exn || 100;
    p.gold = d.gold || 0;
    p.bag = d.bag || { hpPot:0, mpPot:0, sword:0, shield:0 };
    p.resources = d.resources || { ore: 0, wood: 0, essence: 0 };
    p.masterLevels = d.masterLevels || { smith: { weapon: 0, armor: 0 }, elf: { weapon: 0, armor: 0 }, witch: { weapon: 0, armor: 0 } };
    G.depth = d.depth || 0;
    stats = d.stats || { totalKills:0, totalGold:0, maxDepth:0, bossKills:0, maxLevel:1, itemsCollected:0 };
    achievements = d.achievements || {};
    if (d.activeQuests?.length) {
        activeQuests = d.activeQuests;
        questState = d.questState || {};
        questGenerationDepth = d.questGenerationDepth || 0;
    }
    return true;
}

function hasSave() {
    try { return localStorage.getItem(SAVE_KEY) !== null; } catch(e) { return false; }
}

function saveGame(show = true) {
    try {
        const data = getSaveData();
        localStorage.setItem(SAVE_KEY, JSON.stringify(data));
        if (show) showSaveIndicator('💾 Сохранено');
        return true;
    } catch(e) { return false; }
}

function loadGame() {
    try {
        const local = localStorage.getItem(SAVE_KEY);
        if (local) {
            applySaveData(JSON.parse(local));
            return true;
        }
    } catch(e) {}
    return false;
}

function resetSave() {
    try { localStorage.removeItem(SAVE_KEY); } catch(e) {}
}

function showSaveIndicator(text) {
    const el = document.getElementById('save-indicator');
    el.textContent = text;
    el.classList.add('show');
    clearTimeout(window._saveTimer);
    window._saveTimer = setTimeout(() => el.classList.remove('show'), 1500);
}

// Автосохранение при закрытии
window.addEventListener('beforeunload', () => saveGame(false));