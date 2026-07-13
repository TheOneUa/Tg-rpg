// ============================================================
//  ЭКРАН ПЕРСОНАЖА — вкладка "Статы"
// ============================================================
function _renderStatsTab(p, cls) {
    const remaining = (p.statPoints || 0) - Object.values(_statPending).reduce((a,b) => a+b, 0);
    const wrap = document.getElementById('stat-points-wrap');
    wrap.style.display = (p.statPoints > 0) ? '' : 'none';
    document.getElementById('stat-points-left').textContent = remaining;
    document.getElementById('stat-level').textContent = 'Уровень ' + p.lv + '  EXP: ' + p.exp + '/' + p.exn;

    const list = document.getElementById('stat-list');
    const eq = p.eqBonus || {};
    list.innerHTML = Object.entries(STAT_GAINS).map(([key, sg]) => {
        const gain = sg[cls];
        const base = key === 'hp' ? p.maxhp : key === 'mp' ? p.maxmp
            : key === 'atkSpd' ? (p._atkSpdStat || 0)
            : p[sg.field];
        const eqVal = eq[key] || 0;
        const pending = _statPending[key] || 0;
        const fmt = v => key === 'spd' ? v.toFixed(2) : Math.round(v);
        return `<div class="stat-row">
            <span class="stat-icon">${sg.icon}</span>
            <div class="stat-info">
                <div class="stat-name">${sg.name}</div>
                <div class="stat-val">${fmt(base)}${eqVal ? ' <span style="color:#4499ff">+' + fmt(eqVal) + '</span>' : ''}${pending > 0 ? ' <span class="stat-gain">(+' + fmt(gain * pending) + ')</span>' : ''}</div>
            </div>
            ${p.statPoints > 0 ? `<button class="stat-btn" data-stat="${key}" ${remaining <= 0 ? 'disabled' : ''}>+</button>` : ''}
        </div>`;
    }).join('');

    list.querySelectorAll('.stat-btn').forEach(btn => {
        bindTapButton(btn, () => {
            const rem = (p.statPoints || 0) - Object.values(_statPending).reduce((a,b) => a+b, 0);
            if (rem <= 0) return;
            _statPending[btn.dataset.stat] = (_statPending[btn.dataset.stat] || 0) + 1;
            _renderStatsTab(p, cls);
        });
    });

    const spent = Object.values(_statPending).reduce((a,b) => a+b, 0);
    const confirmBtn = document.getElementById('stat-confirm');
    confirmBtn.style.display = p.statPoints > 0 ? '' : 'none';
    confirmBtn.textContent = spent > 0 ? '✅ Применить' : '⏭ Пропустить';
    confirmBtn.onclick = () => {
        const s = Object.values(_statPending).reduce((a,b) => a+b, 0);
        for (const [key, pts] of Object.entries(_statPending)) {
            if (!pts) continue;
            const sg = STAT_GAINS[key];
            const gain = sg[cls] * pts;
            if (key === 'hp') { p.maxhp += gain; p.hp = Math.min(p.hp + gain, p.maxhp); }
            else if (key === 'mp') { p.maxmp += gain; p.mp = Math.min(p.mp + gain, p.maxmp); }
            else p[sg.field] = +(p[sg.field] + gain).toFixed(2);
        }
        p.statPoints = (p.statPoints || 0) - s;
        _statPending = { hp: 0, mp: 0, atk: 0, def: 0, spd: 0 };
        p.recalcEqBonus(); // синхронизируем eff-статы с новой базой
        if (s > 0) showQNotif('✨ Статы прокачаны!');
        saveGame(true);
        _renderCharScreen();
    };

    const hint = document.getElementById('stat-hint');
    hint.textContent = p.statPoints > 0 ? 'Нераспределено очков: ' + p.statPoints : '';
}
