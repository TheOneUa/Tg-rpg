// ============================================================
//  PLAYER MOVEMENT — таймеры кадра, движение и коллизии
// ============================================================
// Вызывается из update() (см. Player.js). _updateMovement()
// возвращает isMoving — используется дальше в _updateAnimation()
// (PlayerAnimation.js), поэтому именно эта функция решает, двигался
// ли игрок в этом кадре, а не дублирует проверку самостоятельно.
Object.assign(Player.prototype, {
    _updateTimers(dt) {
        this.anim += 0.12 * dt;
        if (this.acd > 0) this.acd -= dt;
        if (this.scd > 0) this.scd -= dt;
        if (this.flash > 0) this.flash -= dt;
        if (this.attackAnim > 0) this.attackAnim -= dt;
        if (this.abilityCD > 0) this.abilityCD -= dt;
        for (let i = 0; i < this.slotCooldowns.length; i++) {
            if (this.slotCooldowns[i] > 0) this.slotCooldowns[i] -= dt;
        }
        updateSlotCooldowns(this.slotCooldowns);

    },

    _updateMovement(inp, tm, dt) {
        const { COLS, ROWS } = getCurrentMapDims();
        let dx = inp.dx, dy = inp.dy;
        const isMoving = !!(dx || dy);
        if (isMoving) {
            const l = Math.hypot(dx, dy);
            dx /= l;
            dy /= l;
            this.face = { x: dx, y: dy };
            const nx = this.x + dx * this.spd * dt;
            const tx = nx / CFG.TILE | 0;
            const ty = this.y / CFG.TILE | 0;
            if (tx >= 0 && tx < COLS && ty >= 0 && ty < ROWS && !SOLID.has(tm[ty][tx])) this.x = nx;
            const ny = this.y + dy * this.spd * dt;
            const tx2 = this.x / CFG.TILE | 0;
            const ty2 = ny / CFG.TILE | 0;
            if (tx2 >= 0 && tx2 < COLS && ty2 >= 0 && ty2 < ROWS && !SOLID.has(tm[ty2][tx2])) this.y = ny;
        }

        return isMoving;
    }
});
