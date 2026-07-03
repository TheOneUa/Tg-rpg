// ============================================================
//  HOUSE INTERIORS (Кузница / Шатёр эльфа / Башня колдуньи)
// ============================================================
// Маленькая комната 7x6: стены по периметру, дверь снизу-по центру
// (выход обратно в деревню), NPC-мастер в центре.
const HOUSE_W = 7;
const HOUSE_H = 6;

function generateHouseGrid() {
    const grid = Array.from({length: HOUSE_H}, () => new Array(HOUSE_W).fill(T_DF));
    // Стены по периметру
    for (let x = 0; x < HOUSE_W; x++) {
        grid[0][x] = T_DW;
        grid[HOUSE_H - 1][x] = T_DW;
    }
    for (let y = 0; y < HOUSE_H; y++) {
        grid[y][0] = T_DW;
        grid[y][HOUSE_W - 1] = T_DW;
    }
    // Дверь — нижний левый угол (как снаружи)
    grid[HOUSE_H - 1][0] = T_EXIT;
    return { grid, exitX: 0, exitY: HOUSE_H - 1 };
}

function drawHouseTile(c2, t, rx, ry) {
    const T = CFG.TILE;
    if (t === T_DW) {
        // Стена дома изнутри
        c2.fillStyle = '#4a3422';
        c2.fillRect(rx, ry, T, T);
        c2.fillStyle = '#5e4530';
        c2.fillRect(rx + 2, ry + 2, T - 4, T - 4);
    } else if (t === T_EXIT) {
        // Выход — деревянная дверь
        c2.fillStyle = '#8a6444';
        c2.fillRect(rx, ry, T, T);
        c2.fillStyle = '#3a2818';
        c2.fillRect(rx + 6, ry + 4, T - 12, T - 6);
        c2.fillStyle = '#ffd700';
        c2.beginPath();
        c2.arc(rx + T - 14, ry + T/2, 2.5, 0, Math.PI*2);
        c2.fill();
    } else {
        // Пол
        c2.fillStyle = '#7a6248';
        c2.fillRect(rx, ry, T, T);
        c2.strokeStyle = 'rgba(0,0,0,0.08)';
        c2.lineWidth = 1;
        c2.strokeRect(rx, ry, T, T);
    }
}

function makeHouseCache(grid) {
    const T = CFG.TILE;
    const oc = document.createElement('canvas');
    oc.width = HOUSE_W * T;
    oc.height = HOUSE_H * T;
    const c2 = oc.getContext('2d');
    for (let y = 0; y < HOUSE_H; y++) {
        for (let x = 0; x < HOUSE_W; x++) {
            drawHouseTile(c2, grid[y][x], x * T, y * T);
        }
    }
    return oc;
}
