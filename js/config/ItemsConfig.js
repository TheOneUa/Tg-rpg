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

    // ── ОРУЖИЕ ЛУЧНИКА ──
    bow_wood:      { name: 'Деревянный лук',  icon: '🏹', slot: 'weapon', rarity: 'common',    atk: 7,  forClass: 'archer', col: '#8b5e3c' },
    bow_elven:     { name: 'Эльфийский лук',  icon: '🪄', slot: 'weapon', rarity: 'rare',      atk: 14, forClass: 'archer', col: '#4a9a5a' },
    bow_shadow:    { name: 'Теневой лук',     icon: '🌑', slot: 'weapon', rarity: 'epic',      atk: 23, forClass: 'archer', col: '#4a3a6a' },
    bow_legend:    { name: 'Лук Ветра',       icon: '🌟', slot: 'weapon', rarity: 'legendary', atk: 34, forClass: 'archer', col: '#88ffee' },

    // ── ОРУЖИЕ МАГА ──
    staff_oak:     { name: 'Дубовый посох',     icon: '🪄', slot: 'weapon', rarity: 'common',    atk: 6,  mp: 10, forClass: 'mage', col: '#6a4a8a' },
    staff_crystal: { name: 'Хрустальный посох', icon: '💎', slot: 'weapon', rarity: 'rare',      atk: 12, mp: 25, forClass: 'mage', col: '#8a5aaa' },
    staff_void:    { name: 'Посох Пустоты',     icon: '🌌', slot: 'weapon', rarity: 'epic',      atk: 20, mp: 35, forClass: 'mage', col: '#3a2a5a' },
    staff_legend:  { name: 'Посох Архимага',    icon: '🌟', slot: 'weapon', rarity: 'legendary', atk: 30, mp: 50, forClass: 'mage', col: '#ff88ff' },

    // ── БРОНЯ МЕЧНИКА (тяжёлая) ──
    armor_leather:{ name: 'Кожаная броня',  icon: '🥋', slot: 'armor', rarity: 'common', def: 4,  forClass: 'warrior', col: '#8b5e3c' },
    armor_chain:  { name: 'Кольчуга',       icon: '🛡️', slot: 'armor', rarity: 'rare',   def: 10, forClass: 'warrior', col: '#a0a8b0' },
    armor_plate:  { name: 'Латные доспехи', icon: '⛨',  slot: 'armor', rarity: 'epic',   def: 18, forClass: 'warrior', col: '#d0d0e0' },

    // ── БРОНЯ ЛУЧНИКА (лёгкая) ──
    armor_hide:   { name: 'Шкурная броня',    icon: '🦌', slot: 'armor', rarity: 'common', def: 3, spd: 0.1, forClass: 'archer', col: '#a08050' },
    armor_ranger: { name: 'Броня Следопыта',  icon: '🌲', slot: 'armor', rarity: 'rare',   def: 7, spd: 0.2, forClass: 'archer', col: '#3a6a3a' },
    armor_shadow: { name: 'Теневой плащ',     icon: '🦇', slot: 'armor', rarity: 'epic',   def: 12, spd: 0.3, forClass: 'archer', col: '#2a2a3a' },

    // ── БРОНЯ МАГА (мантии) ──
    armor_robe:     { name: 'Мантия',           icon: '👘', slot: 'armor', rarity: 'common', def: 2, mp: 15, forClass: 'mage', col: '#5a3a7a' },
    armor_arcane:   { name: 'Мантия Аркана',    icon: '🔮', slot: 'armor', rarity: 'rare',   def: 5, mp: 30, forClass: 'mage', col: '#4a2a8a' },
    armor_celestial:{ name: 'Небесное Одеяние', icon: '✨', slot: 'armor', rarity: 'epic',   def: 9, mp: 45, forClass: 'mage', col: '#8a4aff' },

    // Кольца (универсальные — все классы)
    ring_hp:      { name: 'Кольцо жизни',    icon: '💍', slot: 'ring', rarity: 'rare', hp: 20, col: '#c83232' },
    ring_atk:     { name: 'Кольцо силы',     icon: '💍', slot: 'ring', rarity: 'rare', atk: 5, col: '#ff8800' },
    ring_spd:     { name: 'Кольцо ветра',    icon: '💍', slot: 'ring', rarity: 'epic', spd: 0.3, col: '#44aaff' },
    ring_speed:   { name: 'Кольцо быстрого клинка', icon: '⚡', slot: 'ring', rarity: 'epic', atkSpd: 0.3, col: '#ffee44' },
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
// Прогрессия по глубине: common (0-4) → rare (5-9) → epic (10-19) → legendary (20+)
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
    ring_spd: 6, ring_speed: 6, ring_hp: 5, ring_atk: 5,
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
    ring_spd: 8, ring_speed: 8,
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

// Выбирает таблицу дропа по глубине подземелья
function getDropTableForDepth(depth) {
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

function rollRandomItemEnchant() {
    const keys = Object.keys(ITEM_ENCHANTS);
    return keys[Math.floor(Math.random() * keys.length)];
}

function rollLoot(isBoss, depth) {
    const drops = [];
    if (isBoss) {
        // Босс: 2-3 гарантированных дропа, с шансом легендарки на глубоких этажах
        const count = 2 + Math.floor(Math.random() * 2);
        const table = depth >= 15 && Math.random() < 0.4 ? DROP_TABLE_BOSS_LEGENDARY : DROP_TABLE_BOSS;
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
