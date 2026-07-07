// ============================================================
//  CANVAS
// ============================================================
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let SW, SH, SC;
let _hudH = 58; // актуальная высота HUD с учётом safe-area (обновляется в resize)

function resize() {
    SW = window.innerWidth;
    SH = window.innerHeight;
    canvas.width  = SW;
    canvas.height = SH;
    // Читаем реальную высоту HUD (включает safe-area-inset-top)
    const hudEl = document.getElementById('hud');
    if (hudEl) _hudH = hudEl.getBoundingClientRect().height || CFG.TOP;
    SC = Math.min(SW / (12 * CFG.TILE), (SH - _hudH - CFG.BOT) / (9 * CFG.TILE));
}

resize();
window.addEventListener('resize', resize);

function wx(x, cx) {
    return (x - cx) * SC + SW/2;
}

function wy(y, cy) {
    return (y - cy) * SC + _hudH + (SH - _hudH - CFG.BOT)/2;
}

function fadeTransition(callback) {
    const overlay = document.getElementById('fade-overlay');
    overlay.classList.add('active');
    setTimeout(() => {
        callback();
        setTimeout(() => overlay.classList.remove('active'), 100);
    }, 400);
}