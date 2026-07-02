// ============================================================
//  SPRITE ENGINE
// ============================================================
// Спецификация листа персонажа (warrior.png / archer.png / mage.png):
//   Сетка: 4 кадра (столбцы) × 5 строк (по одной на анимацию)
//   Кадр: 48×48 px → лист 192×240 px
//   Строки по порядку: idle, walk, attack, ability, death
//   Каждая анимация = ровно 4 кадра.
//   В листе рисуется ТОЛЬКО направление "влево" (left).
//   Направление "вправо" получается автоматическим зеркалированием
//   в рантайме (ctx.scale(-1,1)) — отдельных кадров вправо не нужно.
//   up/down пока не поддерживаются — используют те же left/right кадры.
//
// Если файл не найден/не загружен — рендер автоматически
// откатывается на старую векторную отрисовку (см. drawX_vector).

const SPRITE_FRAME = 48;
const SPRITE_COLS = 4;
const ANIM_ORDER = ['idle', 'walk', 'attack', 'ability', 'death'];

// Кэш загруженных изображений: { key: { img, loaded, failed } }
const _spriteCache = {};

function loadSprite(key, path) {
    if (_spriteCache[key]) return _spriteCache[key];
    const entry = { img: new Image(), loaded: false, failed: false, frameW: SPRITE_FRAME, frameH: SPRITE_FRAME };
    entry.img.onload = () => {
        entry.loaded = true;
        // Автоопределение размера кадра по ширине листа и числу колонок
        // Поддерживаемые форматы: 4 кол × N строк (герои, враги)
        const detectedW = Math.round(entry.img.naturalWidth / SPRITE_COLS);
        const detectedH = detectedW; // всегда квадратный кадр
        entry.frameW = detectedW;
        entry.frameH = detectedH;
        // Пересчитываем число строк
        entry.rows = Math.round(entry.img.naturalHeight / detectedH);
        console.log(`[Sprite] ${key}: ${entry.img.naturalWidth}x${entry.img.naturalHeight} → frame ${detectedW}x${detectedH}, ${entry.rows} rows`);
    };
    entry.img.onerror = () => { entry.failed = true; console.warn(`[Sprite] Failed to load: ${path}`); };
    entry.img.src = path;
    _spriteCache[key] = entry;
    return entry;
}

function isSpriteReady(key) {
    const e = _spriteCache[key];
    return !!(e && e.loaded);
}

// Вычисляет номер строки в листе персонажа по анимации (направление не влияет — лист только left)
function getCharSheetRow(anim) {
    const animIdx = ANIM_ORDER.indexOf(anim);
    return animIdx < 0 ? 0 : animIdx;
}

// Преобразует вектор взгляда (face.x/face.y) в горизонтальное направление 'left'/'right'.
// Пока поддерживаются только эти два — вертикальное движение наследует
// последнее горизонтальное направление (по умолчанию 'right').
function faceToDirection(fx, fy, lastDir) {
    if (Math.abs(fx) > 0.05) return fx > 0 ? 'right' : 'left';
    return lastDir || 'right';
}

// Рисует кадр персонажа из спрайт-листа (только left/right, зеркалим вправо).
// frame: номер кадра 0-3
// size: размер отрисовки в px на экране (с учётом SC масштаба камеры)
function drawCharSprite(spriteKey, anim, dir, frame, px, py, size) {
    const entry = _spriteCache[spriteKey];
    if (!entry || !entry.loaded) return false;

    const row = getCharSheetRow(anim);
    const col = Math.max(0, Math.min(SPRITE_COLS - 1, frame | 0));
    const fw = entry.frameW || SPRITE_FRAME;
    const fh = entry.frameH || SPRITE_FRAME;
    const sx = col * fw;
    const sy = row * fh;

    ctx.imageSmoothingEnabled = false; // чёткие пиксели, без блюра при масштабировании
    ctx.save();
    if (dir === 'left') {
        // Лист смотрит вправо — зеркалим для левого направления
        ctx.translate(px, py);
        ctx.scale(-1, 1);
        ctx.drawImage(
            entry.img,
            sx, sy, SPRITE_FRAME, SPRITE_FRAME,
            -size / 2, -size / 2, size, size
        );
    } else {
        ctx.drawImage(
            entry.img,
            sx, sy, SPRITE_FRAME, SPRITE_FRAME,
            px - size / 2, py - size / 2, size, size
        );
    }
    ctx.restore();
    return true;
}

// Простой спрайт без анимации (один кадр) — для предметов/тайлов/NPC-иконок
function drawSimpleSprite(spriteKey, px, py, size) {
    const entry = _spriteCache[spriteKey];
    if (!entry || !entry.loaded) return false;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(entry.img, px - size / 2, py - size / 2, size, size);
    return true;
}

// ============================================================
//  ПРЕДЗАГРУЗКА СПРАЙТОВ ГЕРОЕВ
// ============================================================
const HERO_SPRITE_KEYS = { warrior: 'hero_warrior', archer: 'hero_archer', mage: 'hero_mage' };

function preloadHeroSprites() {
    loadSprite('hero_warrior', 'assets/sprites/warrior.png');
    loadSprite('hero_archer', 'assets/sprites/archer.png');
    loadSprite('hero_mage', 'assets/sprites/mage.png');
}
