// ============================================================
//  VERSION
// ============================================================
const VERSION = '5.3.1';

// ============================================================
//  CONFIG
// ============================================================
const CFG = {
    TILE: 48,
    W_COLS: 13,
    W_ROWS: 13,
    D_COLS: 40,
    D_ROWS: 32,
    TOP: 58,
    BOT: 190,
    SPAWN_X: 6 * 48 + 24,
    SPAWN_Y: 6 * 48 + 24,
    PORTAL_X: 6 * 48 + 24,
    PORTAL_Y: 2 * 48 + 24,
    SAVE_INTERVAL: 5000,
    LEVEL_COST: 10
};

// ============================================================
//  TILE TYPES
// ============================================================
const T_GRASS = 0, T_TREE = 1, T_WATER = 2, T_STONE = 3, T_SAND = 4;
const T_DF = 5, T_DW = 6, T_DOOR = 7, T_ENTRANCE = 8, T_EXIT = 9;
const T_HOUSE_WALL = 10, T_HOUSE_DOOR = 11;
const SOLID = new Set([T_TREE, T_WATER, T_DW, T_HOUSE_WALL]);

// ============================================================
//  CLASSES
// ============================================================
const CLASSES = {
    //            hp   mp   atk  def  spd   atkCD  atkRange  atkType   mpCost
    warrior: { name: 'Мечник', icon: '⚔️',
        hp: 160, mp: 30,  atk: 30, def: 10, spd: 2.0,
        atkCD: 60,  atkRange: 2, atkType: 'melee',  mpCost: 0  },
    archer:  { name: 'Лучник', icon: '🏹',
        hp: 110, mp: 60,  atk: 22, def: 5,  spd: 2.8,
        atkCD: 60,  atkRange: 6, atkType: 'arrow',  mpCost: 0  },
    mage:    { name: 'Маг',    icon: '🔮',
        hp: 80,  mp: 120, atk: 20, def: 3,  spd: 3.2,
        atkCD: 48,  atkRange: 6, atkType: 'fireball', mpCost: 8 }
};

// ============================================================
//  ABILITIES (вторая кнопка — активная способность класса)
// ============================================================
// cd: кулдаун в кадрах (60 = 1 сек, нормализовано через dt)
// dur: длительность эффекта в кадрах (если применимо)
// mpCost: стоимость маны на активацию
const ABILITIES = {
    warrior: {
        key: 'rage',
        name: 'Кровавая ярость',
        icon: '💢',
        desc: '5 сек: 100% крит + ускорение атаки',
        cd: 1200,      // 20 сек
        dur: 300,      // 5 сек
        mpCost: 15,
        critBonus: 1.0,      // 100% крит шанс на время действия
        atkSpeedMult: 1.6    // атака на 60% быстрее (меньше cooldown)
    },
    archer: {
        key: 'volley',
        name: 'Шквал стрел',
        icon: '🌪️',
        desc: '5 сек: ускоренная стрельба, веер стрел, ускоренные стрелы',
        cd: 1200,      // 20 сек
        dur: 300,      // 5 сек
        mpCost: 20,
        atkSpeedMult: 1.7,   // быстрее стреляет
        arrowSpeedMult: 1.5, // стрелы летят быстрее
        fanCount: 3,         // количество стрел веером
        fanSpreadDeg: 18     // угол разброса между стрелами
    },
    mage: {
        key: 'heal',
        name: 'Исцеление',
        icon: '✨',
        desc: 'Восстанавливает HP + реген на 5 сек',
        cd: 1200,      // 20 сек
        dur: 300,      // 5 сек реген после
        mpCost: 30,
        healPercent: 0.35,   // мгновенное лечение 35% от maxHP
        regenPerSec: 0.02    // дополнительный реген %maxHP/сек на время dur
    }
};

// ============================================================
//  SHOP
// ============================================================
const SHOP = [
    { name: 'Зелье HP', icon: '🧪', desc: '+40 HP', price: 30, give: 'hpPot' },
    { name: 'Зелье MP', icon: '💧', desc: '+30 MP', price: 25, give: 'mpPot' },
    { name: 'Меч+', icon: '⚔️', desc: '+10 атаки', price: 60, give: 'sword' },
    { name: 'Щит', icon: '🛡️', desc: '+4 защиты', price: 50, give: 'shield' }
];

// ============================================================
//  РЕСУРСЫ ДЛЯ МАСТЕРОВ
// ============================================================
const RESOURCES = {
    ore:      { name: 'Руда',       icon: '🪨' },
    wood:     { name: 'Древесина',  icon: '🪵' },
    essence:  { name: 'Эссенция',   icon: '💎' }
};

// ============================================================
//  МАСТЕРА (Кузнец / Эльф / Колдунья)
// ============================================================
// Каждый мастер улучшает atk (оружие) и def (броня) безлимитно.
// Цена = base * (level+1)^growth, растёт с каждым уровнем.
// effectiveness: множитель эффекта апгрейда по классам (родной класс
// получает полную пользу, остальные — ослабленную).
const MASTERS = {
    smith: {
        name: 'Кузнец', icon: '🛠️',
        resource: 'ore',
        primaryClass: 'warrior',
        weaponGain: 4,   // прирост atk за уровень (родному классу)
        armorGain: 2,    // прирост def за уровень (родному классу)
        offClassMult: 0.4, // множитель для не-родных классов
        baseGold: 40, baseRes: 3,
        priceGrowth: 1.18
    },
    elf: {
        name: 'Эльф', icon: '🏹',
        resource: 'wood',
        primaryClass: 'archer',
        weaponGain: 4,
        armorGain: 2,
        offClassMult: 0.4,
        baseGold: 40, baseRes: 3,
        priceGrowth: 1.18
    },
    witch: {
        name: 'Колдунья', icon: '🔮',
        resource: 'essence',
        primaryClass: 'mage',
        weaponGain: 4,
        armorGain: 2,
        offClassMult: 0.4,
        baseGold: 40, baseRes: 3,
        priceGrowth: 1.18
    }
};

