// ============================================================
//  ПИНКОД АДМИН-ПАНЕЛИ (из меню)
// ============================================================
const ADMIN_PIN_KEY = 'tg_rpg_admin_pin';
const ADMIN_TG_IDS  = []; // добавь свой Telegram ID: [123456789]

let _adminPinBuf = '';

function getAdminPin() {
    return localStorage.getItem(ADMIN_PIN_KEY) || '1234';
}

function openAdminPinScreen() {
    _adminPinBuf = '';
    _updateAdminPinDisplay();
    document.getElementById('admin-pin-error').textContent = '';
    document.getElementById('admin-pin-screen').classList.add('open');

    // Если Telegram ID совпадает — сразу войти
    try {
        const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
        if (tgUser && ADMIN_TG_IDS.includes(tgUser.id)) {
            document.getElementById('admin-pin-screen').classList.remove('open');
            _openAdminPanel();
            return;
        }
    } catch(e) {}
}

function _updateAdminPinDisplay() {
    for (let i = 0; i < 4; i++) {
        document.getElementById('apd' + i)
            .classList.toggle('filled', i < _adminPinBuf.length);
    }
}

function _adminPinKey(n) {
    if (n === 'cancel') {
        document.getElementById('admin-pin-screen').classList.remove('open');
        document.getElementById('menu-screen').classList.add('open');
        return;
    }
    if (n === 'back') {
        _adminPinBuf = _adminPinBuf.slice(0, -1);
        _updateAdminPinDisplay();
        document.getElementById('admin-pin-error').textContent = '';
        return;
    }
    if (_adminPinBuf.length >= 6) return;
    _adminPinBuf += n;
    _updateAdminPinDisplay();

    // Проверяем после ввода минимальной длины
    if (_adminPinBuf.length >= 4) {
        setTimeout(() => {
            if (_adminPinBuf === getAdminPin()) {
                document.getElementById('admin-pin-screen').classList.remove('open');
                _openAdminPanel();
            } else if (_adminPinBuf.length >= getAdminPin().length) {
                document.getElementById('admin-pin-error').textContent = '❌ Неверный пинкод';
                _adminPinBuf = '';
                _updateAdminPinDisplay();
            }
        }, 180);
    }
}

function _openAdminPanel() {
    // Устанавливаем авторизацию для admin.html ДО загрузки iframe
    // admin.html проверяет sessionStorage['tg_rpg_admin_auth']
    sessionStorage.setItem('tg_rpg_admin_auth', '1');

    const overlay = document.getElementById('admin-overlay');
    const frame   = document.getElementById('admin-frame');

    // Перезагружаем iframe при каждом открытии, чтобы он подхватил сессию
    frame.src = '';
    requestAnimationFrame(() => {
        frame.src = 'admin.html';
        overlay.classList.add('open');
        // Закрываем экран меню/пина
        document.getElementById('admin-pin-screen').classList.remove('open');
        document.getElementById('menu-screen').classList.remove('open');
    });
}

function _closeAdminPanel() {
    document.getElementById('admin-overlay').classList.remove('open');
    document.getElementById('admin-frame').src = '';
    document.getElementById('menu-screen').classList.add('open');
}

function initAdminPinHandlers() {
    document.querySelectorAll('.apk').forEach(btn => {
        bindTapButton(btn, () => _adminPinKey(btn.dataset.n));
    });
}

