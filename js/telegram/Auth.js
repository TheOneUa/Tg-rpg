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
    try {
        if (window.Telegram?.WebApp) {
            Telegram.WebApp.ready();
            Telegram.WebApp.expand();
            tgApplyTheme();
            return getTelegramUser();
        }
    } catch(e) {
        console.warn('Telegram init error:', e);
    }
    return null;
}

console.log('✅ Auth.js загружен');