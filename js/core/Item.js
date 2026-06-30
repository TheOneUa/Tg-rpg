// ============================================================
//  ITEM
// ============================================================
class Item {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.alive = true;
        this.bob = Math.random() * Math.PI * 2;
        
        const itemData = {
            hpPot:   { col: '#c83232', icon: '🧪' },
            mpPot:   { col: '#3c78dc', icon: '💧' },
            sword:   { col: '#969190', icon: '⚔️' },
            shield:  { col: '#8090a0', icon: '🛡️' },
            gold:    { col: '#ffd700', icon: '💰' }
        };
        
        this.col = itemData[type].col;
        this.icon = itemData[type].icon;
    }
    
    update() {
        this.bob += 0.07 * (G.dt || 1);
    }
    
    draw(cx, cy) {
        if (!this.alive) return;
        const worldX = this.x * CFG.TILE + CFG.TILE/2;
        const worldY = this.y * CFG.TILE + CFG.TILE/2;
        const px = wx(worldX, cx);
        const py = wy(worldY + Math.sin(this.bob) * 4, cy);
        const r = 10 * SC;
        
        ctx.fillStyle = this.col;
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,.6)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.font = `${14*SC}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(this.icon, px, py + 5*SC);
    }
}