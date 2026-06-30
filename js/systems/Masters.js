// ============================================================
//  МАСТЕРА — апгрейд оружия/брони (Кузнец/Эльф/Колдунья)
// ============================================================
function openMasterShop(masterId) {
    const p = G.p;
    const m = MASTERS[masterId];
    const res = RESOURCES[m.resource];
    const lvl = p.masterLevels[masterId];
    const isPrimary = p.cls === m.primaryClass;

    mtitle.textContent = m.icon + ' ' + m.name;
    msub.textContent = '💰 ' + p.gold + '  ' + res.icon + ' ' + (p.resources[m.resource] || 0) +
        (isPrimary ? '  ⭐ Ваш класс — полный эффект' : '  (для вашего класса эффект слабее)');

    const weaponCost = getMasterUpgradeCost(masterId, 'weapon', lvl.weapon);
    const armorCost = getMasterUpgradeCost(masterId, 'armor', lvl.armor);
    const weaponGain = getMasterUpgradeGain(masterId, 'weapon', p.cls);
    const armorGain = getMasterUpgradeGain(masterId, 'armor', p.cls);

    const canWeapon = p.gold >= weaponCost.gold && (p.resources[m.resource] || 0) >= weaponCost.res;
    const canArmor = p.gold >= armorCost.gold && (p.resources[m.resource] || 0) >= armorCost.res;

    mbody.innerHTML = `
        <div class="mitem">
            <div class="micon" style="background:rgba(255,150,50,.12);border:1px solid #aa6622">⚔️</div>
            <div class="minfo">
                <div class="mname">Оружие — ур. ${lvl.weapon}</div>
                <div class="mdesc">+${weaponGain} атаки${isPrimary ? '' : ' (слабее, не ваш класс)'}</div>
                <div class="mprice">💰 ${weaponCost.gold}  ${res.icon} ${weaponCost.res}</div>
            </div>
            <button class="mbuy" id="mw-buy" ${canWeapon ? '' : 'disabled'}>Улучшить</button>
        </div>
        <div class="mitem">
            <div class="micon" style="background:rgba(80,160,255,.12);border:1px solid #3a6aaa">🛡️</div>
            <div class="minfo">
                <div class="mname">Броня — ур. ${lvl.armor}</div>
                <div class="mdesc">+${armorGain} защиты${isPrimary ? '' : ' (слабее, не ваш класс)'}</div>
                <div class="mprice">💰 ${armorCost.gold}  ${res.icon} ${armorCost.res}</div>
            </div>
            <button class="mbuy" id="ma-buy" ${canArmor ? '' : 'disabled'}>Улучшить</button>
        </div>
        <div style="text-align:center;color:#777;font-size:11px;padding:8px 4px;">
            ${res.icon} ${res.name} добывается в подземелье — редко с обычных врагов, гарантированно с боссов.
        </div>
    `;

    const wBtn = document.getElementById('mw-buy');
    if (wBtn) wBtn.addEventListener('click', () => {
        if (p.gold < weaponCost.gold || (p.resources[m.resource] || 0) < weaponCost.res) return;
        p.gold -= weaponCost.gold;
        p.resources[m.resource] -= weaponCost.res;
        p.atk += weaponGain;
        lvl.weapon++;
        G.floats.push(new FText(p.x, p.y - CFG.TILE, '⚔️ +' + weaponGain + ' атаки', '#ff8844', 15));
        sound.play('levelup');
        tgVibrate('medium');
        saveGame(true);
        openMasterShop(masterId);
    });

    const aBtn = document.getElementById('ma-buy');
    if (aBtn) aBtn.addEventListener('click', () => {
        if (p.gold < armorCost.gold || (p.resources[m.resource] || 0) < armorCost.res) return;
        p.gold -= armorCost.gold;
        p.resources[m.resource] -= armorCost.res;
        p.def += armorGain;
        lvl.armor++;
        G.floats.push(new FText(p.x, p.y - CFG.TILE, '🛡️ +' + armorGain + ' защиты', '#4488ff', 15));
        sound.play('levelup');
        tgVibrate('medium');
        saveGame(true);
        openMasterShop(masterId);
    });

    modal.classList.add('open');
}
