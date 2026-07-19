// ============================================================
//  ПРЕДМЕТЫ — таблица лута из монстров
// ============================================================
// slot: 'weapon' | 'armor' | 'ring' | 'consumable'
// rarity: 'common' | 'rare' | 'epic' | 'legendary'
// forClass: 'warrior' | 'archer' | 'mage' | undefined (универсальный)
const ITEM_DEFS = {
    // Зелья (расходники)
    hpPot:        { name: 'Зелье HP',      icon: '🧪', slot: 'consumable', col: '#c83232' },
    mpPot:        { name: 'Зелье MP',      icon: '💧', slot: 'consumable', col: '#3c78dc' },
    gold:         { name: 'Золото',        icon: '💰', slot: 'consumable', col: '#ffd700' },

    // ── ОРУЖИЕ МЕЧНИКА ──
    sword_iron:    { name: 'Железный меч',    icon: '⚔️', slot: 'weapon', rarity: 'common',    atk: 8,  forClass: 'warrior', col: '#969190' },
    sword_steel:   { name: 'Стальной меч',    icon: '🗡️', slot: 'weapon', rarity: 'rare',      atk: 16, forClass: 'warrior', col: '#b0c8e0' },
    sword_flame:   { name: 'Пылающий клинок', icon: '🔥', slot: 'weapon', rarity: 'epic',      atk: 26, forClass: 'warrior', col: '#ff6633' },
    sword_legend:  { name: 'Клинок Королей',  icon: '🌟', slot: 'weapon', rarity: 'legendary', atk: 38, forClass: 'warrior', col: '#ffcc33' },
    sword_mythic:  { name: 'Клинок Титана',   icon: '💠', slot: 'weapon', rarity: 'mythic',    atk: 58, forClass: 'warrior', col: '#33e0ff' },
    sword_divine:  { name: 'Меч Вознесения',  icon: '🌠', slot: 'weapon', rarity: 'divine',    atk: 90, forClass: 'warrior', col: '#ffffff' },

    // ── ОРУЖИЕ ЛУЧНИКА ──
    bow_wood:      { name: 'Деревянный лук',  icon: '🏹', slot: 'weapon', rarity: 'common',    atk: 7,  forClass: 'archer', col: '#8b5e3c' },
    bow_elven:     { name: 'Эльфийский лук',  icon: '🪄', slot: 'weapon', rarity: 'rare',      atk: 14, forClass: 'archer', col: '#4a9a5a' },
    bow_shadow:    { name: 'Теневой лук',     icon: '🌑', slot: 'weapon', rarity: 'epic',      atk: 23, forClass: 'archer', col: '#4a3a6a' },
    bow_legend:    { name: 'Лук Ветра',       icon: '🌟', slot: 'weapon', rarity: 'legendary', atk: 34, forClass: 'archer', col: '#88ffee' },
    bow_mythic:    { name: 'Лук Бури',        icon: '💠', slot: 'weapon', rarity: 'mythic',    atk: 52, forClass: 'archer', col: '#33ffcc' },
    bow_divine:    { name: 'Лук Небожителя',  icon: '🌠', slot: 'weapon', rarity: 'divine',    atk: 80, forClass: 'archer', col: '#ffffff' },

    // ── ОРУЖИЕ МАГА ──
    staff_oak:     { name: 'Дубовый посох',     icon: '🪄', slot: 'weapon', rarity: 'common',    atk: 6,  mp: 10, forClass: 'mage', col: '#6a4a8a' },
    staff_crystal: { name: 'Хрустальный посох', icon: '💎', slot: 'weapon', rarity: 'rare',      atk: 12, mp: 25, forClass: 'mage', col: '#8a5aaa' },
    staff_void:    { name: 'Посох Пустоты',     icon: '🌌', slot: 'weapon', rarity: 'epic',      atk: 20, mp: 35, forClass: 'mage', col: '#3a2a5a' },
    staff_legend:  { name: 'Посох Архимага',    icon: '🌟', slot: 'weapon', rarity: 'legendary', atk: 30, mp: 50, forClass: 'mage', col: '#ff88ff' },
    staff_mythic:  { name: 'Посох Вечности',    icon: '💠', slot: 'weapon', rarity: 'mythic',    atk: 44, mp: 75, forClass: 'mage', col: '#ff33cc' },
    staff_divine:  { name: 'Посох Творца',      icon: '🌠', slot: 'weapon', rarity: 'divine',    atk: 68, mp: 110, forClass: 'mage', col: '#ffffff' },

    // ── БРОНЯ МЕЧНИКА (тяжёлая) ──
    armor_leather:{ name: 'Кожаная броня',  icon: '🥋', slot: 'armor', rarity: 'common', def: 4,  forClass: 'warrior', col: '#8b5e3c' },
    armor_chain:  { name: 'Кольчуга',       icon: '🛡️', slot: 'armor', rarity: 'rare',   def: 10, forClass: 'warrior', col: '#a0a8b0' },
    armor_plate:  { name: 'Латные доспехи', icon: '⛨',  slot: 'armor', rarity: 'epic',   def: 18, forClass: 'warrior', col: '#d0d0e0' },
    armor_dragon: { name: 'Драконья броня', icon: '🐉', slot: 'armor', rarity: 'legendary', def: 29, forClass: 'warrior', col: '#ff4422' },
    armor_titan:  { name: 'Доспехи Титана', icon: '💠', slot: 'armor', rarity: 'mythic',    def: 46, forClass: 'warrior', col: '#33e0ff' },
    armor_ascend: { name: 'Латы Вознесения',icon: '🌠', slot: 'armor', rarity: 'divine',    def: 74, forClass: 'warrior', col: '#ffffff' },

    // ── БРОНЯ ЛУЧНИКА (лёгкая) ──
    armor_hide:   { name: 'Шкурная броня',    icon: '🦌', slot: 'armor', rarity: 'common', def: 3, spd: 0.1, forClass: 'archer', col: '#a08050' },
    armor_ranger: { name: 'Броня Следопыта',  icon: '🌲', slot: 'armor', rarity: 'rare',   def: 7, spd: 0.2, forClass: 'archer', col: '#3a6a3a' },
    armor_shadow: { name: 'Теневой плащ',     icon: '🦇', slot: 'armor', rarity: 'epic',   def: 12, spd: 0.3, forClass: 'archer', col: '#2a2a3a' },
    armor_phoenix:{ name: 'Броня Феникса',    icon: '🔥', slot: 'armor', rarity: 'legendary', def: 19, spd: 0.4, forClass: 'archer', col: '#ff6633' },
    armor_storm:  { name: 'Плащ Бури',        icon: '💠', slot: 'armor', rarity: 'mythic',    def: 31, spd: 0.5, forClass: 'archer', col: '#33ffcc' },
    armor_windgod:{ name: 'Одеяние Ветра Богов', icon: '🌠', slot: 'armor', rarity: 'divine', def: 49, spd: 0.6, forClass: 'archer', col: '#ffffff' },

    // ── БРОНЯ МАГА (мантии) ──
    armor_robe:     { name: 'Мантия',           icon: '👘', slot: 'armor', rarity: 'common', def: 2, mp: 15, forClass: 'mage', col: '#5a3a7a' },
    armor_arcane:   { name: 'Мантия Аркана',    icon: '🔮', slot: 'armor', rarity: 'rare',   def: 5, mp: 30, forClass: 'mage', col: '#4a2a8a' },
    armor_celestial:{ name: 'Небесное Одеяние', icon: '✨', slot: 'armor', rarity: 'epic',   def: 9, mp: 45, forClass: 'mage', col: '#8a4aff' },
    armor_eternity: { name: 'Мантия Вечности',  icon: '🌌', slot: 'armor', rarity: 'legendary', def: 14, mp: 70, forClass: 'mage', col: '#cc44ff' },
    armor_chaos:    { name: 'Одеяние Хаоса',    icon: '💠', slot: 'armor', rarity: 'mythic',    def: 22, mp: 105, forClass: 'mage', col: '#ff33cc' },
    armor_creator:  { name: 'Мантия Творца',    icon: '🌠', slot: 'armor', rarity: 'divine',    def: 35, mp: 160, forClass: 'mage', col: '#ffffff' },

    // Кольца (универсальные — все классы)
    ring_hp:      { name: 'Кольцо жизни',    icon: '💍', slot: 'ring', rarity: 'rare', hp: 20, col: '#c83232' },
    ring_atk:     { name: 'Кольцо силы',     icon: '💍', slot: 'ring', rarity: 'rare', atk: 5, col: '#ff8800' },
    ring_spd:     { name: 'Кольцо ветра',    icon: '💍', slot: 'ring', rarity: 'epic', spd: 0.3, col: '#44aaff' },
    ring_speed:   { name: 'Кольцо быстрого клинка', icon: '⚡', slot: 'ring', rarity: 'epic', atkSpd: 0.3, col: '#ffee44' },
    ring_vitality:{ name: 'Кольцо Вечной Жизни', icon: '💍', slot: 'ring', rarity: 'legendary', hp: 45, col: '#ff4466' },
    ring_might:   { name: 'Кольцо Титана',       icon: '💍', slot: 'ring', rarity: 'legendary', atk: 11, col: '#ffaa22' },
    ring_storm:   { name: 'Кольцо Шторма',       icon: '💠', slot: 'ring', rarity: 'mythic', spd: 0.6, atkSpd: 0.2, col: '#33e0ff' },
    ring_eternal: { name: 'Кольцо Вечности',     icon: '🌠', slot: 'ring', rarity: 'divine', hp: 40, atk: 10, def: 8, spd: 0.3, atkSpd: 0.3, col: '#ffffff' },
};

