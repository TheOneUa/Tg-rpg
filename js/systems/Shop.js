// ============================================================
//  SHOP — Торговец (покупает и продаёт всё)
// ============================================================

// Что продаёт торговец (фиксированный магазин)
const SHOP_SELL = [
    { id:'hpPot',         price:35  },
    { id:'mpPot',         price:28  },
    { id:'sword_iron',    price:80  },
    { id:'bow_wood',      price:80  },
    { id:'staff_oak',     price:80  },
    { id:'armor_leather', price:70  },
    { id:'armor_robe',    price:70  },
    { id:'sword_steel',   price:180 },
    { id:'bow_elven',     price:180 },
    { id:'staff_crystal', price:180 },
    { id:'armor_chain',   price:160 },
    { id:'ring_hp',       price:200 },
    { id:'ring_atk',      price:200 },
    { id:'ring_spd',      price:350 },
];

// Цена выкупа (торговец платит игроку) — 40% от цены продажи
function buybackPrice(itemId) {
    const row = SHOP_SELL.find(r => r.id === itemId);
    if (row) return Math.floor(row.price * 0.4);
    // расходники
    if (itemId === 'hpPot') return 14;
    if (itemId === 'mpPot') return 11;
    // ресурсы
    if (itemId === 'ore' || itemId === 'wood' || itemId === 'essence') return 20;
    return 5;
}

function openShop() {
    const p = G.p;
    mtitle.textContent = '🛒 Торговец';
    msub.textContent = '💰 ' + p.gold + ' золота';

    // Вкладки: Купить / Продать
    let shopTab = 'buy';

    function render() {
        msub.textContent = '💰 ' + p.gold + ' золота';
        if (shopTab === 'buy') renderBuy();
        else renderSell();
    }

    function renderBuy() {
        mbody.innerHTML = `
            <div style="display:flex;gap:8px;margin-bottom:10px">
                <button class="mbuy" style="flex:1;background:rgba(255,215,0,.2);color:#ffd700;border:1px solid rgba(255,215,0,.4)" onclick="shopTab='buy';renderBuy()">🛍 Купить</button>
                <button class="mbuy" style="flex:1;background:rgba(255,255,255,.06);color:#aaa;border:1px solid rgba(255,255,255,.1)" onclick="shopTab='sell';renderSell()">💸 Продать</button>
            </div>
            ${SHOP_SELL.map(row => {
                const def = ITEM_DEFS[row.id];
                if (!def) return '';
                const canBuy = p.gold >= row.price;
                return `<div class="mitem">
                    <div class="micon" style="background:rgba(255,215,0,.08);border:1px solid rgba(255,215,0,.2);font-size:22px;display:flex;align-items:center;justify-content:center">${def.icon}</div>
                    <div class="minfo">
                        <div class="mname">${def.name}</div>
                        <div class="mdesc">${_itemStatStr(def) || def.slot}</div>
                        <div class="mprice">💰 ${row.price}</div>
                    </div>
                    <button class="mbuy" ${canBuy?'':'disabled'} onclick="shopBuy('${row.id}',${row.price})">Купить</button>
                </div>`;
            }).join('')}`;
        // Re-attach tab buttons properly
        mbody.querySelectorAll('[onclick]').forEach(el => {
            const fn = el.getAttribute('onclick');
            el.removeAttribute('onclick');
            el.addEventListener('click', () => eval(fn));
        });
    }

    function renderSell() {
        const sellItems = [];
        // Инвентарь экипируемых
        (p.inventory || []).forEach((item, idx) => {
            sellItems.push({ label: 'inv', idx, id: item.type, price: buybackPrice(item.type) });
        });
        // Экипированные (снимет и продаст)
        Object.entries(p.equipment || {}).forEach(([slot, itemId]) => {
            if (itemId) sellItems.push({ label: 'eq', slot, id: itemId, price: buybackPrice(itemId) });
        });
        // Расходники
        Object.entries(p.bag || {}).forEach(([id, qty]) => {
            if (qty > 0) sellItems.push({ label: 'bag', id, qty, price: buybackPrice(id) });
        });
        // Ресурсы
        Object.entries(p.resources || {}).forEach(([id, qty]) => {
            if (qty > 0) sellItems.push({ label: 'res', id, qty, price: buybackPrice(id) });
        });

        mbody.innerHTML = `
            <div style="display:flex;gap:8px;margin-bottom:10px">
                <button class="mbuy" style="flex:1;background:rgba(255,255,255,.06);color:#aaa;border:1px solid rgba(255,255,255,.1)" id="tab-buy-btn">🛍 Купить</button>
                <button class="mbuy" style="flex:1;background:rgba(255,215,0,.2);color:#ffd700;border:1px solid rgba(255,215,0,.4)" id="tab-sell-btn">💸 Продать</button>
            </div>
            ${sellItems.length === 0
                ? '<div style="color:#555;padding:20px;text-align:center">Нечего продавать</div>'
                : sellItems.map((si, i) => {
                    const def = ITEM_DEFS[si.id] || RESOURCES[si.id] || { name: si.id, icon: '❓' };
                    const qty = si.qty ? ' ×' + si.qty : '';
                    const total = si.qty ? si.price * si.qty : si.price;
                    const slotNote = si.label === 'eq' ? ' [надет]' : '';
                    return `<div class="mitem">
                        <div class="micon" style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);font-size:22px;display:flex;align-items:center;justify-content:center">${def.icon||'❓'}</div>
                        <div class="minfo">
                            <div class="mname">${def.name||si.id}${qty}${slotNote}</div>
                            <div class="mprice">💰 ${total}</div>
                        </div>
                        <button class="mbuy" style="background:rgba(200,50,50,.2);color:#f88;border:1px solid rgba(200,50,50,.3)" data-si="${i}">Продать</button>
                    </div>`;
                }).join('')}`;

        // Переключение вкладок
        mbody.querySelector('#tab-buy-btn')?.addEventListener('click', () => { shopTab = 'buy'; renderBuy(); });

        // Продажа
        mbody.querySelectorAll('[data-si]').forEach(btn => {
            btn.addEventListener('click', () => {
                const si = sellItems[parseInt(btn.dataset.si)];
                if (!si) return;
                const qty = si.qty || 1;
                const total = si.price * qty;
                p.gold += total;
                onGoldEarned(total);
                stats.totalGold += total;
                if (si.label === 'inv') {
                    p.inventory.splice(si.idx, 1);
                } else if (si.label === 'eq') {
                    p.equipment[si.slot] = null;
                    p.recalcEqBonus();
                } else if (si.label === 'bag') {
                    p.bag[si.id] = 0;
                } else if (si.label === 'res') {
                    p.resources[si.id] = 0;
                }
                showQNotif('💰 +' + total + ' за ' + (ITEM_DEFS[si.id]?.name || si.id));
                sound.play('pickup');
                saveGame(true);
                renderSell();
            });
        });
    }

    window.shopBuy = function(id, price) {
        if (p.gold < price) return;
        p.gold -= price;
        const def = ITEM_DEFS[id];
        if (def.slot === 'consumable') {
            p.bag[id] = (p.bag[id] || 0) + 1;
        } else {
            p.inventory.push({ type: id });
        }
        showQNotif(def.icon + ' Куплено: ' + def.name);
        sound.play('pickup');
        saveGame(true);
        render();
    };

    renderBuy();
    modal.classList.add('open');
}
