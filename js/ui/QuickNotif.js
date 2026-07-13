// ============================================================
//  УВЕДОМЛЕНИЯ (всплывающие сообщения сверху экрана)
// ============================================================
function showQNotif(text) {
    const container = document.getElementById('qnotif');
    const el = document.createElement('div');
    el.className = 'qn';
    el.textContent = text;
    container.appendChild(el);
    setTimeout(() => el.remove(), 2600);
}
