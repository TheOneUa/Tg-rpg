// ============================================================
//  SHOP — Торговец (покупает и продаёт всё)
// ============================================================

// Что продаёт торговец (фиксированный магазин).
// Легендарные предметы намеренно НЕ продаются — только дроп с боссов
// на глубоких этажах, чтобы оставались редкой ценностью.
const SHOP_SELL = [
    { id:'hpPot',          price:35  },
    { id:'mpPot',          price:28  },
    // common tier
    { id:'sword_iron',     price:80  },
    { id:'bow_wood',       price:80  },
    { id:'staff_oak',      price:80  },
    { id:'armor_leather',  price:70  },
    { id:'armor_hide',     price:70  },
    { id:'armor_robe',     price:70  },
    // rare tier
    { id:'sword_steel',    price:180 },
    { id:'bow_elven',      price:180 },
    { id:'staff_crystal',  price:180 },
    { id:'armor_chain',    price:160 },
    { id:'armor_ranger',   price:160 },
    { id:'armor_arcane',   price:160 },
    { id:'ring_hp',        price:200 },
    { id:'ring_atk',       price:200 },
    // epic tier — дороже, но доступно за золото без похода на глубину
    { id:'sword_flame',    price:420 },
    { id:'bow_shadow',     price:420 },
    { id:'staff_void',     price:420 },
    { id:'armor_plate',    price:380 },
    { id:'armor_shadow',   price:380 },
    { id:'armor_celestial',price:380 },
    { id:'ring_spd',       price:350 },
    { id:'ring_speed',     price:350 },
];

// Цена выкупа (торговец платит игроку) — 40% от базовой цены продажи.
// Принимает либо строку-ID (расходники/ресурсы), либо полный инстанс
// предмета (учитывает уровень улучшения и наличие боевой абилки).
function buybackPrice(itemIdOrInstance) {
    const isInstance = itemIdOrInstance && typeof itemIdOrInstance === 'object';
    const itemId = isInstance ? itemIdOrInstance.type : itemIdOrInstance;

    const row = SHOP_SELL.find(r => r.id === itemId);
    let price;
    if (row) {
        price = Math.floor(row.price * 0.4);
    } else if (itemId === 'hpPot') {
        price = 14;
    } else if (itemId === 'mpPot') {
        price = 11;
    } else if (itemId === 'ore' || itemId === 'wood' || itemId === 'essence') {
        price = 20;
    } else {
        price = 5;
    }

    if (isInstance) {
        const level = itemIdOrInstance.level || 0;
        if (level > 0) price = Math.round(price * (1 + level * 0.15));
        if (itemIdOrInstance.enchantId) price = Math.round(price * 1.5); // зачарованный предмет ценнее
    }

    return price;
}

