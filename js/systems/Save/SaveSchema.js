// ============================================================
//  SAVE SCHEMA — сериализация/десериализация состояния игры
// ============================================================
// Единственное место, которое знает "из чего состоит сохранение".
// Меняешь набор полей — меняешь SAVE_VERSION и добавляешь миграцию
// в SaveMigrations.js.

const SAVE_KEY     = 'tg_rpg_v4';
const SAVE_VERSION = 3; // v3: инвентарь хранит уникальные instanceId (было просто {type})

function getSaveData() {
    const p = G.p;
    return {
        saveVersion: SAVE_VERSION,
        version: VERSION,
        playerData: playerData,
        maxDepthReached: maxDepthReached,
        hp: p.hp, mp: p.mp,
        maxhp: p.maxhp, maxmp: p.maxmp,
        atk: p.atk, def: p.def, spd: p.spd,
        lv: p.lv, exp: p.exp, exn: p.exn,
        gold: p.gold, bag: p.bag, statPoints: p.statPoints ?? 0,
        inventory: p.inventory ?? [], equipment: p.equipment ?? { weapon:null, armor:null, ring:null },
        itemUpgrades: p.itemUpgrades ?? {}, enchants: p.enchants ?? {},
        nextItemInstanceId: _nextItemInstanceId, // счётчик уникальных ID предметов
        _enchantCrit: p._enchantCrit ?? 0, _enchantMpRegen: p._enchantMpRegen ?? 0,
        _atkSpdStat: p._atkSpdStat ?? 0,
        resources: p.resources ?? { ore:0, wood:0, essence:0 },
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
    if (!d || typeof d !== 'object') return false;

    // BUG-055: проверка совместимости версии сохранения
    const sv = d.saveVersion ?? 1;
    if (sv < SAVE_VERSION) {
        console.warn(`[Save] Старое сохранение v${sv}, текущая схема v${SAVE_VERSION} — мигрируем`);
        _migrateSave(d, sv);
    }

    const p = G.p;
    playerData = d.playerData ?? playerData;

    // Класс — восстанавливаем ДО перезаписи статов
    p.initFromClass(playerData.class ?? 'warrior');

    // BUG-029: используем ?? вместо || чтобы корректно обрабатывать значения 0
    maxDepthReached  = d.maxDepthReached ?? 0;
    p.hp             = d.hp   ?? p.maxhp;
    p.mp             = d.mp   ?? p.maxmp;
    p.maxhp          = d.maxhp ?? p.maxhp;
    p.maxmp          = d.maxmp ?? p.maxmp;
    p.atk            = d.atk  ?? p.atk;
    p.def            = d.def  ?? p.def;
    p.spd            = d.spd  ?? p.spd;
    p.lv             = d.lv   ?? 1;
    p.exp            = d.exp  ?? 0;
    p.exn            = d.exn  ?? 100;
    p.gold           = d.gold ?? 0;
    p.statPoints     = d.statPoints ?? 0;
    p._enchantCrit   = d._enchantCrit   ?? 0;
    p._enchantMpRegen = d._enchantMpRegen ?? 0;
    p._atkSpdStat    = d._atkSpdStat    ?? 0;

    p.bag = d.bag
        ? { hpPot: d.bag.hpPot ?? 0, mpPot: d.bag.mpPot ?? 0 }
        : { hpPot: 0, mpPot: 0 };

    p.inventory    = Array.isArray(d.inventory)  ? d.inventory  : [];
    p.equipment    = d.equipment ?? { weapon: null, armor: null, ring: null };
    p.itemUpgrades = d.itemUpgrades ?? {};
    p.enchants     = d.enchants     ?? {};
    p.resources    = d.resources    ?? { ore: 0, wood: 0, essence: 0 };

    // Восстанавливаем глобальный счётчик уникальных ID предметов
    restoreItemInstanceCounter(d.nextItemInstanceId);

    // Миграция v2→v3: старые предметы хранились как { type } без instanceId/level.
    // Присваиваем каждому уникальный ID при первой загрузке в новой версии.
    p.inventory = p.inventory.map(item =>
        item.instanceId ? item : { ...createItemInstance(item.type) }
    );
    for (const slot of Object.keys(p.equipment)) {
        const eq = p.equipment[slot];
        if (eq && !eq.instanceId) {
            p.equipment[slot] = createItemInstance(typeof eq === 'string' ? eq : eq.type);
        }
    }

    const defML = { atk:0, def:0, maxhp:0, maxmp:0, spd:0, atkSpd:0 };
    if (d.masterLevels) {
        p.masterLevels = {
            smith: { ...defML, ...d.masterLevels.smith },
            elf:   { ...defML, ...d.masterLevels.elf   },
            witch: { ...defML, ...d.masterLevels.witch  },
        };
    } else {
        p.masterLevels = { smith: {...defML}, elf: {...defML}, witch: {...defML} };
    }

    p.recalcEqBonus();

    G.depth = d.depth ?? 0;
    stats   = d.stats ?? { totalKills:0, totalGold:0, maxDepth:0, bossKills:0, maxLevel:1, itemsCollected:0 };
    achievements = d.achievements ?? {};

    if (Array.isArray(d.activeQuests) && d.activeQuests.length > 0) {
        activeQuests          = d.activeQuests;
        questState            = d.questState ?? {};
        questGenerationDepth  = d.questGenerationDepth ?? 0;
        questProgress         = d.questProgress ?? { kills:{}, bossKillsQ:0, goldEarned:0, maxDepthQ:0 };
    }

    return true;
}
