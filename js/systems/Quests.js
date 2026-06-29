// ============================================================
//  QUESTS
// ============================================================
let questState = {};
let activeQuests = [];
let questGenerationDepth = 0;

const QUEST_POOLS = {
    base: [
        { id:'q1', name:'Охота на гоблинов', target:'Гоблин', need:5, reward:80 },
        { id:'q2', name:'Скелеты в шкафу', target:'Скелет', need:5, reward:120 },
        { id:'q3', name:'Истребитель орков', target:'Орк', need:3, reward:180 },
        { id:'q4', name:'Охотник на призраков', target:'Призрак', need:4, reward:160 },
        { id:'q5', name:'Убийца драконов', target:'Дракон', need:2, reward:350 }
    ],
    advanced: [
        { id:'aq1', name:'Истребитель гоблинов', target:'Гоблин', need:15, reward:250 },
        { id:'aq2', name:'Армия скелетов', target:'Скелет', need:15, reward:350 },
        { id:'aq3', name:'Орды орков', target:'Орк', need:10, reward:450 },
        { id:'aq4', name:'Охотник за призраками', target:'Призрак', need:12, reward:400 },
        { id:'aq5', name:'Повелитель драконов', target:'Дракон', need:5, reward:700 },
        { id:'aq6', name:'Массовое истребление', target:'Любой', need:30, reward:500 }
    ],
    elemental: [
        { id:'eq1', name:'Огненная угроза', target:'Огненный Элементаль', need:10, reward:300 },
        { id:'eq2', name:'Водная стихия', target:'Водный Элементаль', need:10, reward:300 },
        { id:'eq3', name:'Земная мощь', target:'Земляной Элементаль', need:10, reward:350 },
        { id:'eq4', name:'Воздушный поток', target:'Воздушный Элементаль', need:10, reward:350 },
        { id:'eq5', name:'Повелитель стихий', target:'Любой', need:25, reward:500 }
    ],
    epic: [
        { id:'ep1', name:'Король гоблинов', target:'Гоблин', need:30, reward:600 },
        { id:'ep2', name:'Некромант', target:'Скелет', need:30, reward:800 },
        { id:'ep3', name:'Вождь орков', target:'Орк', need:20, reward:1000 },
        { id:'ep4', name:'Призрачный легион', target:'Призрак', need:25, reward:900 },
        { id:'ep5', name:'Драконий клан', target:'Дракон', need:10, reward:1500 },
        { id:'ep6', name:'Элементальный хаос', target:'Любой', need:40, reward:1200 },
        { id:'ep7', name:'Уничтожитель миров', target:'Любой', need:60, reward:2000 }
    ]
};

function generateQuests(depth) {
    const numQuests = Math.min(3 + Math.floor(depth/5), 6);
    let pool = [...QUEST_POOLS.base];
    if(depth>=5) pool = pool.concat(QUEST_POOLS.advanced.slice(0,3));
    if(depth>=10) pool = pool.concat(QUEST_POOLS.advanced.slice(3));
    if(depth>=8) pool = pool.concat(QUEST_POOLS.elemental);
    if(depth>=20) pool = pool.concat(QUEST_POOLS.epic.slice(0,3));
    if(depth>=30) pool = pool.concat(QUEST_POOLS.epic.slice(3));
    
    for(let i=pool.length-1; i>0; i--) {
        const j=Math.floor(Math.random()*(i+1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    
    const selected = [], used = new Set();
    for(const q of pool) {
        if(selected.length >= numQuests) break;
        if(q.target === 'Любой' || !used.has(q.target)) {
            used.add(q.target);
            selected.push({ ...q, id: q.id + '_' + Date.now() + '_' + Math.random().toString(36).substr(2,3) });
        }
    }
    return selected;
}

function initQuests(depth) {
    const quests = generateQuests(depth);
    activeQuests = quests;
    questState = {};
    quests.forEach(q => questState[q.id] = { kills: 0, claimed: false });
    questGenerationDepth = depth;
    updateQuestTracker();
}

function updateQuestTracker() {
    const active = activeQuests.find(q => !questState[q.id].claimed && questState[q.id].kills < q.need);
    const el = document.getElementById('quest-tracker');
    if(active) {
        el.style.display = 'block';
        const st = questState[active.id];
        document.getElementById('qt-name').textContent = '📋 ' + active.name;
        document.getElementById('qt-progress').textContent = '⚔ ' + st.kills + '/' + active.need;
    } else {
        el.style.display = 'none';
    }
}

function onEnemyKilled(name) {
    let any = false;
    for(const q of activeQuests) {
        if((q.target === 'Любой' || q.target === name) && !questState[q.id].claimed) {
            const st = questState[q.id];
            if(st.kills < q.need) {
                st.kills++;
                any = true;
                if(st.kills >= q.need) {
                    showQNotif('✅ «' + q.name + '» — выполнено! Сдай у Старейшины.');
                    sound.play('levelup');
                }
            }
        }
    }
    if(any) updateQuestTracker();
}