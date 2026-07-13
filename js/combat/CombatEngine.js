// ============================================================
//  COMBAT ENGINE — единая точка входа для любого урона в игре
// ============================================================
// Начиная с этой версии, ни один другой код не наносит урон
// напрямую (не пишет в e.hp -= X или this.hp -= X). Весь урон
// идёт через CombatEngine.attack(...) или CombatEngine.applyDamageToPlayer(...).
//
// Это не меняет игровые формулы — DamageFormula.js/CritSystem.js/
// EnemyDeath.js остаются как были, CombatEngine их вызывает по
// порядку и берёт на себя эффекты (частицы/текст/звук/вибро),
// которые раньше были продублированы в нескольких местах Player.js.
//
// Зачем: любая будущая механика (яд, вампиризм, PvP, новый класс)
// добавляется ОДНИМ изменением здесь, а не поиском по всем файлам,
// которые наносят урон.

const CombatEngine = {

    // ────────────────────────────────────────────────────────
    // ИГРОК → ВРАГ (ближний бой)
    // attacker: Player, target: Enemy
    // Возвращает { damage, isCrit, targetDied, healed }
    // ────────────────────────────────────────────────────────
    attack(attacker, target, parts, floats, options = {}) {
        if (!this.canAttack(attacker, target)) {
            return { damage: 0, isCrit: false, targetDied: false, healed: 0 };
        }

        const result = computeDamage(attacker.effAtk, target.def, attacker, options);
        const outcome = this._applyToEnemy(attacker, target, result.damage, result.isCrit, parts, floats, options.enemies);

        if (result.isCrit) {
            target.stunTimer = 20; // стан только от гарантированного/случайного крита в ближнем бою
        }

        return outcome;
    },

    // ────────────────────────────────────────────────────────
    // СНАРЯД (стрела/файрбол) → ВРАГ
    // baseDamage уже посчитан при выпуске снаряда (Player.effAtk на момент выстрела)
    // ────────────────────────────────────────────────────────
    attackWithProjectile(attacker, target, baseDamage, parts, floats, enemies) {
        if (!target || !target.alive) {
            return { damage: 0, isCrit: false, targetDied: false, healed: 0 };
        }
        const result = computeDamage(baseDamage, target.def, attacker, { noVariance: true });
        return this._applyToEnemy(attacker, target, result.damage, result.isCrit, parts, floats, enemies);
    },

    // ────────────────────────────────────────────────────────
    // ВРАГ → ИГРОК
    // Возвращает { damage, blocked, dodged }
    // ────────────────────────────────────────────────────────
    attackPlayer(enemy, player, floats) {
        if (Math.random() < player.blockChance) {
            floats.push(new FText(player.x, player.y - CFG.TILE * 1.2, '🛡 БЛОК!', '#88ccff', 14));
            sound.play('block');
            tgVibrate('light');
            return { damage: 0, blocked: true, dodged: false };
        }
        if (Math.random() < player.dodgeChance) {
            floats.push(new FText(player.x, player.y - CFG.TILE * 1.2, '💨 УКЛОН!', '#88ff88', 14));
            sound.play('dodge');
            tgVibrate('light');
            return { damage: 0, blocked: false, dodged: true };
        }

        const dmg = applyArmor(enemy.atk, player.effDef);
        player.hp -= dmg;
        player.flash = 12;
        floats.push(new FText(player.x, player.y - CFG.TILE/2, '-' + dmg, '#ff4444', 13));
        sound.play('hit');
        tgVibrate('heavy');

        return { damage: dmg, blocked: false, dodged: false };
    },

    // ────────────────────────────────────────────────────────
    // Внутренний шаг: применить готовый урон к врагу + эффекты + смерть
    // (общая часть attack() и attackWithProjectile())
    // ────────────────────────────────────────────────────────
    _applyToEnemy(attacker, target, dmg, isCrit, parts, floats, enemies) {
        const ex = target.x * CFG.TILE + CFG.TILE/2;
        const ey = target.y * CFG.TILE + CFG.TILE/2;

        target.hp -= dmg;
        floats.push(new FText(ex, ey - CFG.TILE, '-' + dmg, isCrit ? '#ff8822' : '#ff4444', isCrit ? 16 : 13));
        for (let i = 0; i < (isCrit ? 12 : 7); i++) parts.push(new Particle(ex, ey, '#e04040'));

        const healed = applyLifesteal(attacker, dmg);
        if (healed > 0) {
            floats.push(new FText(attacker.x, attacker.y - CFG.TILE * 1.3, '🩸+' + healed, '#ff6688', 12));
        }

        if (isCrit) {
            floats.push(new FText(ex, ey - CFG.TILE * 1.6, '💥 КРИТ!', '#ff4422', 16));
            sound.play('crit');
            tgVibrate('heavy');
        } else {
            sound.play('hit');
            tgVibrate('light');
        }

        // Боевые абилки надетых предметов (яд/сплэш/ускорение/заморозка/вампиризм)
        if (target.alive && attacker.itemAbilities) {
            processItemAbilities(attacker, target, dmg, parts, floats, enemies);
        }

        let targetDied = false;
        if (target.hp <= 0) {
            resolveEnemyDeath(target, parts, floats);
            targetDied = true;
        }

        return { damage: dmg, isCrit, targetDied, healed };
    },

    // ────────────────────────────────────────────────────────
    // Проверка возможности атаки (жив ли атакующий/цель, кулдаун и т.д.)
    // Пока минимальная — расширяется по мере добавления статус-эффектов
    // (стан атакующего, немота для магов и т.п.)
    // ────────────────────────────────────────────────────────
    canAttack(attacker, target) {
        if (!target || !target.alive) return false;
        if (attacker.stunTimer > 0) return false; // на будущее — если игрок получит стан
        return true;
    }
};
