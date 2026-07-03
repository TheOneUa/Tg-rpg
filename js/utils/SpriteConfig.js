// ============================================================
//  SPRITE CONFIG — конфиг анимаций, хранится в localStorage
// ============================================================
// Структура на один спрайт-ключ:
//   { anim: { file, cols, fps, sound } }
//   file  — имя файла в assets/sprites/ (без пути)
//   cols  — число кадров в строке
//   fps   — скорость анимации
//   sound — ключ звука из Sound.SOUNDS или null

const SPRITE_CONFIG_KEY = 'tg_rpg_sprite_config';

// Дефолтный конфиг — один лист 4×5 на персонажа (обратная совместимость)
const SPRITE_CONFIG_DEFAULTS = {
    hero_warrior: {
        idle:    { file: 'warrior.png', cols: 4, fps: 6,  row: 0, sound: null },
        walk:    { file: 'warrior.png', cols: 4, fps: 10, row: 1, sound: null },
        attack:  { file: 'warrior.png', cols: 4, fps: 14, row: 2, sound: 'hit' },
        ability: { file: 'warrior.png', cols: 4, fps: 12, row: 3, sound: 'crit' },
        death:   { file: 'warrior.png', cols: 4, fps: 5,  row: 4, sound: null },
    },
    hero_archer: {
        idle:    { file: 'archer.png', cols: 4, fps: 6,  row: 0, sound: null },
        walk:    { file: 'archer.png', cols: 4, fps: 10, row: 1, sound: null },
        attack:  { file: 'archer.png', cols: 4, fps: 14, row: 2, sound: 'pickup' },
        ability: { file: 'archer.png', cols: 4, fps: 12, row: 3, sound: 'crit' },
        death:   { file: 'archer.png', cols: 4, fps: 5,  row: 4, sound: null },
    },
    hero_mage: {
        idle:    { file: 'mage.png', cols: 4, fps: 6,  row: 0, sound: null },
        walk:    { file: 'mage.png', cols: 4, fps: 10, row: 1, sound: null },
        attack:  { file: 'mage.png', cols: 4, fps: 14, row: 2, sound: 'portal' },
        ability: { file: 'mage.png', cols: 4, fps: 12, row: 3, sound: 'levelup' },
        death:   { file: 'mage.png', cols: 4, fps: 5,  row: 4, sound: null },
    },
    // Снаряды — отдельные ключи
    projectile_arrow: {
        fly: { file: 'arrow.png', cols: 4, fps: 12, row: 0, sound: null, rotate: true },
        hit: { file: 'arrow_hit.png', cols: 4, fps: 16, row: 0, sound: 'hit', rotate: false },
    },
    projectile_fireball: {
        fly: { file: 'fireball.png', cols: 4, fps: 14, row: 0, sound: null, rotate: true },
        hit: { file: 'fireball_hit.png', cols: 4, fps: 16, row: 0, sound: 'crit', rotate: false },
    },
};

// Рабочий конфиг (загружается при старте, может быть переопределён из localStorage)
let spriteConfig = {};

function loadSpriteConfig() {
    spriteConfig = JSON.parse(JSON.stringify(SPRITE_CONFIG_DEFAULTS)); // глубокая копия defaults
    try {
        const saved = JSON.parse(localStorage.getItem(SPRITE_CONFIG_KEY));
        if (saved) {
            // Мёрджим сохранённый конфиг поверх defaults (позволяет добавлять новые ключи)
            for (const key of Object.keys(saved)) {
                spriteConfig[key] = { ...spriteConfig[key], ...saved[key] };
                for (const anim of Object.keys(saved[key])) {
                    spriteConfig[key][anim] = { ...((spriteConfig[key] || {})[anim] || {}), ...saved[key][anim] };
                }
            }
        }
    } catch(e) { console.warn('[SpriteConfig] Failed to load saved config:', e); }
}

function saveSpriteConfig() {
    try {
        localStorage.setItem(SPRITE_CONFIG_KEY, JSON.stringify(spriteConfig));
    } catch(e) { console.warn('[SpriteConfig] Failed to save config:', e); }
}

function resetSpriteConfig() {
    spriteConfig = JSON.parse(JSON.stringify(SPRITE_CONFIG_DEFAULTS));
    localStorage.removeItem(SPRITE_CONFIG_KEY);
}

// Получить конфиг конкретной анимации
function getAnimConfig(spriteKey, anim) {
    return (spriteConfig[spriteKey] || {})[anim] || null;
}

// Получить или вычислить ключ для кэша спрайта по файлу
function getSpriteFileKey(filename) {
    return 'file_' + filename.replace(/[^a-z0-9]/gi, '_');
}

// Предзагрузить все файлы из конфига
function preloadAllFromConfig() {
    const seen = new Set();
    for (const spriteKey of Object.keys(spriteConfig)) {
        for (const anim of Object.keys(spriteConfig[spriteKey])) {
            const cfg = spriteConfig[spriteKey][anim];
            if (cfg && cfg.file && !seen.has(cfg.file)) {
                seen.add(cfg.file);
                loadSprite(getSpriteFileKey(cfg.file), 'assets/sprites/' + cfg.file);
            }
        }
    }
}

// Инициализация при старте
loadSpriteConfig();
