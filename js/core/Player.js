// ============================================================
//  PLAYER
// ============================================================
class Player {
    constructor() {
        this.x = CFG.SPAWN_X;
        this.y = CFG.SPAWN_Y;
        this.spd = 2.5;
        this.maxhp = 120;
        this.hp = 120;
        this.maxmp = 60;
        this.mp = 60;
        this.atk = 20;
        this.def = 5;
        this.lv = 1;
        this.exp = 0;
        this.exn = 100;
        this.gold = 0;
        this.bag = { hpPot: 0, mpPot: 0, sword: 0, shield: 0 };
        this.acd = 0;
        this.scd = 0;
        this.flash = 0;
        this.anim = 0;
        this.face = { x: 0, y: 1 };
        this.slotCooldowns = [0, 0, 0, 0];
        this.blockChance = 0.1;
        this.dodgeChance = 0.05;
        this.attackAnim = 0;
        this.attackAngle = 0;
    }
    
    initFromClass(cls) {
        const d = CLASSES[cls];
        if (!d) return;
        this.maxhp = d.hp;
        this.hp = d.hp;
        this.maxmp = d.mp;
        this.mp = d.mp;
        this.atk = d.atk;
        this.def = d.def;
        this.spd = d.spd;
    }
    
    lvup(floats) {
        this.lv++;
        stats.maxLevel = Math.max(stats.maxLevel, this.lv);
        this.exn = this.exn * 1.5 | 0;
        this.maxhp += 20;
        this.hp = this.maxhp;
        this.maxmp += 10;
        this.mp = this.maxmp;
        this.atk += 5;
        this.def += 1;
        this.blockChance = Math.min(0.3, 0.1 + this.lv * 0.008);
        this.dodgeChance = Math.min(0.15, 0.05 + this.lv * 0.004);
        floats.push(new FText(this.x, this.y - CFG.TILE, 'Уровень ' + this.lv + '! ↑', '#ffd700', 20));
        sound.play('levelup');
        tgVibrate('heavy');
        checkAchievements();
        saveGame(true);
    }
    
    useSlot(slot, floats) {
        const idx = SLOT_KEYS.indexOf(slot);
        if (idx >= 0 && this.slotCooldowns[idx] > 0) return;
        if (this.bag[slot] <= 0) return;
        
        if (slot === 'hpPot') {
            if (this.hp >= this.maxhp) return;
            const h = Math.min(40, this.maxhp - this.hp);
            this.hp += h;
            this.bag.hpPot--;
            floats.push(new FText(this.x, this.y - CFG.TILE, '+' + h + ' HP', '#3cb43c'));
            sound.play('pickup');
            tgVibrate('light');
        } else if (slot === 'mpPot') {
            if (this.mp >= this.maxmp) return;
            const m = Math.min(30, this.maxmp - this.mp);
            this.mp += m;
            this.bag.mpPot--;
            floats.push(new FText(this.x, this.y - CFG.TILE, '+' + m + ' MP', '#3c78dc'));
            sound.play('pickup');
            tgVibrate('light');
        } else if (slot === 'sword') {
            this.atk += 10;
            this.bag.sword--;
            floats.push(new FText(this.x, this.y - CFG.TILE, '⚔ +10 атака', '#e68220'));
            sound.play('pickup');
            tgVibrate('medium');
        } else if (slot === 'shield') {
            this.def += 4;
            this.bag.shield--;
            floats.push(new FText(this.x, this.y - CFG.TILE, '🛡 +4 защита', '#8090e0'));
            sound.play('pickup');
            tgVibrate('medium');
        }
        if (idx >= 0) this.slotCooldowns[idx] = 20;
        saveGame(true);
    }
    
    melee(enemies, parts, floats) {
        if (this.acd > 0) return;
        this.acd = 30;
        this.attackAnim = 15;
        this.attackAngle = Math.atan2(this.face.y, this.face.x);
        const ax = this.x + this.face.x * CFG.TILE;
        const ay = this.y + this.face.y * CFG.TILE;
        const isCrit = Math.random() < 0.15;
        const dmg = isCrit ? this.atk * 2 : this.atk - (Math.random() * 5 | 0);
        
        for (const e of enemies) {
            if (!e.alive) continue;
            const ex = e.x * CFG.TILE + CFG.TILE/2;
            const ey = e.y * CFG.TILE + CFG.TILE/2;
            if (Math.hypot(ax - ex, ay - ey) < CFG.TILE * 1.4) {
                e.hp -= Math.max(1, dmg);
                floats.push(new FText(ex, ey - CFG.TILE, '-' + Math.max(1, dmg), '#ff4444'));
                for (let i = 0; i < 7; i++) parts.push(new Particle(ex, ey, '#e04040'));
                if (isCrit) {
                    floats.push(new FText(ex, ey - CFG.TILE * 1.5, '💥 КРИТ!', '#ff4422', 20));
                    e.stunTimer = 20;
                    sound.play('crit');
                    tgVibrate('heavy');
                } else {
                    sound.play('hit');
                    tgVibrate('medium');
                }
                if (e.hp <= 0) {
                    e.alive = false;
                    stats.totalKills++;
                    if (e.isBoss) stats.bossKills++;
                    sound.play('kill');
                    for (let i = 0; i < 14; i++) parts.push(new Particle(ex, ey, e.color, -3));
                    onEnemyKilled(e.name);
                    checkAchievements();
                    saveGame(true);
                }
            }
        }
    }
    