function openShop() {
    const p = G.p;
    const shopBody  = document.getElementById('shop-body');
    const shopGold  = document.getElementById('shop-gold');
    let shopTab = 'buy';

    function render() {
        shopGold.textContent = '💰 ' + p.gold + ' золота';
        document.querySelectorAll('#shop-screen [data-shoptab]').forEach(t => {
            t.classList.toggle('active', t.dataset.shoptab === shopTab);
        });
        if (shopTab === 'buy') renderBuy();
        else renderSell();
    }

    function renderBuy() {
        shopBody.innerHTML = SHOP_SELL.map(row => {
            const def = ITEM_DEFS[row.id];
            if (!def) return '';
            const canBuy = p.gold >= row.price;
            const classMismatch = def.forClass && def.forClass !== p.cls;
            const rowStyle = classMismatch ? 'opacity:.6' : '';
            const classTag = classMismatch ? ` <span style="color:#888;font-size:10px">(${CLASSES[def.forClass]?.name || def.forClass})</span>` : '';
            return `<div class="mitem" style="${rowStyle}">
                <div class="micon" style="background:rgba(255,215,0,.08);border:1px solid rgba(255,215,0,.2);font-size:22px;display:flex;align-items:center;justify-content:center">${def.icon}</div>
                <div class="minfo">
                    <div class="mname">${def.name}${classTag}</div>
                    <div class="mdesc">${_itemStatStr(def) || def.slot}</div>
                    <div class="mprice">💰 ${row.price}</div>
                </div>
                <button class="mbuy" ${canBuy?'':'disabled'} data-buy="${row.id}" data-price="${row.price}">Купить</button>
            </div>`;
        }).join('');

        shopBody.querySelectorAll('[data-buy]').forEach(btn => {
            btn.addEventListener('click', () => shopBuy(btn.dataset.buy, +btn.dataset.price));
        });
    }

    function renderSell() {
        const sellItems = [];
        // Инвентарь экипируемых (полные инстансы — учитывают уровень улучшения в цене)
        (p.inventory || []).forEach((item, idx) => {
            sellItems.push({ label: 'inv', idx, instance: item, id: item.type, price: buybackPrice(item) });
        });
        // Экипированные — показываем, но ПРОДАТЬ НЕЛЬЗЯ (сначала снять в разделе Экипировка)
        Object.entries(p.equipment || {}).forEach(([slot, instance]) => {
            if (instance) sellItems.push({ label: 'eq', slot, instance, id: instance.type, price: buybackPrice(instance), locked: true });
        });
        // Расходники
        Object.entries(p.bag || {}).forEach(([id, qty]) => {
            if (qty > 0) sellItems.push({ label: 'bag', id, qty, price: buybackPrice(id) });
        });
        // Ресурсы
        Object.entries(p.resources || {}).forEach(([id, qty]) => {
            if (qty > 0) sellItems.push({ label: 'res', id, qty, price: buybackPrice(id) });
        });

        shopBody.innerHTML = sellItems.length === 0
            ? '<div style="color:#555;padding:20px;text-align:center">Нечего продавать</div>'
            : sellItems.map((si, i) => {
                const def = ITEM_DEFS[si.id] || RESOURCES[si.id] || { name: si.id, icon: '❓' };
                const qty = si.qty ? ' ×' + si.qty : '';
                const total = si.qty ? si.price * si.qty : si.price;
                const displayName = si.instance ? getItemDisplayName(si.instance) : (def.name || si.id);
                const lockedNote = si.locked ? ' <span style="color:#e67;">[надет — сначала снимите]</span>' : '';
                const rowStyle = si.locked ? 'opacity:.55' : '';
                return `<div class="mitem" style="${rowStyle}">
                    <div class="micon" style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);font-size:22px;display:flex;align-items:center;justify-content:center">${def.icon||'❓'}</div>
                    <div class="minfo">
                        <div class="mname">${displayName}${qty}${lockedNote}</div>
                        <div class="mprice">💰 ${total}</div>
                    </div>
                    <button class="mbuy" ${si.locked ? 'disabled' : ''} style="background:rgba(200,50,50,.2);color:#f88;border:1px solid rgba(200,50,50,.3)" data-si="${i}">${si.locked ? 'Надето' : 'Продать'}</button>
                </div>`;
            }).join('');

        // Продажа (только не-locked позиции реально кликабельны — disabled кнопка не вызовет click)
        shopBody.querySelectorAll('[data-si]').forEach(btn => {
            btn.addEventListener('click', () => {
                const si = sellItems[parseInt(btn.dataset.si)];
                if (!si || si.locked) return; // защита от продажи надетого даже при программном клике
                const qty = si.qty || 1;
                const total = si.price * qty;
                p.gold += total;
                onGoldEarned(total);
                stats.totalGold += total;
                if (si.label === 'inv') {
                    p.inventory.splice(si.idx, 1);
                } else if (si.label === 'bag') {
                    p.bag[si.id] = 0;
                } else if (si.label === 'res') {
                    p.resources[si.id] = 0;
                }
                showQNotif('💰 +' + total + ' за ' + (ITEM_DEFS[si.id]?.name || si.id));
                sound.play('pickup');
                saveGame(true);
                render();
            });
        });
    }

    function shopBuy(id, price) {
        if (p.gold < price) return;
        p.gold -= price;
        const def = ITEM_DEFS[id];
        if (def.slot === 'consumable') {
            p.bag[id] = (p.bag[id] || 0) + 1;
        } else {
            p.inventory.push(createItemInstance(id)); // покупка тоже создаёт уникальный инстанс
        }
        showQNotif(def.icon + ' Куплено: ' + def.name);
        sound.play('pickup');
        saveGame(true);
        render();
    }

    document.querySelectorAll('#shop-screen [data-shoptab]').forEach(tabEl => {
        tabEl.onclick = () => { shopTab = tabEl.dataset.shoptab; render(); };
    });
    document.getElementById('shop-close').onclick = () => {
        document.getElementById('shop-screen').classList.remove('open');
    };

    render();
    document.getElementById('shop-screen').classList.add('open');
}
