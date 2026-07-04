// ============================================================
//  VILLAGE
// ============================================================
// Три дома 2×2: H=стена, O=дверь (нижний правый угол)
const VILLAGE_RAW = [
    "TTTTTTTTTTTTT",
    "THHGGHHGGHHGT",
    "THOGGHOGGHOGT",
    "TGGGGGGGGGGGT",
    "TGGGGGGGGGGGT",
    "TGGGGGGGGGGGT",
    "TGGGGGGGGGGGT",
    "TGGGGFFFGGGGT",
    "TGGGGFFFGGGGT",
    "TGGGGGGGGGGGT",
    "TGGGGGGGGGGGT",
    "TGGGGGGGGGGGT",
    "TTTTTTTTTTTTT",
];

// Дверь — нижний правый угол каждого дома 2×2
const VILLAGE_HOUSES = [
    { id: 'smith', doorX: 2,  doorY: 2, name: () => getName('buildings','smith').name || 'Кузница',        icon: () => getName('buildings','smith').icon || '🔥' },
    { id: 'elf',   doorX: 6,  doorY: 2, name: () => getName('buildings','elf').name   || 'Шатёр эльфа',    icon: () => getName('buildings','elf').icon   || '🌿' },
    { id: 'witch', doorX: 10, doorY: 2, name: () => getName('buildings','witch').name  || 'Башня колдуньи', icon: () => getName('buildings','witch').icon  || '✨' }
];

function parseVillage(raw) {
    const m = { 'G': T_GRASS, 'T': T_TREE, 'D': T_DOOR, 'F': T_STONE, 'H': T_HOUSE_WALL, 'O': T_HOUSE_DOOR };
    return raw.map(r => Array.from(r).map(c => m[c] !== undefined ? m[c] : T_GRASS));
}

function drawVillageTile(c2, t, rx, ry) {
    const T = CFG.TILE;
    switch(t) {
        case T_GRASS:
            c2.fillStyle = '#1e6420';
            c2.fillRect(rx, ry, T, T);
            c2.fillStyle = '#3a8a3a';
            for(let i=0;i<3;i++) c2.fillRect(rx + (i*13+5)%(T-4), ry + (i*17+3)%(T-4), 2, 2);
            if(Math.random() < 0.08) {
                c2.fillStyle = ['#ff6b6b','#ffd93d','#6bcbff','#ff8a5c'][Math.floor(Math.random()*4)];
                c2.beginPath();
                c2.arc(rx + 10 + Math.random()*28, ry + 10 + Math.random()*28, 3, 0, Math.PI*2);
                c2.fill();
            }
            break;
        case T_TREE:
            c2.fillStyle = '#1a4a1a';
            c2.fillRect(rx, ry, T, T);
            c2.fillStyle = '#785028';
            c2.fillRect(rx + T/2 - 3, ry + T/2 - 2, 6, T/2 + 2);
            c2.fillStyle = '#1e8228';
            c2.beginPath();
            c2.arc(rx + T/2, ry + T/3, T/3, 0, Math.PI*2);
            c2.fill();
            c2.fillStyle = '#2a9a32';
            c2.beginPath();
            c2.arc(rx + T/3, ry + T/4, T/5, 0, Math.PI*2);
            c2.fill();
            c2.beginPath();
            c2.arc(rx + T*2/3, ry + T/4, T/5, 0, Math.PI*2);
            c2.fill();
            break;
        case T_DOOR:
            c2.fillStyle = '#8a7a5a';
            c2.fillRect(rx, ry, T, T);
            c2.fillStyle = '#9a8a6a';
            for(let i=0;i<4;i++) c2.fillRect(rx + 6 + i*10, ry + 4, 6, T-8);
            break;
        case T_STONE:
            c2.fillStyle = '#5a5550';
            c2.fillRect(rx, ry, T, T);
            c2.fillStyle = '#7a7570';
            c2.beginPath();
            c2.arc(rx + T/2, ry + T/2 - 2, T/3, 0, Math.PI*2);
            c2.fill();
            c2.fillStyle = '#4a8acc';
            c2.beginPath();
            c2.arc(rx + T/2, ry + T/2 - 6, 5, 0, Math.PI*2);
            c2.fill();
            c2.beginPath();
            c2.arc(rx + T/2 - 3, ry + T/2 - 8, 3, 0, Math.PI*2);
            c2.fill();
            c2.beginPath();
            c2.arc(rx + T/2 + 3, ry + T/2 - 8, 3, 0, Math.PI*2);
            c2.fill();
            break;
        case T_HOUSE_WALL:
            c2.fillStyle = '#6a4a32';
            c2.fillRect(rx, ry, T, T);
            c2.fillStyle = '#8a6444';
            c2.fillRect(rx + 2, ry + 2, T - 4, T - 4);
            c2.strokeStyle = '#4a321e';
            c2.lineWidth = 2;
            c2.strokeRect(rx + 2, ry + 2, T - 4, T - 4);
            // Деревянная текстура — диагональные балки
            c2.strokeStyle = '#5a3e28';
            c2.lineWidth = 1.5;
            c2.beginPath();
            c2.moveTo(rx + 4, ry + T - 4);
            c2.lineTo(rx + T - 4, ry + 4);
            c2.stroke();
            // Крыша-намёк сверху
            c2.fillStyle = '#8a3025';
            c2.fillRect(rx, ry, T, 6);
            break;
        case T_HOUSE_DOOR:
            c2.fillStyle = '#6a4a32';
            c2.fillRect(rx, ry, T, T);
            c2.fillStyle = '#3a2818';
            c2.fillRect(rx + 6, ry + 6, T - 12, T - 6);
            c2.fillStyle = '#5a3e28';
            c2.fillRect(rx + 8, ry + 8, T - 16, T - 10);
            c2.fillStyle = '#ffd700';
            c2.beginPath();
            c2.arc(rx + T - 14, ry + T/2 + 4, 2.5, 0, Math.PI*2);
            c2.fill();
            break;
    }
}

function makeVillageCache(tm) {
    const T = CFG.TILE, COLS = CFG.W_COLS, ROWS = CFG.W_ROWS;
    const oc = document.createElement('canvas');
    oc.width = COLS * T;
    oc.height = ROWS * T;
    const c2 = oc.getContext('2d');
    c2.fillStyle = '#1a4a1a';
    c2.fillRect(0, 0, oc.width, oc.height);
    for(let y=0; y<ROWS; y++) for(let x=0; x<COLS; x++) drawVillageTile(c2, tm[y][x], x*T, y*T);
    return oc;
}