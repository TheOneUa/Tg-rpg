// ============================================================
//  MAIN - ТОЧКА ВХОДА
// ============================================================

// ============================================================
//  ГЛОБАЛЬНЫЕ ДАННЫЕ
// ============================================================
const sound = new Sound();
let playerData = { name: 'Герой', class: 'warrior', tgId: null, tgUsername: null };
let maxDepthReached = 0;
let dead = false;
let gameStarted = false;

const G = {
    p: new Player(),
    depth: 0,
    location: 'village', // 'village' | 'house' | 'dungeon'
    currentHouse: null,  // id дома, если location === 'house'
    enemies: [],
    items: [],
    npcs: [],
    parts: [],
    floats: [],
    projs: [],
    t: 0,
    dungeonGrid: null,
    dungeonDown: null,
    _dungeonCache: null,
    _villageCache: null,
    _houseCache: {},
    dt: 1
};

// ============================================================
//  УВЕДОМЛЕНИЯ
// ============================================================
function showQNotif(text) {
    const container = document.getElementById('qnotif');
    const el = document.createElement('div');
    el.className = 'qn';
    el.textContent = text;
    container.appendChild(el);
    setTimeout(() => el.remove(), 2600);
}

// ============================================================
//  ДРОП РЕСУРСОВ (Руда / Древесина / Эссенция)
// ============================================================
const RESOURCE_KEYS = ['ore', 'wood', 'essence'];
function dropResourceFromEnemy(e, floats) {
    const p = G.p;
    let resKey = null, amount = 0;
    if (e.isBoss) {
        // Боссы — гарантированный дроп, 2-3 шт случайного ресурса
        resKey = RESOURCE_KEYS[Math.floor(Math.random() * RESOURCE_KEYS.length)];
        amount = 2 + Math.floor(Math.random() * 2);
    } else if (Math.random() < 0.08) {
        // Обычные враги — редкий дроп (8%), 1 шт
        resKey = RESOURCE_KEYS[Math.floor(Math.random() * RESOURCE_KEYS.length)];
        amount = 1;
    }
    if (resKey) {
        p.resources[resKey] = (p.resources[resKey] || 0) + amount;
        const info = RESOURCES[resKey];
        const ex = e.x * CFG.TILE + CFG.TILE/2;
        const ey = e.y * CFG.TILE + CFG.TILE/2;
        floats.push(new FText(ex, ey - CFG.TILE * 2.1, info.icon + ' +' + amount, '#88e0ff', 14));
    }
}

// ============================================================
//  КНОПКА СПОСОБНОСТИ (bs)
// ============================================================
function updateAbilityButtonIcon() {
    const ab = ABILITIES[G.p.cls];
    if (!ab) return;
    document.getElementById('bs-icon').textContent = ab.icon;
    document.getElementById('bs').title = ab.name + ' — ' + ab.desc;
}

function updateAbilityButtonState() {
    const p = G.p;
    const ab = ABILITIES[p.cls];
    if (!ab) return;
    const btn = document.getElementById('bs');
    const cd = document.getElementById('bs-cooldown');

    if (p.abilityActive > 0) {
        btn.classList.add('active-effect');
        btn.classList.remove('ready');
        cd.style.setProperty('--pct', 0);
        cd.textContent = '';
    } else if (p.abilityCD > 0) {
        btn.classList.remove('active-effect', 'ready');
        const pct = Math.round((p.abilityCD / ab.cd) * 100);
        cd.style.setProperty('--pct', pct);
        cd.textContent = Math.ceil(p.abilityCD / 60);
    } else {
        btn.classList.remove('active-effect');
        btn.classList.add('ready');
        cd.style.setProperty('--pct', 0);
        cd.textContent = '';
    }
}

// ============================================================
//  ЗАГРУЗКА
// ============================================================
function init() {
    // Инициализация кнопок
    initAuthHandlers();
    initUIHandlers();
    initMenuHandlers();
    initSettingsHandlers();
    initPauseHandlers();
    initAdminPinHandlers();
    
    // Запуск цикла
    requestAnimationFrame(loop);
    
    // Сплэш экран 3 сек
    showSplash();
}

// ============================================================
//  СПЛЭШ
// ============================================================
function showSplash() {
    const bar = document.getElementById('splash-progress-bar');
    const splash = document.getElementById('splash-screen');
    
    // Пробуем загрузить пользовательское изображение из assets
    const img = document.getElementById('splash-img');
    const emoji = document.getElementById('splash-emoji');
    img.onload = () => { img.classList.add('loaded'); emoji.style.display = 'none'; };
    img.onerror = () => { /* оставляем emoji */ };
    img.src = 'assets/splash.png';
    
    // Прогресс-бар
    setTimeout(() => { bar.style.width = '100%'; }, 50);
    
    // После 3 сек — скрыть сплэш, показать меню
    setTimeout(() => {
        splash.classList.add('fade-out');
        setTimeout(() => {
            splash.style.display = 'none';
            showMainMenu();
        }, 600);
    }, 3000);
}

