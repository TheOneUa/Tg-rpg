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
        this.resources = { ore: 0, wood: 0, essence: 0 };
        this.masterLevels = { smith: { weapon: 0, armor: 0 }, elf: { weapon: 0, armor: 0 }, witch: { weapon: 0, armor: 0 } };
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
        // Класс
        this.cls = 'warrior';
        this.atkCD = 60;
        this.atkRange = 2;
        this.atkType = 'melee';
        this.mpCost = 0;
        this.autoAtkTimer = 0;
        this.statPoints = 0; // нераспределённые очки статов
        // Способность (вторая кнопка)
        this.abilityCD = 0;       // текущий кулдаун (кадры)
        this.abilityActive = 0;   // оставшиеся кадры активного эффекта (0 = неактивна)
        // Спрайт-анимация
        this.spriteAnim = 'idle'; // текущая анимация
        this.spriteDir  = 'right';// текущее направление ('left'/'right')
        this.spriteFrame = 0;     // текущий кадр (0-3)
        this.spriteTimer = 0;     // накопленное время для смены кадра
    }
    
    initFromClass(cls) {
        const d = CLASSES[cls];
        if (!d) return;
        this.cls = cls;
        this.maxhp = d.hp;
        this.hp = d.hp;
        this.maxmp = d.mp;
        this.mp = d.mp;
        this.atk = d.atk;
        this.def = d.def;
        this.spd = d.spd;
        this.atkCD = d.atkCD;
        this.atkRange = d.atkRange;
        this.atkType = d.atkType;
        this.mpCost = d.mpCost;
        this.autoAtkTimer = 0;
        this.statPoints = 0; // нераспределённые очки статов
    }
    
    lvup(floats) {
        this.lv++;
        stats.maxLevel = Math.max(stats.maxLevel, this.lv);
        this.exn = this.exn * 1.5 | 0;
        // Выдаём очки статов — игрок распределяет сам
        this.statPoints = (this.statPoints || 0) + 3;
        this.blockChance = Math.min(0.3, 0.1 + this.lv * 0.008);
        this.dodgeChance = Math.min(0.15, 0.05 + this.lv * 0.004);
        floats.push(new FText(this.x, this.y - CFG.TILE, '✨ Уровень ' + this.lv + '!', '#ffd700', 20));
        floats.push(new FText(this.x, this.y - CFG.TILE * 2, '+3 очка статов', '#88ffcc', 15));
        sound.play('levelup');
        tgVibrate('heavy');
        checkAchievements();
        saveGame(true);
        // Открываем экран распределения статов
        openStatScreen();
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
    
    // Найти ближайшего врага в радиусе (в тайлах).
    // requireLOS = true для дальних атак (стрела/файрбол) — проверяем видимость через стены.
    _nearestEnemy(enemies, rangeTiles, requireLOS = false) {
        let best = null, bestDist = Infinity;
        const rangePixels = rangeTiles * CFG.TILE;
        const ptx = Math.floor(this.x / CFG.TILE);
        const pty = Math.floor(this.y / CFG.TILE);
        // Используем dungeonGrid напрямую — getCurrentTM() может вернуть карту деревни
        const tm = (requireLOS && G.location === 'dungeon' && G.dungeonGrid)
            ? G.dungeonGrid : null;

        for (const e of enemies) {
            if (!e.alive) continue;
            const ex = e.x * CFG.TILE + CFG.TILE/2;
            const ey = e.y * CFG.TILE + CFG.TILE/2;
            const d = Math.hypot(this.x - ex, this.y - ey);
            if (d >= rangePixels || d >= bestDist) continue;
            if (tm) {
                const etx = Math.floor(e.x);
                const ety = Math.floor(e.y);
                if (!hasLineOfSight(ptx, pty, etx, ety, tm)) continue;
            }
            best = e;
            bestDist = d;
        }
        return best;
    }

    // Нанести урон врагу с крит-шансом (с учётом активной способности мечника)
    _dealDamage(e, parts, floats) {
        const rage = this.cls === 'warrior' && this.abilityActive > 0;
        const isCrit = rage ? true : Math.random() < 0.15;
        const dmg = Math.max(1, isCrit ? this.atk * 2 : this.atk - (Math.random() * 4 | 0));
        const ex = e.x * CFG.TILE + CFG.TILE/2;
        const ey = e.y * CFG.TILE + CFG.TILE/2;
        e.hp -= dmg;
        floats.push(new FText(ex, ey - CFG.TILE, '-' + dmg, isCrit ? '#ff8822' : '#ff4444', isCrit ? 16 : 13));
        for (let i = 0; i < (isCrit ? 12 : 7); i++) parts.push(new Particle(ex, ey, '#e04040'));
        if (isCrit) {
            floats.push(new FText(ex, ey - CFG.TILE * 1.6, '💥 КРИТ!', '#ff4422', 18));
            e.stunTimer = 20;
            sound.play('crit');
            tgVibrate('heavy');
        } else {
            sound.play('hit');
            tgVibrate('light');
        }
        if (e.hp <= 0) {
            e.alive = false;
            stats.totalKills++;
            if (e.isBoss) stats.bossKills++;
            sound.play('kill');
            for (let i = 0; i < 14; i++) parts.push(new Particle(ex, ey, e.color, -3));
            dropResourceFromEnemy(e, floats);
            onEnemyKilled(e.name);
            checkAchievements();
            saveGame(true);
        }
        return dmg;
    }

    // Урон по конкретной цели от снаряда (стрела/файрбол), с floats+parts
    _dealProjDamage(e, dmg, parts, floats) {
        const ex = e.x * CFG.TILE + CFG.TILE/2;
        const ey = e.y * CFG.TILE + CFG.TILE/2;
        e.hp -= dmg;
        floats.push(new FText(ex, ey - CFG.TILE, '-' + dmg, '#ff4444'));
        for (let j = 0; j < 7; j++) parts.push(new Particle(ex, ey, '#e04040'));
        if (e.hp <= 0) {
            e.alive = false;
            stats.totalKills++;
            if (e.isBoss) stats.bossKills++;
            sound.play('kill');
            for (let j = 0; j < 14; j++) parts.push(new Particle(ex, ey, e.color, -3));
            dropResourceFromEnemy(e, floats);
            onEnemyKilled(e.name);
            checkAchievements();
            saveGame(true);
        }
    }

    // Автоатака — вызывается каждый кадр из update()
    autoAttack(enemies, parts, floats, projs) {
        if (this.acd > 0) return;

        const volleyActive = this.cls === 'archer' && this.abilityActive > 0;

        if (this.atkType === 'melee') {
            // Мечник: бьёт ближайшего в радиусе 2 тайла
            const target = this._nearestEnemy(enemies, this.atkRange);
            if (!target) return;
            const ab = ABILITIES.warrior;
            const rage = this.abilityActive > 0;
            this.acd = rage ? Math.round(this.atkCD / ab.atkSpeedMult) : this.atkCD;
            this.attackAnim = 12;
            const ex = target.x * CFG.TILE + CFG.TILE/2;
            const ey = target.y * CFG.TILE + CFG.TILE/2;
            this.attackAngle = Math.atan2(ey - this.y, ex - this.x);
            this.face = { x: Math.cos(this.attackAngle), y: Math.sin(this.attackAngle) };
            this._dealDamage(target, parts, floats);

        } else if (this.atkType === 'arrow') {
            // Лучник: стреляет стрелой (или веером, если активна способность)
            const target = this._nearestEnemy(enemies, this.atkRange, true);
            if (!target) return;
            const ab = ABILITIES.archer;
            this.acd = volleyActive ? Math.round(this.atkCD / ab.atkSpeedMult) : this.atkCD;
            const ex = target.x * CFG.TILE + CFG.TILE/2;
            const ey = target.y * CFG.TILE + CFG.TILE/2;
            const baseAng = Math.atan2(ey - this.y, ex - this.x);
            this.face = { x: Math.cos(baseAng), y: Math.sin(baseAng) };
            this.attackAngle = baseAng;
            this.attackAnim = 10;

            const baseSpd = 7;
            const spd = volleyActive ? baseSpd * ab.arrowSpeedMult : baseSpd;
            const shots = volleyActive ? ab.fanCount : 1;
            const spreadRad = (ab.fanSpreadDeg * Math.PI / 180);

            for (let i = 0; i < shots; i++) {
                let ang = baseAng;
                if (shots > 1) {
                    const mid = (shots - 1) / 2;
                    ang = baseAng + (i - mid) * spreadRad;
                }
                projs.push({
                    x: this.x, y: this.y,
                    vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd,
                    dmg: this.atk, angle: ang,
                    alive: true, life: Math.ceil(this.atkRange * CFG.TILE / spd) + 5,
                    trail: [], type: 'arrow', spriteFrame: 0, spriteTimer: 0,
                    color: volleyActive ? '#ffaa33' : '#e8c840',
                    trailColor: volleyActive ? '#ff7700' : '#c8a020'
                });
            }
            sound.play('pickup');

        } else if (this.atkType === 'fireball') {
            // Маг: огненный шар, тратит ману
            const target = this._nearestEnemy(enemies, this.atkRange, true);
            if (!target) return;
            if (this.mp < this.mpCost) return; // нет маны — не стреляет
            this.acd = this.atkCD;
            this.mp = Math.max(0, this.mp - this.mpCost);
            const ex = target.x * CFG.TILE + CFG.TILE/2;
            const ey = target.y * CFG.TILE + CFG.TILE/2;
            const ang = Math.atan2(ey - this.y, ex - this.x);
            this.face = { x: Math.cos(ang), y: Math.sin(ang) };
            this.attackAngle = ang;
            this.attackAnim = 10;
            const spd = 6;
            projs.push({
                x: this.x, y: this.y,
                vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd,
                dmg: Math.round(this.atk * 1.4), angle: ang,
                alive: true, life: Math.ceil(this.atkRange * CFG.TILE / spd) + 5,
                trail: [], type: 'fireball', spriteFrame: 0, spriteTimer: 0,
                color: '#ff6622', trailColor: '#ff4400'
            });
            sound.play('portal');
        }
    }

    // ============================================================
    //  СПОСОБНОСТЬ (вторая кнопка)
    // ============================================================
    useAbility(floats) {
        if (this.abilityCD > 0) return false;
        const ab = ABILITIES[this.cls];
        if (!ab) return false;
        if (this.mp < ab.mpCost) {
            floats.push(new FText(this.x, this.y - CFG.TILE * 1.4, '❌ Мало маны', '#88aaff', 13));
            return false;
        }

        this.mp = Math.max(0, this.mp - ab.mpCost);
        this.abilityCD = ab.cd;

        if (this.cls === 'warrior') {
            this.abilityActive = ab.dur;
            floats.push(new FText(this.x, this.y - CFG.TILE * 1.4, '💢 ЯРОСТЬ!', '#ff3333', 18));
            sound.play('crit');
            tgVibrate('heavy');

        } else if (this.cls === 'archer') {
            this.abilityActive = ab.dur;
            floats.push(new FText(this.x, this.y - CFG.TILE * 1.4, '🌪️ ШКВАЛ!', '#ffaa33', 18));
            sound.play('crit');
            tgVibrate('heavy');

        } else if (this.cls === 'mage') {
            const healAmt = Math.round(this.maxhp * ab.healPercent);
            this.hp = Math.min(this.maxhp, this.hp + healAmt);
            this.abilityActive = ab.dur; // используется для реген-тика
            floats.push(new FText(this.x, this.y - CFG.TILE * 1.4, '✨ +' + healAmt + ' HP', '#44ff88', 18));
            sound.play('levelup');
            tgVibrate('medium');
        }
        return true;
    }

    // Оставляем для обратной совместимости
    melee(enemies, parts, floats) {
        this.autoAttack(enemies, parts, floats, G.projs);
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
        const dt = G.dt || 1;
        this.anim += 0.12 * dt;
        if (this.acd > 0) this.acd -= dt;
        if (this.scd > 0) this.scd -= dt;
        if (this.flash > 0) this.flash -= dt;
        if (this.attackAnim > 0) this.attackAnim -= dt;
        if (this.abilityCD > 0) this.abilityCD -= dt;
        for (let i = 0; i < this.slotCooldowns.length; i++) {
            if (this.slotCooldowns[i] > 0) this.slotCooldowns[i] -= dt;
        }
        updateSlotCooldowns(this.slotCooldowns);

        // Тик активного эффекта способности
        if (this.abilityActive > 0) {
            if (this.cls === 'mage') {
                // Реген% от maxHP в секунду (60 кадров = 1 сек)
                const ab = ABILITIES.mage;
                this.hp = Math.min(this.maxhp, this.hp + (ab.regenPerSec * this.maxhp / 60) * dt);
            }
            this.abilityActive -= dt;
            if (this.abilityActive < 0) this.abilityActive = 0;
        }
        
        const { COLS, ROWS } = getCurrentMapDims();
        let dx = inp.dx, dy = inp.dy;
        const isMoving = !!(dx || dy);
        if (isMoving) {
            const l = Math.hypot(dx, dy);
            dx /= l;
            dy /= l;
            this.face = { x: dx, y: dy };
            const nx = this.x + dx * this.spd * dt;
            const tx = nx / CFG.TILE | 0;
            const ty = this.y / CFG.TILE | 0;
            if (tx >= 0 && tx < COLS && ty >= 0 && ty < ROWS && !SOLID.has(tm[ty][tx])) this.x = nx;
            const ny = this.y + dy * this.spd * dt;
            const tx2 = this.x / CFG.TILE | 0;
            const ty2 = ny / CFG.TILE | 0;
            if (tx2 >= 0 && tx2 < COLS && ty2 >= 0 && ty2 < ROWS && !SOLID.has(tm[ty2][tx2])) this.y = ny;
        }

        // ── Спрайт-анимация ──────────────────────────────────────────
        // Направление: если есть горизонтальное движение — обновляем,
        // иначе оставляем последнее (face.x уже учитывает атаку).
        this.spriteDir = faceToDirection(this.face.x, this.face.y, this.spriteDir);

        // Определяем нужную анимацию по приоритету:
        // death > attack (attackAnim) > ability (abilityActive) > walk > idle
        let targetAnim;
        if (this.hp <= 0)             targetAnim = 'death';
        else if (this.attackAnim > 0) targetAnim = 'attack';
        else if (this.abilityActive > 0 && this.spriteAnim !== 'ability')
                                       targetAnim = 'ability';
        else if (isMoving)             targetAnim = 'walk';
        else                           targetAnim = 'idle';

        // Сброс кадра при смене анимации
        if (targetAnim !== this.spriteAnim) {
            this.spriteAnim = targetAnim;
            this.spriteFrame = 0;
            this.spriteTimer = 0;
        }

        // FPS и число кадров из конфига, fallback на хардкод
        const cfg = getAnimConfig(HERO_SPRITE_KEYS[this.cls] || 'hero_warrior', this.spriteAnim);
        const animFps  = cfg ? cfg.fps  : ({ idle:6, walk:10, attack:14, ability:12, death:5 }[this.spriteAnim] || 8);
        const maxCols  = cfg ? cfg.cols : SPRITE_COLS;
        this.spriteTimer += dt;
        const framesPerTick = 60 / animFps;
        if (this.spriteTimer >= framesPerTick) {
            this.spriteTimer -= framesPerTick;
            if (this.spriteAnim === 'death') {
                this.spriteFrame = Math.min(this.spriteFrame + 1, maxCols - 1);
            } else {
                this.spriteFrame = (this.spriteFrame + 1) % maxCols;
            }
        }
        // ─────────────────────────────────────────────────────────────
        // Автоатака (только в подземелье)
        if (G.depth > 0 && enemies.length > 0) {
            this.autoAttack(enemies, parts, floats, projs);
        }
        // Регенерация маны для мага
        if (this.cls === 'mage' && this.mp < this.maxmp) {
            this.mp = Math.min(this.maxmp, this.mp + 0.05 * dt);
        }
        // Кнопка способности (вторая кнопка, бывшая "магия")
        if (inp.atk) { inp.atk = false; }   // зарезервировано (автоатака уже идёт сама)
        if (inp.spell) { inp.spell = false; this.useAbility(floats); }
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