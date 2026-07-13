// ============================================================
//  UI ОБРАБОТЧИКИ (диалог смерти, сохранения, выбора уровня)
// ============================================================
function initUIHandlers() {
    // Кнопка рестарта
    document.getElementById('rbtn').addEventListener('click', () => {
        resetSave();
        location.reload();
    });
    
    // Диалог сохранения
    document.getElementById('sd-continue').addEventListener('click', () => {
        document.getElementById('save-dialog').classList.remove('open');
        if (loadGame()) {
            startGame(true);
        } else {
            showQNotif('❌ Не удалось загрузить сохранение!');
        }
    });
    
    document.getElementById('sd-new').addEventListener('click', () => {
        document.getElementById('save-dialog').classList.remove('open');
        resetSave();
        document.getElementById('hero-name').value = '';
        document.querySelectorAll('.class-btn').forEach(b => b.classList.remove('selected'));
        document.querySelector('.class-btn[data-class="warrior"]').classList.add('selected');
        document.getElementById('load-btn').style.display = 'none';
        document.getElementById('reset-btn').style.display = 'none';
        document.getElementById('create-sub').textContent = 'Выбери имя и класс';
        showQNotif('🗑️ Прогресс сброшен');
    });
    
    // Диалог выбора уровня
    document.getElementById('lv-cancel').addEventListener('click', () => {
        document.getElementById('level-dialog').classList.remove('open');
    });
    
    document.getElementById('lv-enter').addEventListener('click', () => {
        const lvDialog = document.getElementById('level-dialog');
        const selectedLevel = parseInt(lvDialog.dataset.selectedLevel || 1);
        const cost = (selectedLevel - 1) * CFG.LEVEL_COST;
        
        if (G.p.gold < cost) {
            showQNotif('❌ Не хватает золота! Нужно ' + cost + '💰');
            return;
        }
        if (selectedLevel > maxDepthReached + 1) {
            showQNotif('❌ Этот уровень ещё не открыт!');
            return;
        }
        
        G.p.gold -= cost;
        lvDialog.classList.remove('open');
        fadeTransition(() => enterDungeon(selectedLevel));
        saveGame(true);
    });
}

// ============================================================
//  ВЫБОР УРОВНЯ
// ============================================================
function openLevelDialog() {
    const dialog = document.getElementById('level-dialog');
    const maxLv = Math.max(maxDepthReached + 1, 1);
    document.getElementById('lv-available').textContent = maxLv;
    
    const list = document.getElementById('level-list');
    list.innerHTML = '';
    
    let selectedLevel = Math.min(maxDepthReached + 1, G.depth + 1);
    if (G.depth === 0 && maxDepthReached === 0) selectedLevel = 1;
    
    for(let i = 1; i <= maxLv; i++) {
        const btn = document.createElement('button');
        btn.className = 'level-btn';
        if(i > maxDepthReached + 1) btn.classList.add('locked');
        if(i === selectedLevel) btn.classList.add('selected');
        
        const cost = (i - 1) * CFG.LEVEL_COST;
        btn.innerHTML = `${i}${i > maxDepthReached + 1 ? ' 🔒' : ''}<span class="cost">${cost}💰</span>`;
        btn.dataset.level = i;
        
        if(i <= maxDepthReached + 1) {
            btn.addEventListener('click', () => {
                dialog.dataset.selectedLevel = i;
                document.querySelectorAll('.level-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
            });
        }
        list.appendChild(btn);
    }
    
    dialog.dataset.selectedLevel = selectedLevel;
    dialog.classList.add('open');
}

function showSaveDialog() {
    try {
        const data = JSON.parse(localStorage.getItem(SAVE_KEY));
        if(data?.playerData) {
            document.getElementById('sd-name').textContent = data.playerData.name || 'Герой';
            document.getElementById('sd-level').textContent = data.lv || 1;
            document.getElementById('sd-depth').textContent = data.depth || 0;
        }
    } catch(e) {}
    document.getElementById('save-dialog').classList.add('open');
    // Показываем кнопки на экране создания
    document.getElementById('load-btn').style.display = 'inline-block';
    document.getElementById('reset-btn').style.display = 'inline-block';
    document.getElementById('create-sub').textContent = 'Найдено сохранение!';
}
