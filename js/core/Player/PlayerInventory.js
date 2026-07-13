// ============================================================
//  PLAYER INVENTORY — расходники (bag)
// ============================================================
Object.assign(Player.prototype, {
    useSlot(slot, floats) {
        const idx = SLOT_KEYS.indexOf(slot);
        if (idx >= 0 && this.slotCooldowns[idx] > 0) return;
        if (!this.bag[slot] || this.bag[slot] <= 0) return;

        if (slot === 'hpPot') {
            if (this.hp >= this.effMaxhp) return;
            const h = Math.min(40, this.effMaxhp - this.hp);
            this.hp += h;
            this.bag.hpPot--;
            floats.push(new FText(this.x, this.y - CFG.TILE, '+' + h + ' HP', '#3cb43c'));
            sound.play('pickup');
            tgVibrate('light');
        } else if (slot === 'mpPot') {
            if (this.mp >= this.effMaxmp) return;
            const m = Math.min(30, this.effMaxmp - this.mp);
            this.mp += m;
            this.bag.mpPot--;
            floats.push(new FText(this.x, this.y - CFG.TILE, '+' + m + ' MP', '#3c78dc'));
            sound.play('pickup');
            tgVibrate('light');
        }
        if (idx >= 0) this.slotCooldowns[idx] = 20;
        saveGame(true);
    },

    _updateItemPickup(items, parts, floats) {
        // Подбор предметов (только в подземелье)
        if (G.depth > 0) {
            for (const it of items) {
                if (!it.alive) continue;
                const ix = it.x * CFG.TILE + CFG.TILE/2;
                const iy = it.y * CFG.TILE + CFG.TILE/2;
                if (Math.hypot(this.x - ix, this.y - iy) < CFG.TILE * 0.85) {
                    const def = ITEM_DEFS[it.type];
                    if (it.type === 'gold') {
                        const goldAmt = 10 + Math.floor(Math.random() * 20);
                        this.gold += goldAmt;
                        stats.totalGold += goldAmt;
                        onGoldEarned(goldAmt);
                        floats.push(new FText(ix, iy - 24, '+' + goldAmt + '💰', '#ffd700'));
                    } else if (def && def.slot === 'consumable') {
                        this.bag[it.type] = (this.bag[it.type] || 0) + 1;
                        stats.itemsCollected++;
                        floats.push(new FText(ix, iy - 24, '+1 ' + it.icon, '#e6c832'));
                    } else if (def) {
                        // Экипируемый предмет — сохраняем полный инстанс (instanceId/level/enchantId)
                        const instance = it.instance || createItemInstance(it.type);
                        this.inventory.push(instance);
                        stats.itemsCollected++;
                        const rarityColor = def.rarity === 'legendary' ? '#ffaa00'
                            : def.rarity === 'epic' ? '#cc44ff'
                            : def.rarity === 'rare' ? '#4499ff' : '#e6c832';
                        const displayName = getItemDisplayName(instance);
                        const enchantTag = instance.enchantId ? ' ' + ITEM_ENCHANTS[instance.enchantId].icon : '';
                        floats.push(new FText(ix, iy - 24, def.icon + ' ' + displayName + enchantTag, rarityColor, 13));
                        showQNotif(def.icon + ' Подобран: ' + displayName + enchantTag);
                    }
                    for (let i = 0; i < 8; i++) parts.push(new Particle(ix, iy, it.col));
                    it.alive = false;
                    sound.play('pickup');
                    tgVibrate('light');
                    checkAchievements();
                    saveGame(true);
                }
            }
        }
        
    }
});
