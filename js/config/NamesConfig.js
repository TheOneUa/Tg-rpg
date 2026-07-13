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
