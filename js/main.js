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
    _villageCache: null
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
//  ЗАГРУЗКА
// ============================================================
function init() {
    // Инициализация кнопок
    initAuthHandlers();
    initUIHandlers();
    initMenuHandlers();
    
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
        : 'Играй без авторизации';
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
    
    document.getElementById('menu-delete').addEventListener('click', () => {
        if (confirm('Удалить сохранение? Это действие нельзя отменить.')) {
            resetSave();
            showQNotif('🗑️ Сохранение удалено');
            showMainMenu();
        }
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
    
    classBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            classBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedClass = btn.dataset.class;
        });
    });
    
    authBtn.addEventListener('click', () => {
        document.getElementById('auth-screen').classList.remove('open');
        document.getElementById('create-screen').classList.add('open');
        if (hasSave()) showSaveDialog();
    });
    
    createBtn.addEventListener('click', () => {
        playerData.name = heroName.value.trim() || 'Герой';
        playerData.class = selectedClass;
        G.p.initFromClass(selectedClass);
        resetSave();
        startGame(false);
    });
    
    loadBtn.addEventListener('click', () => {
        if (loadGame()) {
            startGame(true);
        } else {
            showQNotif('❌ Не удалось загрузить сохранение!');
        }
    });
    
    resetBtn.addEventListener('click', () => {
        resetSave();
        heroName.value = '';
        classBtns.forEach(b => b.classList.remove('selected'));
        document.querySelector('.class-btn[data-class="warrior"]').classList.add('selected');
        loadBtn.style.display = 'none';
        resetBtn.style.display = 'none';
        document.getElementById('create-sub').textContent = 'Выбери имя и класс';
        showQNotif('🗑️ Прогресс сброшен');
    });
    
    heroName.addEventListener('keydown', e => {
        if (e.key === 'Enter') createBtn.click();
    });
}

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
    
    // Инициализация NPC
    const villageGrid = parseVillage(VILLAGE_RAW);
    G.npcs = [new NPC(3, 3, 0), new NPC(5, 3, 1)];
    
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
    document.getElementById('create-screen').classList.remove('open');
    document.getElementById('hud').classList.add('open');
    document.getElementById('quickbar').classList.add('open');
    document.getElementById('ctrl').classList.add('open');
    
    setInterval(() => {
        if(gameStarted) saveGame(false);
    }, CFG.SAVE_INTERVAL);
    
    showQNotif('👋 Добро пожаловать, ' + playerData.name + '!');
    updateQuestTracker();
}

// ============================================================
//  ПЕРЕХОДЫ
// ============================================================
function enterDungeon(depth) {
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
    G.depth = 0;
    G.p.x = CFG.SPAWN_X;
    G.p.y = CFG.SPAWN_Y;
    G.enemies = [];
    G.items = [];
    G.npcs = [new NPC(3, 3, 0), new NPC(5, 3, 1)];
    G.dungeonGrid = null;
    G.dungeonDown = null;
    G._dungeonCache = null;
    
    G.floats.push(new FText(G.p.x, G.p.y - CFG.TILE, '🌿 Деревня!', '#00b4a0', 15));
    sound.play('portal');
    tgVibrate('heavy');
    saveGame(true);
}

let _villageTM = null;
function getCurrentTM() {
    if(G.depth > 0 && G.dungeonGrid) return G.dungeonGrid;
    if(!_villageTM) _villageTM = parseVillage(VILLAGE_RAW);
    return _villageTM;
}

function getCurrentCache() {
    if(G.depth > 0 && G.dungeonGrid) {
        if(!G._dungeonCache) {
            G._dungeonCache = makeDungeonCache(G.dungeonGrid);
        }
        return G._dungeonCache;
    }
    if(!G._villageCache) {
        G._villageCache = makeVillageCache(parseVillage(VILLAGE_RAW));
    }
    return G._villageCache;
}