// ============================================================
//  ITEM ENCHANTS — боевые абилки предметов (не путать с ENCHANTS
//  в systems/Masters/Masters.js, те дают пассивные статы игроку;
//  эти — активируются в бою через CombatEngine при ударе)
// ============================================================
const ITEM_ENCHANTS = {
    poison: {
        name: 'Отравленный',
        icon: '☠️',
        desc: 'Шанс 25% наложить яд (тикающий урон 5 сек)',
        triggerChance: 0.25,
        effect: 'poison',
        poisonDmgPerTick: 0.15, // % от атаки игрока за тик
        poisonTicks: 5,
        poisonTickInterval: 60  // кадров между тиками (1 сек)
    },
    splash: {
        name: 'Разящий',
        icon: '💥',
        desc: 'Удар задевает врагов рядом (50% урона)',
        triggerChance: 1.0, // всегда срабатывает
        effect: 'splash',
        splashRadius: 1.5,  // тайлы
        splashDamageMult: 0.5
    },
    haste: {
        name: 'Стремительный',
        icon: '💨',
        desc: 'Шанс 20% сбросить половину кулдауна атаки',
        triggerChance: 0.2,
        effect: 'haste',
        hasteReduction: 0.5
    },
    frost: {
        name: 'Ледяной',
        icon: '❄️',
        desc: 'Шанс 20% заморозить врага на 1 сек',
        triggerChance: 0.2,
        effect: 'freeze',
        freezeDuration: 60 // кадров
    },
    vampiric: {
        name: 'Вампирский',
        icon: '🩸',
        desc: '+8% похищения жизни от урона этим оружием',
        triggerChance: 1.0,
        effect: 'itemLifesteal',
        lifestealPercent: 0.08
    }
};

