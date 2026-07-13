// ============================================================
//  КНОПКА СПОСОБНОСТИ (bs)
// ============================================================
function updateAbilityButtonIcon() {
    const ab = ABILITIES[G.p.cls];
    if (!ab) return;
    document.getElementById('bs-icon').textContent = ab.icon;
    document.getElementById('bs').title = ab.name + ' — ' + ab.desc;
}

function updateAbilityButtonState() {
    const p = G.p;
    const ab = ABILITIES[p.cls];
    if (!ab) return;
    const btn = document.getElementById('bs');
    const cd = document.getElementById('bs-cooldown');

    if (p.abilityActive > 0) {
        btn.classList.add('active-effect');
        btn.classList.remove('ready');
        cd.style.setProperty('--pct', 0);
        cd.textContent = '';
    } else if (p.abilityCD > 0) {
        btn.classList.remove('active-effect', 'ready');
        const pct = Math.round((p.abilityCD / ab.cd) * 100);
        cd.style.setProperty('--pct', pct);
        cd.textContent = Math.ceil(p.abilityCD / 60);
    } else {
        btn.classList.remove('active-effect');
        btn.classList.add('ready');
        cd.style.setProperty('--pct', 0);
        cd.textContent = '';
    }
}
