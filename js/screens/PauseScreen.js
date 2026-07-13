// ============================================================
//  ПАУЗА
// ============================================================
let gamePaused = false;

function openPause() {
    gamePaused = true;
    saveGame(true);
    document.getElementById('pause-screen').classList.add('open');
}

function closePause() {
    gamePaused = false;
    document.getElementById('pause-screen').classList.remove('open');
}

function initPauseHandlers() {
    bindTapButton(document.getElementById('pause-btn'), openPause);
    bindTapButton(document.getElementById('pause-continue'), closePause);
    bindTapButton(document.getElementById('pause-settings'), () => {
        document.getElementById('pause-screen').classList.remove('open');
        _settingsReturnToPause = true;
        document.getElementById('settings-screen').classList.add('open');
    });
    bindTapButton(document.getElementById('pause-menu'), () => {
        closePause();
        gameStarted = false;
        document.getElementById('pause-btn').classList.remove('visible');
        document.getElementById('hud').classList.remove('open');
        document.getElementById('ctrl').classList.remove('open');
        G.enemies = []; G.items = []; G.projs = []; G.parts = []; G.floats = [];
        showMainMenu();
    });
}

let _settingsReturnToPause = false;