    hurt(dmg, floats) {
        if (Math.random() < this.blockChance) {
            floats.push(new FText(this.x, this.y - CFG.TILE * 1.2, '🛡 БЛОК!', '#88ccff', 14));
            sound.play('block');
            tgVibrate('light');
            return;
        }
        if (Math.random() < this.dodgeChance) {
            floats.push(new FText(this.x, this.y - CFG.TILE * 1.2, '💨 УКЛОН!', '#88ff88', 14));
            sound.play('dodge');
            tgVibrate('light');
            return;
        }
        const r = Math.max(1, dmg - this.def);
        this.hp -= r;
        this.flash = 12;
        floats.push(new FText(this.x, this.y - CFG.TILE/2, '-' + r, '#ff4444', 13));
        sound.play('hit');
        tgVibrate('heavy');
    }
    
    update(inp, tm, enemies, items, parts, floats, projs, npcs) {
        this.anim += 0.12;
        if (this.acd > 0) this.acd--;
        if (this.scd > 0) this.scd--;
        if (this.flash > 0) this.flash--;
        if (this.attackAnim > 0) this.attackAnim--;
        for (let i = 0; i < this.slotCooldowns.length; i++) {
            if (this.slotCooldowns[i] > 0) this.slotCooldowns[i]--;
        }
        updateSlotCooldowns(this.slotCooldowns);
        
        const COLS = G.depth > 0 ? CFG.D_COLS : CFG.W_COLS;
        const ROWS = G.depth > 0 ? CFG.D_ROWS : CFG.W_ROWS;
        let dx = inp.dx, dy = inp.dy;
        if (dx || dy) {
            const l = Math.hypot(dx, dy);
            dx /= l;
            dy /= l;
            this.face = { x: dx, y: dy };
            const nx = this.x + dx * this.spd;
            const tx = nx / CFG.TILE | 0;
            const ty = this.y / CFG.TILE | 0;
            if (tx >= 0 && tx < COLS && ty >= 0 && ty < ROWS && !SOLID.has(tm[ty][tx])) this.x = nx;
            const ny = this.y + dy * this.spd;
            const tx2 = this.x / CFG.TILE | 0;
            const ty2 = ny / CFG.TILE | 0;
            if (tx2 >= 0 && tx2 < COLS && ty2 >= 0 && ty2 < ROWS && !SOLID.has(tm[ty2][tx2])) this.y = ny;
        }
        if (inp.atk) { inp.atk = false; this.melee(enemies, parts, floats); }
        if (inp.spell) {
            inp.spell = false;
            if (this.scd <= 0 && this.mp >= 15) {
                this.scd = 45;
                this.mp -= 15;
                projs.push({
                    x: this.x, y: this.y,
                    vx: this.face.x * 5,
                    vy: this.face.y * 5,
                    dmg: this.atk * 1.5 | 0,
                    alive: true,
                    life: 120,
                    trail: []
                });
                sound.play('portal');
            }
        }
        if (inp.useSlot) { this.useSlot(inp.useSlot, floats); inp.useSlot = null; }
        
        // Подбор предметов (только в подземелье)
        if (G.depth > 0) {
            for (const it of items) {
                if (!it.alive) continue;
                const ix = it.x * CFG.TILE + CFG.TILE/2;
                const iy = it.y * CFG.TILE + CFG.TILE/2;
                if (Math.hypot(this.x - ix, this.y - iy) < CFG.TILE * 0.85) {
                    if (it.type === 'gold') {
                        this.gold += 25;
                        stats.totalGold += 25;
                        floats.push(new FText(ix, iy - 24, '+25💰', '#ffd700'));
                    } else {
                        this.bag[it.type] = (this.bag[it.type] || 0) + 1;
                        stats.itemsCollected++;
                        floats.push(new FText(ix, iy - 24, '+1 ' + it.icon, '#e6c832'));
                    }
                    for (let i = 0; i < 8; i++) parts.push(new Particle(ix, iy, it.col));
                    it.alive = false;
                    sound.play('pickup');
                    tgVibrate('light');
                    checkAchievements();
                    saveGame(true);
                }
            }
        }
        
        // Урон от врагов (только в подземелье)
        if (G.depth > 0) {
            for (const e of enemies) {
                if (!e.alive) continue;
                const ex = e.x * CFG.TILE + CFG.TILE/2;
                const ey = e.y * CFG.TILE + CFG.TILE/2;
                if (Math.hypot(this.x - ex, this.y - ey) < CFG.TILE * 0.85 && e.acd <= 0) {
                    e.acd = 60;
                    this.hurt(e.atk, floats);
                }
            }
        }
        
        while (this.exp >= this.exn) {
            this.exp -= this.exn;
            this.lvup(floats);
        }
    }
    
