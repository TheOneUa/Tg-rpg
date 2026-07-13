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
//  ПЕРЕХОДЫ МЕЖДУ СЦЕНАМИ (деревня / подземелье / дома мастеров)
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
    onDepthReached(G.depth);
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
    G._villageCache = null; // сбрасываем кэш деревни (на случай изменений)
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
