// ============================================================
//  INPUT
// ============================================================
const inp = { dx:0, dy:0, atk:false, spell:false, useSlot:null, portal:false, ctx:false };
const keys = {};

window.addEventListener('keydown', e => {
    keys[e.code] = true;
    if(e.code === 'Digit1') inp.useSlot = 'hpPot';
    if(e.code === 'Digit2') inp.useSlot = 'mpPot';
    if(e.code === 'Digit3') inp.useSlot = 'sword';
    if(e.code === 'Digit4') inp.useSlot = 'shield';
    if(e.code === 'KeyE') inp.ctx = true;
});

window.addEventListener('keyup', e => keys[e.code] = false);

function kbUpdate() {
    if(!joyActive) {
        inp.dx = 0;
        inp.dy = 0;
        if(keys['ArrowLeft'] || keys['KeyA']) inp.dx -= 1;
        if(keys['ArrowRight'] || keys['KeyD']) inp.dx += 1;
        if(keys['ArrowUp'] || keys['KeyW']) inp.dy -= 1;
        if(keys['ArrowDown'] || keys['KeyS']) inp.dy += 1;
    }
    if(keys['Space']) inp.atk = true;
    if(keys['KeyF']) inp.spell = true;
}

// ============================================================
//  JOYSTICK (плавающий — появляется там, где коснулись пальцем)
// ============================================================
// #joy-zone — невидимая зона касания в нижней левой части экрана.
// #joy — сам круг джойстика, position:fixed, центрируется на точке
// касания через left/top + CSS transform:translate(-50%,-50%).
const joyZoneEl = document.getElementById('joy-zone');
const joyEl = document.getElementById('joy');
const knobEl = document.getElementById('knob');
let joyActive = false, joyId = null, joyOx = 0, joyOy = 0;
const JOY_MAX = 50, JOY_DEAD = 5;

joyZoneEl.addEventListener('touchstart', e => {
    e.preventDefault();
    if (joyActive) return; // палец джойстика уже есть — второй палец не перехватываем
    const t = e.changedTouches[0];
    joyId = t.identifier;
    joyActive = true;
    joyOx = t.clientX;
    joyOy = t.clientY;
    joyEl.style.left = joyOx + 'px';
    joyEl.style.top = joyOy + 'px';
    joyEl.classList.add('active');
    knobEl.style.transform = 'translate(-50%,-50%)';
}, { passive:false });

joyZoneEl.addEventListener('touchmove', e => {
    e.preventDefault();
    for(const t of e.changedTouches) {
        if(t.identifier !== joyId) continue;
        let dx = t.clientX - joyOx;
        let dy = t.clientY - joyOy;
        const dist = Math.hypot(dx, dy);
        if(dist < JOY_DEAD) {
            inp.dx = 0;
            inp.dy = 0;
            knobEl.style.transform = 'translate(-50%,-50%)';
            return;
        }
        const clamped = Math.min(dist, JOY_MAX);
        const nx = dx/dist * clamped;
        const ny = dy/dist * clamped;
        knobEl.style.transform = `translate(calc(-50% + ${nx}px), calc(-50% + ${ny}px))`;
        inp.dx = nx / JOY_MAX;
        inp.dy = ny / JOY_MAX;
    }
}, { passive:false });

function joyEnd(e) {
    for(const t of e.changedTouches) {
        if(t.identifier === joyId) {
            joyActive = false;
            joyId = null;
            inp.dx = 0;
            inp.dy = 0;
            joyEl.classList.remove('active');
            knobEl.style.transform = 'translate(-50%,-50%)';
        }
    }
}
joyZoneEl.addEventListener('touchend', joyEnd);
joyZoneEl.addEventListener('touchcancel', joyEnd);

// ============================================================
//  BUTTONS
// ============================================================
// Используем touchstart вместо click — это позволяет нажимать кнопки
// ОДНОВРЕМЕННО с управлением джойстиком на iOS (мульти-тач).
// click имеет задержку ~300ms и иногда "теряется" при параллельном touch.
function bindTapButton(el, handler) {
    if (!el) return;
    let touched = false;
    el.addEventListener('touchstart', e => {
        e.preventDefault();
        touched = true;
        handler();
    }, { passive: false });
    el.addEventListener('click', e => {
        // Фоллбэк для мыши/десктопа. Если событие уже обработано тачем — пропускаем.
        if (touched) { touched = false; return; }
        handler();
    });
}

bindTapButton(document.getElementById('ba'), () => {
    inp.atk = true;
    tgVibrate('light');
});

bindTapButton(document.getElementById('bs'), () => {
    inp.spell = true;
    tgVibrate('light');
});

// Контекстная кнопка — действие определяется из main.js
bindTapButton(document.getElementById('ctx-btn'), () => {
    inp.ctx = true;
    tgVibrate('medium');
});