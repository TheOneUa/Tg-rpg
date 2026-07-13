// ============================================================
//  МАСТЕРА — координатор
// ============================================================
// Каждый мастер предлагает 3 раздела (вкладки), реализованные
// в соседних файлах через Object.assign(MasterUI, {...}):
//   MasterStats.js   — renderStats()   (постоянный бонус к статам за золото)
//   MasterUpgrade.js — renderUpgrade() (+бонус к надетой вещи за золото+ресурс)
//   MasterEnchant.js — renderEnchant() (уникальный бонус к предмету)
//
// Раньше это была одна функция openMasterShop() с вложенными
// замыканиями render/renderStats/renderUpgrade/renderEnchant —
// то есть их физически нельзя было раскидать по файлам (замыкания
// живут только в своей лексической области). MasterUI — то же самое
// состояние, но в виде объекта, поэтому методы можно дописывать
// из разных файлов через Object.assign.

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

// Зачарования (уникальные бонусы) — используется MasterEnchant.js
const ENCHANTS = [
    { id: 'lifesteal', name: 'Похищение жизни', desc: '5% урона → HP', icon: '🩸' },
    { id: 'critup',    name: 'Острое лезвие',   desc: '+10% крит шанс', icon: '💢' },
    { id: 'speedup',   name: 'Быстрый',         desc: '+0.2 скорость',  icon: '💨' },
    { id: 'mpregen',   name: 'Мистическое',     desc: '+MP реген',      icon: '✨' },
    { id: 'hpboost',   name: 'Живучесть',       desc: '+25 HP',         icon: '💚' },
];

function enchantCost(masterId) {
    const base = { smith: 150, elf: 150, witch: 150 }[masterId] || 150;
    return { gold: base, res: 5 };
}

// Цена улучшения растёт с уровнем КОНКРЕТНОГО инстанса предмета.
// Раньше цена была константой независимо от уровня — баг, из-за
// которого +1 и +50 стоили одинаково. Теперь растёт по той же
// кривой, что и статы у мастера.
function upgradeCost(masterId, itemLevel = 0) {
    const base = { smith: 80, elf: 80, witch: 80 }[masterId] || 80;
    const mult = Math.pow(1.22, itemLevel);
    return {
        gold: Math.round(base * mult),
        res: Math.max(1, Math.round(3 * mult))
    };
}

// ============================================================
//  MasterUI — общее состояние + вкладки
// ============================================================
// Методы renderStats/renderUpgrade/renderEnchant дописываются
// в MasterStats.js/MasterUpgrade.js/MasterEnchant.js.
const MasterUI = {
    masterId: null,
    p: null,
    m: null,
    res: null,
    tab: 'stats',

    open(masterId) {
        this.masterId = masterId;
        this.p = G.p;
        this.m = MASTERS[masterId];
        this.res = RESOURCES[this.m.resource];
        this.tab = 'stats';
        mtitle.textContent = this.m.icon + ' ' + this.m.name;
        this.render();
        modal.classList.add('open');
    },

    render() {
        msub.textContent = '💰 ' + this.p.gold + '  ' + this.res.icon + ' ' + (this.p.resources[this.m.resource] || 0);
        if (this.tab === 'stats') this.renderStats();
        else if (this.tab === 'upgrade') this.renderUpgrade();
        else this.renderEnchant();
    },

    // Общая HTML-обёртка вкладок — переиспользуется всеми render*
    tabsHtml(active) {
        return `<div style="display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap">
            <button class="mbuy" style="flex:1;font-size:11px;${active==='stats'?'background:rgba(255,215,0,.2);color:#ffd700;border:1px solid rgba(255,215,0,.4)':'background:rgba(255,255,255,.06);color:#aaa;border:1px solid rgba(255,255,255,.1)'}" data-mt="stats">📊 Статы</button>
            <button class="mbuy" style="flex:1;font-size:11px;${active==='upgrade'?'background:rgba(255,215,0,.2);color:#ffd700;border:1px solid rgba(255,215,0,.4)':'background:rgba(255,255,255,.06);color:#aaa;border:1px solid rgba(255,255,255,.1)'}" data-mt="upgrade">⬆ Улучшить</button>
            <button class="mbuy" style="flex:1;font-size:11px;${active==='enchant'?'background:rgba(255,215,0,.2);color:#ffd700;border:1px solid rgba(255,215,0,.4)':'background:rgba(255,255,255,.06);color:#aaa;border:1px solid rgba(255,255,255,.1)'}" data-mt="enchant">✨ Зачаровать</button>
        </div>`;
    },

    attachTabBtns() {
        mbody.querySelectorAll('[data-mt]').forEach(btn => {
            btn.addEventListener('click', () => { this.tab = btn.dataset.mt; this.render(); });
        });
    }
};

// Публичная точка входа (вызывается из NPC.js)
function openMasterShop(masterId) {
    MasterUI.open(masterId);
}
