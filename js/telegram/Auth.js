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
        // Синхронно, сразу — не зависит от асинхронных tg.expand()/
        // requestFullscreen(). Включает CSS-минимум --tg-fullscreen-floor
        // (см. main.css) для верхнего отступа под шапку Telegram.
        document.documentElement.classList.add('in-telegram');
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
        // В fullscreen-режиме (Bot API 8.0+) Telegram рисует свою шапку
        // (Закрыть / свернуть / меню "...") ПОВЕРХ контента — это отдельно
        // от выреза устройства (env(safe-area-inset-top)) и требует своего
        // API. Пишем в CSS-переменные, чтобы HUD мог отступить от обеих
        // величин сразу (см. --tg-content-safe-top/--tg-safe-top в main.css).
        _applyTelegramSafeArea(tg);
        tg.onEvent?.('safeAreaChanged', () => _applyTelegramSafeArea(tg));
        tg.onEvent?.('contentSafeAreaChanged', () => _applyTelegramSafeArea(tg));
        tg.onEvent?.('fullscreenChanged', () => _applyTelegramSafeArea(tg));
        // requestFullscreen() выше — асинхронный, значения могут подъехать
        // не сразу. События должны поймать момент, но на некоторых клиентах
        // они не всегда срабатывают надёжно — подстраховываемся ещё одним
        // вызовом чуть погодя. Не критично для самого фикса (см. main.css —
        // там есть жёсткий CSS-минимум max(...) на случай, если и это не
        // поможет), но если API всё же вернёт значение больше минимума —
        // подхватим более точное.
        setTimeout(() => _applyTelegramSafeArea(tg), 300);
        tgApplyTheme();
        return getTelegramUser();
    }
    return null;
}

// Записывает отступы Telegram в CSS-переменные корня документа.
// contentSafeAreaInset — зона, перекрытая ЭЛЕМЕНТАМИ САМОГО TELEGRAM
// (шапка fullscreen-режима). safeAreaInset — вырез/статусбар устройства.
// Оба могут отсутствовать в старых клиентах — тогда просто 0.
//
// FALLBACK-минимум для случая, когда contentSafeAreaInset недоступен/
// нулевой, ТЕПЕРЬ живёт в CSS (main.css, через max(...)) — не здесь.
// Причина: _applyTelegramSafeArea() вызывается синхронно сразу после
// tg.requestFullscreen(), а сам переход в fullscreen асинхронный —
// tg.isFullscreen в этот момент мог ещё читаться как false, и любая
// проверка на нём здесь ненадёжна по таймингу. CSS max() не зависит
// от того, когда именно подъехало значение — работает всегда.
function _applyTelegramSafeArea(tg) {
    try {
        const content = tg.contentSafeAreaInset || {};
        const device   = tg.safeAreaInset || {};
        const root = document.documentElement.style;

        root.setProperty('--tg-content-safe-top',    (content.top    ?? 0) + 'px');
        root.setProperty('--tg-content-safe-bottom', (content.bottom ?? 0) + 'px');
        root.setProperty('--tg-safe-top',    (device.top    ?? 0) + 'px');
        root.setProperty('--tg-safe-bottom', (device.bottom ?? 0) + 'px');
    } catch(e) {
        console.warn('[Telegram] safe area недоступна:', e);
    }
}