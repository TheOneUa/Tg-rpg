// ============================================================
//  HUD
// ============================================================
const HUD_ELEMENTS = {
    fhp: document.getElementById('fhp'),
    fmp: document.getElementById('fmp'),
    fxp: document.getElementById('fxp'),
    thp: document.getElementById('thp'),
    tmp: document.getElementById('tmp'),
    slv: document.getElementById('slv'),
    sat: document.getElementById('sat'),
    sgold: document.getElementById('s-gold'),
    sloc: document.getElementById('s-loc'),
    sdepth: document.getElementById('s-depth'),
    smaxdepth: document.getElementById('s-maxdepth'),
    sres: document.getElementById('s-res'),
    ssave: document.getElementById('s-save'),
    sq: document.getElementById('s-quests'),
    sa: document.getElementById('s-ach'),
    qv: [0,1,2,3].map(i => document.getElementById('qv' + i)),
    cd: [0,1,2,3].map(i => document.getElementById('cd' + i))
};

const SLOT_KEYS = ['hpPot', 'mpPot'];

function updateSlotCooldowns(cds) {
    for(let i=0; i<2; i++) {
        if(!HUD_ELEMENTS.cd[i]) continue;
        if(cds[i] > 0) {
            HUD_ELEMENTS.cd[i].style.opacity = '1';
            HUD_ELEMENTS.cd[i].textContent = (cds[i]/60*10|0)/10 + 's';
        } else {
            HUD_ELEMENTS.cd[i].style.opacity = '0';
        }
    }
}

function hudUpdate(p) {
    HUD_ELEMENTS.fhp.style.width = Math.max(0, p.hp/p.effMaxhp*100) + '%';
    HUD_ELEMENTS.fmp.style.width = Math.max(0, p.mp/p.effMaxmp*100) + '%';
    HUD_ELEMENTS.fxp.style.width = Math.max(0, p.exp/p.exn*100) + '%';
    HUD_ELEMENTS.thp.textContent = p.hp + '/' + p.effMaxhp;
    HUD_ELEMENTS.tmp.textContent = p.mp + '/' + p.effMaxmp;
    HUD_ELEMENTS.slv.textContent = 'Ур.' + p.lv;
    HUD_ELEMENTS.sat.textContent = '⚔' + p.effAtk + ' 🛡' + p.effDef;
    HUD_ELEMENTS.sgold.textContent = '💰' + p.gold;
    let locText = '📍 Деревня';
    if (G.location === 'dungeon') locText = '⚔ Подземелье';
    else if (G.location === 'house') {
        const h = VILLAGE_HOUSES.find(h => h.id === G.currentHouse);
        locText = '🚪 ' + (typeof h.name === 'function' ? h.name() : h.name || 'Дом');
    }
    HUD_ELEMENTS.sloc.textContent = locText;
    HUD_ELEMENTS.sdepth.textContent = '⚔ ' + G.depth;
    HUD_ELEMENTS.smaxdepth.textContent = '🏆 ' + maxDepthReached;
    HUD_ELEMENTS.sres.textContent = '🪨' + (p.resources.ore||0) + ' 🪵' + (p.resources.wood||0) + ' 💎' + (p.resources.essence||0);
    
    const total = activeQuests.length;
    const done = activeQuests.filter(q => questState[q.id]?.claimed).length;
    HUD_ELEMENTS.sq.textContent = '📋' + (total - done) + '/' + total;
    
    const achDone = ACHIEVEMENTS.filter(a => achievements[a.id]).length;
    HUD_ELEMENTS.sa.textContent = '🏆' + achDone + '/' + ACHIEVEMENTS.length;
    
    HUD_ELEMENTS.qv[0].textContent = 'x' + (p.bag.hpPot || 0);
    HUD_ELEMENTS.qv[1].textContent = 'x' + (p.bag.mpPot || 0);
}

// Обработчики слотов (touchstart для поддержки мульти-тач на iOS)
[0,1,2,3].forEach(i => {
    bindTapButton(document.getElementById('qs' + i), () => {
        inp.useSlot = SLOT_KEYS[i];
        tgVibrate('light');
    });
});