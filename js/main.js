// ============================================================
//  MAIN — точка входа и координация запуска игры
// ============================================================
// Этот файл — только глобальное состояние (G, playerData) и init().
// Вся остальная логика вынесена по смыслу:
//   screens/      — экраны меню/паузы/настроек/создания героя/админ-пина
//   ui/           — переиспользуемые UI-виджеты (уведомления, диалог уровня, кнопка способности)
//   world/        — переходы между сценами и доступ к текущей карте
//   loot/         — дроп предметов с врагов
//   GameLoop.js   — игровой цикл (update+render), один файл — не резать
// Полная карта разбивки — REFACTOR_PROGRESS.md, Session H.

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
//  СТАРТ ИГРЫ (координатор — вызывает screens/world инициализацию)
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
    // Пересчитываем canvas после показа HUD — теперь getBoundingClientRect вернёт реальную высоту
    requestAnimationFrame(() => resize());
    updateAbilityButtonIcon();
    
    setInterval(() => {
        if(gameStarted) saveGame(false);
    }, CFG.SAVE_INTERVAL);
    
    showQNotif('👋 Добро пожаловать, ' + playerData.name + '!');
    updateQuestTracker();
}

// ============================================================
//  ИНИЦИАЛИЗАЦИЯ
// ============================================================
function init() {
    // Инициализация кнопок (каждый initXHandlers живёт в своём screens/*.js)
    initAuthHandlers();
    initUIHandlers();
    initMenuHandlers();
    initSettingsHandlers();
    initPauseHandlers();
    initAdminPinHandlers();

    // Экран персонажа — вкладки и кнопка закрытия
    document.querySelectorAll('.stat-tab').forEach(tab => {
        bindTapButton(tab, () => {
            _activeCharTab = tab.dataset.tab;
            _renderCharScreen();
        });
    });
    bindTapButton(document.getElementById('stat-close'), _closeCharScreen);
    bindTapButton(document.getElementById('hud-stat-btn'), openStatScreen);

    // Кнопка закрытия админ-оверлея
    bindTapButton(document.getElementById('admin-overlay-close'), _closeAdminPanel);
    
    // Запуск цикла
    requestAnimationFrame(loop);
    
    // Сплэш экран 3 сек
    showSplash();
}

window.addEventListener('load', init);