// Таблицы дропа: { itemId: вес } — чем больше вес, тем чаще.
// Прогрессия по глубине: common(0-4)→rare(5-9)→epic(10-19)→legendary(20-39)
// →mythic(40-69)→divine(70+, без верхнего предела — самый глубокий тир
// действует и на глубине 100, и на 500).
const DROP_TABLE_COMMON = {
    hpPot: 35, mpPot: 25,
    sword_iron: 6, bow_wood: 6, staff_oak: 6,
    armor_leather: 5, armor_hide: 5, armor_robe: 5,
};
const DROP_TABLE_RARE = {
    hpPot: 22, mpPot: 18,
    sword_iron: 5, bow_wood: 5, staff_oak: 5,
    sword_steel: 7, bow_elven: 7, staff_crystal: 7,
    armor_leather: 4, armor_hide: 4, armor_robe: 4,
    armor_chain: 5, armor_ranger: 5, armor_arcane: 5,
    ring_hp: 4, ring_atk: 4,
};
const DROP_TABLE_EPIC = {
    hpPot: 15, mpPot: 13,
    sword_steel: 6, bow_elven: 6, staff_crystal: 6,
    sword_flame: 8, bow_shadow: 8, staff_void: 8,
    armor_chain: 4, armor_ranger: 4, armor_arcane: 4,
    armor_plate: 6, armor_shadow: 6, armor_celestial: 6,
    ring_hp: 5, ring_atk: 5, ring_spd: 4, ring_speed: 4,
};
const DROP_TABLE_LEGENDARY = {
    sword_flame: 8, bow_shadow: 8, staff_void: 8,
    sword_legend: 6, bow_legend: 6, staff_legend: 6,
    armor_plate: 6, armor_shadow: 6, armor_celestial: 6,
    armor_dragon: 4, armor_phoenix: 4, armor_eternity: 4,
    ring_spd: 6, ring_speed: 6, ring_hp: 5, ring_atk: 5,
    ring_vitality: 3, ring_might: 3,
};
const DROP_TABLE_MYTHIC = {
    sword_legend: 6, bow_legend: 6, staff_legend: 6,
    sword_mythic: 5, bow_mythic: 5, staff_mythic: 5,
    armor_dragon: 5, armor_phoenix: 5, armor_eternity: 5,
    armor_titan: 4, armor_storm: 4, armor_chaos: 4,
    ring_vitality: 4, ring_might: 4, ring_storm: 4,
};
const DROP_TABLE_DIVINE = {
    sword_mythic: 6, bow_mythic: 6, staff_mythic: 6,
    sword_divine: 4, bow_divine: 4, staff_divine: 4,
    armor_titan: 5, armor_storm: 5, armor_chaos: 5,
    armor_ascend: 3, armor_windgod: 3, armor_creator: 3,
    ring_storm: 5, ring_might: 4, ring_vitality: 4, ring_eternal: 2,
};
const DROP_TABLE_BOSS = {
    sword_steel: 8, bow_elven: 8, staff_crystal: 8,
    sword_flame: 10, bow_shadow: 10, staff_void: 10,
    armor_chain: 6, armor_ranger: 6, armor_arcane: 6,
    armor_plate: 8, armor_shadow: 8, armor_celestial: 8,
    ring_hp: 6, ring_atk: 6, ring_spd: 6, ring_speed: 6,
    hpPot: 15, mpPot: 10,
};
// Боссы с глубины 15+ могут дропнуть легендарки
const DROP_TABLE_BOSS_LEGENDARY = {
        sword_flame: 8, bow_shadow: 8, staff_void: 8,
    sword_legend: 10, bow_legend: 10, staff_legend: 10,
    armor_plate: 6, armor_shadow: 6, armor_celestial: 6,
    armor_dragon: 6, armor_phoenix: 6, armor_eternity: 6,
    ring_spd: 8, ring_speed: 8, ring_vitality: 4, ring_might: 4,
};
// Боссы с глубины 40+ могут дропнуть мифики
const DROP_TABLE_BOSS_MYTHIC = {
    sword_legend: 8, bow_legend: 8, staff_legend: 8,
    sword_mythic: 10, bow_mythic: 10, staff_mythic: 10,
    armor_dragon: 6, armor_phoenix: 6, armor_eternity: 6,
    armor_titan: 8, armor_storm: 8, armor_chaos: 8,
    ring_vitality: 6, ring_might: 6, ring_storm: 6,
};
// Боссы с глубины 70+ могут дропнуть божественные — без верхнего предела глубины
const DROP_TABLE_BOSS_DIVINE = {
    sword_mythic: 8, bow_mythic: 8, staff_mythic: 8,
    sword_divine: 10, bow_divine: 10, staff_divine: 10,
    armor_titan: 6, armor_storm: 6, armor_chaos: 6,
    armor_ascend: 8, armor_windgod: 8, armor_creator: 8,
    ring_storm: 6, ring_might: 5, ring_vitality: 5, ring_eternal: 4,
};

