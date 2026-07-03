// ============================================================
//  NPC
// ============================================================
const NPC_DATA = {
    0:        { name: 'Торговец',   col: '#c89632', icon: '🛒', label: 'Магазин' },
    1:        { name: 'Старейшина', col: '#b4b4dc', icon: '📜', label: 'Задания' },
    smith:    { name: 'Кузнец',     col: '#9a6428', icon: '🛠️', label: 'Кузница' },
    elf:      { name: 'Эльф',       col: '#4a9a5a', icon: '🏹', label: 'Лавка эльфа' },
    witch:    { name: 'Колдунья',   col: '#8a3aaa', icon: '🔮', label: 'Башня колдуньи' }
};

class NPC {
    constructor(x, y, t) {
        this.type = t;
        this._refresh();
        this.x = x * CFG.TILE + CFG.TILE/2;
        this.y = y * CFG.TILE + CFG.TILE/2;
        this.anim = Math.random() * Math.PI * 2;
    }

    _refresh() {
        // Берём данные из namesConfig если есть, иначе из NPC_DATA defaults
        const named = getName('npcs', String(this.type));
        const def   = NPC_DATA[this.type] || NPC_DATA[0];
        this.name  = named.name  || def.name;
        this.icon  = named.icon  || def.icon;
        this.label = named.label || def.label;
        this.col   = def.col;
    }
    
    update() {
        this.anim += 0.05 * (G.dt || 1);
    }
    
    talk() {
        if (this.type === 0) openShop();
        else if (this.type === 1) openQuests();
        else if (this.type === 'smith') openMasterShop('smith');
        else if (this.type === 'elf') openMasterShop('elf');
        else if (this.type === 'witch') openMasterShop('witch');
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
        } else if (this.type === 1) {
            ctx.fillStyle = '#4040a0';
            ctx.beginPath();
            ctx.arc(px, py - 4*SC + bob, r * 1.1, Math.PI, 0);
            ctx.fill();
            ctx.fillRect(px - r * 1.1, py - 4*SC + bob, r * 2.2, r * 0.5);
        } else {
            // Мастера (кузнец/эльф/колдунья) — иконка по центру на цветном фоне
            ctx.font = `${20*SC}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.icon, px, py + bob + 1*SC);
        }
        
        ctx.fillStyle = '#ffd700';
        ctx.font = `bold ${11*SC}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'alphabetic';
        ctx.fillText(this.name, px, py - 42*SC);
        
        ctx.fillStyle = '#00e0c0';
        ctx.font = `${9*SC}px sans-serif`;
        ctx.fillText('[🌀] ' + this.label, px, py - 54*SC);
    }
}
