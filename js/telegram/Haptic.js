// ============================================================
//  HAPTIC FEEDBACK
// ============================================================
function tgVibrate(s = 'light') {
    try {
        if (typeof appSettings !== 'undefined' && !appSettings.vibroEnabled) return;
        const level = (typeof appSettings !== 'undefined') ? appSettings.vibroLevel : s;
        if (window.Telegram?.WebApp?.HapticFeedback) {
            Telegram.WebApp.HapticFeedback.impactOccurred(level);
        }
    } catch(e) {}
}

function tgApplyTheme() {
    try {
        if (window.Telegram?.WebApp?.themeParams) {
            document.body.style.backgroundColor = Telegram.WebApp.themeParams.bg_color || '#0a0a0f';
        }
    } catch(e) {}
}

// ============================================================
//  SOUND
// ============================================================
class Sound {
    constructor() {
        this.enabled = true;
        this.volume = 1.0;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        } catch(e) {
            this.enabled = false;
        }
    }
    
    play(type) {
        if (!this.enabled || !this.ctx) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            const now = this.ctx.currentTime;
            
            const presets = {
                hit:     { t: 'sawtooth', f: [300,100], d: 0.1,  g: 0.15 },
                crit:    { t: 'square',   f: [600,200], d: 0.15, g: 0.2  },
                kill:    { t: 'sine',     f: [400,800], d: 0.2,  g: 0.12 },
                levelup: { t: 'square',   f: [523,659,784], d: 0.35, g: 0.1 },
                portal:  { t: 'sine',     f: [200,500], d: 0.3,  g: 0.1  },
                pickup:  { t: 'sine',     f: [600,900], d: 0.08, g: 0.08 },
                block:   { t: 'triangle', f: [150,50],  d: 0.06, g: 0.12 },
                dodge:   { t: 'sine',     f: [800,1200], d: 0.05, g: 0.06 }
            };
            
            const p = presets[type];
            if (!p) return;
            
            osc.type = p.t;
            if (Array.isArray(p.f)) {
                p.f.forEach((f, i) => osc.frequency.setValueAtTime(f, now + i * 0.1));
            } else {
                osc.frequency.setValueAtTime(p.f, now);
            }
            const vol = (typeof appSettings !== 'undefined') ? appSettings.volume : 1;
            gain.gain.setValueAtTime(p.g * vol, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + p.d);
            osc.start(now);
            osc.stop(now + p.d);
        } catch(e) {}
    }
}