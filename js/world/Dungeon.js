// ============================================================
//  DUNGEON GENERATION
// ============================================================
function generateDungeon(depth) {
    const T = CFG.TILE, COLS = CFG.D_COLS, ROWS = CFG.D_ROWS;
    const grid = Array.from({length: ROWS}, () => new Array(COLS).fill(T_DW));
    
    // Комнаты
    const rooms = [];
    const numRooms = Math.min(8 + Math.floor(depth/3), 20);
    for(let i=0; i<numRooms*30 && rooms.length<numRooms; i++) {
        const w = 4 + Math.floor(Math.random()*5), h = 4 + Math.floor(Math.random()*5);
        const x = 1 + Math.floor(Math.random()*(COLS-w-2)), y = 1 + Math.floor(Math.random()*(ROWS-h-2));
        let overlap = rooms.some(r => x < r.x+r.w+1 && x+w+1 > r.x && y < r.y+r.h+1 && y+h+1 > r.y);
        if(!overlap) {
            for(let dy=0; dy<h; dy++) for(let dx=0; dx<w; dx++) grid[y+dy][x+dx] = T_DF;
            rooms.push({x,y,w,h});
        }
    }
    if(rooms.length < 2) {
        for(let y=2; y<ROWS-2; y++) for(let x=2; x<COLS-2; x++) grid[y][x] = T_DF;
        rooms.push({x:2,y:2,w:COLS-4,h:ROWS-4});
    }
    
    // Коридоры
    for(let i=1; i<rooms.length; i++) {
        const a=rooms[i-1], b=rooms[i];
        const ax=a.x+Math.floor(a.w/2), ay=a.y+Math.floor(a.h/2);
        const bx=b.x+Math.floor(b.w/2), by=b.y+Math.floor(b.h/2);
        if(Math.random()<0.5) {
            for(let x=Math.min(ax,bx); x<=Math.max(ax,bx); x++) { grid[ay][x]=T_DF; if(ay+1<ROWS) grid[ay+1][x]=T_DF; }
            for(let y=Math.min(ay,by); y<=Math.max(ay,by); y++) { grid[y][bx]=T_DF; if(bx+1<COLS) grid[y][bx+1]=T_DF; }
        } else {
            for(let y=Math.min(ay,by); y<=Math.max(ay,by); y++) { grid[y][ax]=T_DF; if(ax+1<COLS) grid[y][ax+1]=T_DF; }
            for(let x=Math.min(ax,bx); x<=Math.max(ax,bx); x++) { grid[by][x]=T_DF; if(by+1<ROWS) grid[by+1][x]=T_DF; }
        }
    }
    
    // Порталы
    const first = rooms[0], last = rooms[rooms.length-1];
    const startX = first.x + Math.floor(first.w/2), startY = first.y + Math.floor(first.h/2);
    const downX = last.x + Math.floor(last.w/2), downY = last.y + Math.floor(last.h/2);
    grid[startY][startX] = T_ENTRANCE;
    grid[downY][downX] = T_EXIT;
    
    // Враги
    const mult = 1 + depth * 0.12;
    const numEnemies = Math.min(10 + Math.floor(depth * 0.8), 28);
    const isBossLevel = depth % 5 === 0 && depth > 0;
    const spawnCells = [];
    for(let y=1; y<ROWS-1; y++) for(let x=1; x<COLS-1; x++) if(grid[y][x] === T_DF) spawnCells.push({x,y});
    for(let i=spawnCells.length-1; i>0; i--) { const j=Math.floor(Math.random()*(i+1)); [spawnCells[i], spawnCells[j]] = [spawnCells[j], spawnCells[i]]; }
    
    const enemies = [];
    const maxEnemies = Math.min(numEnemies + (isBossLevel?1:0), spawnCells.length);
    for(let i=0; i<maxEnemies; i++) {
        const cell = spawnCells[i];
        if(!cell) break;
        let enemy;
        if(isBossLevel && i===0) {
            const bt = BOSS_TYPES[Math.floor((depth/5 - 1) % BOSS_TYPES.length)];
            const bmult = 1 + Math.floor(depth/20) * 0.2;
            enemy = new Enemy({
                ...cell,
                name: bt.name,
                color: bt.color,
                icon: bt.icon,
                maxhp: Math.floor(bt.hp * mult * bmult),
                hp: Math.floor(bt.hp * mult * bmult),
                atk: Math.floor(bt.atk * mult * bmult),
                def: Math.floor((bt.def || 0) * (1 + depth * 0.015)),
                exp: Math.floor(bt.exp * mult * bmult),
                spd: 0.7 + Math.random() * 0.2,
                isBoss: true
            });
        } else {
            const roll = Math.random();
            let idx = 0;
            if(depth>25) idx = roll<0.10?0:roll<0.18?1:roll<0.26?2:roll<0.34?3:roll<0.42?4:roll<0.55?5:roll<0.68?6:roll<0.81?7:8;
            else if(depth>15) idx = roll<0.12?0:roll<0.22?1:roll<0.32?2:roll<0.42?3:roll<0.52?4:roll<0.64?5:roll<0.76?6:roll<0.88?7:8;
            else if(depth>8) idx = roll<0.15?0:roll<0.28?1:roll<0.40?2:roll<0.52?3:roll<0.64?4:roll<0.74?5:roll<0.84?6:roll<0.92?7:8;
            else idx = roll<0.22?0:roll<0.40?1:roll<0.55?2:roll<0.68?3:roll<0.78?4:roll<0.86?5:roll<0.92?6:roll<0.96?7:8;
            const type = ENEMY_TYPES[idx];
            enemy = new Enemy({
                ...cell,
                name: type.name,
                color: type.color,
                icon: type.icon,
                maxhp: Math.floor(type.hp * mult),
                hp: Math.floor(type.hp * mult),
                atk: Math.floor(type.atk * mult),
                def: Math.floor((type.def || 0) * (1 + depth * 0.015)),
                exp: Math.floor(type.exp * mult),
                spd: (1 + depth * 0.02) * (0.8 + Math.random() * 0.4),
                isBoss: false
            });
        }
        enemies.push(enemy);
    }
    
    // Предметы
    const items = [];
    const numItems = Math.min(5 + Math.floor(depth * 0.4), 15);
    for(let i=0; i<numItems && i<spawnCells.length; i++) {
        const cell = spawnCells[spawnCells.length - 1 - i];
        if(!cell) break;
        const types = ['hpPot','mpPot','gold'];
        const type = types[Math.floor(Math.random()*types.length)];
        items.push(new Item(cell.x, cell.y, type));
    }
    
    return { grid, startX, startY, downX, downY, enemies, items };
}

