// ============================================================
//  ЭКРАН ПЕРСОНАЖА — вкладка "Инвентарь"
// ============================================================
function _renderInvTab(p) {
    const inv = p.inventory || [];
    const grid = document.getElementById('inv-grid');
    const empty = document.getElementById('inv-empty');

    if (!inv.length) {
        grid.innerHTML = '';
        empty.style.display = '';
        return;
    }
    empty.style.display = 'none';
    grid.innerHTML = inv.map((instance, idx) => {
        const def = ITEM_DEFS[instance.type] || {};
        const effStats = getItemEffectiveStats(instance);
        const displayName = getItemDisplayName(instance);
        const classMismatch = def.forClass && def.forClass !== p.cls;
        const abilityIcon = instance.enchantId ? ITEM_ENCHANTS[instance.enchantId]?.icon : '';
        return `<div class="inv-item rarity-${def.rarity||'common'}" data-idx="${idx}" style="${classMismatch ? 'opacity:.55' : ''}">
            <span class="inv-item-icon">${def.icon || '❓'}${abilityIcon ? ' ' + abilityIcon : ''}</span>
            <div class="inv-item-name">${displayName}</div>
            <div class="inv-item-stats">${_itemStatStr(effStats)}</div>
        </div>`;
    }).join('');

    grid.querySelectorAll('.inv-item').forEach(el => {
        bindTapButton(el, () => {
            const idx = parseInt(el.dataset.idx);
            const instance = p.inventory[idx];
            if (!instance) return;
            const def = ITEM_DEFS[instance.type];
            if (!def || def.slot === 'consumable') return;
            p.equip(idx, G.floats);
            _renderCharScreen();
        });
    });
}
