// ============================================================
//  SPRITE ENGINE
// ============================================================
// Работает совместно с SpriteConfig.js.
// Поддерживает:
//   - Отдельный файл и произвольное число кадров на каждую анимацию
//   - Автоопределение размера кадра: frameW = naturalWidth / cols
//   - Зеркалирование по горизонтали для направления 'left'
//   - Вращение спрайта снаряда по направлению полёта

const SPRITE_FRAME = 48; // дефолт если авто не смогло
const SPRITE_COLS  = 4;  // дефолт колонок (для обратной совместимости)
const ANIM_ORDER   = ['idle', 'walk', 'attack', 'ability', 'death'];

// ── Кэш ────────────────────────────────────────────────────
const _spriteCache = {};

function loadSprite(key, path) {
    if (_spriteCache[key]) return _spriteCache[key];
    const entry = { img: new Image(), loaded: false, failed: false, frameW: SPRITE_FRAME, frameH: SPRITE_FRAME, rows: 5 };
    entry.img.onload = () => {
        entry.loaded = true;
        // Автоопределение по конфигу если есть, иначе по ширине / SPRITE_COLS
        // Реальный cols будет задан в drawCharSprite через cfg.cols
        entry.naturalW = entry.img.naturalWidth;
        entry.naturalH = entry.img.naturalHeight;
        // Дефолтное авто (одиночная строка или квадратная сетка)
        entry.frameW = Math.round(entry.img.naturalWidth / SPRITE_COLS);
        entry.frameH = entry.frameW;
        entry.rows   = Math.round(entry.img.naturalHeight / entry.frameH);
        console.log(`[Sprite] ${key}: ${entry.naturalW}×${entry.naturalH} → frame ${entry.frameW}×${entry.frameH}, ${entry.rows} rows`);
    };
    entry.img.onerror = () => { entry.failed = true; console.warn(`[Sprite] Failed: ${path}`); };
    entry.img.src = path;
    _spriteCache[key] = entry;
    return entry;
}

function isSpriteReady(key) {
    const e = _spriteCache[key];
    return !!(e && e.loaded);
}

// ── Вспомогательные ────────────────────────────────────────

function faceToDirection(fx, fy, lastDir) {
    if (Math.abs(fx) > 0.05) return fx > 0 ? 'right' : 'left';
    return lastDir || 'right';
}

// ── Рисование кадра персонажа ───────────────────────────────
// spriteKey  — ключ в _spriteCache
// cfg        — объект из getAnimConfig (содержит file, cols, fps, row)
// frame      — текущий кадр 0..cols-1
// dir        — 'left' | 'right'
function drawCharSpriteFromCfg(cfg, frame, dir, px, py, size) {
    if (!cfg) return false;
    const fileKey = getSpriteFileKey(cfg.file);
    const entry = _spriteCache[fileKey];
    if (!entry || !entry.loaded) return false;

    const cols = cfg.cols || SPRITE_COLS;
    const row  = cfg.row  !== undefined ? cfg.row : 0;
    const fw   = Math.round(entry.naturalW / cols);
    const fh   = fw; // квадратный кадр
    const col  = Math.max(0, Math.min(cols - 1, frame | 0));
    const sx   = col * fw;
    const sy   = row * fh;

    ctx.imageSmoothingEnabled = false;
    ctx.save();
    if (dir === 'left') {
        ctx.translate(px, py);
        ctx.scale(-1, 1);
        ctx.drawImage(entry.img, sx, sy, fw, fh, -size/2, -size/2, size, size);
    } else {
        ctx.drawImage(entry.img, sx, sy, fw, fh, px - size/2, py - size/2, size, size);
    }
    ctx.restore();
    return true;
}

// Обёртка — по spriteKey и anim тянет cfg из spriteConfig (для Player.draw)
function drawCharSprite(spriteKey, anim, dir, frame, px, py, size) {
    const cfg = getAnimConfig(spriteKey, anim);
    return drawCharSpriteFromCfg(cfg, frame, dir, px, py, size);
}

// ── Снаряд ─────────────────────────────────────────────────
// projKey    — 'projectile_arrow' | 'projectile_fireball'
// phase      — 'fly' | 'hit'
// angle      — угол направления в радианах (для rotate:true)
function drawProjectileSprite(projKey, phase, frame, angle, px, py, size) {
    const cfg = getAnimConfig(projKey, phase);
    if (!cfg) return false;
    const fileKey = getSpriteFileKey(cfg.file);
    const entry = _spriteCache[fileKey];
    if (!entry || !entry.loaded) return false;

    const cols = cfg.cols || 4;
    const fw   = Math.round(entry.naturalW / cols);
    const col  = Math.max(0, Math.min(cols - 1, frame | 0));
    const sx   = col * fw;
    const sy   = 0;

    ctx.imageSmoothingEnabled = false;
    ctx.save();
    ctx.translate(px, py);
    if (cfg.rotate && angle !== undefined) ctx.rotate(angle);
    ctx.drawImage(entry.img, sx, sy, fw, fw, -size/2, -size/2, size, size);
    ctx.restore();
    return true;
}

// ── Простой спрайт (предметы, иконки) ──────────────────────
function drawSimpleSprite(spriteKey, px, py, size) {
    const entry = _spriteCache[spriteKey];
    if (!entry || !entry.loaded) return false;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(entry.img, px - size/2, py - size/2, size, size);
    return true;
}

// ── Предзагрузка спрайтов героев ───────────────────────────
const HERO_SPRITE_KEYS = { warrior: 'hero_warrior', archer: 'hero_archer', mage: 'hero_mage' };

function preloadHeroSprites() {
    preloadAllFromConfig(); // грузит все файлы из SpriteConfig
}
