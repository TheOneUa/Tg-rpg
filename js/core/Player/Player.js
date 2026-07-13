// ============================================================
//  PLAYER
// ============================================================
// Класс разбит на несколько файлов, все они расширяют
// Player.prototype через Object.assign (см. соседние файлы).
// ВАЖНО: порядок загрузки в index.html — этот файл (конструктор)
// должен идти ПЕРВЫМ, остальные части Player/* — сразу за ним,
// и всё это строго до main.js (там `G.p = new Player()` создаётся
// синхронно в момент парсинга).
//
//   PlayerStats.js      — initFromClass, lvup, _updateLeveling
//   PlayerInventory.js  — useSlot, _updateItemPickup
//   PlayerEquipment.js  — recalcEqBonus, equip, unequip
//   PlayerCombat.js     — _nearestEnemy, _dealDamage, _dealProjDamage,
//                         autoAttack, useAbility, melee, hurt,
//                         _updateAbilityTick, _updateCombatTick, _updateEnemyContact
//                         (использует combat/DamageFormula.js,
//                          combat/CritSystem.js, combat/EnemyDeath.js)
//   PlayerMovement.js   — _updateTimers, _updateMovement
//   PlayerAnimation.js  — _updateAnimation
//   PlayerRender.js     — draw()
//
// Больше выносить нечего — Player.js теперь только constructor
// и update()-оркестратор (~97 строк, было 690 до начала рефакторинга).
class Player {
    constructor() {
        this.x = CFG.SPAWN_X;
        this.y = CFG.SPAWN_Y;
        this.spd = 2.5;
        this.maxhp = 120;
        this.hp = 120;
        this.maxmp = 60;
        this.mp = 60;
        this.atk = 20;
        this.def = 5;
        this.lv = 1;
        this.exp = 0;
        this.exn = 100;
        this.gold = 0;
        this.bag = { hpPot: 0, mpPot: 0 };
        this.resources = { ore: 0, wood: 0, essence: 0 };
        this.masterLevels = { smith: { atk:0, def:0, maxhp:0, maxmp:0, spd:0, atkSpd:0 }, elf: { atk:0, def:0, maxhp:0, maxmp:0, spd:0, atkSpd:0 }, witch: { atk:0, def:0, maxhp:0, maxmp:0, spd:0, atkSpd:0 } };
        this.inventory = []; // массив инстансов { instanceId, type, level, enchantId }
        this.equipment = { weapon: null, armor: null, ring: null }; // хранит инстансы, не строки
        this.eqBonus   = { atk: 0, def: 0, hp: 0, mp: 0, spd: 0, atkSpd: 0 };
        // Эффективные боевые характеристики (пересчитываются в recalcEqBonus)
        this.effAtk = this.atk;
        this.effDef = this.def;
        this.effMaxhp = this.maxhp;
        this.effMaxmp = this.maxmp;
        this.effSpd = this.spd;
        this.itemUpgrades = {}; // LEGACY (v5.6.0): заменено instance.level, поле оставлено для миграции старых сейвов
        this.enchants = {};     // { slotId: enchId } — пассивные статы от мастера (см. systems/Masters), не путать с боевыми абилками предметов
        this._enchantCrit   = 0;
        this._enchantMpRegen = 0;
        this._atkSpdStat    = 0; // накопленный бонус скорости атаки от статов
        this.acd = 0;
        this.scd = 0;
        this.flash = 0;
        this.anim = 0;
        this.face = { x: 0, y: 1 };
        this.slotCooldowns = [0, 0, 0, 0];
        this.blockChance = 0.1;
        this.dodgeChance = 0.05;
        this.attackAnim = 0;
        this.attackAngle = 0;
        // Класс
        this.cls = 'warrior';
        this.atkCD = 60;
        this.atkRange = 2;
        this.atkType = 'melee';
        this.mpCost = 0;
        this.autoAtkTimer = 0;
        this.statPoints = 0; // нераспределённые очки статов
        // Способность (вторая кнопка)
        this.abilityCD = 0;       // текущий кулдаун (кадры)
        this.abilityActive = 0;   // оставшиеся кадры активного эффекта (0 = неактивна)
        // Спрайт-анимация
        this.spriteAnim = 'idle'; // текущая анимация
        this.spriteDir  = 'right';// текущее направление ('left'/'right')
        this.spriteFrame = 0;     // текущий кадр (0-3)
        this.spriteTimer = 0;     // накопленное время для смены кадра
    }

    // update() — оркестратор. Реализация под-шагов разнесена по файлам:
    //   _updateTimers, _updateMovement           → PlayerMovement.js
    //   _updateAnimation                         → PlayerAnimation.js
    //   _updateAbilityTick, _updateCombatTick,
    //   _updateEnemyContact                      → PlayerCombat.js
    //   _updateItemPickup                        → PlayerInventory.js
    //   _updateLeveling                          → PlayerStats.js
    // Порядок вызовов сохранён 1:1 от исходного монолитного update().
    update(inp, tm, enemies, items, parts, floats, projs, npcs) {
        const dt = G.dt || 1;
        this._updateTimers(dt);
        this._updateAbilityTick(dt);
        const isMoving = this._updateMovement(inp, tm, dt);
        this._updateAnimation(isMoving, dt);
        this._updateCombatTick(inp, enemies, parts, floats, projs, dt);
        this._updateItemPickup(items, parts, floats);
        this._updateEnemyContact(enemies, floats);
        this._updateLeveling(floats);
    }
    
}