function weightedRandom(table) {
    const total = Object.values(table).reduce((a,b) => a+b, 0);
    let r = Math.random() * total;
    for (const [key, w] of Object.entries(table)) {
        r -= w;
        if (r <= 0) return key;
    }
    return Object.keys(table)[0];
}

// Выбирает таблицу дропа по глубине подземелья.
// depth>=70 — верхний тир, БЕЗ потолка (100, 200, 500 — всё ещё DIVINE).
function getDropTableForDepth(depth) {
    if (depth >= 70) return DROP_TABLE_DIVINE;
    if (depth >= 40) return DROP_TABLE_MYTHIC;
    if (depth >= 20) return DROP_TABLE_LEGENDARY;
    if (depth >= 10) return DROP_TABLE_EPIC;
    if (depth >= 5)  return DROP_TABLE_RARE;
    return DROP_TABLE_COMMON;
}

// Золото за убийство обычного врага, масштабируется с глубиной
function getGoldDropAmount(depth, isBoss) {
    const base = isBoss ? (40 + depth * 8) : (8 + depth * 2);
    const variance = 0.7 + Math.random() * 0.6; // ±30%
    return Math.round(base * variance);
}

// Шанс, что выпавший экипируемый предмет будет сразу зачарован боевой
// абилкой (яд/сплэш/ускорение/заморозка/вампиризм) — растёт с глубиной.
function rollItemEnchantChance(depth, isBoss) {
    const baseChance = isBoss ? 0.35 : 0.08;
    const depthBonus = Math.min(0.35, depth * 0.012); // +1.2%/этаж, потолок +35%
    return baseChance + depthBonus;
}

