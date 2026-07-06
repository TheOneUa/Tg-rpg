// ============================================================
//  QUESTS — накапливающийся список, сдача только у Старейшины
// ============================================================
let questState = {};
let activeQuests = [];
let questGenerationDepth = 0;

// Типы квестов: kill / boss / gold / depth
const QUEST_TEMPLATES = [
    // Убийства обычных врагов
    { type:'kill', target:'Гоблин',   need:5,  reward:{ gold:80,  exp:60,  item:'hpPot'  }, name:'Охота на гоблинов',      minDepth:1 },
    { type:'kill', target:'Скелет',   need:5,  reward:{ gold:120, exp:90,  item:'mpPot'  }, name:'Скелеты в шкафу',        minDepth:1 },
    { type:'kill', target:'Орк',      need:3,  reward:{ gold:180, exp:140, item:'hpPot'  }, name:'Истребитель орков',       minDepth:3 },
    { type:'kill', target:'Призрак',  need:4,  reward:{ gold:160, exp:120, item:'mpPot'  }, name:'Охотник на призраков',    minDepth:4 },
    { type:'kill', target:'Дракон',   need:2,  reward:{ gold:350, exp:280, item:'hpPot'  }, name:'Убийца дракончиков',     minDepth:6 },
    { type:'kill', target:'Любой',    need:15, reward:{ gold:200, exp:160, item:'hpPot'  }, name:'Зачистка подземелья',    minDepth:2 },
    // Продвинутые убийства
    { type:'kill', target:'Гоблин',   need:20, reward:{ gold:300, exp:240, item:'mpPot'  }, name:'Истребитель гоблинов',   minDepth:5 },
    { type:'kill', target:'Скелет',   need:20, reward:{ gold:400, exp:320, item:'hpPot'  }, name:'Армия скелетов',         minDepth:5 },
    { type:'kill', target:'Орк',      need:15, reward:{ gold:500, exp:400, item:'mpPot'  }, name:'Орды орков',             minDepth:8 },
    { type:'kill', target:'Любой',    need:40, reward:{ gold:600, exp:480, item:'hpPot'  }, name:'Массовое истребление',   minDepth:10 },
    { type:'kill', target:'Любой',    need:80, reward:{ gold:1200,exp:960, item:'mpPot'  }, name:'Уничтожитель миров',     minDepth:20 },
    // Боссы
    { type:'boss', target:'любой',    need:1,  reward:{ gold:400, exp:350, item:'hpPot'  }, name:'Первый трофей',          minDepth:5 },
    { type:'boss', target:'любой',    need:3,  reward:{ gold:800, exp:700, item:'mpPot'  }, name:'Охотник на боссов',      minDepth:5 },
    { type:'boss', target:'любой',    need:5,  reward:{ gold:1500,exp:1200,item:'hpPot'  }, name:'Убийца титанов',         minDepth:10 },
    { type:'boss', target:'любой',    need:10, reward:{ gold:3000,exp:2400,item:'mpPot'  }, name:'Легенда подземелья',     minDepth:20 },
    // Глубина
    { type:'depth', need:3,  reward:{ gold:150, exp:100, item:'hpPot' }, name:'Исследователь',          minDepth:1 },
    { type:'depth', need:5,  reward:{ gold:250, exp:200, item:'mpPot' }, name:'Первопроходец',          minDepth:1 },
    { type:'depth', need:10, reward:{ gold:500, exp:400, item:'hpPot' }, name:'Покоритель глубин',      minDepth:1 },
    { type:'depth', need:20, reward:{ gold:1000,exp:800, item:'mpPot' }, name:'Властелин подземелья',   minDepth:1 },
    { type:'depth', need:30, reward:{ gold:2000,exp:1600,item:'hpPot' }, name:'Бездонный исследователь',minDepth:1 },
    // Золото
    { type:'gold', need:200,  reward:{ gold:100, exp:80,  item:'hpPot' }, name:'Начинающий торговец',   minDepth:1 },
    { type:'gold', need:500,  reward:{ gold:250, exp:200, item:'mpPot' }, name:'Опытный торговец',      minDepth:1 },
    { type:'gold', need:1000, reward:{ gold:500, exp:400, item:'hpPot' }, name:'Богатый авантюрист',    minDepth:1 },
    { type:'gold', need:3000, reward:{ gold:1200,exp:1000,item:'mpPot' }, name:'Золотой магнат',        minDepth:1 },
];

// Прогресс по типам (накапливается глобально)
let questProgress = {
    kills: {},    // { 'Гоблин': 5, 'Любой': 12, ... }
    bossKillsQ: 0,
    goldEarned: 0,
    maxDepthQ: 0
};

function initQuests(depth) {
    // Добавляем квесты нового уровня глубины (не заменяем старые)
    const newQuests = QUEST_TEMPLATES.filter(t => {
        const minOk = t.minDepth <= depth + 2;
        const alreadyHas = activeQuests.some(q => q.name === t.name);
        return minOk && !alreadyHas;
    });
    newQuests.forEach(t => {
        const q = { ...t, id: t.name.replace(/\s/g,'_') + '_' + t.minDepth };
        activeQuests.push(q);
        if (!questState[q.id]) {
            questState[q.id] = { claimed: false };
        }
    });
    questGenerationDepth = depth;
    updateQuestTracker();
}

function questProgressFor(q) {
    if (q.type === 'kill') {
        const any = questProgress.kills['Любой'] || 0;
        const spec = questProgress.kills[q.target] || 0;
        return q.target === 'Любой' ? any : spec;
    }
    if (q.type === 'boss')  return questProgress.bossKillsQ;
    if (q.type === 'gold')  return questProgress.goldEarned;
    if (q.type === 'depth') return questProgress.maxDepthQ;
    return 0;
}

