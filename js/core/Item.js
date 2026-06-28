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
        this.bob += 0.07;
    }
    
    draw(cx, cy) {
        if (!this.alive) return;
        const px = wx(this.x, cx);
        const py = wy(this.y + Math.sin(this.bob) * 4, cy);
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