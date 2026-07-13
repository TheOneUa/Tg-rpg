// ============================================================
//  ГЛАВНОЕ МЕНЮ
// ============================================================
function showMainMenu() {
    // Авторизация Telegram
    const tgUser = initTelegram();
    if (tgUser) {
        playerData.tgId = tgUser.id;
        playerData.tgUsername = tgUser.username || tgUser.first_name || 'Игрок';
    }
    
    const username = playerData.tgUsername || 'Гость';
    document.getElementById('menu-user').innerHTML = tgUser
        ? '👤 <span>' + username + '</span>'
        : '';
    document.getElementById('menu-version').textContent = 'v' + VERSION;
    
    const hasSaveData = hasSave();
    
    if (hasSaveData) {
        // Показать карточку сохранения
        try {
            const data = JSON.parse(localStorage.getItem(SAVE_KEY));
            if (data?.playerData) {
                document.getElementById('menu-hero-name').textContent =
                    (data.playerData.name || 'Герой') + ' — ' + (data.playerData.class ? CLASSES[data.playerData.class]?.name || '' : '');
                document.getElementById('menu-save-level').textContent = 'Ур. ' + (data.lv || 1);
                document.getElementById('menu-save-depth').textContent = 'Глубина: ' + (data.depth || 0);
            }
        } catch(e) {}
        document.getElementById('menu-save-card').style.display = 'block';
        document.getElementById('menu-continue').style.display = 'flex';
        document.getElementById('menu-delete').style.display = 'flex';
        document.getElementById('menu-new-text').innerHTML = 'Новая игра<span class="btn-sub">Начать с нуля</span>';
    } else {
        document.getElementById('menu-save-card').style.display = 'none';
        document.getElementById('menu-continue').style.display = 'none';
        document.getElementById('menu-delete').style.display = 'none';
        document.getElementById('menu-new-text').innerHTML = 'Начать игру<span class="btn-sub">Создать героя</span>';
    }
    
    document.getElementById('menu-screen').classList.add('open');
}

function initMenuHandlers() {
    document.getElementById('menu-continue').addEventListener('click', () => {
        document.getElementById('menu-screen').classList.remove('open');
        if (loadGame()) {
            startGame(true);
        } else {
            showQNotif('❌ Не удалось загрузить сохранение!');
            document.getElementById('menu-screen').classList.add('open');
        }
    });
    
    document.getElementById('menu-new').addEventListener('click', () => {
        document.getElementById('menu-screen').classList.remove('open');
        document.getElementById('create-screen').classList.add('open');
    });

    document.getElementById('menu-settings').addEventListener('click', () => {
        document.getElementById('menu-screen').classList.remove('open');
        document.getElementById('settings-screen').classList.add('open');
    });
    
    document.getElementById('menu-delete').addEventListener('click', () => {
        if (confirm('Удалить сохранение? Это действие нельзя отменить.')) {
            resetSave();
            showQNotif('🗑️ Сохранение удалено');
            showMainMenu();
        }
    });

    bindTapButton(document.getElementById('menu-admin'), () => {
        document.getElementById('menu-screen').classList.remove('open');
        openAdminPinScreen();
    });
}
