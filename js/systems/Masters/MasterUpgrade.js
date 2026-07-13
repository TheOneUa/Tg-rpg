// ============================================================
//  MASTER UI — вкладка "Улучшить"
// ============================================================
// Улучшает КОНКРЕТНЫЙ инстанс надетого предмета (instance.level++).
// Цена растёт по экспоненциальной кривой от текущего уровня —
// без потолка, как и статы у мастера (см. upgradeCost в Masters.js).
Object.assign(MasterUI, {
    renderUpgrade() {
        const p = this.p, m = this.m, res = this.res, masterId = this.masterId;
        const eq = p.equipment || {};
        const equippedItems = Object.entries(eq).filter(([,inst]) => inst).map(([slot, inst]) => ({ slot, inst }));

        mbody.innerHTML = this.tabsHtml('upgrade') + `
            <div style="color:#666;font-size:12px;margin-bottom:8px;padding:0 4px">
                Улучшает надетый предмет: +20% к основному бонусу за уровень<br>
                Цена растёт с каждым улучшением конкретной вещи
            </div>
            ${equippedItems.length === 0
                ? '<div style="color:#444;padding:16px;text-align:center">Наденьте предмет для улучшения</div>'
                : equippedItems.map(({slot, inst}) => {
                    const def = ITEM_DEFS[inst.type];
                    if (!def) return '';
                    const level = inst.level || 0;
                    const cost = upgradeCost(masterId, level);
                    const canAfford = p.gold >= cost.gold && (p.resources[m.resource] || 0) >= cost.res;
                    const effStats = getItemEffectiveStats(inst);
                    const displayName = getItemDisplayName(inst);
                    return `<div class="mitem">
                        <div class="micon" style="font-size:22px;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1)">${def.icon}</div>
                        <div class="minfo">
                            <div class="mname">${displayName}</div>
                            <div class="mdesc">${_itemStatStr(effStats)}</div>
                            <div class="mprice">💰${cost.gold}  ${res.icon}${cost.res}</div>
                        </div>
                        <button class="mbuy" ${canAfford?'':'disabled'} data-upslot="${slot}">Улучшить</button>
                    </div>`;
                }).join('')}`;

        this.attachTabBtns();
        mbody.querySelectorAll('[data-upslot]').forEach(btn => {
            btn.addEventListener('click', () => {
                const slot = btn.dataset.upslot;
                const inst = p.equipment[slot];
                if (!inst) return;
                const level = inst.level || 0;
                const cost = upgradeCost(masterId, level);
                if (p.gold < cost.gold || (p.resources[m.resource]||0) < cost.res) return;

                p.gold -= cost.gold;
                p.resources[m.resource] -= cost.res;
                inst.level = level + 1; // улучшаем ИМЕННО этот инстанс, не тип
                p.recalcEqBonus();

                const def = ITEM_DEFS[inst.type];
                showQNotif('⬆️ ' + getItemDisplayName(inst) + '!');
                sound.play('crit');
                saveGame(true);
                this.render();
            });
        });
    }
});
