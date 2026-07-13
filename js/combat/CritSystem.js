// ============================================================
//  CRIT SYSTEM — шанс критического удара
// ============================================================
// Крит применяется ко всем видам атак игрока (ближний бой, стрела,
// файрбол) через единую формулу в DamageFormula.js. Учитывает
// зачарование "Острое лезвие" (critup) и способность мечника "Ярость"
// (гарантированный крит на время действия способности).

const BASE_CRIT_CHANCE = 0.15;
const CRIT_MULTIPLIER  = 2.0;

// Считает итоговый шанс крита с учётом зачарований и способностей
function getCritChance(attacker) {
    if (!attacker) return BASE_CRIT_CHANCE;
    let chance = BASE_CRIT_CHANCE;
    if (attacker._enchantCrit) chance += attacker._enchantCrit;
    if (attacker.cls === 'warrior' && attacker.abilityActive > 0) return 1.0;
    return Math.min(1, chance);
}

function rollCrit(attacker, forceCrit = false) {
    if (forceCrit) return true;
    return Math.random() < getCritChance(attacker);
}
