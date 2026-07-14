// ============================================================
//  PLAYER COMBAT — атака, способность, получение урона
// ============================================================
// Расчёт урона/крита/брони — combat/DamageFormula.js, CritSystem.js.
// Обработка смерти врага — combat/EnemyDeath.js.
// Единая точка входа для нанесения урона — combat/CombatEngine.js.
// Этот файл отвечает только за прицеливание, кулдауны и создание
// снарядов — сам урон не считает и эффекты не рисует напрямую.
Object.assign(Player.prototype, {
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
    },

    // Нанести урон врагу — тонкая обёртка над CombatEngine.attack()
    // (имя метода сохранено для обратной совместимости вызовов из autoAttack)
    _dealDamage(e, parts, floats, enemies) {
        const outcome = CombatEngine.attack(this, e, parts, floats, { enemies });
        return outcome.damage;
    },

    // Урон по цели от снаряда (стрела/файрбол) — тонкая обёртка над CombatEngine
    _dealProjDamage(e, baseDamage, parts, floats, enemies) {
        const outcome = CombatEngine.attackWithProjectile(this, e, baseDamage, parts, floats, enemies);
        return outcome.damage;
    },

    // Автоатака — вызывается каждый кадр из update()
    autoAttack(enemies, parts, floats, projs) {
        if (this.acd > 0) return;

        // Эффективный кулдаун атаки с учётом бонуса скорости атаки от экипировки
        // eqBonus.atkSpd: каждые 0.1 = -5% кулдауна (макс -50%)
        const atkSpdBonus = Math.min(0.5, ((this.eqBonus?.atkSpd || 0) + (this._atkSpdStat || 0)) * 0.5);
        const effCD = (base) => Math.max(10, Math.round(base * (1 - atkSpdBonus)));

        const volleyActive = this.cls === 'archer' && this.abilityActive > 0;

        if (this.atkType === 'melee') {
            // Мечник: бьёт ближайшего в радиусе 2 тайла
            const target = this._nearestEnemy(enemies, this.atkRange);
            if (!target) return;
            const ab = ABILITIES.warrior;
            const rage = this.abilityActive > 0;
            this.acd = rage ? Math.round(effCD(this.atkCD) / ab.atkSpeedMult) : effCD(this.atkCD);
            this.attackAnim = 12;
            const ex = target.x * CFG.TILE + CFG.TILE/2;
            const ey = target.y * CFG.TILE + CFG.TILE/2;
            this.attackAngle = Math.atan2(ey - this.y, ex - this.x);
            this.face = { x: Math.cos(this.attackAngle), y: Math.sin(this.attackAngle) };
            this._dealDamage(target, parts, floats, enemies);

        } else if (this.atkType === 'arrow') {
            // Лучник: стреляет стрелой (или веером, если активна способность)
            const target = this._nearestEnemy(enemies, this.atkRange, true);
            if (!target) return;
            const ab = ABILITIES.archer;
            this.acd = volleyActive ? Math.round(effCD(this.atkCD) / ab.atkSpeedMult) : effCD(this.atkCD);
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
                    dmg: this.effAtk, angle: ang,
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
            this.acd = effCD(this.atkCD);
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
                dmg: Math.round(this.effAtk * 1.4), angle: ang,
                alive: true, life: Math.ceil(this.atkRange * CFG.TILE / spd) + 5,
                trail: [], type: 'fireball', spriteFrame: 0, spriteTimer: 0,
                color: '#ff6622', trailColor: '#ff4400'
            });
            sound.play('portal');
        }
    },

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
            const healAmt = Math.round(this.effMaxhp * ab.healPercent);
            this.hp = Math.min(this.effMaxhp, this.hp + healAmt);
            this.abilityActive = ab.dur; // используется для реген-тика
            floats.push(new FText(this.x, this.y - CFG.TILE * 1.4, '✨ +' + healAmt + ' HP', '#44ff88', 18));
            sound.play('levelup');
            tgVibrate('medium');
        }
        return true;
    },

    // Оставляем для обратной совместимости
    melee(enemies, parts, floats) {
        this.autoAttack(enemies, parts, floats, G.projs);
    },

    // Получить урон от врага — тонкая обёртка над CombatEngine.attackPlayer()
    // Сигнатура сохранена (dmg, floats) для обратной совместимости,
    // но теперь реальный атакующий передаётся через _updateEnemyContact.
    hurt(dmg, floats, attackerEnemy = null) {
        if (!attackerEnemy) {
            // Фоллбэк для случаев, когда конкретный враг неизвестен —
            // эмулируем "виртуального" атакующего с нужным atk
            attackerEnemy = { atk: dmg };
        }
        return CombatEngine.attackPlayer(attackerEnemy, this, floats);
    },

    // ── Ниже методы, вызываемые из update() (Player.js) ──

    _updateAbilityTick(dt) {
        // Тик активного эффекта способности
        if (this.abilityActive > 0) {
            if (this.cls === 'mage') {
                // Реген% от maxHP в секунду (60 кадров = 1 сек)
                const ab = ABILITIES.mage;
                this.hp = Math.min(this.effMaxhp, this.hp + (ab.regenPerSec * this.effMaxhp / 60) * dt);
            }
            this.abilityActive -= dt;
            if (this.abilityActive < 0) this.abilityActive = 0;
        }
        
    },

    _updateCombatTick(inp, enemies, parts, floats, projs, dt) {
        // Автоатака (только в подземелье)
        if (G.depth > 0 && enemies.length > 0) {
            this.autoAttack(enemies, parts, floats, projs);
        }
        // Регенерация маны: база — только у мага, плюс бонус от зачарования
        // "Мистическое" (_enchantMpRegen), которое раньше нигде не читалось.
        const baseMpRegen = (this.cls === 'mage') ? 0.05 : 0;
        const enchantMpRegen = this._enchantMpRegen || 0;
        const totalMpRegen = baseMpRegen + enchantMpRegen;
        if (totalMpRegen > 0 && this.mp < this.effMaxmp) {
            this.mp = Math.min(this.effMaxmp, this.mp + totalMpRegen * dt);
        }
        // Кнопка способности (вторая кнопка, бывшая "магия")
        if (inp.atk) { inp.atk = false; }   // зарезервировано (автоатака уже идёт сама)
        if (inp.spell) { inp.spell = false; this.useAbility(floats); }
        if (inp.useSlot) { this.useSlot(inp.useSlot, floats); inp.useSlot = null; }
        
    },

    _updateEnemyContact(enemies, floats) {
        // Урон от врагов (только в подземелье)
        if (G.depth > 0) {
            for (const e of enemies) {
                if (!e.alive) continue;
                if (e.frozenTimer > 0) continue; // заморожен — атаковать не может
                const ex = e.x * CFG.TILE + CFG.TILE/2;
                const ey = e.y * CFG.TILE + CFG.TILE/2;
                if (Math.hypot(this.x - ex, this.y - ey) < CFG.TILE * 0.85 && e.acd <= 0) {
                    e.acd = 60;
                    this.hurt(e.atk, floats, e);
                }
            }
        }
        
    }
});
