// ============================================================
//  ITEM ABILITIES — боевые эффекты зачарованных предметов
// ============================================================
// Вызывается из CombatEngine после каждого успешного удара игрока.
// attacker.itemAbilities заполняется в PlayerEquipment.recalcEqBonus()
// из ITEM_ENCHANTS надетых предметов (яд/сплэш/ускорение/заморозка/вампиризм).
//
// Дизайн: каждая абилка триггерится независимо от остальных (можно
// одновременно иметь яд на оружии и сплэш на кольце — если появятся
// кольца с абилками в будущем).

function processItemAbilities(attacker, target, dmg, parts, floats, enemies) {
    if (!attacker.itemAbilities || attacker.itemAbilities.length === 0) return;

    for (const ability of attacker.itemAbilities) {
        if (Math.random() >= ability.triggerChance) continue;

        switch (ability.effect) {
            case 'poison':
                _applyPoison(target, attacker, ability, floats);
                break;
            case 'splash':
                _applySplash(attacker, target, dmg, ability, parts, floats, enemies);
                break;
            case 'haste':
                _applyHaste(attacker, ability, floats);
                break;
            case 'freeze':
                _applyFreeze(target, ability, floats);
                break;
            case 'itemLifesteal':
                _applyItemLifesteal(attacker, dmg, ability, floats);
                break;
        }
    }
}

// ── Яд: тикающий урон на несколько секунд ──
function _applyPoison(target, attacker, ability, floats) {
    if (!target.alive) return;
    target.poisonStacks = target.poisonStacks || [];
    target.poisonStacks.push({
        dmgPerTick: Math.max(1, Math.round(attacker.effAtk * ability.poisonDmgPerTick)),
        ticksLeft: ability.poisonTicks,
        tickTimer: ability.poisonTickInterval
    });
    const ex = target.x * CFG.TILE + CFG.TILE/2;
    const ey = target.y * CFG.TILE + CFG.TILE/2;
    floats.push(new FText(ex, ey - CFG.TILE * 2, '☠️ Отравлен', '#66cc44', 12));
}

// ── Сплэш: доп. урон по врагам рядом с целью ──
function _applySplash(attacker, target, dmg, ability, parts, floats, enemies) {
    if (!enemies) return;
    const splashDmg = Math.max(1, Math.round(dmg * ability.splashDamageMult));
    const radiusPx = ability.splashRadius * CFG.TILE;

    for (const other of enemies) {
        if (!other.alive || other === target) continue;
        const ox = other.x * CFG.TILE + CFG.TILE/2;
        const oy = other.y * CFG.TILE + CFG.TILE/2;
        const tx = target.x * CFG.TILE + CFG.TILE/2;
        const ty = target.y * CFG.TILE + CFG.TILE/2;
        if (Math.hypot(ox - tx, oy - ty) > radiusPx) continue;

        other.hp -= splashDmg;
        floats.push(new FText(ox, oy - CFG.TILE, '-' + splashDmg, '#ff8844', 12));
        for (let i = 0; i < 5; i++) parts.push(new Particle(ox, oy, '#ff8844'));
        if (other.hp <= 0) resolveEnemyDeath(other, parts, floats);
    }
}

// ── Ускорение: частично сбрасывает кулдаун атаки ──
function _applyHaste(attacker, ability, floats) {
    if (attacker.acd > 0) {
        attacker.acd = Math.round(attacker.acd * (1 - ability.hasteReduction));
        floats.push(new FText(attacker.x, attacker.y - CFG.TILE * 1.5, '💨', '#ffee44', 14));
    }
}

// ── Заморозка: враг не двигается некоторое время ──
function _applyFreeze(target, ability, floats) {
    if (!target.alive) return;
    target.frozenTimer = Math.max(target.frozenTimer || 0, ability.freezeDuration);
    const ex = target.x * CFG.TILE + CFG.TILE/2;
    const ey = target.y * CFG.TILE + CFG.TILE/2;
    floats.push(new FText(ex, ey - CFG.TILE * 1.8, '❄️ Заморожен', '#66ccff', 12));
}

// ── Вампиризм от конкретного предмета (отдельно от зачарования у мастера) ──
function _applyItemLifesteal(attacker, dmg, ability, floats) {
    const heal = Math.round(dmg * ability.lifestealPercent);
    if (heal > 0 && attacker.hp < attacker.effMaxhp) {
        attacker.hp = Math.min(attacker.effMaxhp, attacker.hp + heal);
        floats.push(new FText(attacker.x, attacker.y - CFG.TILE * 1.1, '🩸+' + heal, '#ff6688', 11));
    }
}

// ============================================================
//  Тик статус-эффектов (яд/заморозка) — вызывается из Enemy.update()
// ============================================================
function updateEnemyStatusEffects(enemy, dt, parts, floats) {
    // Яд
    if (enemy.poisonStacks && enemy.poisonStacks.length > 0) {
        for (let i = enemy.poisonStacks.length - 1; i >= 0; i--) {
            const stack = enemy.poisonStacks[i];
            stack.tickTimer -= dt;
            if (stack.tickTimer <= 0) {
                stack.tickTimer += 60; // 1 сек между тиками (нормализовано к 60fps в вызывающем коде через dt)
                stack.ticksLeft--;
                enemy.hp -= stack.dmgPerTick;
                const ex = enemy.x * CFG.TILE + CFG.TILE/2;
                const ey = enemy.y * CFG.TILE + CFG.TILE/2;
                floats.push(new FText(ex, ey - CFG.TILE * 0.8, '-' + stack.dmgPerTick, '#66cc44', 11));
                for (let j = 0; j < 3; j++) parts.push(new Particle(ex, ey, '#66cc44'));
                if (enemy.hp <= 0) {
                    resolveEnemyDeath(enemy, parts, floats);
                    return;
                }
            }
            if (stack.ticksLeft <= 0) enemy.poisonStacks.splice(i, 1);
        }
    }

    // Заморозка — таймер тикает, движение блокируется в Enemy.update() отдельной проверкой
    if (enemy.frozenTimer > 0) {
        enemy.frozenTimer -= dt;
    }
}
