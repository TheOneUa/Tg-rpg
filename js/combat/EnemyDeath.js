// ============================================================
//  ENEMY DEATH — единая обработка смерти врага
// ============================================================
// Раньше этот блок (6 строк) был продублирован один-в-один в
// Player._dealDamage и Player._dealProjDamage. Реальный риск:
// поправить дроп/ачивки/сохранение в одном месте и забыть про
// второе — тихий баг. Теперь один источник истины.

function resolveEnemyDeath(e, parts, floats) {
    const ex = e.x * CFG.TILE + CFG.TILE/2;
    const ey = e.y * CFG.TILE + CFG.TILE/2;
    e.alive = false;
    stats.totalKills++;
    if (e.isBoss) stats.bossKills++;
    sound.play('kill');
    for (let i = 0; i < 14; i++) parts.push(new Particle(ex, ey, e.color, -3));
    dropResourceFromEnemy(e, floats);
    onEnemyKilled(e.name);
    checkAchievements();
    saveGame(true);
}