// ============================================================
//  ГЛАВНОЕ МЕНЮ
// ============================================================
function showMainMenu() {
    // Авторизация Telegram
    const tgUser = initTelegram();
    if (tgUser) {
        playerData.tgId = tgUser.id;
        playerData.tgUsername = tgUser.username || tgUser.first_name || 'Игрок';
    }
    
    const username = playerData.tgUsername || 'Гость';
    document.getElementById('menu-user').innerHTML = tgUser
        ? '👤 <span>' + username + '</span>'
        : '';
    document.getElementById('menu-version').textContent = 'v' + VERSION;
    
    const hasSaveData = hasSave();
    
    if (hasSaveData) {
        // Показать карточку сохранения
        try {
            const data = JSON.parse(localStorage.getItem(SAVE_KEY));
            if (data?.playerData) {
                document.getElementById('menu-hero-name').textContent =
                    (data.playerData.name || 'Герой') + ' — ' + (data.playerData.class ? CLASSES[data.playerData.class]?.name || '' : '');
                document.getElementById('menu-save-level').textContent = 'Ур. ' + (data.lv || 1);
                document.getElementById('menu-save-depth').textContent = 'Глубина: ' + (data.depth || 0);
            }
        } catch(e) {}
        document.getElementById('menu-save-card').style.display = 'block';
        document.getElementById('menu-continue').style.display = 'flex';
        document.getElementById('menu-delete').style.display = 'flex';
        document.getElementById('menu-new-text').innerHTML = 'Новая игра<span class="btn-sub">Начать с нуля</span>';
    } else {
        document.getElementById('menu-save-card').style.display = 'none';
        document.getElementById('menu-continue').style.display = 'none';
        document.getElementById('menu-delete').style.display = 'none';
        document.getElementById('menu-new-text').innerHTML = 'Начать игру<span class="btn-sub">Создать героя</span>';
    }
    
    document.getElementById('menu-screen').classList.add('open');
}

function initMenuHandlers() {
    document.getElementById('menu-continue').addEventListener('click', () => {
        document.getElementById('menu-screen').classList.remove('open');
        if (loadGame()) {
            startGame(true);
        } else {
            showQNotif('❌ Не удалось загрузить сохранение!');
            document.getElementById('menu-screen').classList.add('open');
        }
    });
    
    document.getElementById('menu-new').addEventListener('click', () => {
        document.getElementById('menu-screen').classList.remove('open');
        document.getElementById('create-screen').classList.add('open');
    });

    document.getElementById('menu-settings').addEventListener('click', () => {
        document.getElementById('menu-screen').classList.remove('open');
        document.getElementById('settings-screen').classList.add('open');
    });
    
    document.getElementById('menu-delete').addEventListener('click', () => {
        if (confirm('Удалить сохранение? Это действие нельзя отменить.')) {
            resetSave();
            showQNotif('🗑️ Сохранение удалено');
            showMainMenu();
        }
    });

    bindTapButton(document.getElementById('menu-admin'), () => {
        document.getElementById('menu-screen').classList.remove('open');
        openAdminPinScreen();
    });
}

// ============================================================
//  ПИНКОД АДМИН-ПАНЕЛИ (из меню)
// ============================================================
const ADMIN_PIN_KEY = 'tg_rpg_admin_pin';
const ADMIN_TG_IDS  = []; // добавь свой Telegram ID: [123456789]

let _adminPinBuf = '';

function getAdminPin() {
    return localStorage.getItem(ADMIN_PIN_KEY) || '1234';
}

function openAdminPinScreen() {
    _adminPinBuf = '';
    _updateAdminPinDisplay();
    document.getElementById('admin-pin-error').textContent = '';
    document.getElementById('admin-pin-screen').classList.add('open');

    // Если Telegram ID совпадает — сразу войти
    try {
        const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
        if (tgUser && ADMIN_TG_IDS.includes(tgUser.id)) {
            document.getElementById('admin-pin-screen').classList.remove('open');
            _openAdminPanel();
            return;
        }
    } catch(e) {}
}

function _updateAdminPinDisplay() {
    for (let i = 0; i < 4; i++) {
        document.getElementById('apd' + i)
            .classList.toggle('filled', i < _adminPinBuf.length);
    }
}

function _adminPinKey(n) {
    if (n === 'cancel') {
        document.getElementById('admin-pin-screen').classList.remove('open');
        document.getElementById('menu-screen').classList.add('open');
        return;
    }
    if (n === 'back') {
        _adminPinBuf = _adminPinBuf.slice(0, -1);
        _updateAdminPinDisplay();
        document.getElementById('admin-pin-error').textContent = '';
        return;
    }
    if (_adminPinBuf.length >= 6) return;
    _adminPinBuf += n;
    _updateAdminPinDisplay();

    // Проверяем после ввода минимальной длины
    if (_adminPinBuf.length >= 4) {
        setTimeout(() => {
            if (_adminPinBuf === getAdminPin()) {
                document.getElementById('admin-pin-screen').classList.remove('open');
                _openAdminPanel();
            } else if (_adminPinBuf.length >= getAdminPin().length) {
                document.getElementById('admin-pin-error').textContent = '❌ Неверный пинкод';
                _adminPinBuf = '';
                _updateAdminPinDisplay();
            }
        }, 180);
    }
}

function _openAdminPanel() {
    // Открываем admin.html в новой вкладке (или в iframe overlay)
    window.open('admin.html', '_blank');
    // Возвращаем пользователя в меню
    document.getElementById('menu-screen').classList.add('open');
}

function initAdminPinHandlers() {
    document.querySelectorAll('.apk').forEach(btn => {
        bindTapButton(btn, () => _adminPinKey(btn.dataset.n));
    });
}

