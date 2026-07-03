// ============================================================
//  PATHFINDING
// ============================================================

// ── Line of Sight (Bresenham) ──────────────────────────────
// Проверяет есть ли прямая видимость между двумя точками
// в тайловых координатах. Возвращает true если путь чист.
function hasLineOfSight(x0, y0, x1, y1, tm) {
    x0 = Math.floor(x0);
    y0 = Math.floor(y0);
    x1 = Math.floor(x1);
    y1 = Math.floor(y1);

    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;
    let cx = x0, cy = y0;
    const maxRows = tm.length;
    const maxCols = tm[0]?.length || 0;

    while (true) {
        if (cx === x1 && cy === y1) return true;
        if (cx < 0 || cy < 0 || cx >= maxCols || cy >= maxRows) return false;
        if (cx !== x0 || cy !== y0) { // не проверяем стартовую клетку
            if (SOLID.has(tm[cy][cx])) return false;
        }
        const e2 = 2 * err;
        if (e2 > -dy) { err -= dy; cx += sx; }
        if (e2 <  dx) { err += dx; cy += sy; }
    }
}

// ── A* Pathfinding ─────────────────────────────────────────
// Возвращает массив тайловых шагов [{x,y}, ...] от (sx,sy) до (tx,ty).
// Если путь не найден — возвращает null.
// Лимит узлов защищает от зависания на больших картах.
function astarPath(sx, sy, tx, ty, tm, maxNodes = 400) {
    sx = Math.floor(sx); sy = Math.floor(sy);
    tx = Math.floor(tx); ty = Math.floor(ty);

    if (sx === tx && sy === ty) return [];
    const rows = tm.length;
    const cols = tm[0]?.length || 0;
    if (tx < 0 || ty < 0 || tx >= cols || ty >= rows) return null;

    const key = (x, y) => y * cols + x;

    const openSet  = new Map(); // key → node
    const closedSet = new Set();
    const gScore = new Map();
    const fScore = new Map();
    const parent = new Map();

    const h = (x, y) => Math.abs(x - tx) + Math.abs(y - ty); // Манхэттен

    const startKey = key(sx, sy);
    gScore.set(startKey, 0);
    fScore.set(startKey, h(sx, sy));
    openSet.set(startKey, { x: sx, y: sy });

    let iterations = 0;
    const DIRS = [[0,-1],[0,1],[-1,0],[1,0],[1,-1],[-1,-1],[1,1],[-1,1]];
    const COSTS = [1,1,1,1,1.4,1.4,1.4,1.4];

    while (openSet.size > 0 && iterations++ < maxNodes) {
        // Найти узел с минимальным fScore
        let curKey = null, curF = Infinity;
        for (const [k] of openSet) {
            const f = fScore.get(k) ?? Infinity;
            if (f < curF) { curF = f; curKey = k; }
        }
        const cur = openSet.get(curKey);
        openSet.delete(curKey);

        if (cur.x === tx && cur.y === ty) {
            // Восстанавливаем путь
            const path = [];
            let k = curKey;
            while (parent.has(k)) {
                const p = parent.get(k);
                path.push({ x: p.x + (k % cols) - p.x, y: p.y + (Math.floor(k/cols)) - p.y });
                // пересчитаем правильно
                k = key(p.x, p.y);
            }
            // Переделываем восстановление без ошибок:
            const fullPath = [];
            let rk = curKey;
            while (parent.has(rk)) {
                fullPath.unshift({ x: rk % cols, y: Math.floor(rk / cols) });
                rk = key(parent.get(rk).x, parent.get(rk).y);
            }
            return fullPath;
        }

        closedSet.add(curKey);

        for (let i = 0; i < DIRS.length; i++) {
            const nx = cur.x + DIRS[i][0];
            const ny = cur.y + DIRS[i][1];
            if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
            if (SOLID.has(tm[ny][nx])) continue;

            // Диагональное движение — проверяем оба соседних тайла
            if (i >= 4) {
                if (SOLID.has(tm[cur.y][nx]) || SOLID.has(tm[ny][cur.x])) continue;
            }

            const nk = key(nx, ny);
            if (closedSet.has(nk)) continue;

            const tentG = (gScore.get(curKey) ?? Infinity) + COSTS[i];
            const existG = gScore.get(nk) ?? Infinity;
            if (tentG < existG) {
                parent.set(nk, cur);
                gScore.set(nk, tentG);
                fScore.set(nk, tentG + h(nx, ny));
                if (!openSet.has(nk)) openSet.set(nk, { x: nx, y: ny });
            }
        }
    }
    return null; // путь не найден
}
