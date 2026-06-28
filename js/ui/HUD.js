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
    ssave: document.getElementById('s-save'),
    sq: document.getElementById('s-quests'),
    sa: document.getElementById('s-ach'),
    qv: [0,1,2,3].map(i => document.getElementById('qv' + i)),
    cd: [0,1,2,3].map(i => document.getElementById('cd' + i))
};

const SLOT_KEYS = ['hpPot', 'mpPot', 'sword', 'shield'];

function updateSlotCooldowns(cds) {
    for(let i=0; i<4; i++) {
        if(cds[i] > 0) {
            HUD_ELEMENTS.cd[i].style.opacity = '1';
            HUD_ELEMENTS.cd[i].textContent = (cds[i]/60*10|0)/10 + 's';
        } else {
            HUD_ELEMENTS.cd[i].style.opacity = '0';
        }
    }
}

function hudUpdate(p) {
    HUD_ELEMENTS.fhp.style.width = Math.max(0, p.hp/p.maxhp*100) + '%';
    HUD_ELEMENTS.fmp.style.width = Math.max(0, p.mp/p.maxmp*100) + '%';
    HUD_ELEMENTS.fxp.style.width = Math.max(0, p.exp/p.exn*100) + '%';
    HUD_ELEMENTS.thp.textContent = p.hp + '/' + p.maxhp;
    HUD_ELEMENTS.tmp.textContent = p.mp + '/' + p.maxmp;
    HUD_ELEMENTS.slv.textContent = 'Ур.' + p.lv;
    HUD_ELEMENTS.sat.textContent = '⚔' + p.atk + ' 🛡' + p.def;
    HUD_ELEMENTS.sgold.textContent = '💰' + p.gold;
    HUD_ELEMENTS.sloc.textContent = G.depth > 0 ? '⚔ Подземелье' : '📍 Деревня';
    HUD_ELEMENTS.sdepth.textContent = '⚔ ' + G.depth;
    HUD_ELEMENTS.smaxdepth.textContent = '🏆 ' + maxDepthReached;
    
    const total = activeQuests.length;
    const done = activeQuests.filter(q => questState[q.id]?.claimed).length;
    HUD_ELEMENTS.sq.textContent = '📋' + (total - done) + '/' + total;
    
    const achDone = ACHIEVEMENTS.filter(a => achievements[a.id]).length;
    HUD_ELEMENTS.sa.textContent = '🏆' + achDone + '/' + ACHIEVEMENTS.length;
    
    HUD_ELEMENTS.qv[0].textContent = 'x' + p.bag.hpPot;
    HUD_ELEMENTS.qv[1].textContent = 'x' + p.bag.mpPot;
    HUD_ELEMENTS.qv[2].textContent = 'x' + p.bag.sword;
    HUD_ELEMENTS.qv[3].textContent = 'x' + p.bag.shield;
    
    // Обновляем подсказку на кнопке действия
    updateActionButton();
}

// ============================================================
//  ПОДСКАЗКА НА КНОПКЕ ДЕЙСТВИЯ
// ============================================================
function updateActionButton() {
    const btn = document.getElementById('bp');
    if (!btn) return;
    
    if (!G.p) return;
    
    const p = G.p;
    const npcs = G.npcs || [];
    const tm = getCurrentTM ? getCurrentTM() : [];
    
    const nearest = findNearestInteractable(p.x, p.y, tm, npcs);
    
    if(nearest.type) {
        switch(nearest.type) {
            case 'npc':
                btn.textContent = '💬';
                btn.style.borderColor = '#44ff88';
                btn.style.background = 'rgba(0,90,80,.55)';
                break;
            case 'portal_enter':
                btn.textContent = '⬇️';
                btn.style.borderColor = '#ff8844';
                btn.style.background = 'rgba(90,50,0,.55)';
                break;
            case 'portal_exit':
                btn.textContent = '⬆️';
                btn.style.borderColor = '#44ff88';
                btn.style.background = 'rgba(0,90,50,.55)';
                break;
            case 'portal_deeper':
                btn.textContent = '⬇️';
                btn.style.borderColor = '#ff8844';
                btn.style.background = 'rgba(90,50,0,.55)';
                break;
            default:
                btn.textContent = '🌀';
                btn.style.borderColor = 'rgba(0,195,175,.8)';
                btn.style.background = 'rgba(0,90,80,.55)';
        }
    } else {
        btn.textContent = '🌀';
        btn.style.borderColor = 'rgba(0,195,175,.8)';
        btn.style.background = 'rgba(0,90,80,.55)';
    }
}

// Обработчики слотов
[0,1,2,3].forEach(i => {
    document.getElementById('qs' + i).addEventListener('click', () => {
        inp.useSlot = SLOT_KEYS[i];
        tgVibrate('light');
    });
});

console.log('✅ HUD.js загружен');