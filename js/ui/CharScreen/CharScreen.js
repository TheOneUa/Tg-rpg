// ============================================================
//  ЭКРАН ПЕРСОНАЖА — координатор
// ============================================================
// Вкладки реализованы в соседних файлах как обычные глобальные
// функции (не замыкания), поэтому режутся без реструктуризации:
//   StatsTab.js     — _renderStatsTab(p, cls)
//   EquipTab.js     — _renderEquipTab(p)
//   InventoryTab.js — _renderInvTab(p)
//
// STAT_GAINS вынесен в config/ClassesConfig.js, _itemStatStr —
// в config/ItemsConfig.js (нужны обеим вкладкам и Masters).

let _statPending = {};
let _activeCharTab = 'stats';

function openStatScreen() {
    _statPending = { hp: 0, mp: 0, atk: 0, def: 0, spd: 0 };
    _activeCharTab = G.p.statPoints > 0 ? 'stats' : 'equip';
    _renderCharScreen();
    document.getElementById('stat-screen').classList.add('open');
}

function _closeCharScreen() {
    document.getElementById('stat-screen').classList.remove('open');
    _updateHudStatBtn();
}

function _renderCharScreen() {
    const p = G.p;
    const cls = p.cls || 'warrior';

    // Заголовок
    document.getElementById('stat-title').textContent = '🎒 ' + (p.name || 'Персонаж') + ' · Ур.' + p.lv;

    // Вкладки
    document.querySelectorAll('.stat-tab').forEach(t => {
        t.classList.toggle('active', t.dataset.tab === _activeCharTab);
    });
    document.querySelectorAll('.stat-tab-content').forEach(c => {
        c.classList.toggle('active', c.id === 'stat-tab-' + _activeCharTab);
    });

    if (_activeCharTab === 'stats') _renderStatsTab(p, cls);
    else if (_activeCharTab === 'equip') _renderEquipTab(p);
    else if (_activeCharTab === 'inv') _renderInvTab(p);
}

function _updateHudStatBtn() {
    const p = G.p;
    const btn = document.getElementById('hud-stat-btn');
    const count = p.statPoints || 0;
    if (btn) {
        btn.classList.toggle('visible', gameStarted);
        const span = btn.querySelector('span');
        if (span) span.textContent = count > 0 ? count : '';
        btn.querySelector('span') && (btn.innerHTML = count > 0 ? '⬆️ +' + count : '🎒');
    }
}
