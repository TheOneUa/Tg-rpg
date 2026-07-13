// ============================================================
//  ДОСТУП К ТЕКУЩЕЙ КАРТЕ (деревня / подземелье / дом)
// ============================================================
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
