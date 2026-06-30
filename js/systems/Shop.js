// ============================================================
//  SHOP
// ============================================================
function openShop() {
    const p = G.p;
    mtitle.textContent = '🛒 Магазин';
    msub.textContent = 'Ваше золото: ' + p.gold + '💰';
    mbody.innerHTML = SHOP.map((si,i) => `
        <div class="mitem">
            <div class="micon" style="background:rgba(255,255,255,.08);border:1px solid #555">${si.icon}</div>
            <div class="minfo">
                <div class="mname">${si.name}</div>
                <div class="mdesc">${si.desc}</div>
                <div class="mprice">💰 ${si.price}</div>
            </div>
            <button class="mbtn buy" data-i="${i}">Купить</button>
        </div>
    `).join('');
    
    mbody.querySelectorAll('.mbtn.buy').forEach((btn,i) => {
        btn.addEventListener('click', () => {
            const si = SHOP[i];
            if(G.p.gold < si.price) {
                msub.textContent = '❌ Мало золота!';
                return;
            }
            G.p.gold -= si.price;
            G.p.bag[si.give] = (G.p.bag[si.give] || 0) + 1;
            msub.textContent = '✅ Куплено: ' + si.name + ' | Золото: ' + G.p.gold;
            G.floats.push(new FText(G.p.x, G.p.y - CFG.TILE, si.icon + ' +1', '#ffd700', 15));
            sound.play('pickup');
            tgVibrate('light');
            saveGame(true);
            openShop();
        });
    });
    modal.classList.add('open');
}

function openQuests() {
    const p = G.p;
    mtitle.textContent = '📜 Задания (Глубина ' + G.depth + ')';
    const total = activeQuests.length;
    const done = activeQuests.filter(q => questState[q.id].claimed).length;
    msub.textContent = 'Выполнено: ' + done + '/' + total;
    
    if(activeQuests.length === 0) {
        mbody.innerHTML = '<div style="color:#aaa;text-align:center;padding:20px;">Нет активных заданий</div>';
    } else {
        mbody.innerHTML = activeQuests.map(q => {
            const st = questState[q.id];
            const done2 = st.kills >= q.need;
            const claimed = st.claimed;
            const btnTxt = claimed ? 'Сдано' : done2 ? 'Получить' : 'В процессе';
            const btnCls = 'mbtn ' + (claimed ? 'qclaim' : done2 ? 'qdone' : 'qact');
            return `<div class="mitem">
                <div class="micon" style="background:rgba(30,60,20,.8);border:1px solid #446644">📋</div>
                <div class="minfo">
                    <div class="mname">${q.name}</div>
                    <div class="mdesc">${q.target} (${st.kills}/${q.need})</div>
                    <div class="mprice">${claimed ? '✅ Выполнено' : '💰 ' + q.reward}</div>
                </div>
                <button class="${btnCls}" ${claimed ? 'disabled' : ''} data-qid="${q.id}">${btnTxt}</button>
            </div>`;
        }).join('');
        
        mbody.querySelectorAll('.mbtn.qact, .mbtn.qdone').forEach(btn => {
            const qid = btn.dataset.qid;
            const q = activeQuests.find(q2 => q2.id === qid);
            if(!q || questState[qid].claimed) return;
            btn.addEventListener('click', () => {
                if(questState[qid].kills < q.need) return;
                questState[qid].claimed = true;
                G.p.gold += q.reward;
                stats.totalGold += q.reward;
                G.floats.push(new FText(G.p.x, G.p.y - CFG.TILE, '💰 +' + q.reward, '#ffd700', 17));
                sound.play('kill');
                tgVibrate('medium');
                updateQuestTracker();
                saveGame(true);
                openQuests();
            });
        });
    }
    modal.classList.add('open');
}