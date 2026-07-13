// ============================================================
//  MASTER UI — вкладка "Статы"
// ============================================================
Object.assign(MasterUI, {
    renderStats() {
        const p = this.p, m = this.m, masterId = this.masterId;
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

        mbody.innerHTML = this.tabsHtml('stats') + statDefs.map(sd => {
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

        this.attachTabBtns();
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
                p.recalcEqBonus(); // синхронизируем eff-статы с новой базой
                showQNotif(STAT_GAINS[sk]?.icon || '⬆️' + ' +' + gain);
                sound.play('levelup');
                saveGame(true);
                this.render();
            });
        });
    }
});
