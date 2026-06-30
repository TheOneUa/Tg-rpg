// ============================================================
//  FLOATING TEXT
// ============================================================
class FText {
    constructor(x, y, txt, col = '#fff', sz = 15) {
        this.x = x;
        this.y = y;
        this.txt = txt;
        this.col = col;
        this.sz = sz;
        this.life = 70;
    }
    
    update(dt = 1) {
        this.y -= 0.9 * dt;
        this.life -= dt;
    }
    
    draw(cx, cy) {
        ctx.globalAlpha = Math.min(1, this.life / 25);
        ctx.fillStyle = this.col;
        ctx.font = `bold ${this.sz}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(this.txt, wx(this.x, cx), wy(this.y, cy));
        ctx.globalAlpha = 1;
    }
}