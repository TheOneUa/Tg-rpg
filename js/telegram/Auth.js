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
        const tg = Telegram.WebApp;
        tg.ready();
        tg.expand();
        // Полноэкранный режим — поверх статусбара (API 8.0+)
        if (typeof tg.requestFullscreen === 'function') {
            tg.requestFullscreen();
        }
        // Отключаем свайп-закрытие (мешает управлению джойстиком)
        if (typeof tg.disableVerticalSwipes === 'function') {
            tg.disableVerticalSwipes();
        }
        tgApplyTheme();
        return getTelegramUser();
    }
    return null;
}