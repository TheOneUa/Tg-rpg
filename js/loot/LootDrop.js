// ============================================================
//  ДРОП ЛУТА ИЗ МОНСТРОВ
// ============================================================
const RESOURCE_KEYS = ['ore', 'wood', 'essence'];

function dropLootFromEnemy(e, floats) {
    const p = G.p;
    const ex = e.x * CFG.TILE + CFG.TILE/2;
    const ey = e.y * CFG.TILE + CFG.TILE/2;

    // 1. Ресурсы (Руда/Древесина/Эссенция)
    let resKey = null, resAmt = 0;
    if (e.isBoss) {
        resKey = RESOURCE_KEYS[Math.floor(Math.random() * RESOURCE_KEYS.length)];
        resAmt = 2 + Math.floor(Math.random() * 2);
    } else if (Math.random() < 0.08) {
        resKey = RESOURCE_KEYS[Math.floor(Math.random() * RESOURCE_KEYS.length)];
        resAmt = 1;
    }
    if (resKey) {
        p.resources[resKey] = (p.resources[resKey] || 0) + resAmt;
        floats.push(new FText(ex, ey - CFG.TILE * 2.2, RESOURCES[resKey].icon + ' +' + resAmt, '#88e0ff', 13));
    }

    // 2. Золото — масштабируется с глубиной подземелья
    const goldAmt = getGoldDropAmount(G.depth, e.isBoss);
    if (Math.random() < (e.isBoss ? 1 : 0.4)) {
        p.gold += goldAmt;
        stats.totalGold += goldAmt;
        onGoldEarned(goldAmt);
        floats.push(new FText(ex, ey - CFG.TILE * 1.9, '+' + goldAmt + '💰', '#ffd700', 13));
    }

    // 3. Предметы по таблице лута — появляются на полу как уникальные инстансы
    const drops = rollLoot(e.isBoss, G.depth);
    if (e.isBoss) onBossKilled();
    drops.forEach((itemId, i) => {
        const def = ITEM_DEFS[itemId];
        if (!def) return;

        // Расходники (зелья/золото из таблицы) — без инстанса
        const isEquippable = def.slot === 'weapon' || def.slot === 'armor' || def.slot === 'ring';
        let payload = itemId;
        if (isEquippable) {
            const instance = createItemInstance(itemId);
            // Шанс зачарования боевой абилкой — растёт с глубиной, выше у боссов
            if (Math.random() < rollItemEnchantChance(G.depth, e.isBoss)) {
                instance.enchantId = rollRandomItemEnchant();
            }
            payload = instance;
        }

        // Раскладываем предметы рядом с позицией врага
        const ox = Math.round(e.x + (i % 2 === 0 ? -1 : 1) * (Math.random() * 0.8));
        const oy = Math.round(e.y + (i > 1 ? 1 : 0));
        const tm = G.dungeonGrid;
        const tx = Math.max(0, Math.min(CFG.D_COLS-1, ox));
        const ty = Math.max(0, Math.min(CFG.D_ROWS-1, oy));
        if (tm && !SOLID.has(tm[ty][tx])) {
            G.items.push(new Item(tx, ty, payload));
        } else {
            G.items.push(new Item(Math.round(e.x), Math.round(e.y), payload));
        }

        const enchantTag = isEquippable && payload.enchantId ? ' ' + ITEM_ENCHANTS[payload.enchantId].icon : '';
        floats.push(new FText(ex, ey - CFG.TILE * 1.6 - i*16, def.icon + ' ' + def.name + enchantTag, '#ffd700', 12));
    });
}

// Оставляем для обратной совместимости
function dropResourceFromEnemy(e, floats) {
    dropLootFromEnemy(e, floats);
}
