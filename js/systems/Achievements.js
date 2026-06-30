// ============================================================
//  ACHIEVEMENTS
// ============================================================
const ACHIEVEMENTS = [
    { id:'a1', name:'Первый шаг', desc:'Убей первого врага', icon:'⚔️', check:s=>s.totalKills>=1 },
    { id:'a2', name:'Охотник', desc:'Убей 50 врагов', icon:'🏹', check:s=>s.totalKills>=50 },
    { id:'a3', name:'Массовое истребление', desc:'Убей 200 врагов', icon:'💀', check:s=>s.totalKills>=200 },
    { id:'a4', name:'Легендарный охотник', desc:'Убей 500 врагов', icon:'⭐', check:s=>s.totalKills>=500 },
    { id:'a5', name:'Богач', desc:'Собери 1000 золота', icon:'💰', check:s=>s.totalGold>=1000 },
    { id:'a6', name:'Миллионер', desc:'Собери 10000 золота', icon:'💎', check:s=>s.totalGold>=10000 },
    { id:'a7', name:'Глубины', desc:'Достигни 5-го уровня', icon:'⬇️', check:s=>s.maxDepth>=5 },
    { id:'a8', name:'Бездна', desc:'Достигни 20-го уровня', icon:'🌊', check:s=>s.maxDepth>=20 },
    { id:'a9', name:'Бездонная бездна', desc:'Достигни 50-го уровня', icon:'🌌', check:s=>s.maxDepth>=50 },
    { id:'a10', name:'Убийца боссов', desc:'Убей 5 боссов', icon:'👑', check:s=>s.bossKills>=5 },
    { id:'a11', name:'Легендарный убийца', desc:'Убей 20 боссов', icon:'🏆', check:s=>s.bossKills>=20 },
    { id:'a12', name:'Силач', desc:'Достигни 10-го уровня', icon:'💪', check:s=>s.maxLevel>=10 },
    { id:'a13', name:'Легенда', desc:'Достигни 25-го уровня', icon:'🌟', check:s=>s.maxLevel>=25 },
    { id:'a14', name:'Собиратель', desc:'Подбери 50 предметов', icon:'📦', check:s=>s.itemsCollected>=50 },
    { id:'a15', name:'Коллекционер', desc:'Подбери 200 предметов', icon:'🧳', check:s=>s.itemsCollected>=200 }
];

let achievements = {};
let stats = {
    totalKills: 0,
    totalGold: 0,
    maxDepth: 0,
    bossKills: 0,
    maxLevel: 1,
    itemsCollected: 0
};

function initAchievements() {
    achievements = {};
    ACHIEVEMENTS.forEach(a => achievements[a.id] = false);
}

function checkAchievements() {
    let unlocked = false;
    ACHIEVEMENTS.forEach(a => {
        if (!achievements[a.id] && a.check(stats)) {
            achievements[a.id] = true;
            unlocked = true;
            showQNotif('🏆 Достижение: ' + a.name + '!');
            sound.play('levelup');
            tgVibrate('heavy');
        }
    });
    return unlocked;
}