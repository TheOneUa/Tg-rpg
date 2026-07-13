// ============================================================
//  CLASSES
// ============================================================
const CLASSES = {
    //            hp   mp   atk  def  spd   atkCD  atkRange  atkType   mpCost
    warrior: { name: 'Мечник', icon: '⚔️',
        hp: 160, mp: 30,  atk: 30, def: 10, spd: 2.0,
        atkCD: 60,  atkRange: 2, atkType: 'melee',  mpCost: 0  },
    archer:  { name: 'Лучник', icon: '🏹',
        hp: 110, mp: 60,  atk: 22, def: 5,  spd: 2.8,
        atkCD: 60,  atkRange: 6, atkType: 'arrow',  mpCost: 0  },
    mage:    { name: 'Маг',    icon: '🔮',
        hp: 80,  mp: 120, atk: 20, def: 3,  spd: 3.2,
        atkCD: 48,  atkRange: 6, atkType: 'fireball', mpCost: 8 }
};

// ============================================================
//  ABILITIES (вторая кнопка — активная способность класса)
// ============================================================
// cd: кулдаун в кадрах (60 = 1 сек, нормализовано через dt)
// dur: длительность эффекта в кадрах (если применимо)
// mpCost: стоимость маны на активацию
const ABILITIES = {
    warrior: {
        key: 'rage',
        name: 'Кровавая ярость',
        icon: '💢',
        desc: '5 сек: 100% крит + ускорение атаки',
        cd: 1200,      // 20 сек
        dur: 300,      // 5 сек
        mpCost: 15,
        critBonus: 1.0,      // 100% крит шанс на время действия
        atkSpeedMult: 1.6    // атака на 60% быстрее (меньше cooldown)
    },
    archer: {
        key: 'volley',
        name: 'Шквал стрел',
        icon: '🌪️',
        desc: '5 сек: ускоренная стрельба, веер стрел, ускоренные стрелы',
        cd: 1200,      // 20 сек
        dur: 300,      // 5 сек
        mpCost: 20,
        atkSpeedMult: 1.7,   // быстрее стреляет
        arrowSpeedMult: 1.5, // стрелы летят быстрее
        fanCount: 3,         // количество стрел веером
        fanSpreadDeg: 18     // угол разброса между стрелами
    },
    mage: {
        key: 'heal',
        name: 'Исцеление',
        icon: '✨',
        desc: 'Восстанавливает HP + реген на 5 сек',
        cd: 1200,      // 20 сек
        dur: 300,      // 5 сек реген после
        mpCost: 30,
        healPercent: 0.35,   // мгновенное лечение 35% от maxHP
        regenPerSec: 0.02    // дополнительный реген %maxHP/сек на время dur
    }
};

// ============================================================
//  STAT_GAINS — прибавки за 1 очко стата по классам
// ============================================================
// Используется: ui/CharScreen (распределение очков) и
// systems/Masters (иконки бонусов от экипировки).
const STAT_GAINS = {
    hp:  { warrior: 20, archer: 15, mage: 10, icon: '❤️', name: 'Здоровье',  field: 'maxhp' },
    mp:  { warrior: 5,  archer: 8,  mage: 15, icon: '💧', name: 'Мана',      field: 'maxmp' },
    atk: { warrior: 5,  archer: 4,  mage: 4,  icon: '⚔️', name: 'Атака',     field: 'atk'  },
    def: { warrior: 3,  archer: 2,  mage: 1,  icon: '🛡️', name: 'Защита',    field: 'def'  },
    spd:    { warrior: 0.15, archer: 0.25, mage: 0.25, icon: '💨', name: 'Скорость',       field: 'spd'    },
    atkSpd: { warrior: 0.15, archer: 0.20, mage: 0.15, icon: '⚡', name: 'Скорость атаки', field: '_atkSpdStat' },
};
