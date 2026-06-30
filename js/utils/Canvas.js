// ============================================================
//  CANVAS
// ============================================================
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let SW, SH, SC;

function resize() {
    SW = window.innerWidth;
    SH = window.innerHeight;
    canvas.width = SW;
    canvas.height = SH;
    SC = Math.min(SW / (12 * CFG.TILE), (SH - CFG.TOP - CFG.BOT) / (9 * CFG.TILE));
}

resize();
window.addEventListener('resize', resize);

function wx(x, cx) {
    return (x - cx) * SC + SW/2;
}

function wy(y, cy) {
    return (y - cy) * SC + CFG.TOP + (SH - CFG.TOP - CFG.BOT)/2;
}

function fadeTransition(callback) {
    const overlay = document.getElementById('fade-overlay');
    overlay.classList.add('active');
    setTimeout(() => {
        callback();
        setTimeout(() => overlay.classList.remove('active'), 100);
    }, 400);
}