// ============================================================
//  ИГРОВОЙ ЦИКЛ
// ============================================================
function loop() {
    requestAnimationFrame(loop);
    if(dead || !gameStarted) return;
    
    kbUpdate();
    G.t += 0.05;
    
    const tm = getCurrentTM();
    const cache = getCurrentCache();
    const enemies = G.enemies;
    const items = G.items;
    const npcs = G.npcs;
    const p = G.p;
    
    // Портал
    if(inp.portal && !document.getElementById('level-dialog').classList.contains('open')) {
        inp.portal = false;
        if(G.depth > 0) {
            let onEntry = false, onDown = false;
            for(let y=0; y<CFG.D_ROWS && !onEntry; y++) {
                for(let x=0; x<CFG.D_COLS && !onEntry; x++) {
                    if(tm[y][x] === T_ENTRANCE) {
                        const ex = x*CFG.TILE + CFG.TILE/2;
                        const ey = y*CFG.TILE + CFG.TILE/2;
                        if(Math.hypot(p.x - ex, p.y - ey) < CFG.TILE * 2) onEntry = true;
                    }
                }
            }
            if(G.dungeonDown) {
                const dx = G.dungeonDown.x * CFG.TILE + CFG.TILE/2;
                const dy = G.dungeonDown.y * CFG.TILE + CFG.TILE/2;
                if(Math.hypot(p.x - dx, p.y - dy) < CFG.TILE * 2) onDown = true;
            }
            if(onEntry) fadeTransition(() => exitDungeon());
            else if(onDown) {
                const nextDepth = G.depth + 1;
                fadeTransition(() => enterDungeon(nextDepth));
            }
        } else {
            // В деревне — проверяем NPC или открываем выбор уровня
            let npcTalked = false;
            for(const npc of G.npcs) {
                if(Math.hypot(p.x - npc.x, p.y - npc.y) < CFG.TILE * 2.5) {
                    npc.talk();
                    npcTalked = true;
                    break;
                }
            }
            if(!npcTalked) openLevelDialog();
        }
    }
    
    // Обновление игрока
    p.update(inp, tm, enemies, items, G.parts, G.floats, G.projs, npcs);
    
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
        G.parts[i].update();
        if(G.parts[i].life <= 0) G.parts.splice(i, 1);
    }
    for(let i=G.floats.length-1; i>=0; i--) {
        G.floats[i].update();
        if(G.floats[i].life <= 0) G.floats.splice(i, 1);
    }
    
    // Обновление снарядов
    for(let i=G.projs.length-1; i>=0; i--) {
        const f = G.projs[i];
        f.trail.push({x: f.x, y: f.y});
        if(f.trail.length > 8) f.trail.shift();
        f.x += f.vx;
        f.y += f.vy;
        f.life--;
        
        const COLS = G.depth > 0 ? CFG.D_COLS : CFG.W_COLS;
        const ROWS = G.depth > 0 ? CFG.D_ROWS : CFG.W_ROWS;
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
                    sound.play('kill');
                    for(let j=0; j<14; j++) {
                        G.parts.push(new Particle(ex, ey, e.color, -3));
                    }
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
    const COLS = G.depth > 0 ? CFG.D_COLS : CFG.W_COLS;
    const ROWS = G.depth > 0 ? CFG.D_ROWS : CFG.W_ROWS;
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
    } else {
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
        for(let i=0; i<f.trail.length; i++) {
            const a = (i+1)/f.trail.length;
            ctx.globalAlpha = a*0.6;
            ctx.fillStyle = '#e68220';
            ctx.beginPath();
            ctx.arc(wx(f.trail[i].x, cx), wy(f.trail[i].y, cy), 10*a*SC, 0, Math.PI*2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
        const px = wx(f.x, cx);
        const py = wy(f.y, cy);
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(px, py, 10*SC, 0, Math.PI*2);
        ctx.fill();
        ctx.strokeStyle = '#e68220';
        ctx.lineWidth = 3;
        ctx.stroke();
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
window.addEventListener('load', init);