function getMasterUpgradeCost(masterId, kind, currentLevel) {
    const m = MASTERS[masterId];
    const lvl = currentLevel || 0;
    const mult = Math.pow(m.priceGrowth, lvl);
    return {
        gold: Math.round(m.baseGold * mult * (kind === 'armor' ? 0.8 : 1)),
        res: Math.round(m.baseRes * mult * (kind === 'armor' ? 0.8 : 1))
    };
}

function getMasterUpgradeGain(masterId, kind, playerClass) {
    const m = MASTERS[masterId];
    const isPrimary = playerClass === m.primaryClass;
    const base = kind === 'armor' ? m.armorGain : m.weaponGain;
    return isPrimary ? base : Math.max(1, Math.round(base * m.offClassMult));
}

// ============================================================
//  ENEMY TYPES
// ============================================================
const ENEMY_TYPES = [
    { name: 'Гоблин', hp: 40, atk: 8, exp: 20, color: '#50a03c', icon: '👹' },
    { name: 'Скелет', hp: 60, atk: 12, exp: 35, color: '#c8c8b4', icon: '💀' },
    { name: 'Орк', hp: 100, atk: 18, exp: 60, color: '#3c6432', icon: '👺' },
    { name: 'Призрак', hp: 50, atk: 14, exp: 45, color: '#6464c8', icon: '👻' },
    { name: 'Дракон', hp: 200, atk: 30, exp: 150, color: '#b42828', icon: '🐉' },
    { name: 'Огненный Элементаль', hp: 80, atk: 20, exp: 70, color: '#ff4422', icon: '🔥' },
    { name: 'Водный Элементаль', hp: 90, atk: 15, exp: 65, color: '#2288ff', icon: '💧' },
    { name: 'Земляной Элементаль', hp: 120, atk: 12, exp: 60, color: '#66aa44', icon: '🪨' },
    { name: 'Воздушный Элементаль', hp: 60, atk: 22, exp: 75, color: '#88ccff', icon: '💨' }
];

// ============================================================
//  BOSS TYPES
// ============================================================
const BOSS_TYPES = [
    { name: '👑 Король Гоблинов', hp: 300, atk: 40, exp: 300, color: '#ff8844', icon: '👑' },
    { name: '👑 Лорд Скелетов', hp: 400, atk: 45, exp: 350, color: '#ccccff', icon: '👑' },
    { name: '👑 Вождь Орков', hp: 500, atk: 50, exp: 400, color: '#44aa44', icon: '👑' },
    { name: '👑 Призрачный Король', hp: 350, atk: 55, exp: 380, color: '#6666ff', icon: '👑' },
    { name: '👑 Дракон-Пожиратель', hp: 700, atk: 60, exp: 500, color: '#ff2266', icon: '👑' }
];

// ============================================================
//  NAMES CONFIG — переименования героев, NPC, зданий
//  (редактируется через админ-панель, хранится в localStorage)
// ============================================================
const NAMES_CONFIG_KEY = 'tg_rpg_names_config';

const NAMES_DEFAULTS = {
    heroes: {
        warrior: { name: 'Мечник',   icon: '⚔️' },
        archer:  { name: 'Лучник',   icon: '🏹' },
        mage:    { name: 'Маг',      icon: '🔮' },
    },
    npcs: {
        0:       { name: 'Торговец',  icon: '🛒', label: 'Магазин' },
        1:       { name: 'Старейшина',icon: '📜', label: 'Задания' },
        smith:   { name: 'Кузнец',    icon: '🛠️', label: 'Кузница' },
        elf:     { name: 'Эльф',      icon: '🏹', label: 'Лавка эльфа' },
        witch:   { name: 'Колдунья',  icon: '🔮', label: 'Башня колдуньи' },
    },
    buildings: {
        smith:   { name: 'Кузница',        icon: '🔥' },
        elf:     { name: 'Шатёр эльфа',    icon: '🌿' },
        witch:   { name: 'Башня колдуньи', icon: '✨' },
    }
};

let namesConfig = JSON.parse(JSON.stringify(NAMES_DEFAULTS));

function loadNamesConfig() {
    try {
        const saved = JSON.parse(localStorage.getItem(NAMES_CONFIG_KEY));
        if (saved) {
            for (const section of Object.keys(saved)) {
                if (!namesConfig[section]) namesConfig[section] = {};
                for (const key of Object.keys(saved[section])) {
                    namesConfig[section][key] = { ...namesConfig[section][key], ...saved[section][key] };
                }
            }
        }
    } catch(e) {}
}

function saveNamesConfig() {
    localStorage.setItem(NAMES_CONFIG_KEY, JSON.stringify(namesConfig));
}

function resetNamesConfig() {
    namesConfig = JSON.parse(JSON.stringify(NAMES_DEFAULTS));
    localStorage.removeItem(NAMES_CONFIG_KEY);
}

function getName(section, key) {
    return (namesConfig[section] || {})[key] || NAMES_DEFAULTS[section]?.[key] || {};
}

loadNamesConfig();
