// ============================================================
//  PARTICLE
// ============================================================
class Particle {
    constructor(x, y, col, vy = -2) {
        this.x = x;
        this.y = y;
        this.col = col;
        this.vx = Math.random() * 3 - 1.5;
        this.vy = vy + Math.random() * -1;
        this.life = this.ml = 20 + Math.random() * 20 | 0;
        this.r = 3 + Math.random() * 5 | 0;
    }
    
    update(dt = 1) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.vy += 0.15 * dt;
        this.life -= dt;
    }
    
    draw(cx, cy) {
        const a = this.life / this.ml;
        ctx.globalAlpha = a;
        ctx.fillStyle = this.col;
        ctx.beginPath();
        ctx.arc(wx(this.x, cx), wy(this.y, cy), Math.max(1, this.r * a), 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}