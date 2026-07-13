// ============================================================
//  ЭКРАН ПЕРСОНАЖА — вкладка "Экипировка"
// ============================================================
function _renderEquipTab(p) {
    const EQ_SLOTS = [
        { id: 'weapon', name: 'Оружие',   icon: '⚔️' },
        { id: 'armor',  name: 'Броня',     icon: '🛡️' },
        { id: 'ring',   name: 'Кольцо',    icon: '💍' },
    ];
    const eq = p.equipment || {};
    const bonus = p.eqBonus || {};

    document.getElementById('eq-slots').innerHTML = EQ_SLOTS.map(sl => {
        const instance = eq[sl.id];
        const def = instance ? ITEM_DEFS[instance.type] : null;
        const effStats = instance ? getItemEffectiveStats(instance) : null;
        const stats = effStats ? _itemStatStr(effStats) : '';
        const displayName = instance ? getItemDisplayName(instance) : (sl.name + ' — пусто');
        const rarityColor = def?.rarity === 'legendary' ? '#ffaa00' : def?.rarity === 'epic' ? '#cc44ff' : def?.rarity === 'rare' ? '#4499ff' : '#ddd';
        return `<div class="eq-slot-row">
            <span class="eq-slot-icon">${def ? def.icon : sl.icon}</span>
            <div class="eq-slot-info">
                <div class="eq-slot-name" style="color:${rarityColor}">${displayName}</div>
                <div class="eq-slot-stats">${stats}</div>
            </div>
            ${def ? `<button class="eq-slot-btn" data-slot="${sl.id}">Снять</button>` : ''}
        </div>`;
    }).join('');

    document.querySelectorAll('.eq-slot-btn').forEach(btn => {
        bindTapButton(btn, () => {
            p.unequip(btn.dataset.slot, G.floats);
            _renderCharScreen();
        });
    });

    const bonusLines = Object.entries(bonus).filter(([,v]) => v > 0)
        .map(([k,v]) => (STAT_GAINS[k]?.icon || '⬆️') + ' +' + (['spd','atkSpd'].includes(k) ? v.toFixed(2) : Math.round(v)));
    document.getElementById('eq-bonus-info').innerHTML = bonusLines.length
        ? 'Бонусы: ' + bonusLines.map(l => `<span>${l}</span>`).join(' ')
        : 'Наденьте предметы для получения бонусов';
}
