// ============================================================
//  ITEM INSTANCE — уникальные экземпляры предметов
// ============================================================
// До этой версии инвентарь хранил предметы как { type: 'sword_iron' } —
// два одинаковых меча были неразличимы, поэтому улучшение оружия
// у мастера (p.itemUpgrades[itemId]) применялось ко ВСЕМ мечам этого
// типа сразу, а не к конкретному экземпляру.
//
// Теперь каждый предмет при создании получает свой instanceId —
// простой счётчик 1,2,3... Инвентарь хранит:
//   { instanceId: 47, type: 'sword_iron', level: 0, enchantId: null }
// Улучшения/зачарования пишутся в p.itemUpgrades[instanceId], а не
// в p.itemUpgrades[type] — теперь это разные записи для разных мечей.

// Глобальный счётчик, сохраняется в save (см. SaveSchema.js)
let _nextItemInstanceId = 1;

function nextItemInstanceId() {
    return _nextItemInstanceId++;
}

// Восстановить счётчик после загрузки сейва (чтобы новые ID не
// пересекались со старыми, если игрок играл раньше этой версии)
function restoreItemInstanceCounter(savedValue) {
    _nextItemInstanceId = Math.max(_nextItemInstanceId, savedValue || 1);
}

// Создать новый экземпляр предмета (используется при дропе/покупке)
function createItemInstance(type) {
    return {
        instanceId: nextItemInstanceId(),
        type: type,
        level: 0,        // уровень улучшения у мастера (+0, +1, +2...)
        enchantId: null  // ключ зачарования (null = нет)
    };
}

// Получить эффективные характеристики предмета с учётом уровня
// улучшения и зачарования. def — база из ITEM_DEFS, level — из инстанса.
function getItemEffectiveStats(instance) {
    const def = ITEM_DEFS[instance.type];
    if (!def) return {};

    const stats = { ...def };
    const level = instance.level || 0;

    // Каждый уровень улучшения = +20% к основному бонусу (округление вверх)
    // Основной бонус — то, что определяет тип предмета (atk для оружия, def для брони)
    if (level > 0) {
        if (def.atk) stats.atk = def.atk + Math.ceil(def.atk * 0.2 * level);
        if (def.def) stats.def = def.def + Math.ceil(def.def * 0.2 * level);
    }

    // Применяем зачарование (добавляет отдельную способность предмета)
    if (instance.enchantId) {
        const ench = ITEM_ENCHANTS[instance.enchantId];
        if (ench) stats.itemAbility = ench;
    }

    return stats;
}

// Строка вида "Меч +3" — имя с учётом уровня улучшения
function getItemDisplayName(instance) {
    const def = ITEM_DEFS[instance.type];
    if (!def) return instance.type;
    const level = instance.level || 0;
    return level > 0 ? `${def.name} +${level}` : def.name;
}

// Найти инстанс предмета по instanceId в инвентаре или экипировке игрока
function findItemInstance(player, instanceId) {
    const inInv = (player.inventory || []).find(i => i.instanceId === instanceId);
    if (inInv) return inInv;
    for (const slot of Object.keys(player.equipment || {})) {
        const eq = player.equipment[slot];
        if (eq && eq.instanceId === instanceId) return eq;
    }
    return null;
}
