// ============================================================
//  PLAYER EQUIPMENT — экипировка и бонусы от неё
// ============================================================
// С этой версии equipment[slot] хранит ПОЛНЫЙ инстанс предмета
// { instanceId, type, level, enchantId }, а не просто строку типа.
// Это даёт индивидуальные улучшения — два одинаковых меча с разным
// instanceId прокачиваются независимо (см. core/ItemInstance.js).
Object.assign(Player.prototype, {
    // Пересчитать бонусы от надетой экипировки
    recalcEqBonus() {
        const b = { atk: 0, def: 0, hp: 0, mp: 0, spd: 0, atkSpd: 0 };
        this.itemAbilities = []; // боевые абилки надетых предметов (для CombatEngine)

        for (const [slot, instance] of Object.entries(this.equipment || {})) {
            if (!instance) continue;
            const stats = getItemEffectiveStats(instance); // база + уровень улучшения
            if (!stats) continue;
            if (stats.atk)  b.atk  += stats.atk;
            if (stats.def)  b.def  += stats.def;
            if (stats.hp)   b.hp   += stats.hp;
            if (stats.mp)   b.mp   += stats.mp;
            if (stats.spd)  b.spd  += stats.spd;
            if (stats.atkSpd) b.atkSpd += stats.atkSpd;
            if (stats.itemAbility) this.itemAbilities.push(stats.itemAbility);
        }
        this.eqBonus = b;

        // Эффективные боевые характеристики = база + бонус экипировки.
        // ВАЖНО: используются в бою (computeDamage/hurt) и в HUD,
        // тогда как this.atk/def/maxhp/maxmp остаются "базой" для
        // статов/левелапа/мастеров — их не трогаем напрямую.
        this.effAtk   = this.atk   + b.atk;
        this.effDef   = this.def   + b.def;
        this.effMaxhp = this.maxhp + b.hp;
        this.effMaxmp = this.maxmp + b.mp;
        this.effSpd   = this.spd   + b.spd;
    },

    // Надеть предмет из инвентаря (по индексу)
    equip(invIdx, floats) {
        const item = this.inventory[invIdx];
        if (!item) return;
        const def = ITEM_DEFS[item.type];
        if (!def || def.slot === 'consumable') return;
        const slot = def.slot; // 'weapon'|'armor'|'ring'

        // Снять текущий предмет в этом слоте — обратно в инвентарь целиком
        if (this.equipment[slot]) {
            this.inventory.push(this.equipment[slot]);
        }
        this.equipment[slot] = item; // сохраняем весь инстанс, не только type
        this.inventory.splice(invIdx, 1);
        this.recalcEqBonus();

        const displayName = getItemDisplayName(item);
        if (floats) floats.push(new FText(this.x, this.y - CFG.TILE, def.icon + ' ' + displayName + ' надет', '#ffd700', 13));
        sound.play('pickup');
        saveGame(true);
    },

    // Снять экипировку в слоте → в инвентарь
    unequip(slot, floats) {
        if (!this.equipment[slot]) return;
        this.inventory.push(this.equipment[slot]);
        this.equipment[slot] = null;
        this.recalcEqBonus();
        if (floats) floats.push(new FText(this.x, this.y - CFG.TILE, 'Снято', '#aaa', 12));
        saveGame(true);
    },

    // Проверить, надет ли предмет с данным instanceId (используется при
    // продаже у Торговца — нельзя продать надетую вещь, сначала снять)
    isItemEquipped(instanceId) {
        return Object.values(this.equipment || {}).some(eq => eq && eq.instanceId === instanceId);
    }
});
