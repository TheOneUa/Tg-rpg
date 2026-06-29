// ============================================================
//  PORTAL
// ============================================================
const PORTAL_POS = { x: CFG.PORTAL_X, y: CFG.PORTAL_Y };

function drawPortal(cx, cy, pos, t, col, label, icon) {
    const px = wx(pos.x, cx);
    const py = wy(pos.y, cy);
    
    for(let i=0; i<8; i++) {
        const a = t + i * Math.PI / 4;
        ctx.fillStyle = col;
        ctx.globalAlpha = 0.5 + Math.sin(t*2 + i) * 0.3;
        ctx.beginPath();
        ctx.arc(px + Math.cos(a)*20*SC, py + Math.sin(a)*20*SC, 4*SC, 0, Math.PI*2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.strokeStyle = col;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(px, py, 18*SC, 0, Math.PI*2);
    ctx.stroke();
    
    if(label) {
        ctx.fillStyle = col;
        ctx.font = `${9*SC}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(label, px, py - 24*SC);
    }
    if(icon) {
        ctx.font = `${14*SC}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(icon, px, py + 6*SC);
    }
}