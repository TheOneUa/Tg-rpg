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
        gold: p.gold, bag: p.bag, statPoints: p.statPoints || 0,
        inventory: p.inventory || [], equipment: p.equipment || { weapon:null, armor:null, ring:null },
        itemUpgrades: p.itemUpgrades || {}, enchants: p.enchants || {},
        _enchantCrit: p._enchantCrit || 0, _enchantMpRegen: p._enchantMpRegen || 0,
        _atkSpdStat: p._atkSpdStat || 0,
        resources: p.resources,
        masterLevels: p.masterLevels,
        depth: G.depth,
        questState: questState,
        activeQuests: activeQuests,
        questGenerationDepth: questGenerationDepth,
        questProgress: questProgress,
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
    p.statPoints = d.statPoints || 0;
    p.inventory     = d.inventory  || [];
    p.equipment     = d.equipment  || { weapon: null, armor: null, ring: null };
    p.itemUpgrades  = d.itemUpgrades || {};
    p.enchants      = d.enchants     || {};
    p._enchantCrit  = d._enchantCrit || 0;
    p._enchantMpRegen = d._enchantMpRegen || 0;
    p._atkSpdStat   = d._atkSpdStat  || 0;
    p.recalcEqBonus();
    p.bag = d.bag || { hpPot:0, mpPot:0, sword:0, shield:0 };
    p.resources = d.resources || { ore: 0, wood: 0, essence: 0 };
    const defML = { atk:0, def:0, maxhp:0, maxmp:0, spd:0, atkSpd:0 };
    p.masterLevels = d.masterLevels || { smith: {...defML}, elf: {...defML}, witch: {...defML} };
    G.depth = d.depth || 0;
    stats = d.stats || { totalKills:0, totalGold:0, maxDepth:0, bossKills:0, maxLevel:1, itemsCollected:0 };
    achievements = d.achievements || {};
    if (d.activeQuests?.length) {
        activeQuests = d.activeQuests;
        questState = d.questState || {};
        questGenerationDepth = d.questGenerationDepth || 0;
        questProgress = d.questProgress || { kills:{}, bossKillsQ:0, goldEarned:0, maxDepthQ:0 };
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