// ============================================================
//  АВТОРИЗАЦИЯ
// ============================================================
function initAuthHandlers() {
    const authBtn = document.getElementById('auth-btn');
    const createBtn = document.getElementById('create-btn');
    const loadBtn = document.getElementById('load-btn');
    const resetBtn = document.getElementById('reset-btn');
    const heroName = document.getElementById('hero-name');
    const classBtns = document.querySelectorAll('.class-btn');

    let selectedClass = 'warrior';

    // Предзагружаем спрайты для превью
    preloadHeroSprites();

    // ── Превью спрайта ──
    const previewCanvas = document.getElementById('preview-canvas');
    const previewCtx = previewCanvas.getContext('2d');
    const PREVIEW_SIZE = 96;
    const PREVIEW_CX = previewCanvas.width / 2;
    const PREVIEW_CY = previewCanvas.height / 2;
    let _pvFrame = 0, _pvTimer = 0, _pvRAF = null;

    function renderPreview(cls) {
        const entry = _spriteCache[HERO_SPRITE_KEYS[cls]];
        previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
        previewCtx.imageSmoothingEnabled = false;
        if (entry && entry.loaded) {
            const fw = entry.frameW || SPRITE_FRAME;
            const fh = entry.frameH || SPRITE_FRAME;
            const sx = _pvFrame * fw;
            previewCtx.drawImage(entry.img, sx, 0, fw, fh,
                PREVIEW_CX - PREVIEW_SIZE/2, PREVIEW_CY - PREVIEW_SIZE/2, PREVIEW_SIZE, PREVIEW_SIZE);
        } else {
            const icons = { warrior: '⚔️', archer: '🏹', mage: '🔮' };
            previewCtx.font = '56px sans-serif';
            previewCtx.textAlign = 'center';
            previewCtx.textBaseline = 'middle';
            previewCtx.fillText(icons[cls] || '❓', PREVIEW_CX, PREVIEW_CY);
        }
    }

    function startPreview(cls) {
        if (_pvRAF) cancelAnimationFrame(_pvRAF);
        let last = 0;
        function tick(ts) {
            _pvRAF = requestAnimationFrame(tick);
            _pvTimer += (ts - last) / (1000/60);
            last = ts;
            if (_pvTimer >= 10) { _pvTimer = 0; _pvFrame = (_pvFrame + 1) % 4; }
            renderPreview(cls);
        }
        _pvRAF = requestAnimationFrame(tick);
    }

    function updatePreviewMeta(cls) {
        const d = CLASSES[cls];
        if (!d) return;
        document.getElementById('preview-name').textContent = d.name;
        document.getElementById('preview-stats').textContent =
            `❤️${d.hp}  💧${d.mp}  ⚔️${d.atk}  🛡️${d.def}  💨${d.spd}`;
        _pvFrame = 0; _pvTimer = 0;
        startPreview(cls);
    }

    updatePreviewMeta('warrior');

    classBtns.forEach(btn => {
        bindTapButton(btn, () => {
            classBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedClass = btn.dataset.class;
            updatePreviewMeta(selectedClass);
        });
    });

    authBtn.addEventListener('click', () => {
        document.getElementById('auth-screen').classList.remove('open');
        document.getElementById('create-screen').classList.add('open');
        updatePreviewMeta(selectedClass);
        if (hasSave()) showSaveDialog();
    });

    createBtn.addEventListener('click', () => {
        playerData.name = heroName.value.trim() || 'Герой';
        playerData.class = selectedClass;
        G.p.initFromClass(selectedClass);
        if (_pvRAF) { cancelAnimationFrame(_pvRAF); _pvRAF = null; }
        resetSave();
        startGame(false);
    });

    loadBtn.addEventListener('click', () => {
        if (_pvRAF) { cancelAnimationFrame(_pvRAF); _pvRAF = null; }
        if (loadGame()) { startGame(true); }
        else showQNotif('❌ Не удалось загрузить сохранение!');
    });

    resetBtn.addEventListener('click', () => {
        resetSave();
        heroName.value = '';
        classBtns.forEach(b => b.classList.remove('selected'));
        document.querySelector('.class-btn[data-class="warrior"]').classList.add('selected');
        selectedClass = 'warrior';
        updatePreviewMeta('warrior');
        loadBtn.style.display = 'none';
        resetBtn.style.display = 'none';
        document.getElementById('create-sub').textContent = 'Выбери имя и класс';
        showQNotif('🗑️ Прогресс сброшен');
    });

    heroName.addEventListener('keydown', e => { if (e.key === 'Enter') createBtn.click(); });
}

// ============================================================
//  ПАУЗА
// ============================================================
let gamePaused = false;

function openPause() {
    gamePaused = true;
    saveGame(true);
    document.getElementById('pause-screen').classList.add('open');
}

function closePause() {
    gamePaused = false;
    document.getElementById('pause-screen').classList.remove('open');
}

function initPauseHandlers() {
    bindTapButton(document.getElementById('pause-btn'), openPause);
    bindTapButton(document.getElementById('pause-continue'), closePause);
    bindTapButton(document.getElementById('pause-settings'), () => {
        document.getElementById('pause-screen').classList.remove('open');
        _settingsReturnToPause = true;
        document.getElementById('settings-screen').classList.add('open');
    });
    bindTapButton(document.getElementById('pause-menu'), () => {
        closePause();
        gameStarted = false;
        document.getElementById('pause-btn').classList.remove('visible');
        document.getElementById('hud').classList.remove('open');
        document.getElementById('ctrl').classList.remove('open');
        G.enemies = []; G.items = []; G.projs = []; G.parts = []; G.floats = [];
        showMainMenu();
    });
}

let _settingsReturnToPause = false;

