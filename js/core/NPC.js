// ============================================================
//  NPC
// ============================================================
class NPC {
    constructor(x, y, t) {
        this.type = t;
        this.name = t === 0 ? 'Торговец' : 'Старейшина';
        this.col = t === 0 ? '#c89632' : '#b4b4dc';
        this.x = x * CFG.TILE + CFG.TILE/2;
        this.y = y * CFG.TILE + CFG.TILE/2;
        this.anim = Math.random() * Math.PI * 2;
    }
    
    update() {
        this.anim += 0.05;
    }
    
    talk() {
        this.type === 0 ? openShop() : openQuests();
    }
    
    draw(cx, cy) {
        const px = wx(this.x, cx);
        const py = wy(this.y, cy);
        const bob = Math.sin(this.anim) * 3 * SC;
        const r = 13 * SC;
        
        ctx.fillStyle = this.col;
        ctx.beginPath();
        ctx.arc(px, py + bob, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,.5)';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        if (this.type === 0) {
            ctx.fillStyle = '#785028';
            ctx.fillRect(px - 8*SC, py - 18*SC + bob, 16*SC, 7*SC);
            ctx.fillRect(px - 12*SC, py - 13*SC + bob, 24*SC, 4*SC);
            ctx.fillStyle = '#e6c832';
            ctx.beginPath();
            ctx.arc(px, py + bob, r * 0.5, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillStyle = '#4040a0';
            ctx.beginPath();
            ctx.arc(px, py - 4*SC + bob, r * 1.1, Math.PI, 0);
            ctx.fill();
            ctx.fillRect(px - r * 1.1, py - 4*SC + bob, r * 2.2, r * 0.5);
        }
        
        ctx.fillStyle = '#ffd700';
        ctx.font = `bold ${11*SC}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(this.name, px, py - 42*SC);
        
        ctx.fillStyle = '#00e0c0';
        ctx.font = `${9*SC}px sans-serif`;
        ctx.fillText(this.type === 0 ? '[🌀] Магазин' : '[🌀] Задания', px, py - 54*SC);
    }
}