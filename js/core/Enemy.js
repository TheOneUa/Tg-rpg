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
        this.def = data.def || 0; // защита врага (используется в DamageFormula)
    }
    
    update(px, py, tm, parts, floats) {
        if (!this.alive) return;
        const dt = G.dt || 1;
        if (this.stunTimer > 0) { this.stunTimer -= dt; return; }

        // Яд/заморозка — тикают даже если враг не может двигаться
        if (parts && floats) updateEnemyStatusEffects(this, dt, parts, floats);
        if (!this.alive) return; // яд мог убить в этом кадре

        this.anim += 0.1 * dt;
        if (this.acd > 0) this.acd -= dt;

        // Заморожен — не двигается, но остальная логика (анимация/кулдаун) продолжается
        if (this.frozenTimer > 0) return;

        const ex = this.x * CFG.TILE + CFG.TILE/2;
        const ey = this.y * CFG.TILE + CFG.TILE/2;
        const dist = Math.hypot(px - ex, py - ey);
        if (dist > CFG.TILE * 10 || dist < 2) return;

        const etx = Math.floor(this.x); // тайловые координаты врага
        const ety = Math.floor(this.y);
        const ptx = Math.floor(px / CFG.TILE); // тайловые координаты игрока
        const pty = Math.floor(py / CFG.TILE);

        // ── Пересчёт пути A* раз в ~30 тиков или при смене цели ──
        if (!this._pathTimer) this._pathTimer = 0;
        this._pathTimer -= dt;

        const targetChanged = this._pathTargetX !== ptx || this._pathTargetY !== pty;
        if (this._pathTimer <= 0 || targetChanged || !this._path) {
            this._pathTimer = 25 + Math.random() * 10; // небольшой рандом чтобы не все разом
            this._pathTargetX = ptx;
            this._pathTargetY = pty;

            // Если прямая видимость есть — A* не нужен, идём напрямую
            if (hasLineOfSight(etx, ety, ptx, pty, tm)) {
                this._path = null; // null = двигаться напрямую
                this._hasLOS = true;
            } else {
                this._path = astarPath(etx, ety, ptx, pty, tm, 300);
                this._pathIdx = 0;
                this._hasLOS = false;
            }
        }

        let dx, dy;

        if (this._hasLOS || !this._path || this._path.length === 0) {
            // Прямое движение к игроку
            dx = (px - ex) / dist;
            dy = (py - ey) / dist;
        } else {
            // Следуем по пути A*
            if (!this._pathIdx) this._pathIdx = 0;

            // Пропускаем уже пройденные узлы
            while (this._pathIdx < this._path.length) {
                const node = this._path[this._pathIdx];
                const nodePx = node.x * CFG.TILE + CFG.TILE/2;
                const nodePy = node.y * CFG.TILE + CFG.TILE/2;
                if (Math.hypot(ex - nodePx, ey - nodePy) < CFG.TILE * 0.6) {
                    this._pathIdx++;
                } else {
                    break;
                }
            }

            if (this._pathIdx >= this._path.length) {
                // Дошли до конца пути, идём напрямую
                dx = (px - ex) / dist;
                dy = (py - ey) / dist;
            } else {
                const node = this._path[this._pathIdx];
                const nodePx = node.x * CFG.TILE + CFG.TILE/2;
                const nodePy = node.y * CFG.TILE + CFG.TILE/2;
                const ndist = Math.hypot(nodePx - ex, nodePy - ey);
                dx = (nodePx - ex) / ndist;
                dy = (nodePy - ey) / ndist;
            }
        }

        // Двигаемся с раздельной проверкой осей (X и Y отдельно, чтобы скользить вдоль стен)
        const spd = this.spd * dt;
        const nx = this.x + (dx * spd) / CFG.TILE;
        const ny = this.y + (dy * spd) / CFG.TILE;
        const tx = Math.round(nx);
        const ty = Math.round(this.y);
        if (tx >= 0 && tx < CFG.D_COLS && ty >= 0 && ty < CFG.D_ROWS && !SOLID.has(tm[ty][tx])) {
            this.x = nx;
        }
        const tx2 = Math.round(this.x);
        const ty2 = Math.round(ny);
        if (tx2 >= 0 && tx2 < CFG.D_COLS && ty2 >= 0 && ty2 < CFG.D_ROWS && !SOLID.has(tm[ty2][tx2])) {
            this.y = ny;
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