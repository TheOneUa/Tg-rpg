// ============================================================
//  PLAYER ANIMATION — выбор спрайт-анимации и смена кадров
// ============================================================
// isMoving приходит извне (см. _updateMovement() в PlayerMovement.js),
// а не пересчитывается здесь — единственный источник истины про
// движение в этом кадре — сама _updateMovement().
Object.assign(Player.prototype, {
    _updateAnimation(isMoving, dt) {
        // ── Спрайт-анимация ──────────────────────────────────────────
        // Направление: если есть горизонтальное движение — обновляем,
        // иначе оставляем последнее (face.x уже учитывает атаку).
        this.spriteDir = faceToDirection(this.face.x, this.face.y, this.spriteDir);

        // Определяем нужную анимацию по приоритету:
        // death > attack (attackAnim) > ability (abilityActive) > walk > idle
        let targetAnim;
        if (this.hp <= 0)             targetAnim = 'death';
        else if (this.attackAnim > 0) targetAnim = 'attack';
        else if (this.abilityActive > 0 && this.spriteAnim !== 'ability')
                                       targetAnim = 'ability';
        else if (isMoving)             targetAnim = 'walk';
        else                           targetAnim = 'idle';

        // Сброс кадра при смене анимации
        if (targetAnim !== this.spriteAnim) {
            this.spriteAnim = targetAnim;
            this.spriteFrame = 0;
            this.spriteTimer = 0;
        }

        // FPS и число кадров из конфига, fallback на хардкод
        const cfg = getAnimConfig(HERO_SPRITE_KEYS[this.cls] || 'hero_warrior', this.spriteAnim);
        const animFps  = cfg ? cfg.fps  : ({ idle:6, walk:10, attack:14, ability:12, death:5 }[this.spriteAnim] || 8);
        const maxCols  = cfg ? cfg.cols : SPRITE_COLS;
        this.spriteTimer += dt;
        const framesPerTick = 60 / animFps;
        if (this.spriteTimer >= framesPerTick) {
            this.spriteTimer -= framesPerTick;
            if (this.spriteAnim === 'death') {
                this.spriteFrame = Math.min(this.spriteFrame + 1, maxCols - 1);
            } else {
                this.spriteFrame = (this.spriteFrame + 1) % maxCols;
            }
        }
        // ─────────────────────────────────────────────────────────────
    }
});
