// ============================================================
//  TELEGRAM AUTH
// ============================================================
function getTelegramUser() {
    try {
        return window.Telegram?.WebApp?.initDataUnsafe?.user || null;
    } catch(e) {
        return null;
    }
}

function initTelegram() {
    if (window.Telegram?.WebApp) {
        Telegram.WebApp.ready();
        Telegram.WebApp.expand();
        tgApplyTheme();
        return getTelegramUser();
    }
    return null;
}