// ============================================================
//  PLAYER RENDER — отрисовка персонажа на canvas
// ============================================================
// Чистый рендеринг: только читает состояние (this.x/y/hp/mp/...),
// ничего не меняет. Самая безопасная часть Player.js для переноса.
Object.assign(Player.prototype, {
    draw(cx, cy) {
        const px = wx(this.x, cx);
        const py = wy(this.y, cy);
        const r = 13 * SC;
        const spriteKey = HERO_SPRITE_KEYS[this.cls] || 'hero_warrior';
        const size = CFG.TILE * SC * 1.4; // чуть крупнее тайла для читаемости

        // Тень (всегда, независимо от спрайта)
        ctx.fillStyle = 'rgba(0,0,0,.28)';
        ctx.beginPath();
        ctx.ellipse(px, py + r * 0.8, r * 0.75, r * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();

        // Flash при получении урона — красный оверлей поверх спрайта
        const flashing = this.flash > 0;

        // ── Попытка нарисовать спрайт ──
        const usedSprite = drawCharSprite(
            spriteKey,
            this.spriteAnim,
            this.spriteDir,
            this.spriteFrame,
            px, py, size
        );

        // ── Fallback: векторный рендер если спрайт не загружен ──
        if (!usedSprite) {
            const bob = Math.sin(this.anim) * 3 * SC;
            ctx.fillStyle = '#8c3cc8';
            ctx.beginPath();
            ctx.moveTo(px, py + bob);
            ctx.lineTo(px - 12*SC, py + 20*SC + bob);
            ctx.lineTo(px + 12*SC, py + 20*SC + bob);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = flashing ? '#ff8888' : '#dcb482';
            ctx.beginPath();
            ctx.arc(px, py + bob, r, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#b48a5a';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.fillStyle = '#969190';
            ctx.beginPath();
            ctx.arc(px, py - 2*SC + bob, r * 0.85, Math.PI, 0);
            ctx.fill();
            ctx.fillStyle = '#5a5550';
            ctx.fillRect(px - 10*SC, py - 14*SC + bob, 20*SC, 8*SC);
            // Оружие
            if (this.attackAnim > 0) {
                const progress = this.attackAnim / 15;
                const angle = this.attackAngle - 0.8 + progress * 1.6;
                ctx.strokeStyle = 'rgba(255,255,200,0.4)';
                ctx.lineWidth = 6*SC;
                ctx.beginPath();
                ctx.arc(px, py + bob, 22*SC, angle - 0.3, angle + 0.3);
                ctx.stroke();
                ctx.strokeStyle = '#ffdd88';
                ctx.lineWidth = 4*SC;
                const swx = px + Math.cos(angle) * 22*SC;
                const swy = py + Math.sin(angle) * 22*SC + bob;
                ctx.beginPath();
                ctx.moveTo(px + Math.cos(angle - 0.2) * 12*SC, py + Math.sin(angle - 0.2) * 12*SC + bob);
                ctx.lineTo(swx, swy);
                ctx.stroke();
                ctx.fillStyle = '#ffeeaa';
                ctx.beginPath();
                ctx.arc(swx, swy, 4*SC, 0, Math.PI * 2);
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
                ctx.arc(swx, swy, 4*SC, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Flash оверлей поверх спрайта
        if (flashing && usedSprite) {
            ctx.save();
            ctx.globalCompositeOperation = 'source-atop';
            ctx.fillStyle = 'rgba(255,80,80,0.45)';
            ctx.fillRect(px - size/2, py - size/2, size, size);
            ctx.restore();
        }

        // Имя и класс
        ctx.fillStyle = '#88ff88';
        ctx.font = `${9*SC}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(playerData.name || 'Герой', px, py - size * 0.56);

        const cls = CLASSES[playerData.class];
        if (cls) {
            const cn = getName('heroes', playerData.class);
            const clsName = cn?.name || cls.name;
            const clsIcon = cn?.icon || cls.icon;
            ctx.fillStyle = '#ffd700';
            ctx.font = `${8*SC}px sans-serif`;
            ctx.fillText(clsIcon + ' ' + clsName, px, py - size * 0.56 - 10*SC);
        }

        // HP/MP полоски
        const bw = 30*SC;
        const bh = 3*SC;
        const hpY = py - size * 0.56 - 22*SC;
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(px - bw/2 - 1, hpY - 1, bw + 2, bh + 2);
        ctx.fillStyle = '#640000';
        ctx.fillRect(px - bw/2, hpY, bw, bh);
        ctx.fillStyle = '#c83232';
        ctx.fillRect(px - bw/2, hpY, bw * Math.max(0, this.hp/this.effMaxhp), bh);
        
        const mpY = hpY - bh - 2*SC;
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(px - bw/2 - 1, mpY - 1, bw + 2, bh + 2);
        ctx.fillStyle = '#1a1a3a';
        ctx.fillRect(px - bw/2, mpY, bw, bh);
        ctx.fillStyle = '#3c78dc';
        ctx.fillRect(px - bw/2, mpY, bw * Math.max(0, this.mp/this.effMaxmp), bh);
        
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
});