// ============================================================
//  UI ОБРАБОТЧИКИ
// ============================================================
function initUIHandlers() {
    // Кнопка рестарта
    document.getElementById('rbtn').addEventListener('click', () => {
        resetSave();
        location.reload();
    });
    
    // Диалог сохранения
    document.getElementById('sd-continue').addEventListener('click', () => {
        document.getElementById('save-dialog').classList.remove('open');
        if (loadGame()) {
            startGame(true);
        } else {
            showQNotif('❌ Не удалось загрузить сохранение!');
        }
    });
    
    document.getElementById('sd-new').addEventListener('click', () => {
        document.getElementById('save-dialog').classList.remove('open');
        resetSave();
        document.getElementById('hero-name').value = '';
        document.querySelectorAll('.class-btn').forEach(b => b.classList.remove('selected'));
        document.querySelector('.class-btn[data-class="warrior"]').classList.add('selected');
        document.getElementById('load-btn').style.display = 'none';
        document.getElementById('reset-btn').style.display = 'none';
        document.getElementById('create-sub').textContent = 'Выбери имя и класс';
        showQNotif('🗑️ Прогресс сброшен');
    });
    
    // Диалог выбора уровня
    document.getElementById('lv-cancel').addEventListener('click', () => {
        document.getElementById('level-dialog').classList.remove('open');
    });
    
    document.getElementById('lv-enter').addEventListener('click', () => {
        const lvDialog = document.getElementById('level-dialog');
        const selectedLevel = parseInt(lvDialog.dataset.selectedLevel || 1);
        const cost = (selectedLevel - 1) * CFG.LEVEL_COST;
        
        if (G.p.gold < cost) {
            showQNotif('❌ Не хватает золота! Нужно ' + cost + '💰');
            return;
        }
        if (selectedLevel > maxDepthReached + 1) {
            showQNotif('❌ Этот уровень ещё не открыт!');
            return;
        }
        
        G.p.gold -= cost;
        lvDialog.classList.remove('open');
        fadeTransition(() => enterDungeon(selectedLevel));
        saveGame(true);
    });
}

