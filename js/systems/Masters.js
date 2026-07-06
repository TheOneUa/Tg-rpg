// ============================================================
//  МАСТЕРА — улучшение статов, предметов и зачарование
// ============================================================
// Каждый мастер предлагает 3 раздела:
// 1. Статы (постоянный бонус к ATK/DEF/HP) — за золото
// 2. Улучшение предмета (+1 к бонусу надетой вещи) — за золото + ресурс
// 3. Зачарование (добавить новый бонус к предмету) — за золото + ресурс

// Стоимость улучшения стата растёт с уровнем
function masterStatCost(masterId, statKey, currentLevel) {
    const base = { smith: 60, elf: 60, witch: 60 }[masterId] || 60;
    return Math.round(base * Math.pow(1.25, currentLevel));
}

// Прирост стата за покупку (родной класс = полный, остальные = 40%)
function masterStatGain(masterId, statKey, cls) {
    const primary = { smith: 'warrior', elf: 'archer', witch: 'mage' }[masterId];
    const full = { atk: 4, def: 2, maxhp: 18, maxmp: 12, spd: 0.15, atkSpd: 0.1 }[statKey] || 2;
    return cls === primary ? full : Math.max(1, Math.round(full * 0.4));
}

// Зачарования (уникальные бонусы)
const ENCHANTS = [
    { id: 'lifesteal', name: 'Похищение жизни', desc: '5% урона → HP', icon: '🩸' },
    { id: 'critup',    name: 'Острое лезвие',   desc: '+10% крит шанс', icon: '💢' },
    { id: 'speedup',   name: 'Быстрый',         desc: '+0.2 скорость',  icon: '💨' },
    { id: 'mpregen',   name: 'Мистическое',     desc: '+MP реген',      icon: '✨' },
    { id: 'hpboost',   name: 'Живучесть',       desc: '+25 HP',         icon: '💚' },
];

function enchantCost(masterId) {
    const base = { smith: 150, elf: 150, witch: 150 }[masterId] || 150;
    const resAmt = 5;
    return { gold: base, res: resAmt };
}

function upgradeCost(masterId) {
    const base = { smith: 80, elf: 80, witch: 80 }[masterId] || 80;
    return { gold: base, res: 3 };
}

