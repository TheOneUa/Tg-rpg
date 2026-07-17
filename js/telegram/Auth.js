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
        // В fullscreen-режиме (Bot API 8.0+) Telegram рисует свою шапку
        // (Закрыть / свернуть / меню "...") ПОВЕРХ контента — это отдельно
        // от выреза устройства (env(safe-area-inset-top)) и требует своего
        // API. Пишем в CSS-переменные, чтобы HUD мог отступить от обеих
        // величин сразу (см. --tg-content-safe-top/--tg-safe-top в main.css).
        _applyTelegramSafeArea(tg);
        tg.onEvent?.('safeAreaChanged', () => _applyTelegramSafeArea(tg));
        tg.onEvent?.('contentSafeAreaChanged', () => _applyTelegramSafeArea(tg));
        tg.onEvent?.('fullscreenChanged', () => _applyTelegramSafeArea(tg));
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
// FALLBACK: contentSafeAreaInset — сравнительно новый API (Bot API 8.0+).
// На практике подтвердилось, что часть клиентов либо не отдаёт его,
// либо отдаёт 0 — тогда шапка Telegram (Закрыть/свернуть/меню) реально
// перекрывает HUD, а наш расчёт думает, что перекрытия нет. Поэтому
// пока игра в fullscreen-режиме (а мы его всегда запрашиваем — см.
// tg.requestFullscreen() выше), гарантируем МИНИМУМ 40px отступа
// независимо от того, что вернул API — а если API вернёт значение
// больше (другое устройство/клиент с более высокой шапкой) — используем
// его. isFullscreen считаем true и тогда, когда сам флаг недоступен
// в данной версии клиента (мы всё равно запрашивали fullscreen).
function _applyTelegramSafeArea(tg) {
    try {
        const content = tg.contentSafeAreaInset || {};
        const device   = tg.safeAreaInset || {};
        const root = document.documentElement.style;
        const FALLBACK_FULLSCREEN_TOP = 40; // px, см. комментарий выше

        const isFs = tg.isFullscreen !== false;
        const contentTop = isFs
            ? Math.max(content.top ?? 0, FALLBACK_FULLSCREEN_TOP)
            : (content.top ?? 0);

        root.setProperty('--tg-content-safe-top',    contentTop + 'px');
        root.setProperty('--tg-content-safe-bottom', (content.bottom ?? 0) + 'px');
        root.setProperty('--tg-safe-top',    (device.top    ?? 0) + 'px');
        root.setProperty('--tg-safe-bottom', (device.bottom ?? 0) + 'px');
    } catch(e) {
        console.warn('[Telegram] safe area недоступна:', e);
    }
}