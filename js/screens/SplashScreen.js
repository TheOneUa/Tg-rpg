// ============================================================
//  SPLASH SCREEN
// ============================================================
function showSplash() {
    const bar = document.getElementById('splash-progress-bar');
    const splash = document.getElementById('splash-screen');
    
    // Пробуем загрузить пользовательское изображение из assets
    const img = document.getElementById('splash-img');
    const emoji = document.getElementById('splash-emoji');
    img.onload = () => { img.classList.add('loaded'); emoji.style.display = 'none'; };
    img.onerror = () => { /* оставляем emoji */ };
    img.src = 'assets/splash.png';
    
    // Прогресс-бар
    setTimeout(() => { bar.style.width = '100%'; }, 50);
    
    // После 3 сек — скрыть сплэш, показать меню
    setTimeout(() => {
        splash.classList.add('fade-out');
        setTimeout(() => {
            splash.style.display = 'none';
            showMainMenu();
        }, 600);
    }, 3000);
}

// ============================================================
