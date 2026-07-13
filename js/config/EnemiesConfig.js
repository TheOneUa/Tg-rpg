// ============================================================
//  ENEMY TYPES
// ============================================================
// def — броня врага, снижает входящий урон (см. combat/DamageFormula.js)
const ENEMY_TYPES = [
    { name: 'Гоблин', hp: 40,  atk: 8,  def: 1, exp: 20,  color: '#50a03c', icon: '👹' },
    { name: 'Скелет', hp: 60,  atk: 12, def: 3, exp: 35,  color: '#c8c8b4', icon: '💀' },
    { name: 'Орк', hp: 100, atk: 18, def: 5, exp: 60,  color: '#3c6432', icon: '👺' },
    { name: 'Призрак', hp: 50,  atk: 14, def: 0, exp: 45,  color: '#6464c8', icon: '👻' },
    { name: 'Дракон', hp: 200, atk: 30, def: 10, exp: 150, color: '#b42828', icon: '🐉' },
    { name: 'Огненный Элементаль', hp: 80,  atk: 20, def: 4, exp: 70,  color: '#ff4422', icon: '🔥' },
    { name: 'Водный Элементаль', hp: 90,  atk: 15, def: 6, exp: 65,  color: '#2288ff', icon: '💧' },
    { name: 'Земляной Элементаль', hp: 120, atk: 12, def: 12, exp: 60,  color: '#66aa44', icon: '🪨' },
    { name: 'Воздушный Элементаль', hp: 60,  atk: 22, def: 2, exp: 75,  color: '#88ccff', icon: '💨' }
];

// ============================================================
//  BOSS TYPES
// ============================================================
const BOSS_TYPES = [
    { name: '👑 Король Гоблинов', hp: 300, atk: 40, def: 8,  exp: 300, color: '#ff8844', icon: '👑' },
    { name: '👑 Лорд Скелетов', hp: 400, atk: 45, def: 12, exp: 350, color: '#ccccff', icon: '👑' },
    { name: '👑 Вождь Орков', hp: 500, atk: 50, def: 16, exp: 400, color: '#44aa44', icon: '👑' },
    { name: '👑 Призрачный Король', hp: 350, atk: 55, def: 6,  exp: 380, color: '#6666ff', icon: '👑' },
    { name: '👑 Дракон-Пожиратель', hp: 700, atk: 60, def: 20, exp: 500, color: '#ff2266', icon: '👑' }
];