function makeDungeonCache(tm) {
    const T = CFG.TILE, COLS = CFG.D_COLS, ROWS = CFG.D_ROWS;
    const oc = document.createElement('canvas');
    oc.width = COLS * T;
    oc.height = ROWS * T;
    const c2 = oc.getContext('2d');
    const colors = {
        [T_GRASS]: '#1e6420', [T_TREE]: '#143c14', [T_WATER]: '#2864c8',
        [T_STONE]: '#969190', [T_SAND]: '#d2b982', [T_DF]: '#3c3730',
        [T_DW]: '#5a5550', [T_ENTRANCE]: '#1a3a2a', [T_EXIT]: '#3a1a0a'
    };
    for(let y=0; y<ROWS; y++) for(let x=0; x<COLS; x++) {
        const t = tm[y][x];
        const rx=x*T, ry=y*T;
        c2.fillStyle = colors[t] || '#3c3730';
        c2.fillRect(rx, ry, T, T);
        if(t === T_DF) { c2.strokeStyle='#322d28'; c2.lineWidth=1; c2.strokeRect(rx, ry, T, T); }
        if(t === T_DW) { c2.fillStyle='#464140'; c2.fillRect(rx+2, ry+2, T-4, T/2-2); c2.fillRect(rx+2, ry+T/2+2, T-4, T/2-4); }
        if(t === T_ENTRANCE) {
            c2.fillStyle='#44ff88';
            c2.beginPath();
            c2.arc(rx+T/2, ry+T/2, T/4, 0, Math.PI*2);
            c2.fill();
            c2.fillStyle='rgba(68,255,136,0.3)';
            c2.beginPath();
            c2.arc(rx+T/2, ry+T/2, T/2, 0, Math.PI*2);
            c2.fill();
            c2.fillStyle='#44ff88';
            c2.font='7px sans-serif';
            c2.textAlign='center';
            c2.fillText('⬆', rx+T/2, ry+T/2+2);
        }
        if(t === T_EXIT) {
            c2.fillStyle='#ff8844';
            c2.beginPath();
            c2.arc(rx+T/2, ry+T/2, T/4, 0, Math.PI*2);
            c2.fill();
            c2.fillStyle='rgba(255,136,68,0.3)';
            c2.beginPath();
            c2.arc(rx+T/2, ry+T/2, T/2, 0, Math.PI*2);
            c2.fill();
            c2.fillStyle='#ff8844';
            c2.font='7px sans-serif';
            c2.textAlign='center';
            c2.fillText('⬇', rx+T/2, ry+T/2+2);
        }
    }
    return oc;
}