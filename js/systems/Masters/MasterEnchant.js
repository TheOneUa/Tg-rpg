// ============================================================
//  MASTER UI — вкладка "Зачаровать"
// ============================================================
Object.assign(MasterUI, {
    renderEnchant() {
        const p = this.p, m = this.m, res = this.res, masterId = this.masterId;
        const cost = enchantCost(masterId);
        const canAfford = p.gold >= cost.gold && (p.resources[m.resource]||0) >= cost.res;
        const eq = p.equipment || {};
        const enchants = p.enchants || {};

        mbody.innerHTML = this.tabsHtml('enchant') + `
            <div style="color:#666;font-size:12px;margin-bottom:8px;padding:0 4px">
                Добавляет уникальный бонус к надетому предмету<br>
                Стоимость: 💰${cost.gold}  ${res.icon}${cost.res}
            </div>
            <div style="color:#888;font-size:11px;margin-bottom:8px">Выберите зачарование:</div>
            ${ENCHANTS.map(en => {
                const alreadyHas = Object.values(enchants).includes(en.id);
                return `<div class="mitem">
                    <div class="micon" style="font-size:20px;display:flex;align-items:center;justify-content:center;background:rgba(180,80,255,.1);border:1px solid rgba(180,80,255,.3)">${en.icon}</div>
                    <div class="minfo">
                        <div class="mname">${en.name}</div>
                        <div class="mdesc">${en.desc}</div>
                        <div class="mprice">💰${cost.gold}  ${res.icon}${cost.res}</div>
                    </div>
                    <button class="mbuy" ${canAfford && !alreadyHas ? '' : 'disabled'} style="background:rgba(180,80,255,.2);border:1px solid rgba(180,80,255,.4);color:#cc88ff" data-enchant="${en.id}">${alreadyHas?'✅':'Зачаровать'}</button>
                </div>`;
            }).join('')}
            <div style="color:#555;font-size:11px;padding:8px 4px">
                Надетый предмет: ${Object.entries(eq).map(([s,inst]) => inst ? (ITEM_DEFS[inst.type]?.icon||'') : '').join(' ') || 'нет'}
            </div>`;

        this.attachTabBtns();
        mbody.querySelectorAll('[data-enchant]').forEach(btn => {
            btn.addEventListener('click', () => {
                const enchId = btn.dataset.enchant;
                if (p.gold < cost.gold || (p.resources[m.resource]||0) < cost.res) return;
                // Ищем любой надетый предмет для зачарования
                const slotId = Object.entries(p.equipment || {}).find(([,inst]) => inst)?.[0];
                if (!slotId) { showQNotif('❌ Наденьте предмет!'); return; }
                p.gold -= cost.gold;
                p.resources[m.resource] -= cost.res;
                if (!p.enchants) p.enchants = {};
                p.enchants[slotId] = enchId;
                _applyEnchant(enchId);
                const en = ENCHANTS.find(e => e.id === enchId);
                showQNotif('✨ ' + en.name + ' — зачарование наложено!');
                sound.play('portal');
                tgVibrate('heavy');
                saveGame(true);
                this.render();
            });
        });
    }
});

// Применить эффект зачарования к игроку
function _applyEnchant(enchId) {
    const p = G.p;
    if (enchId === 'speedup') p.spd = +(p.spd + 0.2).toFixed(2);
    if (enchId === 'hpboost') { p.maxhp += 25; p.hp = Math.min(p.hp + 25, p.maxhp); }
    if (enchId === 'critup') p._enchantCrit = (p._enchantCrit || 0) + 0.1;
    if (enchId === 'mpregen') p._enchantMpRegen = (p._enchantMpRegen || 0) + 0.03;
    // lifesteal обрабатывается в Player._dealDamage
    p.recalcEqBonus();
}
