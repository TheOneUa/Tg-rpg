// ============================================================
//  MODAL
// ============================================================
const modal = document.getElementById('modal');
const mtitle = document.getElementById('mtitle');
const msub = document.getElementById('msub');
const mbody = document.getElementById('mbody');
const mclose = document.getElementById('mclose');

function closeModal() {
    modal.classList.remove('open');
}

mclose.addEventListener('click', closeModal);
modal.addEventListener('touchstart', e => {
    if(e.target === modal) closeModal();
}, { passive: true });

// Открытие достижений
document.getElementById('s-ach').addEventListener('click', openAchievements);
document.getElementById('s-quests').addEventListener('click', openQuests);

function openAchievements() {
    mtitle.textContent = '🏆 Достижения';
    const total = ACHIEVEMENTS.length;
    const done = ACHIEVEMENTS.filter(a => achievements[a.id]).length;
    msub.textContent = 'Выполнено: ' + done + '/' + total;
    mbody.innerHTML = ACHIEVEMENTS.map(a => {
        const unlocked = achievements[a.id];
        return `<div class="mitem" style="opacity:${unlocked?1:0.4}">
            <div class="micon" style="background:${unlocked?'rgba(255,200,50,.2)':'rgba(80,80,80,.2)'};border:1px solid ${unlocked?'#ffd700':'#555'}">${a.icon}</div>
            <div class="minfo">
                <div class="mname">${unlocked?'✅ ':'🔒 '}${a.name}</div>
                <div class="mdesc">${a.desc}</div>
            </div>
            <div style="font-size:10px;color:${unlocked?'#ffd700':'#666'}">${unlocked?'✓':''}</div>
        </div>`;
    }).join('');
    modal.classList.add('open');
}