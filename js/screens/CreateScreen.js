// ============================================================
//  ЭКРАН СОЗДАНИЯ ПЕРСОНАЖА
// ============================================================
function initAuthHandlers() {
    const authBtn = document.getElementById('auth-btn');
    const createBtn = document.getElementById('create-btn');
    const loadBtn = document.getElementById('load-btn');
    const resetBtn = document.getElementById('reset-btn');
    const heroName = document.getElementById('hero-name');
    const classBtns = document.querySelectorAll('.class-btn');

    let selectedClass = 'warrior';

    // Предзагружаем спрайты для превью
    preloadHeroSprites();

    // ── Превью спрайта ──
    const previewCanvas = document.getElementById('preview-canvas');
    const previewCtx = previewCanvas.getContext('2d');
    const PREVIEW_SIZE = 96;
    const PREVIEW_CX = previewCanvas.width / 2;
    const PREVIEW_CY = previewCanvas.height / 2;
    let _pvFrame = 0, _pvTimer = 0, _pvRAF = null;

    function renderPreview(cls) {
        const entry = _spriteCache[HERO_SPRITE_KEYS[cls]];
        previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
        previewCtx.imageSmoothingEnabled = false;
        if (entry && entry.loaded) {
            const fw = entry.frameW || SPRITE_FRAME;
            const fh = entry.frameH || SPRITE_FRAME;
            const sx = _pvFrame * fw;
            previewCtx.drawImage(entry.img, sx, 0, fw, fh,
                PREVIEW_CX - PREVIEW_SIZE/2, PREVIEW_CY - PREVIEW_SIZE/2, PREVIEW_SIZE, PREVIEW_SIZE);
        } else {
            const icons = { warrior: '⚔️', archer: '🏹', mage: '🔮' };
            previewCtx.font = '56px sans-serif';
            previewCtx.textAlign = 'center';
            previewCtx.textBaseline = 'middle';
            previewCtx.fillText(icons[cls] || '❓', PREVIEW_CX, PREVIEW_CY);
        }
    }

    function startPreview(cls) {
        if (_pvRAF) cancelAnimationFrame(_pvRAF);
        let last = 0;
        function tick(ts) {
            _pvRAF = requestAnimationFrame(tick);
            _pvTimer += (ts - last) / (1000/60);
            last = ts;
            if (_pvTimer >= 10) { _pvTimer = 0; _pvFrame = (_pvFrame + 1) % 4; }
            renderPreview(cls);
        }
        _pvRAF = requestAnimationFrame(tick);
    }

    function updatePreviewMeta(cls) {
        const d = CLASSES[cls];
        if (!d) return;
        document.getElementById('preview-name').textContent = d.name;
        document.getElementById('preview-stats').textContent =
            `❤️${d.hp}  💧${d.mp}  ⚔️${d.atk}  🛡️${d.def}  💨${d.spd}`;
        _pvFrame = 0; _pvTimer = 0;
        startPreview(cls);
    }

    updatePreviewMeta('warrior');

    classBtns.forEach(btn => {
        bindTapButton(btn, () => {
            classBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedClass = btn.dataset.class;
            updatePreviewMeta(selectedClass);
        });
    });

    authBtn.addEventListener('click', () => {
        document.getElementById('auth-screen').classList.remove('open');
        document.getElementById('create-screen').classList.add('open');
        updatePreviewMeta(selectedClass);
        if (hasSave()) showSaveDialog();
    });

    createBtn.addEventListener('click', () => {
        playerData.name = heroName.value.trim() || 'Герой';
        playerData.class = selectedClass;
        G.p.initFromClass(selectedClass);
        if (_pvRAF) { cancelAnimationFrame(_pvRAF); _pvRAF = null; }
        resetSave();
        startGame(false);
    });

    loadBtn.addEventListener('click', () => {
        if (_pvRAF) { cancelAnimationFrame(_pvRAF); _pvRAF = null; }
        if (loadGame()) { startGame(true); }
        else showQNotif('❌ Не удалось загрузить сохранение!');
    });

    resetBtn.addEventListener('click', () => {
        resetSave();
        heroName.value = '';
        classBtns.forEach(b => b.classList.remove('selected'));
        document.querySelector('.class-btn[data-class="warrior"]').classList.add('selected');
        selectedClass = 'warrior';
        updatePreviewMeta('warrior');
        loadBtn.style.display = 'none';
        resetBtn.style.display = 'none';
        document.getElementById('create-sub').textContent = 'Выбери имя и класс';
        showQNotif('🗑️ Прогресс сброшен');
    });

    heroName.addEventListener('keydown', e => { if (e.key === 'Enter') createBtn.click(); });
}

