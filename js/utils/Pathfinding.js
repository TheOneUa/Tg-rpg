// ============================================================
//  PATHFINDING
// ============================================================

// ── Line of Sight (Bresenham по тайлам) ────────────────────
// Все аргументы в ТАЙЛОВЫХ координатах.
// Возвращает true если прямая видимость есть (нет стен на пути).
function hasLineOfSight(x0, y0, x1, y1, tm) {
    x0 = Math.floor(x0);
    y0 = Math.floor(y0);
    x1 = Math.floor(x1);
    y1 = Math.floor(y1);

    const maxRows = tm.length;
    const maxCols = tm[0]?.length || 0;

    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;
    let cx = x0, cy = y0;

    while (true) {
        // Проверяем текущую клетку (кроме стартовой — игрок может стоять в "двери")
        if (cx !== x0 || cy !== y0) {
            if (cx < 0 || cy < 0 || cx >= maxCols || cy >= maxRows) return false;
            if (SOLID.has(tm[cy][cx])) return false;
        }
        // Достигли цели — путь чист
        if (cx === x1 && cy === y1) return true;

        const e2 = 2 * err;
        if (e2 > -dy) { err -= dy; cx += sx; }
        if (e2 <  dx) { err += dx; cy += sy; }
    }
}

// ── A* Pathfinding ─────────────────────────────────────────
// Все аргументы в ТАЙЛОВЫХ координатах.
// Возвращает [{x,y}, ...] — список тайлов пути (без стартового).
// Возвращает [] если уже на месте, null если путь не найден.
function astarPath(sx, sy, tx, ty, tm, maxNodes = 400) {
    sx = Math.floor(sx); sy = Math.floor(sy);
    tx = Math.floor(tx); ty = Math.floor(ty);

    if (sx === tx && sy === ty) return [];

    const rows = tm.length;
    const cols = tm[0]?.length || 0;
    if (tx < 0 || ty < 0 || tx >= cols || ty >= rows) return null;
    if (SOLID.has(tm[ty][tx])) return null; // цель в стене

    const key = (x, y) => y * cols + x;
    const h   = (x, y) => Math.abs(x - tx) + Math.abs(y - ty);

    const openSet   = new Map();   // key → {x,y}
    const closedSet = new Set();
    const gScore    = new Map();
    const fScore    = new Map();
    const parent    = new Map();   // key → parentKey

    const sk = key(sx, sy);
    gScore.set(sk, 0);
    fScore.set(sk, h(sx, sy));
    openSet.set(sk, { x: sx, y: sy });

    const DIRS  = [[0,-1],[0,1],[-1,0],[1,0],[1,-1],[-1,-1],[1,1],[-1,1]];
    const COSTS = [1,     1,    1,     1,    1.41,   1.41,   1.41,  1.41];

    let iterations = 0;
    while (openSet.size > 0 && iterations++ < maxNodes) {
        // Узел с минимальным fScore
        let curKey = null, curF = Infinity;
        for (const k of openSet.keys()) {
            const f = fScore.get(k) ?? Infinity;
            if (f < curF) { curF = f; curKey = k; }
        }

        const cur = openSet.get(curKey);
        openSet.delete(curKey);
        closedSet.add(curKey);

        if (cur.x === tx && cur.y === ty) {
            // Восстанавливаем путь
            const path = [];
            let rk = curKey;
            while (parent.has(rk)) {
                path.unshift({ x: rk % cols, y: Math.floor(rk / cols) });
                rk = parent.get(rk);
            }
            return path;
        }

        for (let i = 0; i < DIRS.length; i++) {
            const nx = cur.x + DIRS[i][0];
            const ny = cur.y + DIRS[i][1];

            if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
            if (SOLID.has(tm[ny][nx])) continue;

            // Диагональное движение — оба смежных тайла должны быть свободны
            if (i >= 4) {
                if (SOLID.has(tm[cur.y][nx]) || SOLID.has(tm[ny][cur.x])) continue;
            }

            const nk = key(nx, ny);
            if (closedSet.has(nk)) continue;

            const tentG = (gScore.get(curKey) ?? Infinity) + COSTS[i];
            if (tentG < (gScore.get(nk) ?? Infinity)) {
                parent.set(nk, curKey);
                gScore.set(nk, tentG);
                fScore.set(nk, tentG + h(nx, ny));
                openSet.set(nk, { x: nx, y: ny });
            }
        }
    }
    return null;
}
