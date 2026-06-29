// ============================================================
//  ENEMY
// ============================================================
class Enemy {
    constructor(data) {
        Object.assign(this, data);
        this.alive = true;
        this.acd = 0;
        this.anim = Math.random() * Math.PI * 2;
        this.stunTimer = 0;
        this.isBoss = data.isBoss || false;
    }
    
    update(px, py, tm) {
        if (!this.alive) return;
        if (this.stunTimer > 0) { this.stunTimer--; return; }
        
        this.anim += 0.1;
        if (this.acd > 0) this.acd--;
        
        const ex = this.x * CFG.TILE + CFG.TILE/2;
        const ey = this.y * CFG.TILE + CFG.TILE/2;
        const dist = Math.hypot(px - ex, py - ey);
        
        if (dist < CFG.TILE * 8 && dist > 2) {
            const dx = (px - ex) / dist * this.spd;
            const dy = (py - ey) / dist * this.spd;
            const nx = this.x + dx / CFG.TILE;
            const ny = this.y + dy / CFG.TILE;
            const tx = Math.round(nx);
            const ty = Math.round(ny);
            
            if (tx >= 0 && tx < CFG.D_COLS && ty >= 0 && ty < CFG.D_ROWS && !SOLID.has(tm[ty][tx])) {
                this.x = nx;
                this.y = ny;
            }
        }
    }
    
    draw(cx, cy) {
        if (!this.alive) return;
        const px = wx(this.x * CFG.TILE + CFG.TILE/2, cx);
        const py = wy(this.y * CFG.TILE + CFG.TILE/2 + Math.sin(this.anim) * 2 * SC, cy);
        const r = 14 * SC;
        
        // Тень
        ctx.fillStyle = 'rgba(0,0,0,.28)';
        ctx.beginPath();
        ctx.ellipse(px, py + r + 3*SC, r*0.8, r*0.3, 0, 0, Math.PI*2);
        ctx.fill();
        
        // Тело
        if (this.isBoss) {
            ctx.shadowColor = '#ff2266';
            ctx.shadowBlur = 20 * SC;
        }
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = 'rgba(255,255,255,.25)';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Иконка
        ctx.font = `${22*SC}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.icon || '❓', px, py + 2*SC);
        
        if (this.isBoss) {
            ctx.shadowColor = '#ff2266';
            ctx.shadowBlur = 25*SC;
            ctx.font = `${28*SC}px sans-serif`;
            ctx.fillText(this.icon || '👑', px, py + 2*SC);
            ctx.shadowBlur = 0;
        }
        
        // HP полоска
        const bw = 36 * SC;
        ctx.fillStyle = '#640000';
        ctx.fillRect(px - bw/2, py - 28*SC, bw, 5*SC);
        ctx.fillStyle = '#00c800';
        ctx.fillRect(px - bw/2, py - 28*SC, bw * Math.max(0, this.hp / this.maxhp), 5*SC);
        
        // Имя
        ctx.fillStyle = this.isBoss ? '#ff8844' : '#fff';
        ctx.font = `${this.isBoss ? 11 : 10}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(this.isBoss ? '👑 ' + this.name : this.name, px, py - 30*SC);
        
        // Стан
        if (this.stunTimer > 0) {
            ctx.fillStyle = '#ffff44';
            ctx.font = `${14*SC}px sans-serif`;
            ctx.textBaseline = 'middle';
            ctx.fillText('💫', px, py - 42*SC);
        }
    }
}