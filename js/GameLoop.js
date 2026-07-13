// ============================================================
//  ИГРОВОЙ ЦИКЛ
// ============================================================
let _lastFrameTime = 0;
const TARGET_FPS = 60;
const MAX_DT = 3; // защита от лагов/сворачивания вкладки (макс "прыжок" = 3 кадра по 60fps)

function loop(timestamp) {
    requestAnimationFrame(loop);

    if (!_lastFrameTime) _lastFrameTime = timestamp;
    const rawDelta = (timestamp - _lastFrameTime) / (1000 / TARGET_FPS); // в "кадрах по 60fps"
    _lastFrameTime = timestamp;
    const dt = Math.min(Math.max(rawDelta, 0), MAX_DT) || 1; // fallback на 1 если первый кадр / NaN
    G.dt = dt;

    if(dead || !gameStarted || gamePaused) return;
    
    kbUpdate();
    G.t += 0.05 * dt;
    
    const tm = getCurrentTM();
    const cache = getCurrentCache();
    const enemies = G.enemies;
    const items = G.items;
    const npcs = G.npcs;
    const p = G.p;
    
    // ── Контекстная кнопка ──
    const ctxBtn = document.getElementById('ctx-btn');
    let ctxMode = null; // 'npc', 'portal', 'exit', 'descend', 'enter-dungeon', 'enter-house', 'exit-house'
    let ctxNpc = null;
    let ctxHouse = null;

    if (G.location === 'village') {
        // Деревня: проверяем NPC
        for(const npc of G.npcs) {
            if(Math.hypot(p.x - npc.x, p.y - npc.y) < CFG.TILE * 1.5) {
                ctxMode = 'npc';
                ctxNpc = npc;
                break;
            }
        }
        // Двери домов
        if (!ctxMode) {
            for (const h of VILLAGE_HOUSES) {
                const hx = h.doorX * CFG.TILE + CFG.TILE/2;
                const hy = h.doorY * CFG.TILE + CFG.TILE/2;
                if (Math.hypot(p.x - hx, p.y - hy) < CFG.TILE * 1.5) {
                    ctxMode = 'enter-house';
                    ctxHouse = h;
                    break;
                }
            }
        }
        // Портал в подземелье
        if(!ctxMode && Math.hypot(p.x - PORTAL_POS.x, p.y - PORTAL_POS.y) < CFG.TILE * 1.5) {
            ctxMode = 'enter-dungeon';
        }
    } else if (G.location === 'house') {
        // Дом: выход обратно в деревню (дверь снизу по центру)
        for (let y = 0; y < HOUSE_H; y++) {
            for (let x = 0; x < HOUSE_W; x++) {
                if (tm[y][x] === T_EXIT) {
                    const ex = x*CFG.TILE + CFG.TILE/2, ey = y*CFG.TILE + CFG.TILE/2;
                    if (Math.hypot(p.x - ex, p.y - ey) < CFG.TILE * 1.5) ctxMode = 'exit-house';
                }
            }
        }
        // Мастер внутри дома
        if (!ctxMode) {
            for (const npc of G.npcs) {
                if (Math.hypot(p.x - npc.x, p.y - npc.y) < CFG.TILE * 1.5) {
                    ctxMode = 'npc';
                    ctxNpc = npc;
                    break;
                }
            }
        }
    } else {
        // Подземелье: вход (выход наверх)
        for(let y=0; y<CFG.D_ROWS; y++) {
            for(let x=0; x<CFG.D_COLS; x++) {
                if(tm[y][x] === T_ENTRANCE) {
                    const ex = x*CFG.TILE + CFG.TILE/2, ey = y*CFG.TILE + CFG.TILE/2;
                    if(Math.hypot(p.x - ex, p.y - ey) < CFG.TILE * 1.5) ctxMode = 'exit';
                }
            }
        }
        // Спуск вниз
        if(!ctxMode && G.dungeonDown) {
            const dx = G.dungeonDown.x*CFG.TILE + CFG.TILE/2;
            const dy = G.dungeonDown.y*CFG.TILE + CFG.TILE/2;
            if(Math.hypot(p.x - dx, p.y - dy) < CFG.TILE * 1.5) ctxMode = 'descend';
        }
    }

    // Обновляем вид кнопки
    if(ctxMode === 'npc') {
        ctxBtn.className = 'npc visible';
        ctxBtn.innerHTML = '💬 ' + ctxNpc.name;
    } else if(ctxMode === 'enter-dungeon') {
        ctxBtn.className = 'portal visible';
        ctxBtn.innerHTML = '⚔️ Подземелье';
    } else if(ctxMode === 'enter-house') {
        ctxBtn.className = 'portal visible';
        ctxBtn.innerHTML = '🚪 Войти: ' + (typeof ctxHouse.name === 'function' ? ctxHouse.name() : ctxHouse.name);
    } else if(ctxMode === 'exit-house') {
        ctxBtn.className = 'exit visible';
        ctxBtn.innerHTML = '🌿 Выйти в деревню';
    } else if(ctxMode === 'exit') {
        ctxBtn.className = 'exit visible';
        ctxBtn.innerHTML = '🌿 Выйти';
    } else if(ctxMode === 'descend') {
        ctxBtn.className = 'portal visible';
        ctxBtn.innerHTML = '⬇️ Глубже';
    } else {
        ctxBtn.className = '';
    }

    // Обработка нажатия
    if(inp.ctx && !document.getElementById('level-dialog').classList.contains('open')) {
        inp.ctx = false;
        if(ctxMode === 'npc' && ctxNpc) {
            ctxNpc.talk();
        } else if(ctxMode === 'enter-dungeon') {
            openLevelDialog();
        } else if(ctxMode === 'enter-house' && ctxHouse) {
            fadeTransition(() => enterHouse(ctxHouse.id));
        } else if(ctxMode === 'exit-house') {
            fadeTransition(() => exitHouse());
        } else if(ctxMode === 'exit') {
            fadeTransition(() => exitDungeon());
        } else if(ctxMode === 'descend') {
            fadeTransition(() => enterDungeon(G.depth + 1));
        }
    }
    // Сброс старого inp.portal на всякий случай
    inp.portal = false;
    
    // Обновление игрока
    p.update(inp, tm, enemies, items, G.parts, G.floats, G.projs, npcs);
    updateAbilityButtonState();
    _updateHudStatBtn();
    
    // Обновление врагов
    if(G.depth > 0) {
        for(const e of enemies) {
            if(!e.alive) {
                p.exp += e.exp || 20;
                onEnemyKilled(e.name);
                if(e.isBoss && G.depth > 0) {
                    const bonus = 50 + G.depth * 10;
                    p.gold += bonus;
                    stats.totalGold += bonus;
                    G.floats.push(new FText(
                        e.x*CFG.TILE + CFG.TILE/2,
                        e.y*CFG.TILE - CFG.TILE,
                        '👑 +' + bonus + '💰',
                        '#ffd700', 18
                    ));
                    showQNotif('👑 Босс повержен! +' + bonus + '💰');
                    sound.play('levelup');
                    checkAchievements();
                    saveGame(true);
                }
                continue;
            }
            e.update(p.x, p.y, tm, G.parts, G.floats);
        }
        G.enemies = G.enemies.filter(e => e.alive);
        G.items = G.items.filter(it => it.alive);
    }
    
    // Обновление предметов
    for(const it of G.items) {
        it.update();
    }
    
    // Обновление NPC
    for(const npc of npcs) {
        npc.update();
    }
    
    // Обновление частиц и текста
    for(let i=G.parts.length-1; i>=0; i--) {
        G.parts[i].update(G.dt);
        if(G.parts[i].life <= 0) G.parts.splice(i, 1);
    }
    for(let i=G.floats.length-1; i>=0; i--) {
        G.floats[i].update(G.dt);
        if(G.floats[i].life <= 0) G.floats.splice(i, 1);
    }
    
    // Обновление снарядов
    for(let i=G.projs.length-1; i>=0; i--) {
        const f = G.projs[i];
        f.trail.push({x: f.x, y: f.y});
        if(f.trail.length > 8) f.trail.shift();
        f.x += f.vx * G.dt;
        f.y += f.vy * G.dt;
        f.life -= G.dt;
        
        const { COLS, ROWS } = getCurrentMapDims();
        const tx = f.x / CFG.TILE | 0;
        const ty = f.y / CFG.TILE | 0;
        
        if(tx < 0 || tx >= COLS || ty < 0 || ty >= ROWS || SOLID.has(tm[ty][tx])) {
            f.alive = false;
            for(let j=0; j<15; j++) {
                G.parts.push(new Particle(f.x, f.y, '#e68220', -3));
            }
        }
        
        for(const e of enemies) {
            if(!e.alive) continue;
            const ex = e.x * CFG.TILE + CFG.TILE/2;
            const ey = e.y * CFG.TILE + CFG.TILE/2;
            if(Math.hypot(f.x - ex, f.y - ey) < CFG.TILE * 0.8) {
                G.p._dealProjDamage(e, f.dmg, G.parts, G.floats, enemies);
                f.alive = false;
                for(let j=0; j<15; j++) {
                    G.parts.push(new Particle(f.x, f.y, '#e68220', -3));
                }
                break;
            }
        }
        if(f.life <= 0) f.alive = false;
        if(!f.alive) G.projs.splice(i, 1);
    }
    
    // Отрисовка
    const { COLS, ROWS } = getCurrentMapDims();
    const MAP_W = COLS * CFG.TILE;
    const MAP_H = ROWS * CFG.TILE;
    const gH = SH - CFG.TOP - CFG.BOT;
    const vW = SW / SC;
    const vH = gH / SC;
    const cx = Math.max(vW/2, Math.min(p.x, MAP_W - vW/2));
    const cy = Math.max(vH/2, Math.min(p.y, MAP_H - vH/2));
    
    ctx.clearRect(0, 0, SW, SH);
    const ox = Math.round(SW/2 - cx*SC);
    const oy = Math.round(CFG.TOP + gH/2 - cy*SC);
    ctx.save();
    ctx.translate(ox, oy);
    ctx.scale(SC, SC);
    ctx.drawImage(cache, 0, 0);
    ctx.restore();
    
    // Порталы
    if(G.depth > 0 && G.dungeonGrid) {
        let entryPos = null, downPos = null;
        for(let y=0; y<CFG.D_ROWS; y++) {
            for(let x=0; x<CFG.D_COLS; x++) {
                if(G.dungeonGrid[y][x] === T_ENTRANCE) {
                    entryPos = { x: x*CFG.TILE + CFG.TILE/2, y: y*CFG.TILE + CFG.TILE/2 };
                }
                if(G.dungeonGrid[y][x] === T_EXIT) {
                    downPos = { x: x*CFG.TILE + CFG.TILE/2, y: y*CFG.TILE + CFG.TILE/2 };
                }
            }
        }
        if(entryPos) drawPortal(cx, cy, entryPos, G.t, '#44ff88', '🌿 Выход', '⬆');
        if(downPos) drawPortal(cx, cy, downPos, G.t + Math.PI, '#ff8844', '⬇ Глубже', '⬇');
    } else if (G.location === 'village') {
        drawPortal(cx, cy, PORTAL_POS, G.t, '#ff8844', '⚔ Подземелье', '⬇');
    }
    
    // Предметы
    if(G.depth > 0) {
        for(const it of G.items) {
            it.draw(cx, cy);
        }
    }
    
    // NPC
    for(const npc of npcs) {
        npc.draw(cx, cy);
    }
    
    // Враги
    for(const e of G.enemies) {
        e.draw(cx, cy);
    }
    
    // Снаряды
    for(const f of G.projs) {
        // Обновляем анимацию снаряда
        const projKey = 'projectile_' + (f.type || 'arrow');
        const projCfg = getAnimConfig(projKey, 'fly');
        const projCols = projCfg ? projCfg.cols : 4;
        const projFps  = projCfg ? projCfg.fps  : 12;
        f.spriteTimer = (f.spriteTimer || 0) + G.dt;
        if (f.spriteTimer >= 60 / projFps) {
            f.spriteTimer -= 60 / projFps;
            f.spriteFrame = ((f.spriteFrame || 0) + 1) % projCols;
        }

        const px = wx(f.x, cx);
        const py = wy(f.y, cy);
        const projSize = (f.type === 'fireball' ? 40 : 28) * SC;
        const angle = f.angle !== undefined ? f.angle : Math.atan2(f.vy, f.vx);

        // Пробуем нарисовать спрайт
        const usedProjSprite = drawProjectileSprite(projKey, 'fly', f.spriteFrame || 0, angle, px, py, projSize);

        // Fallback векторный рендер
        if (!usedProjSprite) {
            // Трейл
            for(let i = 0; i < f.trail.length; i++) {
                const a = (i+1)/f.trail.length;
                ctx.globalAlpha = a * 0.6;
                ctx.fillStyle = f.trailColor || '#e68220';
                ctx.beginPath();
                ctx.arc(wx(f.trail[i].x, cx), wy(f.trail[i].y, cy), 8*a*SC, 0, Math.PI*2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;
            if (f.type === 'arrow') {
                ctx.save();
                ctx.translate(px, py);
                ctx.rotate(angle);
                ctx.fillStyle = f.color || '#e8c840';
                ctx.fillRect(-14*SC, -3*SC, 28*SC, 6*SC);
                ctx.fillStyle = '#c8a020';
                ctx.beginPath();
                ctx.moveTo(14*SC, 0);
                ctx.lineTo(8*SC, -5*SC);
                ctx.lineTo(8*SC, 5*SC);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            } else {
                // Файрбол
                const grad = ctx.createRadialGradient(px, py, 0, px, py, 14*SC);
                grad.addColorStop(0, '#ffffaa');
                grad.addColorStop(0.4, '#ff8800');
                grad.addColorStop(1, 'rgba(255,50,0,0)');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(px, py, 14*SC, 0, Math.PI*2);
                ctx.fill();
            }
        }
    }
    
    // Частицы и текст
    for(const pt of G.parts) pt.draw(cx, cy);
    for(const ft of G.floats) ft.draw(cx, cy);
    
    // Игрок
    p.draw(cx, cy);
    
    // HUD
    hudUpdate(p);
    
    // Смерть
    if(p.hp <= 0) {
        dead = true;
        document.getElementById('dead').classList.add('open');
        saveGame(true);
    }
}
