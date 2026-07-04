// ============================================================
//  ITEM
// ============================================================
class Item {
    constructor(x, y, type) {
        this.x = x;       // тайловые координаты
        this.y = y;
        this.type = type;
        this.alive = true;
        this.bob = Math.random() * Math.PI * 2;

        const def = ITEM_DEFS[type] || { name: type, icon: '❓', col: '#888', slot: 'consumable' };
        this.col    = def.col;
        this.icon   = def.icon;
        this.name   = def.name;
        this.slot   = def.slot;
        this.rarity = def.rarity || 'common';
    }

    get def() { return ITEM_DEFS[this.type] || {}; }

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

        // Ореол редкости
        if (this.rarity === 'rare') {
            ctx.fillStyle = 'rgba(100,150,255,0.15)';
            ctx.beginPath();
            ctx.arc(px, py, r * 1.8, 0, Math.PI*2);
            ctx.fill();
        } else if (this.rarity === 'epic') {
            ctx.fillStyle = 'rgba(180,80,255,0.2)';
            ctx.beginPath();
            ctx.arc(px, py, r * 2.0, 0, Math.PI*2);
            ctx.fill();
        }

        ctx.fillStyle = this.col;
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI*2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,.5)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.font = `${14*SC}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.icon, px, py + 1*SC);
        ctx.textBaseline = 'alphabetic';
    }
}