function isQuestDone(q) {
    return questProgressFor(q) >= q.need;
}

function updateQuestTracker() {
    const inProgress = activeQuests.find(q =>
        !questState[q.id]?.claimed && !isQuestDone(q));
    const el = document.getElementById('quest-tracker');
    if (!el) return;
    if (inProgress) {
        el.style.display = 'block';
        document.getElementById('qt-name').textContent = '📋 ' + inProgress.name;
        const prog = questProgressFor(inProgress);
        document.getElementById('qt-progress').textContent = prog + '/' + inProgress.need;
    } else {
        const readyToClaim = activeQuests.some(q => !questState[q.id]?.claimed && isQuestDone(q));
        if (readyToClaim) {
            el.style.display = 'block';
            document.getElementById('qt-name').textContent = '✅ Квест выполнен!';
            document.getElementById('qt-progress').textContent = 'Сдай у Старейшины';
        } else {
            el.style.display = 'none';
        }
    }
}

function onEnemyKilled(name) {
    questProgress.kills['Любой'] = (questProgress.kills['Любой'] || 0) + 1;
    if (name) questProgress.kills[name] = (questProgress.kills[name] || 0) + 1;
    _checkQuestCompletion();
}

function onBossKilled() {
    questProgress.bossKillsQ++;
    _checkQuestCompletion();
}

function onGoldEarned(amount) {
    questProgress.goldEarned = (questProgress.goldEarned || 0) + amount;
    _checkQuestCompletion();
}

function onDepthReached(depth) {
    if (depth > questProgress.maxDepthQ) {
        questProgress.maxDepthQ = depth;
        _checkQuestCompletion();
    }
}

function _checkQuestCompletion() {
    for (const q of activeQuests) {
        if (!questState[q.id]?.claimed && isQuestDone(q)) {
            if (!questState[q.id]._notified) {
                questState[q.id]._notified = true;
                showQNotif('✅ «' + q.name + '» выполнено! Иди к Старейшине');
                sound.play('levelup');
            }
        }
    }
    updateQuestTracker();
}

// Открыть список квестов (вызывается у Старейшины)
function openQuests() {
    const isAtElder = true; // вызывается только через NPC.talk() Старейшины
    mtitle.textContent = '📜 Задания Старейшины';
    msub.textContent = 'Выполняй задания и получай награды';

    // Сортировка: сначала выполненные (можно сдать), потом в процессе, потом сданные
    const sorted = [...activeQuests].sort((a, b) => {
        const aDone  = isQuestDone(a) && !questState[a.id]?.claimed;
        const bDone  = isQuestDone(b) && !questState[b.id]?.claimed;
        const aClaim = questState[a.id]?.claimed;
        const bClaim = questState[b.id]?.claimed;
        if (aDone && !bDone) return -1;
        if (!aDone && bDone) return 1;
        if (aClaim && !bClaim) return 1;
        if (!aClaim && bClaim) return -1;
        return 0;
    });

    mbody.innerHTML = sorted.map(q => {
        const st = questState[q.id] || {};
        const prog = questProgressFor(q);
        const done = isQuestDone(q);
        const claimed = st.claimed;
        const r = q.reward;

        const typeIcon = { kill:'⚔️', boss:'👑', gold:'💰', depth:'⬇️' }[q.type] || '📋';
        const rewardStr = `💰${r.gold} ✨${r.exp} XP ${ITEM_DEFS[r.item]?.icon||''}×1`;
        const statusColor = claimed ? '#555' : done ? '#4caf50' : '#888';

        return `<div class="mitem" style="opacity:${claimed?0.5:1}">
            <div class="micon" style="background:rgba(255,215,0,.1);border:1px solid rgba(255,215,0,.3);font-size:18px;display:flex;align-items:center;justify-content:center">${typeIcon}</div>
            <div class="minfo">
                <div class="mname">${q.name}</div>
                <div class="mdesc" style="color:${statusColor}">${claimed ? '✅ Сдано' : prog + ' / ' + q.need}</div>
                <div class="mdesc" style="color:#ffd700;font-size:10px">${rewardStr}</div>
            </div>
            ${done && !claimed
                ? `<button class="mbuy" data-qid="${q.id}">Сдать</button>`
                : claimed
                ? `<span style="font-size:20px">✅</span>`
                : ''
            }
        </div>`;
    }).join('') || '<div style="color:#555;padding:20px;text-align:center">Квестов пока нет</div>';

    // Обработчики кнопок "Сдать"
    mbody.querySelectorAll('[data-qid]').forEach(btn => {
        btn.addEventListener('click', () => {
            const q = activeQuests.find(x => x.id === btn.dataset.qid);
            if (!q || questState[q.id]?.claimed || !isQuestDone(q)) return;
            const p = G.p;
            const r = q.reward;
            // Выдаём награду
            p.gold += r.gold;
            p.exp  += r.exp;
            if (r.item) p.bag[r.item] = (p.bag[r.item] || 0) + 1;
            questState[q.id].claimed = true;
            // Проверяем левелап
            while (p.exp >= p.exn) {
                p.exp -= p.exn;
                p.lvup(G.floats);
            }
            showQNotif('🎁 Награда: ' + r.gold + '💰 ' + r.exp + 'XP');
            sound.play('levelup');
            saveGame(true);
            openQuests(); // обновить список
        });
    });

    modal.classList.add('open');
}
