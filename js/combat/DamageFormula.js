// ============================================================
//  DAMAGE FORMULA — единая формула урона для всех источников
//  (ближний бой, стрелы, файрбол, урон по игроку)
// ============================================================
// Броня снижает урон по формуле убывающей отдачи (как в MOBA-играх):
//   reduction = armor / (armor + K)
// где K — константа масштаба. Высокая броня не даёт неуязвимости —
// минимум 1 урон всегда проходит.
const ARMOR_K = 50;

function armorReduction(armor) {
    const a = Math.max(0, armor || 0);
    return a / (a + ARMOR_K); // 0..~0.9, никогда не достигает 1
}

function applyArmor(rawDamage, armor) {
    const reduced = rawDamage * (1 - armorReduction(armor));
    return Math.max(1, Math.round(reduced));
}

// ============================================================
//  ОСНОВНАЯ ФОРМУЛА УРОНА
// ============================================================
// attackerAtk: сырое значение атаки атакующего (this.effAtk и т.п.)
// defenderDef: защита цели
// attacker: объект атакующего (для getCritChance/зачарований)
// options: { forceCrit, noVariance, baseDamage }
// Возвращает { damage, isCrit }
function computeDamage(attackerAtk, defenderDef, attacker, options = {}) {
    const rawBase = options.baseDamage ?? attackerAtk;
    // ±10% разброс для живости чисел (снаряды идут без разброса — noVariance)
    const variance = options.noVariance ? 1 : (0.9 + Math.random() * 0.2);
    let base = rawBase * variance;

    const isCrit = rollCrit(attacker, options.forceCrit);
    if (isCrit) base *= CRIT_MULTIPLIER;

    const finalDamage = applyArmor(base, defenderDef);
    return { damage: finalDamage, isCrit };
}

// ============================================================
//  LIFESTEAL (похищение жизни)
// ============================================================
function applyLifesteal(attacker, damageDealt) {
    if (!attacker || !attacker.enchants) return 0;
    const hasLifesteal = Object.values(attacker.enchants).includes('lifesteal');
    if (!hasLifesteal) return 0;
    const heal = Math.round(damageDealt * 0.05);
    if (heal > 0 && attacker.hp < attacker.effMaxhp) {
        attacker.hp = Math.min(attacker.effMaxhp, attacker.hp + heal);
        return heal;
    }
    return 0;
}
