//  НАСТРОЙКИ
// ============================================================
const SETTINGS_KEY = 'tg_rpg_settings';

let appSettings = {
    soundEnabled: true,
    volume: 0.8,
    vibroEnabled: true,
    vibroLevel: 'medium'
};

function loadSettings() {
    try {
        const s = JSON.parse(localStorage.getItem(SETTINGS_KEY));
        if (s) appSettings = { ...appSettings, ...s };
    } catch(e) {}
    applySettings();
}

function saveSettings() {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(appSettings));
    } catch(e) {}
}

function applySettings() {
    // Звук
    sound.enabled = appSettings.soundEnabled;
    sound.volume = appSettings.volume;
    // Вибрация применяется в tgVibrate()
}

function initSettingsHandlers() {
    loadSettings();

    const volSlider = document.getElementById('vol-slider');
    const volVal = document.getElementById('vol-val');
    const soundToggle = document.getElementById('sound-toggle');
    const soundIcon = document.getElementById('sound-toggle-icon');
    const vibroToggle = document.getElementById('vibro-toggle');
    const vibroLevels = document.querySelectorAll('.vibro-lvl');

    // Восстановить UI из настроек
    volSlider.value = Math.round(appSettings.volume * 100);
    volVal.textContent = Math.round(appSettings.volume * 100) + '%';
    _setSoundToggle(appSettings.soundEnabled);
    _setVibroToggle(appSettings.vibroEnabled);
    vibroLevels.forEach(b => {
        b.classList.toggle('active', b.dataset.level === appSettings.vibroLevel);
    });

    // Громкость
    volSlider.addEventListener('input', () => {
        const v = parseInt(volSlider.value);
        volVal.textContent = v + '%';
        appSettings.volume = v / 100;
        sound.volume = appSettings.volume;
    });

    // Вкл/выкл звук
    soundToggle.addEventListener('click', () => {
        appSettings.soundEnabled = !appSettings.soundEnabled;
        sound.enabled = appSettings.soundEnabled;
        _setSoundToggle(appSettings.soundEnabled);
    });

    // Вкл/выкл вибрация
    vibroToggle.addEventListener('click', () => {
        appSettings.vibroEnabled = !appSettings.vibroEnabled;
        _setVibroToggle(appSettings.vibroEnabled);
    });

    // Уровень вибрации
    vibroLevels.forEach(btn => {
        btn.addEventListener('click', () => {
            appSettings.vibroLevel = btn.dataset.level;
            vibroLevels.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Тест
    document.getElementById('settings-test').addEventListener('click', () => {
        sound.play('levelup');
        tgVibrate(appSettings.vibroLevel);
    });

    // Назад — сохранить и вернуться в меню
    document.getElementById('settings-back').addEventListener('click', () => {
        saveSettings();
        applySettings();
        document.getElementById('settings-screen').classList.remove('open');
        if (_settingsReturnToPause) {
            _settingsReturnToPause = false;
            document.getElementById('pause-screen').classList.add('open');
        } else {
            document.getElementById('menu-screen').classList.add('open');
        }
    });
}

function _setSoundToggle(on) {
    const btn = document.getElementById('sound-toggle');
    const icon = document.getElementById('sound-toggle-icon');
    btn.textContent = on ? 'ВКЛ' : 'ВЫКЛ';
    btn.classList.toggle('active', on);
    icon.textContent = on ? '🔔' : '🔕';
}

function _setVibroToggle(on) {
    const btn = document.getElementById('vibro-toggle');
    btn.textContent = on ? 'ВКЛ' : 'ВЫКЛ';
    btn.classList.toggle('active', on);
}