    draw(cx, cy) {
        const px = wx(this.x, cx);
        const py = wy(this.y, cy);
        const bob = Math.sin(this.anim) * 3 * SC;
        const r = 13 * SC;
        
        // Тень
        ctx.fillStyle = 'rgba(0,0,0,.3)';
        ctx.beginPath();
        ctx.ellipse(px, py + r + 5*SC, r*0.8, r*0.3, 0, 0, Math.PI*2);
        ctx.fill();
        
        // Тело
        ctx.fillStyle = '#8c3cc8';
        ctx.beginPath();
        ctx.moveTo(px, py + bob);
        ctx.lineTo(px - 12*SC, py + 20*SC + bob);
        ctx.lineTo(px + 12*SC, py + 20*SC + bob);
        ctx.closePath();
        ctx.fill();
        
        // Голова
        ctx.fillStyle = this.flash > 0 ? '#ff8888' : '#dcb482';
        ctx.beginPath();
        ctx.arc(px, py + bob, r, 0, Math.PI*2);
        ctx.fill();
        ctx.strokeStyle = '#b48a5a';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Шлем
        ctx.fillStyle = '#969190';
        ctx.beginPath();
        ctx.arc(px, py - 2*SC + bob, r*0.85, Math.PI, 0);
        ctx.fill();
        ctx.fillStyle = '#5a5550';
        ctx.fillRect(px - 10*SC, py - 14*SC + bob, 20*SC, 8*SC);
        
        // Атака
        if (this.attackAnim > 0) {
            const progress = this.attackAnim / 15;
            const angle = this.attackAngle - 0.8 + progress * 1.6;
            const swx = px + Math.cos(angle) * 22*SC;
            const swy = py + Math.sin(angle) * 22*SC + bob;
            ctx.strokeStyle = 'rgba(255,255,200,0.4)';
            ctx.lineWidth = 6*SC;
            ctx.beginPath();
            ctx.arc(px, py + bob, 22*SC, angle - 0.3, angle + 0.3);
            ctx.stroke();
            ctx.strokeStyle = '#ffdd88';
            ctx.lineWidth = 4*SC;
            ctx.beginPath();
            ctx.moveTo(px + Math.cos(angle - 0.2) * 12*SC, py + Math.sin(angle - 0.2) * 12*SC + bob);
            ctx.lineTo(swx, swy);
            ctx.stroke();
            ctx.fillStyle = '#ffeeaa';
            ctx.beginPath();
            ctx.arc(swx, swy, 4*SC, 0, Math.PI*2);
            ctx.fill();
        } else {
            const ang = Math.atan2(this.face.y, this.face.x);
            const swx = px + Math.cos(ang) * 18*SC;
            const swy = py + Math.sin(ang) * 18*SC + bob;
            ctx.strokeStyle = '#969190';
            ctx.lineWidth = 4*SC;
            ctx.beginPath();
            ctx.moveTo(px, py + bob);
            ctx.lineTo(swx, swy);
            ctx.stroke();
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(swx, swy, 4*SC, 0, Math.PI*2);
            ctx.fill();
        }
        
        // Имя
        ctx.fillStyle = '#88ff88';
        ctx.font = `${9*SC}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(playerData.name || 'Герой', px, py - 28*SC + bob);
        
        const cls = CLASSES[playerData.class];
        if (cls) {
            ctx.fillStyle = '#ffd700';
            ctx.font = `${8*SC}px sans-serif`;
            ctx.textBaseline = 'bottom';
            ctx.fillText(cls.icon + ' ' + cls.name, px, py - 36*SC + bob);
        }
        
        // HP/MP полоски
        const bw = 30*SC;
        const bh = 3*SC;
        const hpY = py - 40*SC + bob;
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(px - bw/2 - 1, hpY - 1, bw + 2, bh + 2);
        ctx.fillStyle = '#640000';
        ctx.fillRect(px - bw/2, hpY, bw, bh);
        ctx.fillStyle = '#c83232';
        ctx.fillRect(px - bw/2, hpY, bw * Math.max(0, this.hp/this.maxhp), bh);
        
        const mpY = hpY - bh - 2*SC;
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(px - bw/2 - 1, mpY - 1, bw + 2, bh + 2);
        ctx.fillStyle = '#1a1a3a';
        ctx.fillRect(px - bw/2, mpY, bw, bh);
        ctx.fillStyle = '#3c78dc';
        ctx.fillRect(px - bw/2, mpY, bw * Math.max(0, this.mp/this.maxmp), bh);
        
        // Щит
        if (this.bag.shield > 0) {
            const shieldX = px - Math.cos(Math.atan2(this.face.y, this.face.x) + 0.5) * 16*SC;
            const shieldY = py - Math.sin(Math.atan2(this.face.y, this.face.x) + 0.5) * 16*SC + bob;
            ctx.fillStyle = '#8090a0';
            ctx.beginPath();
            ctx.arc(shieldX, shieldY, 7*SC, 0, Math.PI*2);
            ctx.fill();
            ctx.strokeStyle = '#aab0c0';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }
}