// ============================================================
//  ВЫБОР УРОВНЯ
// ============================================================
function openLevelDialog() {
    const dialog = document.getElementById('level-dialog');
    const maxLv = Math.max(maxDepthReached + 1, 1);
    document.getElementById('lv-available').textContent = maxLv;
    
    const list = document.getElementById('level-list');
    list.innerHTML = '';
    
    let selectedLevel = Math.min(maxDepthReached + 1, G.depth + 1);
    if (G.depth === 0 && maxDepthReached === 0) selectedLevel = 1;
    
    for(let i = 1; i <= maxLv; i++) {
        const btn = document.createElement('button');
        btn.className = 'level-btn';
        if(i > maxDepthReached + 1) btn.classList.add('locked');
        if(i === selectedLevel) btn.classList.add('selected');
        
        const cost = (i - 1) * CFG.LEVEL_COST;
        btn.innerHTML = `${i}${i > maxDepthReached + 1 ? ' 🔒' : ''}<span class="cost">${cost}💰</span>`;
        btn.dataset.level = i;
        
        if(i <= maxDepthReached + 1) {
            btn.addEventListener('click', () => {
                dialog.dataset.selectedLevel = i;
                document.querySelectorAll('.level-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
            });
        }
        list.appendChild(btn);
    }
    
    dialog.dataset.selectedLevel = selectedLevel;
    dialog.classList.add('open');
}

function showSaveDialog() {
    try {
        const data = JSON.parse(localStorage.getItem(SAVE_KEY));
        if(data?.playerData) {
            document.getElementById('sd-name').textContent = data.playerData.name || 'Герой';
            document.getElementById('sd-level').textContent = data.lv || 1;
            document.getElementById('sd-depth').textContent = data.depth || 0;
        }
    } catch(e) {}
    document.getElementById('save-dialog').classList.add('open');
    // Показываем кнопки на экране создания
    document.getElementById('load-btn').style.display = 'inline-block';
    document.getElementById('reset-btn').style.display = 'inline-block';
    document.getElementById('create-sub').textContent = 'Найдено сохранение!';
}

// ============================================================
//  ЗАПУСК ИГРЫ
// ============================================================
function startGame(loaded) {
    G.p.x = CFG.SPAWN_X;
    G.p.y = CFG.SPAWN_Y;
    G.location = 'village';
    
    // Инициализация NPC
    const villageGrid = parseVillage(VILLAGE_RAW);
    G.npcs = spawnVillageNpcs();
    
    if(!loaded) {
        G.depth = 0;
        maxDepthReached = 0;
        initQuests(0);
        initAchievements();
        saveGame(true);
    } else {
        if(G.depth > 0) {
            maxDepthReached = Math.max(maxDepthReached, G.depth);
            enterDungeon(G.depth);
        }
        showQNotif('💾 Прогресс восстановлен!');
    }
    
    gameStarted = true;
    preloadHeroSprites();
    document.getElementById('pause-btn').classList.add('visible');
    document.getElementById('create-screen').classList.remove('open');
    document.getElementById('hud').classList.add('open');
    document.getElementById('ctrl').classList.add('open');
    updateAbilityButtonIcon();
    
    setInterval(() => {
        if(gameStarted) saveGame(false);
    }, CFG.SAVE_INTERVAL);
    
    showQNotif('👋 Добро пожаловать, ' + playerData.name + '!');
    updateQuestTracker();
}

// ============================================================
//  СПАВН NPC ДЕРЕВНИ
// ============================================================
function spawnVillageNpcs() {
    return [
        new NPC(4, 5, 0),   // Торговец
        new NPC(8, 5, 1),   // Старейшина
    ];
}

// ============================================================
//  ПЕРЕХОДЫ
// ============================================================
function enterDungeon(depth) {
    G.location = 'dungeon';
    G.depth = depth;
    maxDepthReached = Math.max(maxDepthReached, depth);
    stats.maxDepth = Math.max(stats.maxDepth, depth);
    
    const gen = generateDungeon(G.depth);
    G.dungeonGrid = gen.grid;
    G.dungeonDown = { x: gen.downX, y: gen.downY };
    G.enemies = gen.enemies;
    G.items = gen.items;
    G.npcs = [];
    
    G.p.x = gen.startX * CFG.TILE + CFG.TILE/2;
    G.p.y = gen.startY * CFG.TILE + CFG.TILE/2;
    G._dungeonCache = makeDungeonCache(G.dungeonGrid);
    
    G.floats.push(new FText(G.p.x, G.p.y - CFG.TILE, '⚔ Глубина ' + G.depth, '#ff8844', 16));
    sound.play('portal');
    tgVibrate('heavy');
    saveGame(true);
    checkAchievements();
    
    if(G.depth % 5 === 0 && G.depth > 0) {
        showQNotif('👑 БОСС ЭТАЖА! Осторожнее!');
    }
    if(G.depth > questGenerationDepth + 3) {
        initQuests(G.depth);
    }
}

function exitDungeon() {
    G.location = 'village';
    G.depth = 0;
    G.p.x = CFG.SPAWN_X;
    G.p.y = CFG.SPAWN_Y;
    G.enemies = [];
    G.items = [];
    G.npcs = spawnVillageNpcs();
    G.dungeonGrid = null;
    G.dungeonDown = null;
    G._dungeonCache = null;
    
    G.floats.push(new FText(G.p.x, G.p.y - CFG.TILE, '🌿 Деревня!', '#00b4a0', 15));
    sound.play('portal');
    tgVibrate('heavy');
    saveGame(true);
}

// ── Дома (Кузница / Шатёр эльфа / Башня колдуньи) ──
function enterHouse(houseId) {
    const house = VILLAGE_HOUSES.find(h => h.id === houseId);
    if (!house) return;

    G.location = 'house';
    G.currentHouse = houseId;
    G.enemies = [];
    G.items = [];

    // Мастер в центре комнаты
    const npc = new NPC(Math.floor(HOUSE_W/2), Math.floor(HOUSE_H/2) - 1, houseId);
    G.npcs = [npc];

    // Игрок у двери (нижний левый угол = 0, HOUSE_H-1), встаём строкой выше
    G.p.x = 1 * CFG.TILE + CFG.TILE/2;
    G.p.y = (HOUSE_H - 2) * CFG.TILE + CFG.TILE/2;

    const houseName = typeof house.name === 'function' ? house.name() : house.name;
    G.floats.push(new FText(G.p.x, G.p.y - CFG.TILE, '🚪 ' + houseName, '#ffd700', 15));
    sound.play('portal');
    tgVibrate('medium');
}

function exitHouse() {
    const houseId = G.currentHouse;
    const house = VILLAGE_HOUSES.find(h => h.id === houseId);

    G.location = 'village';
    G.currentHouse = null;
    G.npcs = spawnVillageNpcs();
    G.enemies = [];
    G.items = [];

    if (house) {
        // Дверь — нижний левый угол дома, спавн на тайл ниже (на траве)
        G.p.x = house.doorX * CFG.TILE + CFG.TILE/2;
        G.p.y = (house.doorY + 1) * CFG.TILE + CFG.TILE/2;
    } else {
        G.p.x = CFG.SPAWN_X;
        G.p.y = CFG.SPAWN_Y;
    }

    sound.play('portal');
    tgVibrate('light');
}

function getCurrentMapDims() {
    if (G.location === 'dungeon') return { COLS: CFG.D_COLS, ROWS: CFG.D_ROWS };
    if (G.location === 'house') return { COLS: HOUSE_W, ROWS: HOUSE_H };
    return { COLS: CFG.W_COLS, ROWS: CFG.W_ROWS };
}

let _villageTM = null;
let _houseTM = {}; // кэш сеток домов по id
function getCurrentTM() {
    if (G.location === 'dungeon' && G.dungeonGrid) return G.dungeonGrid;
    if (G.location === 'house' && G.currentHouse) {
        if (!_houseTM[G.currentHouse]) {
            _houseTM[G.currentHouse] = generateHouseGrid().grid;
        }
        return _houseTM[G.currentHouse];
    }
    if(!_villageTM) _villageTM = parseVillage(VILLAGE_RAW);
    return _villageTM;
}

function getCurrentCache() {
    if (G.location === 'dungeon' && G.dungeonGrid) {
        if(!G._dungeonCache) {
            G._dungeonCache = makeDungeonCache(G.dungeonGrid);
        }
        return G._dungeonCache;
    }
    if (G.location === 'house' && G.currentHouse) {
        if (!G._houseCache[G.currentHouse]) {
            G._houseCache[G.currentHouse] = makeHouseCache(getCurrentTM());
        }
        return G._houseCache[G.currentHouse];
    }
    if(!G._villageCache) {
        G._villageCache = makeVillageCache(parseVillage(VILLAGE_RAW));
    }
    return G._villageCache;
}

// ============================================================
//  ИГРОВОЙ ЦИКЛ
// ============================================================
let _lastFrameTime = 0;
const TARGET_FPS = 60;
const MAX_DT = 3; // защита от лагов/сворачивания вкладки (макс "прыжок" = 3 кадра по 60fps)

function loop(timestamp) {
    requestAnimationFrame(loop);

    if (!_lastFrameTime) _lastFrameTime = timestamp;
    const rawDelta = (timestamp - _lastFrameTime) / (1000 / TARGET_FPS); // в "кадрах по 60fps"
    _lastFrameTime = timestamp;
    const dt = Math.min(Math.max(rawDelta, 0), MAX_DT) || 1; // fallback на 1 если первый кадр / NaN
    G.dt = dt;

    if(dead || !gameStarted || gamePaused) return;
    
    kbUpdate();
    G.t += 0.05 * dt;
    
    const tm = getCurrentTM();
    const cache = getCurrentCache();
    const enemies = G.enemies;
    const items = G.items;
    const npcs = G.npcs;
    const p = G.p;
    
    // ── Контекстная кнопка ──
    const ctxBtn = document.getElementById('ctx-btn');
    let ctxMode = null; // 'npc', 'portal', 'exit', 'descend', 'enter-dungeon', 'enter-house', 'exit-house'
    let ctxNpc = null;
    let ctxHouse = null;

    if (G.location === 'village') {
        // Деревня: проверяем NPC
        for(const npc of G.npcs) {
            if(Math.hypot(p.x - npc.x, p.y - npc.y) < CFG.TILE * 1.5) {
                ctxMode = 'npc';
                ctxNpc = npc;
                break;
            }
        }
        // Двери домов
        if (!ctxMode) {
            for (const h of VILLAGE_HOUSES) {
                const hx = h.doorX * CFG.TILE + CFG.TILE/2;
                const hy = h.doorY * CFG.TILE + CFG.TILE/2;
                if (Math.hypot(p.x - hx, p.y - hy) < CFG.TILE * 1.5) {
                    ctxMode = 'enter-house';
                    ctxHouse = h;
                    break;
                }
            }
        }
        // Портал в подземелье
        if(!ctxMode && Math.hypot(p.x - PORTAL_POS.x, p.y - PORTAL_POS.y) < CFG.TILE * 1.5) {
            ctxMode = 'enter-dungeon';
        }
    } else if (G.location === 'house') {
        // Дом: выход обратно в деревню (дверь снизу по центру)
        for (let y = 0; y < HOUSE_H; y++) {
            for (let x = 0; x < HOUSE_W; x++) {
                if (tm[y][x] === T_EXIT) {
                    const ex = x*CFG.TILE + CFG.TILE/2, ey = y*CFG.TILE + CFG.TILE/2;
                    if (Math.hypot(p.x - ex, p.y - ey) < CFG.TILE * 1.5) ctxMode = 'exit-house';
                }
            }
        }
        // Мастер внутри дома
        if (!ctxMode) {
            for (const npc of G.npcs) {
                if (Math.hypot(p.x - npc.x, p.y - npc.y) < CFG.TILE * 1.5) {
                    ctxMode = 'npc';
                    ctxNpc = npc;
                    break;
                }
            }
        }
    } else {
        // Подземелье: вход (выход наверх)
        for(let y=0; y<CFG.D_ROWS; y++) {
            for(let x=0; x<CFG.D_COLS; x++) {
                if(tm[y][x] === T_ENTRANCE) {
                    const ex = x*CFG.TILE + CFG.TILE/2, ey = y*CFG.TILE + CFG.TILE/2;
                    if(Math.hypot(p.x - ex, p.y - ey) < CFG.TILE * 1.5) ctxMode = 'exit';
                }
            }
        }
        // Спуск вниз
        if(!ctxMode && G.dungeonDown) {
            const dx = G.dungeonDown.x*CFG.TILE + CFG.TILE/2;
            const dy = G.dungeonDown.y*CFG.TILE + CFG.TILE/2;
            if(Math.hypot(p.x - dx, p.y - dy) < CFG.TILE * 1.5) ctxMode = 'descend';
        }
    }

    // Обновляем вид кнопки
    if(ctxMode === 'npc') {
        ctxBtn.className = 'npc visible';
        ctxBtn.innerHTML = '💬 ' + ctxNpc.name;
    } else if(ctxMode === 'enter-dungeon') {
        ctxBtn.className = 'portal visible';
        ctxBtn.innerHTML = '⚔️ Подземелье';
    } else if(ctxMode === 'enter-house') {
        ctxBtn.className = 'portal visible';
        ctxBtn.innerHTML = '🚪 Войти: ' + (typeof ctxHouse.name === 'function' ? ctxHouse.name() : ctxHouse.name);
    } else if(ctxMode === 'exit-house') {
        ctxBtn.className = 'exit visible';
        ctxBtn.innerHTML = '🌿 Выйти в деревню';
    } else if(ctxMode === 'exit') {
        ctxBtn.className = 'exit visible';
        ctxBtn.innerHTML = '🌿 Выйти';
    } else if(ctxMode === 'descend') {
        ctxBtn.className = 'portal visible';
        ctxBtn.innerHTML = '⬇️ Глубже';
    } else {
        ctxBtn.className = '';
    }

    // Обработка нажатия
    if(inp.ctx && !document.getElementById('level-dialog').classList.contains('open')) {
        inp.ctx = false;
        if(ctxMode === 'npc' && ctxNpc) {
            ctxNpc.talk();
        } else if(ctxMode === 'enter-dungeon') {
            openLevelDialog();
        } else if(ctxMode === 'enter-house' && ctxHouse) {
            fadeTransition(() => enterHouse(ctxHouse.id));
        } else if(ctxMode === 'exit-house') {
            fadeTransition(() => exitHouse());
        } else if(ctxMode === 'exit') {
            fadeTransition(() => exitDungeon());
        } else if(ctxMode === 'descend') {
            fadeTransition(() => enterDungeon(G.depth + 1));
        }
    }
    // Сброс старого inp.portal на всякий случай
    inp.portal = false;
    
    // Обновление игрока
    p.update(inp, tm, enemies, items, G.parts, G.floats, G.projs, npcs);
    updateAbilityButtonState();
    
    // Обновление врагов
    if(G.depth > 0) {
        for(const e of enemies) {
            if(!e.alive) {
                p.exp += e.exp || 20;
                onEnemyKilled(e.name);
                if(e.isBoss && G.depth > 0) {
                    const bonus = 50 + G.depth * 10;
                    p.gold += bonus;
                    stats.totalGold += bonus;
                    G.floats.push(new FText(
                        e.x*CFG.TILE + CFG.TILE/2,
                        e.y*CFG.TILE - CFG.TILE,
                        '👑 +' + bonus + '💰',
                        '#ffd700', 18
                    ));
                    showQNotif('👑 Босс повержен! +' + bonus + '💰');
                    sound.play('levelup');
                    checkAchievements();
                    saveGame(true);
                }
                continue;
            }
            e.update(p.x, p.y, tm);
        }
        G.enemies = G.enemies.filter(e => e.alive);
        G.items = G.items.filter(it => it.alive);
    }
    
    // Обновление предметов
    for(const it of G.items) {
        it.update();
    }
    
    // Обновление NPC
    for(const npc of npcs) {
        npc.update();
    }
    
    // Обновление частиц и текста
    for(let i=G.parts.length-1; i>=0; i--) {
        G.parts[i].update(G.dt);
        if(G.parts[i].life <= 0) G.parts.splice(i, 1);
    }
    for(let i=G.floats.length-1; i>=0; i--) {
        G.floats[i].update(G.dt);
        if(G.floats[i].life <= 0) G.floats.splice(i, 1);
    }
    
    // Обновление снарядов
    for(let i=G.projs.length-1; i>=0; i--) {
        const f = G.projs[i];
        f.trail.push({x: f.x, y: f.y});
        if(f.trail.length > 8) f.trail.shift();
        f.x += f.vx * G.dt;
        f.y += f.vy * G.dt;
        f.life -= G.dt;
        
        const { COLS, ROWS } = getCurrentMapDims();
        const tx = f.x / CFG.TILE | 0;
        const ty = f.y / CFG.TILE | 0;
        
        if(tx < 0 || tx >= COLS || ty < 0 || ty >= ROWS || SOLID.has(tm[ty][tx])) {
            f.alive = false;
            for(let j=0; j<15; j++) {
                G.parts.push(new Particle(f.x, f.y, '#e68220', -3));
            }
        }
        
        for(const e of enemies) {
            if(!e.alive) continue;
            const ex = e.x * CFG.TILE + CFG.TILE/2;
            const ey = e.y * CFG.TILE + CFG.TILE/2;
            if(Math.hypot(f.x - ex, f.y - ey) < CFG.TILE * 0.8) {
                e.hp -= f.dmg;
                G.floats.push(new FText(ex, ey - CFG.TILE, '-' + f.dmg, '#ff4444'));
                for(let j=0; j<7; j++) {
                    G.parts.push(new Particle(ex, ey, '#e04040'));
                }
                if(e.hp <= 0) {
                    e.alive = false;
                    stats.totalKills++;
                    if (e.isBoss) stats.bossKills++;
                    sound.play('kill');
                    for(let j=0; j<14; j++) {
                        G.parts.push(new Particle(ex, ey, e.color, -3));
                    }
                    dropResourceFromEnemy(e, G.floats);
                    checkAchievements();
                    saveGame(true);
                }
                f.alive = false;
                for(let j=0; j<15; j++) {
                    G.parts.push(new Particle(f.x, f.y, '#e68220', -3));
                }
                break;
            }
        }
        if(f.life <= 0) f.alive = false;
        if(!f.alive) G.projs.splice(i, 1);
    }
    
    // Отрисовка
    const { COLS, ROWS } = getCurrentMapDims();
    const MAP_W = COLS * CFG.TILE;
    const MAP_H = ROWS * CFG.TILE;
    const gH = SH - CFG.TOP - CFG.BOT;
    const vW = SW / SC;
    const vH = gH / SC;
    const cx = Math.max(vW/2, Math.min(p.x, MAP_W - vW/2));
    const cy = Math.max(vH/2, Math.min(p.y, MAP_H - vH/2));
    
    ctx.clearRect(0, 0, SW, SH);
    const ox = Math.round(SW/2 - cx*SC);
    const oy = Math.round(CFG.TOP + gH/2 - cy*SC);
    ctx.save();
    ctx.translate(ox, oy);
    ctx.scale(SC, SC);
    ctx.drawImage(cache, 0, 0);
    ctx.restore();
    
    // Порталы
    if(G.depth > 0 && G.dungeonGrid) {
        let entryPos = null, downPos = null;
        for(let y=0; y<CFG.D_ROWS; y++) {
            for(let x=0; x<CFG.D_COLS; x++) {
                if(G.dungeonGrid[y][x] === T_ENTRANCE) {
                    entryPos = { x: x*CFG.TILE + CFG.TILE/2, y: y*CFG.TILE + CFG.TILE/2 };
                }
                if(G.dungeonGrid[y][x] === T_EXIT) {
                    downPos = { x: x*CFG.TILE + CFG.TILE/2, y: y*CFG.TILE + CFG.TILE/2 };
                }
            }
        }
        if(entryPos) drawPortal(cx, cy, entryPos, G.t, '#44ff88', '🌿 Выход', '⬆');
        if(downPos) drawPortal(cx, cy, downPos, G.t + Math.PI, '#ff8844', '⬇ Глубже', '⬇');
    } else if (G.location === 'village') {
        drawPortal(cx, cy, PORTAL_POS, G.t, '#ff8844', '⚔ Подземелье', '⬇');
    }
    
    // Предметы
    if(G.depth > 0) {
        for(const it of G.items) {
            it.draw(cx, cy);
        }
    }
    
    // NPC
    for(const npc of npcs) {
        npc.draw(cx, cy);
    }
    
    // Враги
    for(const e of G.enemies) {
        e.draw(cx, cy);
    }
    
    // Снаряды
    for(const f of G.projs) {
        // Обновляем анимацию снаряда
        const projKey = 'projectile_' + (f.type || 'arrow');
        const projCfg = getAnimConfig(projKey, 'fly');
        const projCols = projCfg ? projCfg.cols : 4;
        const projFps  = projCfg ? projCfg.fps  : 12;
        f.spriteTimer = (f.spriteTimer || 0) + G.dt;
        if (f.spriteTimer >= 60 / projFps) {
            f.spriteTimer -= 60 / projFps;
            f.spriteFrame = ((f.spriteFrame || 0) + 1) % projCols;
        }

        const px = wx(f.x, cx);
        const py = wy(f.y, cy);
        const projSize = (f.type === 'fireball' ? 40 : 28) * SC;
        const angle = f.angle !== undefined ? f.angle : Math.atan2(f.vy, f.vx);

        // Пробуем нарисовать спрайт
        const usedProjSprite = drawProjectileSprite(projKey, 'fly', f.spriteFrame || 0, angle, px, py, projSize);

        // Fallback векторный рендер
        if (!usedProjSprite) {
            // Трейл
            for(let i = 0; i < f.trail.length; i++) {
                const a = (i+1)/f.trail.length;
                ctx.globalAlpha = a * 0.6;
                ctx.fillStyle = f.trailColor || '#e68220';
                ctx.beginPath();
                ctx.arc(wx(f.trail[i].x, cx), wy(f.trail[i].y, cy), 8*a*SC, 0, Math.PI*2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;
            if (f.type === 'arrow') {
                ctx.save();
                ctx.translate(px, py);
                ctx.rotate(angle);
                ctx.fillStyle = f.color || '#e8c840';
                ctx.fillRect(-14*SC, -3*SC, 28*SC, 6*SC);
                ctx.fillStyle = '#c8a020';
                ctx.beginPath();
                ctx.moveTo(14*SC, 0);
                ctx.lineTo(8*SC, -5*SC);
                ctx.lineTo(8*SC, 5*SC);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            } else {
                // Файрбол
                const grad = ctx.createRadialGradient(px, py, 0, px, py, 14*SC);
                grad.addColorStop(0, '#ffffaa');
                grad.addColorStop(0.4, '#ff8800');
                grad.addColorStop(1, 'rgba(255,50,0,0)');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(px, py, 14*SC, 0, Math.PI*2);
                ctx.fill();
            }
        }
    }
    
    // Частицы и текст
    for(const pt of G.parts) pt.draw(cx, cy);
    for(const ft of G.floats) ft.draw(cx, cy);
    
    // Игрок
    p.draw(cx, cy);
    
    // HUD
    hudUpdate(p);
    
    // Смерть
    if(p.hp <= 0) {
        dead = true;
        document.getElementById('dead').classList.add('open');
        saveGame(true);
    }
}

// ============================================================
//  ЗАПУСК
// ============================================================
// ============================================================
//  НАСТРОЙКИ
// ============================================================
const SETTINGS_KEY = 'tg_rpg_settings';

let appSettings = {
    soundEnabled: true,
    volume: 0.8,
    vibroEnabled: true,
    vibroLevel: 'medium'
};

function loadSettings() {
    try {
        const s = JSON.parse(localStorage.getItem(SETTINGS_KEY));
        if (s) appSettings = { ...appSettings, ...s };
    } catch(e) {}
    applySettings();
}

function saveSettings() {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(appSettings));
    } catch(e) {}
}

function applySettings() {
    // Звук
    sound.enabled = appSettings.soundEnabled;
    sound.volume = appSettings.volume;
    // Вибрация применяется в tgVibrate()
}

function initSettingsHandlers() {
    loadSettings();

    const volSlider = document.getElementById('vol-slider');
    const volVal = document.getElementById('vol-val');
    const soundToggle = document.getElementById('sound-toggle');
    const soundIcon = document.getElementById('sound-toggle-icon');
    const vibroToggle = document.getElementById('vibro-toggle');
    const vibroLevels = document.querySelectorAll('.vibro-lvl');

    // Восстановить UI из настроек
    volSlider.value = Math.round(appSettings.volume * 100);
    volVal.textContent = Math.round(appSettings.volume * 100) + '%';
    _setSoundToggle(appSettings.soundEnabled);
    _setVibroToggle(appSettings.vibroEnabled);
    vibroLevels.forEach(b => {
        b.classList.toggle('active', b.dataset.level === appSettings.vibroLevel);
    });

    // Громкость
    volSlider.addEventListener('input', () => {
        const v = parseInt(volSlider.value);
        volVal.textContent = v + '%';
        appSettings.volume = v / 100;
        sound.volume = appSettings.volume;
    });

    // Вкл/выкл звук
    soundToggle.addEventListener('click', () => {
        appSettings.soundEnabled = !appSettings.soundEnabled;
        sound.enabled = appSettings.soundEnabled;
        _setSoundToggle(appSettings.soundEnabled);
    });

    // Вкл/выкл вибрация
    vibroToggle.addEventListener('click', () => {
        appSettings.vibroEnabled = !appSettings.vibroEnabled;
        _setVibroToggle(appSettings.vibroEnabled);
    });

    // Уровень вибрации
    vibroLevels.forEach(btn => {
        btn.addEventListener('click', () => {
            appSettings.vibroLevel = btn.dataset.level;
            vibroLevels.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Тест
    document.getElementById('settings-test').addEventListener('click', () => {
        sound.play('levelup');
        tgVibrate(appSettings.vibroLevel);
    });

    // Назад — сохранить и вернуться в меню
    document.getElementById('settings-back').addEventListener('click', () => {
        saveSettings();
        applySettings();
        document.getElementById('settings-screen').classList.remove('open');
        if (_settingsReturnToPause) {
            _settingsReturnToPause = false;
            document.getElementById('pause-screen').classList.add('open');
        } else {
            document.getElementById('menu-screen').classList.add('open');
        }
    });
}

function _setSoundToggle(on) {
    const btn = document.getElementById('sound-toggle');
    const icon = document.getElementById('sound-toggle-icon');
    btn.textContent = on ? 'ВКЛ' : 'ВЫКЛ';
    btn.classList.toggle('active', on);
    icon.textContent = on ? '🔔' : '🔕';
}

function _setVibroToggle(on) {
    const btn = document.getElementById('vibro-toggle');
    btn.textContent = on ? 'ВКЛ' : 'ВЫКЛ';
    btn.classList.toggle('active', on);
}


window.addEventListener('load', init);