// Шанс, что выпавший экипируемый предмет будет сразу иметь уровень
// улучшения (+1, +5...) — как у мастера, только бесплатно от дропа.
// Сам ШАНС ограничен разумным потолком (85%) — иначе каждый дроп будет
// улучшенным и это перестанет быть интересным. А вот МАКСИМАЛЬНЫЙ
// достижимый уровень — без потолка, растёт с глубиной вечно, как и
// уровень улучшения у мастера (см. MasterUpgrade.js — тоже без потолка).
function rollDropEnhanceLevel(depth, isBoss) {
    const baseChance = isBoss ? 0.15 : 0.03;
    const perDepth   = isBoss ? 0.012 : 0.004;
    const chance = Math.min(0.85, baseChance + depth * perDepth);
    if (Math.random() >= chance) return 0;

    // Максимум уровня растёт с глубиной без верхнего предела.
    const maxLevel = 1 + Math.floor(depth / 8) + (isBoss ? 2 : 0);
    // Геометрическое распределение — низкие уровни в пределах maxLevel
    // выпадают чаще, чем самый максимум (45% шанс продолжить рост).
    let level = 1;
    while (level < maxLevel && Math.random() < 0.45) level++;
    return level;
}

function rollRandomItemEnchant() {
    const keys = Object.keys(ITEM_ENCHANTS);
    return keys[Math.floor(Math.random() * keys.length)];
}

// Выбирает таблицу дропа для босса по глубине — топ-тир тоже без потолка.
function getBossDropTable(depth) {
    if (depth >= 70 && Math.random() < 0.4) return DROP_TABLE_BOSS_DIVINE;
    if (depth >= 40 && Math.random() < 0.4) return DROP_TABLE_BOSS_MYTHIC;
    if (depth >= 15 && Math.random() < 0.4) return DROP_TABLE_BOSS_LEGENDARY;
    return DROP_TABLE_BOSS;
}

function rollLoot(isBoss, depth) {
    const drops = [];
    if (isBoss) {
        // Босс: 2-3 гарантированных дропа, с шансом более высокого тира
        // на глубоких этажах (см. getBossDropTable)
        const count = 2 + Math.floor(Math.random() * 2);
        const table = getBossDropTable(depth);
        for (let i = 0; i < count; i++) drops.push(weightedRandom(table));
    } else {
        // Обычный враг: шанс на дроп растёт с глубиной (35% → до 55% на глубине 20+)
        const dropChance = Math.min(0.55, 0.35 + depth * 0.01);
        if (Math.random() < dropChance) {
            const table = getDropTableForDepth(depth);
            drops.push(weightedRandom(table));
        }
    }
    return drops;
}

// Строка вида "⚔️+5 🛡️+2" для отображения бонусов предмета.
// Используется: ui/CharScreen (экипировка/инвентарь) и systems/Masters (улучшение).
function _itemStatStr(def) {
    if (!def) return '';
    const parts = [];
    if (def.atk)    parts.push('⚔️+' + def.atk);
    if (def.def)    parts.push('🛡️+' + def.def);
    if (def.hp)     parts.push('❤️+' + def.hp);
    if (def.mp)     parts.push('💧+' + def.mp);
    if (def.spd)    parts.push('💨+' + def.spd);
    if (def.atkSpd) parts.push('⚡+' + def.atkSpd);
    if (def.itemAbility) parts.push(def.itemAbility.icon + ' ' + def.itemAbility.name);
    return parts.join(' ');
}
