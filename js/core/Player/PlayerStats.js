// ============================================================
//  PLAYER STATS — класс персонажа, левел-ап
// ============================================================
Object.assign(Player.prototype, {
    initFromClass(cls) {
        const d = CLASSES[cls];
        if (!d) return;
        this.cls = cls;
        this.maxhp = d.hp;
        this.hp = d.hp;
        this.maxmp = d.mp;
        this.mp = d.mp;
        this.atk = d.atk;
        this.def = d.def;
        this.spd = d.spd;
        this.atkCD = d.atkCD;
        this.atkRange = d.atkRange;
        this.atkType = d.atkType;
        this.mpCost = d.mpCost;
        this.autoAtkTimer = 0;
        this.statPoints = 0; // нераспределённые очки статов
        this.recalcEqBonus(); // синхронизируем eff-статы с новой базой класса
    },

    lvup(floats) {
        this.lv++;
        stats.maxLevel = Math.max(stats.maxLevel, this.lv);
        this.exn = this.exn * 1.5 | 0;
        // Выдаём очки статов — игрок распределяет сам
        this.statPoints = (this.statPoints || 0) + 3;
        this.blockChance = Math.min(0.3, 0.1 + this.lv * 0.008);
        this.dodgeChance = Math.min(0.15, 0.05 + this.lv * 0.004);
        floats.push(new FText(this.x, this.y - CFG.TILE, '✨ Уровень ' + this.lv + '!', '#ffd700', 20));
        floats.push(new FText(this.x, this.y - CFG.TILE * 2, '+3 очка статов', '#88ffcc', 15));
        sound.play('levelup');
        tgVibrate('heavy');
        checkAchievements();
        saveGame(true);
        // Не открываем экран — игрок распределит через кнопку 🎒 в HUD
    },

    _updateLeveling(floats) {
        while (this.exp >= this.exn) {
            this.exp -= this.exn;
            this.lvup(floats);
        }
    }
});