function openMasterShop(masterId) {
    const p = G.p;
    const m = MASTERS[masterId];
    const res = RESOURCES[m.resource];
    mtitle.textContent = m.icon + ' ' + m.name;

    let masterTab = 'stats';

    function render() {
        msub.textContent = '💰 ' + p.gold + '  ' + res.icon + ' ' + (p.resources[m.resource] || 0);
        if (masterTab === 'stats') renderStats();
        else if (masterTab === 'upgrade') renderUpgrade();
        else renderEnchant();
    }

    function tabs(active) {
        return `<div style="display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap">
            <button class="mbuy" style="flex:1;font-size:11px;${active==='stats'?'background:rgba(255,215,0,.2);color:#ffd700;border:1px solid rgba(255,215,0,.4)':'background:rgba(255,255,255,.06);color:#aaa;border:1px solid rgba(255,255,255,.1)'}" data-mt="stats">📊 Статы</button>
            <button class="mbuy" style="flex:1;font-size:11px;${active==='upgrade'?'background:rgba(255,215,0,.2);color:#ffd700;border:1px solid rgba(255,215,0,.4)':'background:rgba(255,255,255,.06);color:#aaa;border:1px solid rgba(255,255,255,.1)'}" data-mt="upgrade">⬆ Улучшить</button>
            <button class="mbuy" style="flex:1;font-size:11px;${active==='enchant'?'background:rgba(255,215,0,.2);color:#ffd700;border:1px solid rgba(255,215,0,.4)':'background:rgba(255,255,255,.06);color:#aaa;border:1px solid rgba(255,255,255,.1)'}" data-mt="enchant">✨ Зачаровать</button>
        </div>`;
    }

    function attachTabBtns() {
        mbody.querySelectorAll('[data-mt]').forEach(btn => {
            btn.addEventListener('click', () => { masterTab = btn.dataset.mt; render(); });
        });
    }

    function renderStats() {
        const statDefs = [
            { key: 'atk',    icon: '⚔️', name: 'Атака'          },
            { key: 'def',    icon: '🛡️', name: 'Защита'         },
            { key: 'maxhp',  icon: '❤️', name: 'HP'             },
            { key: 'maxmp',  icon: '💧', name: 'MP'             },
            { key: 'spd',    icon: '💨', name: 'Скорость'        },
            { key: 'atkSpd', icon: '⚡', name: 'Скорость атаки'  },
        ];
        if (!p.masterLevels[masterId]) p.masterLevels[masterId] = { atk:0, def:0, maxhp:0, maxmp:0, spd:0, atkSpd:0 };
        const lvls = p.masterLevels[masterId];

        mbody.innerHTML = tabs('stats') + statDefs.map(sd => {
            const lvl = lvls[sd.key] || 0;
            const cost = masterStatCost(masterId, sd.key, lvl);
            const gain = masterStatGain(masterId, sd.key, p.cls);
            const canBuy = p.gold >= cost;
            const curVal = sd.key === 'spd' ? (p[sd.key] || 0).toFixed(2) : Math.round(p[sd.key] || 0);
            const gainFmt = sd.key === 'spd' ? gain.toFixed(2) : gain;
            return `<div class="mitem">
                <div class="micon" style="background:rgba(255,215,0,.08);border:1px solid rgba(255,215,0,.2);font-size:20px;display:flex;align-items:center;justify-content:center">${sd.icon}</div>
                <div class="minfo">
                    <div class="mname">${sd.name} — ${curVal} <span style="color:#888;font-size:10px">(ур.${lvl})</span></div>
                    <div class="mdesc">+${gainFmt}${p.cls === m.primaryClass ? '' : ' (слабее для вашего класса)'}</div>
                    <div class="mprice">💰 ${cost}</div>
                </div>
                <button class="mbuy" ${canBuy?'':'disabled'} data-stat="${sd.key}">Купить</button>
            </div>`;
        }).join('');

        attachTabBtns();
        mbody.querySelectorAll('[data-stat]').forEach(btn => {
            btn.addEventListener('click', () => {
                const sk = btn.dataset.stat;
                const lvl = p.masterLevels[masterId][sk] || 0;
                const cost = masterStatCost(masterId, sk, lvl);
                if (p.gold < cost) return;
                p.gold -= cost;
                const gain = masterStatGain(masterId, sk, p.cls);
                if (sk === 'maxhp') { p.maxhp += gain; p.hp = Math.min(p.hp + gain, p.maxhp); }
                else if (sk === 'maxmp') { p.maxmp += gain; p.mp = Math.min(p.mp + gain, p.maxmp); }
                else if (sk === 'atkSpd') { p._atkSpdStat = +((p._atkSpdStat || 0) + gain).toFixed(2); }
                else p[sk] = +((p[sk] || 0) + gain).toFixed(2);
                p.masterLevels[masterId][sk] = lvl + 1;
                showQNotif(STAT_GAINS[sk]?.icon || '⬆️' + ' +' + gain);
                sound.play('levelup');
                saveGame(true);
                render();
            });
        });
    }

    function renderUpgrade() {
        // Улучшить надетый предмет (atk или def +1)
        const cost = upgradeCost(masterId);
        const canAfford = p.gold >= cost.gold && (p.resources[m.resource] || 0) >= cost.res;
        const eq = p.equipment || {};
        const equippedItems = Object.entries(eq).filter(([,id]) => id).map(([slot, id]) => ({ slot, id }));

        mbody.innerHTML = tabs('upgrade') + `
            <div style="color:#666;font-size:12px;margin-bottom:8px;padding:0 4px">
                Улучшает надетый предмет: +2 к основному бонусу<br>
                Стоимость: 💰${cost.gold}  ${res.icon}${cost.res} за улучшение
            </div>
            ${equippedItems.length === 0
                ? '<div style="color:#444;padding:16px;text-align:center">Наденьте предмет для улучшения</div>'
                : equippedItems.map(({slot, id}) => {
                    const def = ITEM_DEFS[id];
                    if (!def) return '';
                    const itemObj = p._getEquipObj?.(slot) || def;
                    return `<div class="mitem">
                        <div class="micon" style="font-size:22px;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1)">${def.icon}</div>
                        <div class="minfo">
                            <div class="mname">${def.name}</div>
                            <div class="mdesc">${_itemStatStr(def)}</div>
                            <div class="mprice">💰${cost.gold}  ${res.icon}${cost.res}</div>
                        </div>
                        <button class="mbuy" ${canAfford?'':'disabled'} data-upslot="${slot}">Улучшить</button>
                    </div>`;
                }).join('')}`;

        attachTabBtns();
        mbody.querySelectorAll('[data-upslot]').forEach(btn => {
            btn.addEventListener('click', () => {
                if (p.gold < cost.gold || (p.resources[m.resource]||0) < cost.res) return;
                const slot = btn.dataset.upslot;
                const id = p.equipment[slot];
                if (!id) return;
                p.gold -= cost.gold;
                p.resources[m.resource] -= cost.res;
                // Добавляем постоянный бонус к этому предмету через overrides
                if (!p.itemUpgrades) p.itemUpgrades = {};
                if (!p.itemUpgrades[id]) p.itemUpgrades[id] = { atk:0, def:0 };
                const def = ITEM_DEFS[id];
                if (def.atk) p.itemUpgrades[id].atk += 2;
                else if (def.def) p.itemUpgrades[id].def += 2;
                p.recalcEqBonus();
                showQNotif('⬆️ ' + def.name + ' улучшен!');
                sound.play('crit');
                saveGame(true);
                render();
            });
        });
    }

    function renderEnchant() {
        const cost = enchantCost(masterId);
        const canAfford = p.gold >= cost.gold && (p.resources[m.resource]||0) >= cost.res;
        const eq = p.equipment || {};
        const enchants = p.enchants || {};

        mbody.innerHTML = tabs('enchant') + `
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
                Надетый предмет: ${Object.entries(eq).map(([s,id]) => id ? (ITEM_DEFS[id]?.icon||'') : '').join(' ') || 'нет'}
            </div>`;

        attachTabBtns();
        mbody.querySelectorAll('[data-enchant]').forEach(btn => {
            btn.addEventListener('click', () => {
                const enchId = btn.dataset.enchant;
                if (p.gold < cost.gold || (p.resources[m.resource]||0) < cost.res) return;
                // Ищем любой надетый предмет для зачарования
                const slotId = Object.entries(p.equipment || {}).find(([,id]) => id)?.[0];
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
                render();
            });
        });
    }

    render();
    modal.classList.add('open');
}

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
