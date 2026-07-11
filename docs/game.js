// ─── Color Split — Renk Sıralama Bulmacası ───────────────────────────────────
// Amaç: her şişeyi tek renk olacak şekilde sırala. Bir şişenin üstündeki aynı
// renk bloğunu, boş bir şişeye ya da üstü aynı renk olan bir şişeye dökebilirsin.
// 10 bölüm; bölümler deterministik üretilir ve dahili çözücü ile çözülebilirliği
// garanti edilir (aynı çözücü "ipucu" düğmesini de besler).

// ─── TEMA ────────────────────────────────────────────────────────────────────
const THEME = {
  bg:     '#141a38',   // düz koyu arka plan (degrade/parıltı yok)
  panel:  'rgba(255,255,255,0.05)',
  text:   '#f2f5ff',
  dim:    '#8b93b5',
  gold:   '#ffcf3f',
  win:    '#51cf66',
  lose:   '#ff6b6b',
  accent: '#e5379c',   // tek vurgu (magenta): restart, seçili şişe, ipucu
  bar:    '#232a52',   // alt bar — düz panel
};

// Sıvı renk paleti (canlı, birbirinden iyi ayrışan tonlar).
const COLORS = [
  '#3fa9e8', // 0 gök mavisi
  '#f0862e', // 1 turuncu
  '#1f7a2e', // 2 koyu yeşil
  '#f4c724', // 3 sarı
  '#9bd64f', // 4 fıstık yeşili
  '#3d63d6', // 5 kraliyet mavisi
  '#e8434a', // 6 kırmızı
  '#e85fb0', // 7 pembe
  '#a544c9', // 8 mor
  '#20c4c4', // 9 turkuaz
];

// ─── BÖLÜMLER ────────────────────────────────────────────────────────────────
const CAP = 4;                 // her şişenin kapasitesi (katman)
const LEVELS = [
  { colors: 3, empty: 2 },     //  1
  { colors: 4, empty: 2 },     //  2
  { colors: 4, empty: 2 },     //  3
  { colors: 5, empty: 2 },     //  4
  { colors: 5, empty: 2 },     //  5
  { colors: 6, empty: 2 },     //  6
  { colors: 6, empty: 2 },     //  7
  { colors: 7, empty: 2 },     //  8
  { colors: 7, empty: 2 },     //  9
  { colors: 8, empty: 2 },     // 10
];

// Güç-artırıcı bedelleri
const HINT_COST = 100;
const UNDO_COST = 250;
const ADD_COST  = 700;
const START_COINS = 500;
const WIN_COINS = 60;
const BONUS_COINS = 500;
const MAX_EXTRA = 2;           // "şişe ekle" ile en fazla eklenebilir boş şişe

// ─── YARDIMCILAR ─────────────────────────────────────────────────────────────
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}


// ─── ÇÖZÜCÜ (döküm mantığı) ──────────────────────────────────────────────────
function topBlock(t) {
  if (!t.length) return null;
  const c = t[t.length - 1];
  let n = 1;
  for (let i = t.length - 2; i >= 0 && t[i] === c; i--) n++;
  return { color: c, count: n };
}
function canPour(src, dst) {
  if (!src.length || dst.length >= CAP) return 0;
  const tb = topBlock(src);
  if (dst.length && dst[dst.length - 1] !== tb.color) return 0;
  return Math.min(tb.count, CAP - dst.length);
}
function isSolved(ts) {
  return ts.every(t => t.length === 0 || (t.length === CAP && t.every(c => c === t[0])));
}
function canonical(ts) {
  return ts.map(t => t.join(',')).sort().join('|');
}
// Çözüm bulursa hamle dizisi ([kaynak, hedef, adet, renk]), bulamazsa null döner.
function solve(startTubes, budget) {
  const state = startTubes.map(t => t.slice());
  const visited = new Set();
  const path = [];
  let nodes = 0;

  function dfs(depth) {
    if (isSolved(state)) return true;
    if (nodes++ > budget || depth > 400) return false;
    const key = canonical(state);
    if (visited.has(key)) return false;
    visited.add(key);

    for (let i = 0; i < state.length; i++) {
      if (!state[i].length) continue;
      const tb = topBlock(state[i]);
      // Tek renk dolu bir şişeyi olduğu gibi boşa taşımak anlamsız → atla.
      const wholeUniform = state[i].length === tb.count && tb.count === state[i].length;
      for (let j = 0; j < state.length; j++) {
        if (i === j) continue;
        const n = canPour(state[i], state[j]);
        if (!n) continue;
        if (state[j].length === 0 && wholeUniform) continue;   // döngü budaması
        for (let k = 0; k < n; k++) state[j].push(state[i].pop());
        path.push([i, j, n, tb.color]);
        if (dfs(depth + 1)) return true;
        path.pop();
        for (let k = 0; k < n; k++) state[i].push(state[j].pop());
      }
    }
    return false;
  }
  return dfs(0) ? path.slice() : null;
}

// ─── BÖLÜM ÜRETİMİ (deterministik + çözülebilir) ─────────────────────────────
function dealTubes(rng, colors, empty) {
  const pool = [];
  for (let c = 0; c < colors; c++) for (let k = 0; k < CAP; k++) pool.push(c);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const tubes = [];
  for (let t = 0; t < colors; t++) tubes.push(pool.slice(t * CAP, (t + 1) * CAP));
  for (let e = 0; e < empty; e++) tubes.push([]);
  return tubes;
}
function makeLevel(idx) {
  const cfg = LEVELS[idx];
  const base = (0x9e3779b1 ^ Math.imul(idx + 1, 2654435761)) >>> 0;
  for (let attempt = 0; attempt < 500; attempt++) {
    const rng = mulberry32((base ^ Math.imul(attempt + 1, 0x85ebca6b)) >>> 0);
    const tubes = dealTubes(rng, cfg.colors, cfg.empty);
    if (isSolved(tubes)) continue;
    if (solve(tubes, 120000)) return tubes;
  }
  return dealTubes(mulberry32(base), cfg.colors, cfg.empty); // güvenli düşüş
}

// ─── DURUM ───────────────────────────────────────────────────────────────────
const KEY = 'colorsort_v1';
function defaultState() { return { levelIndex: 0, coins: START_COINS, solvedCount: 0 }; }
function load() {
  try { const d = JSON.parse(localStorage.getItem(KEY)); if (d) return d; } catch (e) {}
  return null;
}
function normalize(d) {
  const s = defaultState();
  if (d) {
    s.levelIndex = Math.min(LEVELS.length - 1, Math.max(0, d.levelIndex | 0));
    s.coins = Number.isFinite(d.coins) ? Math.max(0, d.coins | 0) : START_COINS;
    s.solvedCount = Math.max(0, d.solvedCount | 0);
  }
  return s;
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }

let S = normalize(load());
window.S = S;
save();

// Çalışma zamanı (kalıcı değil)
let tubes = [];
let selected = -1;
let tubeLifts = [];
let history = [];
let extraTubes = 0;
let anims = [];               // { from, to, n, color, t0, dur }[]
let hint = null;              // { from, to, until }
let won = false;
let toast = { msg: '', color: '', start: 0, until: 0 };
let running = false;          // rAF döngüsü açık mı (talep-üzerine render)
let last = 0;                 // son kare zamanı — kick() erken çağrıldığı için burada tanımlı (TDZ önlemi)

function showToast(msg, color, dur) {
  const t0 = performance.now();
  toast = { msg, color: color || THEME.text, start: t0, until: t0 + (dur || 1500) };
  kick();
}

function startLevel(i) {
  tubes = makeLevel(i);
  selected = -1; history = []; extraTubes = 0;
  anims = []; hint = null; won = false;
  tubeLifts = new Array(tubes.length).fill(0);
  kick();
}

// ─── OYUN AKIŞI ──────────────────────────────────────────────────────────────
function applyMove(state, move) {
  for (let k = 0; k < move.n; k++) state[move.to].push(state[move.from].pop());
}

function makePourMove(from, to, state) {
  const n = canPour(state[from], state[to]);
  if (!n) return false;
  return { from, to, n, color: state[from][state[from].length - 1] };
}

function startPourMove(move) {
  applyMove(tubes, move);
  anims.push({ from: move.from, to: move.to, n: move.n, color: move.color, t0: performance.now(), dur: 520 + move.n * 75 });
}

function tubeIsAnimating(i) {
  return anims.some(a => a.from === i || a.to === i);
}

function tryPour(from, to) {
  if (won) return false;
  if (tubeIsAnimating(from) || tubeIsAnimating(to)) return false;
  const move = makePourMove(from, to, tubes);
  if (!move) return false;
  history.push({ from, to, n: move.n });
  hint = null;
  startPourMove(move);
  return true;
}

function finishAnimations(now) {
  anims = anims.filter(a => now - a.t0 < a.dur);
  if (anims.length) return;
  const solvedNow = isSolved(tubes);
  if (solvedNow) win();
}

function win() {
  if (won) return;
  won = true;
  S.coins += WIN_COINS;
  S.solvedCount++;
  save();
  if (window.Leaderboard) window.Leaderboard.recordScore(S.solvedCount);
  showToast('SEVİYE TAMAM  +' + WIN_COINS, THEME.win, 1600);
}

function nextLevel() {
  let ni = S.levelIndex + 1;
  if (ni >= LEVELS.length) { ni = 0; showToast('Tebrikler! Baştan başlıyoruz', THEME.accent, 1800); }
  S.levelIndex = ni; save();
  startLevel(ni);
}

function doRestart() { if (!anims.length) startLevel(S.levelIndex); }

function doCoinBonus() {
  if (anims.length || won) return;
  S.coins += BONUS_COINS;
  save();
  showToast('+' + BONUS_COINS, THEME.gold, 900);
  kick();
}

function doUndo() {
  if (anims.length || won) return;
  if (!history.length) return;
  if (S.coins < UNDO_COST) return;
  const m = history.pop();
  const moves = m.moves || [m];
  for (let i = moves.length - 1; i >= 0; i--) {
    const move = moves[i];
    for (let k = 0; k < move.n; k++) tubes[move.from].push(tubes[move.to].pop());
  }
  S.coins -= UNDO_COST; save();
  selected = -1; hint = null;
}

function doHint() {
  if (anims.length || won) return;
  if (S.coins < HINT_COST) return;
  const sol = solve(tubes, 120000);
  if (!sol || !sol.length) return;
  hint = { from: sol[0][0], to: sol[0][1], until: performance.now() + 2600 };
  S.coins -= HINT_COST; save();
}

function doAdd() {
  if (anims.length || won) return;
  if (extraTubes >= MAX_EXTRA) { showToast('Daha fazla şişe eklenemez', THEME.dim); return; }
  if (S.coins < ADD_COST) return;
  tubes.push([]); extraTubes++;
  tubeLifts.push(0);
  S.coins -= ADD_COST; save();
}

// ─── CANVAS ──────────────────────────────────────────────────────────────────
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let W = 0, H = 0, DPR = 1;
function resize() {
  DPR = Math.min(window.devicePixelRatio || 1, 3);
  W = window.innerWidth; H = window.innerHeight;
  canvas.width = Math.floor(W * DPR);
  canvas.height = Math.floor(H * DPR);
  canvas.style.width = W + 'px';
  canvas.style.height = H + 'px';
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  kick();
}
window.addEventListener('resize', resize);
// Sayfa gizliyken rAF durur; yeniden görünür olunca tek kareyi garanti et.
document.addEventListener('visibilitychange', () => { if (!document.hidden) kick(); });
resize();

// ─── DÜZEN ───────────────────────────────────────────────────────────────────
function layout() {
  const headerY = 12;
  const pillH = Math.min(42, H * 0.05);
  const pillW = Math.min(150, W * 0.4);
  const coinPill = { x: W / 2 - pillW / 2, y: headerY, w: pillW, h: pillH };
  const rBtnR = pillH * 0.52;
  const restart = { x: W - 18 - rBtnR, y: headerY + pillH / 2, r: rBtnR };

  const levelY = headerY + pillH + 16;
  const levelBarH = 26;

  const barH = Math.min(80, H * 0.1);
  const barW = Math.min(430, W * 0.9);
  const bottomBar = { x: W / 2 - barW / 2, y: H - 18 - barH, w: barW, h: barH };

  const tubesTop = levelY + levelBarH + 14;
  const tubesBottom = bottomBar.y - 16;

  const T = tubes.length;
  const rows = T <= 5 ? 1 : (T <= 10 ? 2 : 3);
  const perRow = Math.ceil(T / rows);
  const side = Math.max(14, W * 0.04);
  const gap = Math.max(8, W * 0.028);
  const rawTw = (W - 2 * side - (perRow - 1) * gap) / perRow;
  const tw = Math.max(20, Math.min(rawTw, 74));
  const areaH = Math.max(120, tubesBottom - tubesTop);
  const rowH = areaH / rows;
  const th = Math.max(70, Math.min(tw * 3.1, rowH * 0.86));

  const rects = [];
  for (let i = 0; i < T; i++) {
    const r = Math.floor(i / perRow);
    const inRow = (r < rows - 1) ? perRow : (T - perRow * (rows - 1));
    const c = i - r * perRow;
    const rowW = inRow * tw + (inRow - 1) * gap;
    const sx = (W - rowW) / 2;
    const x = sx + c * (tw + gap);
    const cy = tubesTop + rowH * (r + 0.5);
    rects.push({ x, y: cy - th / 2, w: tw, h: th, i });
  }

  const btns = [];
  const ids = ['hint', 'undo', 'add'];
  const costs = [HINT_COST, UNDO_COST, ADD_COST];
  const bw = bottomBar.w / 3;
  for (let k = 0; k < 3; k++) {
    btns.push({ id: ids[k], cost: costs[k], x: bottomBar.x + k * bw, y: bottomBar.y, w: bw, h: bottomBar.h });
  }
  return { coinPill, restart, levelY, levelBarH, rects, bottomBar, btns };
}

// ─── ÇİZİM: yollar ───────────────────────────────────────────────────────────
function roundRectPath(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function tubePath(x, y, w, h, rt, rb) {
  ctx.beginPath();
  
  const lipExt = w * 0.06; // lip extends 6% of width on each side
  const lipH = h * 0.03;   // lip height is 3% of total height
  const lipR = Math.max(1.5, h * 0.006); // small rounding radius for the lip corners
  
  // Start at left body edge, going up
  ctx.moveTo(x, y + h * 0.2);
  ctx.lineTo(x, y + lipH + lipR);
  
  // Curve outward to the left under the lip
  ctx.arcTo(x, y + lipH, x - lipExt, y + lipH, lipR);
  ctx.lineTo(x - lipExt, y + lipH);
  ctx.lineTo(x - lipExt, y + lipR);
  
  // Top-left outer corner of the lip
  ctx.arcTo(x - lipExt, y, x - lipExt + lipR, y, lipR);
  
  // Top edge of the lip going right
  ctx.lineTo(x + w + lipExt - lipR, y);
  
  // Top-right outer corner of the lip
  ctx.arcTo(x + w + lipExt, y, x + w + lipExt, y + lipR, lipR);
  ctx.lineTo(x + w + lipExt, y + lipH - lipR);
  
  // Curve inward to the right body under the lip
  ctx.arcTo(x + w + lipExt, y + lipH, x + w, y + lipH, lipR);
  ctx.lineTo(x + w, y + lipH);
  ctx.lineTo(x + w, y + h - rb);
  
  // Bottom-right corner of the tube
  ctx.arcTo(x + w, y + h, x + w - rb, y + h, rb);
  
  // Bottom edge going left
  ctx.lineTo(x + rb, y + h);
  
  // Bottom-left corner of the tube
  ctx.arcTo(x, y + h, x, y + h - rb, rb);
  
  ctx.closePath();
}
function innerPath(ix, itop, iw, ibot, rb) {
  ctx.beginPath();
  const ry = iw * 0.6;
  ctx.moveTo(ix, itop - ry);
  ctx.lineTo(ix + iw, itop - ry);
  ctx.lineTo(ix + iw, ibot - rb);
  ctx.arcTo(ix + iw, ibot, ix + iw - rb, ibot, rb);
  ctx.lineTo(ix + rb, ibot);
  ctx.arcTo(ix, ibot, ix, ibot - rb, rb);
  ctx.closePath();
}

function drawLiquidBand(x, w, top, height, ci, sprinkleKey, angle) {
  if (height <= 0.5) return;
  angle = angle || 0;
  const baseColor = COLORS[ci];
  const rx_base = w / 2;
  const ry_base = Math.min(w * 0.08, height * 0.5);
  const botY = top + height;
  
  ctx.save();
  
  // Calculate rotation of the top cap to simulate horizontal surface under tilt
  const maxRot = Math.PI / 4; // Max 45 degrees
  const rotAngle = Math.max(-maxRot, Math.min(maxRot, -angle));
  
  // To prevent the tilted top surface from intersecting the flat bottom cap of the segment
  // when the segment is very short (height is small), we limit the tilt angle.
  // The vertical offset dy must not exceed height * 0.8.
  const maxRotAngle = Math.atan((height * 0.8) / rx_base);
  const clampedRotAngle = Math.max(-maxRotAngle, Math.min(maxRotAngle, rotAngle));
  
  const cosRot = Math.cos(clampedRotAngle);
  
  // Adjust horizontal radius so the ellipse edges meet the tube walls at x and x + w
  const rx = rx_base / cosRot;
  const ry = ry_base;
  
  // Vertical offset at the walls due to rotation
  const dy = rx_base * Math.tan(-clampedRotAngle);
  
  // 1. Draw cylinder body and bottom cap (flat bottom, tilted top)
  ctx.beginPath();
  ctx.moveTo(x, top + dy);
  ctx.lineTo(x + w, top - dy);
  ctx.lineTo(x + w, botY);
  ctx.ellipse(x + rx_base, botY, rx_base, ry_base, 0, 0, Math.PI, false);
  ctx.lineTo(x, top + dy);
  ctx.closePath();
  ctx.fillStyle = baseColor;
  ctx.fill();
  
  // 2. Draw sprinkles
  drawLiquidSprinkles(x, w, top, height, ci, sprinkleKey);
  
  // 3. Draw top cap ellipse (rotated to match liquid tilt)
  ctx.beginPath();
  ctx.ellipse(x + rx_base, top, rx, ry, clampedRotAngle, 0, Math.PI * 2);
  ctx.fillStyle = baseColor;
  ctx.fill();
  
  // Flat top cap face overlay (subtle tint to define the 3D surface)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.fill();
  
  ctx.restore();
}

function drawLiquidSprinkles(x, w, top, height, ci, sprinkleKey) {
  if (height < 10 || (ci !== 3 && ci !== 6)) return;

  const count = Math.max(6, Math.min(11, Math.floor((w * height) / 360)));
  const seed = (ci + 1) * 977 + sprinkleKey * 131 + Math.floor(top * 0.17) + Math.floor(height * 0.29);
  const time = last * 0.001;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, top, w, height);
  ctx.clip();
  ctx.strokeStyle = '#fff7e8';
  ctx.fillStyle = '#fff7e8';
  ctx.lineCap = 'round';
  ctx.lineWidth = Math.max(1, w * 0.025);

  for (let i = 0; i < count; i++) {
    const a = Math.sin(seed + i * 12.9898) * 43758.5453;
    const b = Math.sin(seed + i * 78.233) * 24634.6345;
    const c = Math.sin(seed + i * 37.719) * 15342.2176;
    const fx = a - Math.floor(a);
    const fy = b - Math.floor(b);
    const fv = c - Math.floor(c);
    const driftX = Math.sin(time * (0.45 + fv * 0.45) + seed + i) * w * 0.045;
    const driftY = Math.cos(time * (0.38 + fv * 0.38) + seed * 0.7 + i) * height * 0.07;
    const sx = x + w * (0.2 + fx * 0.6) + driftX;
    const sy = top + height * (0.2 + fy * 0.6) + driftY;
    const len = Math.max(2.2, w * (0.055 + fv * 0.055));
    const twinkle = 0.22 + 0.42 * (0.5 + 0.5 * Math.sin(time * (1.5 + fv * 1.4) + seed + i * 1.7));
    ctx.globalAlpha = (ci === 3 ? 0.34 : 0.29) * twinkle;

    if (fv < 0.34) {
      ctx.beginPath();
      ctx.arc(sx, sy, Math.max(0.8, w * (0.012 + fv * 0.012)), 0, Math.PI * 2);
      ctx.fill();
    } else {
      const ang = -1.1 + fv * 2.2;
      ctx.beginPath();
      ctx.moveTo(sx - Math.cos(ang) * len * 0.5, sy - Math.sin(ang) * len * 0.5);
      ctx.lineTo(sx + Math.cos(ang) * len * 0.5, sy + Math.sin(ang) * len * 0.5);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function hasAnimatedSprinkles() {
  if (anims.some(a => a.color === 3 || a.color === 6)) return true;
  return tubes.some(t => t.some(c => c === 3 || c === 6));
}

// ─── ÇİZİM: şişe (düz) ───────────────────────────────────────────────────────
function drawTube(R, spec) {
  const { x, w, h } = R;
  const y = R.y - (spec.lift || 0);
  const tx = spec.tx || 0;
  const ty = spec.ty || 0;
  const angle = spec.angle || 0;
  const transformed = tx || ty || angle;

  if (transformed) {
    const cx = x + w / 2;
    const cy = y + h / 2;
    ctx.save();
    ctx.translate(cx + tx, cy + ty);
    ctx.rotate(angle);
    ctx.translate(-cx, -cy);
  }

  const wall = w * 0.085;
  const rt = w * 0.17, rb = w * 0.46;
  const neck = h * 0.11;
  const ix = x + wall, iw = w - 2 * wall;
  const itop = y + neck, ibot = y + h - wall;
  const irb = Math.max(2, rb - wall);
  const segH = (ibot - itop) / CAP;
  const active = spec.glow || spec.hint;

  // 1. Cam gövde zemini
  tubePath(x, y, w, h, rt, rb);
  ctx.fillStyle = THEME.panel;
  ctx.fill();

  // 2. Sıvı — 3D katmanlar (iç şekle kırpılmış)
  ctx.save();
  innerPath(ix, itop, iw, ibot, irb);
  ctx.clip();
  for (let s = 0; s < spec.units.length; s++) {
    const segBottom = ibot - s * segH;
    drawLiquidBand(ix, iw, segBottom - segH - 0.5, segH + 1, spec.units[s], R.i * 17 + s, 0);
  }
  if (spec.partialTop && spec.partialTop.frac > 0.001) {
    const base = spec.units.length;
    const segBottom = ibot - base * segH;
    const ph = segH * spec.partialTop.frac;
    drawLiquidBand(ix, iw, segBottom - ph, ph + 0.5, spec.partialTop.color, R.i * 17 + base + 9, angle);
  }
  ctx.restore();

  // 3. Dış hat (seçili/ipucu → vurgu rengi)
  tubePath(x, y, w, h, rt, rb);
  ctx.lineWidth = active ? 3 : 1.5;
  ctx.strokeStyle = active ? THEME.accent : 'rgba(255,255,255,0.18)';
  ctx.stroke();

  // 4. 3D Şişe Ağzı (Mouth Ellipse)
  ctx.save();
  const lipExt = w * 0.06;
  const mouthRx = w / 2 + lipExt;
  const mouthRy = w * 0.065;
  const mouthCx = x + w / 2;
  const mouthCy = y;
  
  ctx.beginPath();
  ctx.ellipse(mouthCx, mouthCy, mouthRx, mouthRy, 0, 0, Math.PI * 2);
  // Koyu iç delik
  ctx.fillStyle = 'rgba(12, 10, 32, 0.7)';
  ctx.fill();
  // Cam kenarı vurgusu
  ctx.strokeStyle = active ? THEME.accent : 'rgba(255, 255, 255, 0.18)';
  ctx.lineWidth = active ? 2.5 : 1.5;
  ctx.stroke();
  ctx.restore();

  if (transformed) ctx.restore();
}

// ─── ÇİZİM: üst bar & ikonlar ────────────────────────────────────────────────
function drawCoin(x, y, r) {
  ctx.fillStyle = THEME.gold;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.20)'; ctx.lineWidth = Math.max(1, r * 0.12);
  ctx.beginPath(); ctx.arc(x, y, r * 0.62, 0, Math.PI * 2); ctx.stroke();
}

function drawCoinPill(P) {
  roundRectPath(P.x, P.y, P.w, P.h, P.h / 2);
  ctx.fillStyle = 'rgba(12,10,32,0.6)';
  ctx.fill();
  ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.stroke();

  ctx.fillStyle = THEME.text;
  ctx.font = `800 ${Math.floor(P.h * 0.44)}px 'Segoe UI', sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';

  const cr = P.h * 0.34;
  const coinText = String(S.coins);
  const gap = P.h * 0.18;
  const mainW = P.w - P.h;
  const groupW = cr * 2 + gap + ctx.measureText(coinText).width;
  const groupX = P.x + (mainW - groupW) / 2;
  drawCoin(groupX + cr, P.y + P.h / 2, cr);
  ctx.fillStyle = THEME.text;
  ctx.fillText(coinText, groupX + cr * 2 + gap, P.y + P.h / 2 + 1);

  // yeşil artı
  const px = P.x + P.w - P.h * 0.5, py = P.y + P.h / 2, pr = P.h * 0.3;
  ctx.fillStyle = '#3fbf5f';
  ctx.beginPath(); ctx.arc(px, py, pr, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(px - pr * 0.5, py); ctx.lineTo(px + pr * 0.5, py);
  ctx.moveTo(px, py - pr * 0.5); ctx.lineTo(px, py + pr * 0.5);
  ctx.stroke();
}

const RELOAD_PATH_1 = 'M61.977,17.156L48.277,30.855c-0.789,0.79-2.074,0.79-2.866,0l-0.197-0.202V20.568c-16.543,1.156-29.65,14.975-29.65,31.806c0,11.82,6.487,22.617,16.937,28.175c2.631,1.402,3.631,4.671,2.233,7.31c-1.403,2.635-4.671,3.634-7.306,2.231c-13.983-7.44-22.67-21.889-22.67-37.716c0-22.792,17.953-41.47,40.457-42.641V0.792l0.197-0.199c0.792-0.79,2.077-0.79,2.866,0l13.699,13.696C62.771,15.083,62.771,16.369,61.977,17.156z';
const RELOAD_PATH_2 = 'M54.174,101.861L40.477,88.166c-0.792-0.79-0.792-2.074,0-2.864l13.697-13.695c0.791-0.794,2.074-0.794,2.868,0l0.191,0.198l0.007,10.082C73.776,80.733,86.89,66.918,86.89,50.084c0-11.82-6.491-22.614-16.939-28.175c-2.635-1.4-3.635-4.675-2.234-7.31c1.406-2.635,4.678-3.634,7.312-2.231c13.979,7.44,22.669,21.892,22.669,37.716c0,22.794-17.953,41.469-40.457,42.636v8.942l-0.198,0.198C56.248,102.652,54.965,102.652,54.174,101.861z';
const RELOAD_ICON_PATHS = [new Path2D(RELOAD_PATH_1), new Path2D(RELOAD_PATH_2)];
const UNDO_ICON_PATH = new Path2D('M4 7H15C16.8692 7 17.8039 7 18.5 7.40193C18.9561 7.66523 19.3348 8.04394 19.5981 8.49999C20 9.19615 20 10.1308 20 12C20 13.8692 20 14.8038 19.5981 15.5C19.3348 15.9561 18.9561 16.3348 18.5 16.5981C17.8039 17 16.8692 17 15 17H8.00001M4 7L7 4M4 7L7 10');
const BULB_ICON_PATHS = [
  new Path2D('M12 7C9.23858 7 7 9.23858 7 12C7 13.3613 7.54402 14.5955 8.42651 15.4972C8.77025 15.8484 9.05281 16.2663 9.14923 16.7482L9.67833 19.3924C9.86537 20.3272 10.6862 21 11.6395 21H12.3605C13.3138 21 14.1346 20.3272 14.3217 19.3924L14.8508 16.7482C14.9472 16.2663 15.2297 15.8484 15.5735 15.4972C16.456 14.5955 17 13.3613 17 12C17 9.23858 14.7614 7 12 7Z'),
  new Path2D('M12 4V3'),
  new Path2D('M18 6L19 5'),
  new Path2D('M20 12H21'),
  new Path2D('M4 12H3'),
  new Path2D('M5 5L6 6'),
  new Path2D('M10 17H14'),
];

function drawRestart(B) {
  roundRectPath(B.x - B.r, B.y - B.r, B.r * 2, B.r * 2, B.r * 0.5);
  ctx.fillStyle = 'rgba(12,10,32,0.6)'; ctx.fill();
  ctx.lineWidth = 1.5; ctx.strokeStyle = THEME.accent; ctx.stroke();

  const size = B.r * 1.36;
  const scale = size / 102.455;
  ctx.save();
  ctx.translate(B.x - size / 2, B.y - size / 2);
  ctx.scale(scale, scale);
  ctx.fillStyle = '#fff';
  for (const path of RELOAD_ICON_PATHS) ctx.fill(path);
  ctx.restore();
}

function drawLevelBar(L) {
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = THEME.text;
  ctx.font = `800 ${Math.floor(Math.min(W * 0.055, 22))}px 'Segoe UI', sans-serif`;
  ctx.fillText('Seviye ' + (S.levelIndex + 1), W / 2, L.levelY);
}

// ─── ÇİZİM: alt bar ──────────────────────────────────────────────────────────
function drawBottomBar(L) {
  const B = L.bottomBar;
  roundRectPath(B.x, B.y, B.w, B.h, 18);
  ctx.fillStyle = THEME.bar; ctx.fill();
  ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(255,255,255,0.10)'; ctx.stroke();

  for (const b of L.btns) {
    const cx = b.x + b.w / 2, cy = b.y + b.h * 0.40;
    const enabled = S.coins >= b.cost && !(b.id === 'add' && extraTubes >= MAX_EXTRA);
    ctx.save();
    if (!enabled) ctx.globalAlpha = 0.5;
    const ir = b.h * 0.24;
    if (b.id === 'hint') drawBulb(cx, cy, ir);
    else if (b.id === 'undo') drawUndo(cx, cy, ir);
    else drawAddBottle(cx, cy, ir);

    // bedel: küçük altın + sayı
    const coinY = b.y + b.h * 0.78;
    drawCoin(cx - b.w * 0.16, coinY, b.h * 0.11);
    ctx.fillStyle = '#fff';
    ctx.font = `800 ${Math.floor(b.h * 0.2)}px 'Segoe UI', sans-serif`;
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(String(b.cost), cx - b.w * 0.16 + b.h * 0.18, coinY + 1);
    ctx.restore();
  }
}
function drawBulb(cx, cy, r) {
  const size = r * 2.08;
  const scale = size / 24;
  ctx.save();
  ctx.translate(cx - size / 2, cy - size / 2);
  ctx.scale(scale, scale);
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (const path of BULB_ICON_PATHS) ctx.stroke(path);
  ctx.restore();
}
function drawUndo(cx, cy, r) {
  const size = r * 1.95;
  const scale = size / 24;
  ctx.save();
  ctx.translate(cx - size / 2, cy - size / 2);
  ctx.scale(scale, scale);
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1.7;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke(UNDO_ICON_PATH);
  ctx.restore();
}
function drawAddBottle(cx, cy, r) {
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = Math.max(2, r * 0.12);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  // Center the bottle inside the button
  const bw = r * 0.85;
  const bh = r * 1.5;
  const bx = cx - bw / 2;
  const by = cy - bh / 2 + r * 0.05; // slightly offset down to balance the mouth
  const rt = bw * 0.17;
  const rb = bw * 0.46;
  
  // Draw the bottle body
  tubePath(bx, by, bw, bh, rt, rb);
  ctx.stroke();
  
  // Draw the 3D mouth ellipse at the top to match the game design
  const mouthRx = bw / 2 + bw * 0.06;
  const mouthRy = bw * 0.07;
  ctx.beginPath();
  ctx.ellipse(cx, by, mouthRx, mouthRy, 0, 0, Math.PI * 2);
  ctx.stroke();
  
  // Draw the plus (+) sign inside the bottle
  const plusSize = bw * 0.28;
  const plusCy = by + bh * 0.55; // centered in the body area
  ctx.beginPath();
  ctx.moveTo(cx - plusSize, plusCy);
  ctx.lineTo(cx + plusSize, plusCy);
  ctx.moveTo(cx, plusCy - plusSize);
  ctx.lineTo(cx, plusCy + plusSize);
  ctx.stroke();
}

// ─── ÇİZİM: ana ──────────────────────────────────────────────────────────────
const POUR_MOVE_END = 0.28;
const POUR_RETURN_START = 0.78;
const POUR_ANGLE = Math.PI * 2 / 3;

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

function easeInOut(v) {
  v = clamp01(v);
  return v < 0.5 ? 2 * v * v : 1 - Math.pow(-2 * v + 2, 2) / 2;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function pourProgress(p) {
  return clamp01((p - POUR_MOVE_END) / (POUR_RETURN_START - POUR_MOVE_END));
}

function sourcePourPose(fromR, toR, p, L) {
  const fromCx = fromR.x + fromR.w / 2;
  const toCx = toR.x + toR.w / 2;
  const dir = fromCx <= toCx ? 1 : -1;
  const targetAngle = dir * POUR_ANGLE;
  const fromCy = fromR.y + fromR.h / 2;
  const sourceLipX = fromCx + dir * fromR.w * 0.5;
  const sourceLipY = fromR.y;
  const relLipX = sourceLipX - fromCx;
  const relLipY = sourceLipY - fromCy;
  const cos = Math.cos(targetAngle);
  const sin = Math.sin(targetAngle);
  const rotatedLipX = relLipX * cos - relLipY * sin;
  const rotatedLipY = relLipX * sin + relLipY * cos;
  const targetLipX = toCx - dir * toR.w * 0.24;
  const minY = -fromR.h * 0.35;
  const targetLipY = toR.y - Math.max(1, toR.w * 0.025);
  const targetX = targetLipX - rotatedLipX - fromR.w / 2;
  const targetY = Math.max(minY, targetLipY - rotatedLipY - fromR.h / 2);
  let hold = 1;

  if (p < POUR_MOVE_END) {
    hold = easeInOut(p / POUR_MOVE_END);
  } else if (p > POUR_RETURN_START) {
    hold = 1 - easeInOut((p - POUR_RETURN_START) / (1 - POUR_RETURN_START));
  }

  return {
    tx: lerp(0, targetX - fromR.x, hold),
    ty: lerp(0, targetY - fromR.y, hold),
    angle: targetAngle * hold,
  };
}

function draw(now) {
  const L = layout();

  // arka plan — düz
  ctx.fillStyle = THEME.bg; ctx.fillRect(0, 0, W, H);

  drawCoinPill(L.coinPill);
  drawRestart(L.restart);
  drawLevelBar(L);

  if (hint && hint.until < now) hint = null;
  const activeAnims = anims.map(a => {
    const p = Math.min(1, (now - a.t0) / a.dur);
    return { ...a, p, fillP: pourProgress(p) };
  });
  const sourceOverlays = [];

  for (let i = 0; i < tubes.length; i++) {
    const spec = { units: tubes[i], partialTop: null, lift: tubeLifts[i] || 0, glow: false, hint: false, tx: 0, ty: 0, angle: 0 };
    const moving = activeAnims.find(a => a.from === i || a.to === i);
    if (moving) {
      if (i === moving.from) {
        Object.assign(spec, sourcePourPose(L.rects[moving.from], L.rects[moving.to], moving.p, L));
        spec.partialTop = { color: moving.color, frac: moving.n * (1 - moving.fillP) };
        sourceOverlays.push({ rect: L.rects[i], spec });
        continue;
      } else if (i === moving.to) {
        spec.units = tubes[i].slice(0, tubes[i].length - moving.n);
        spec.partialTop = { color: moving.color, frac: moving.n * moving.fillP };
      }
    }
    if (hint && (i === hint.from || i === hint.to)) spec.hint = true;
    drawTube(L.rects[i], spec);
  }
  
  // ─── DÖKÜLME AKIŞ ÇİZGİSİ (Pouring Stream Animation) ───────────────────────
  for (const a of activeAnims) {
    if (a.p >= POUR_MOVE_END && a.p <= POUR_RETURN_START) {
      const fromR = L.rects[a.from];
      const toR = L.rects[a.to];
      
      const fromCx = fromR.x + fromR.w / 2;
      const toCx = toR.x + toR.w / 2;
      const dir = fromCx <= toCx ? 1 : -1;
      
      // Dökülen tüpün ağzının konumu
      const targetLipX = toCx - dir * toR.w * 0.24;
      const targetLipY = toR.y - Math.max(1, toR.w * 0.025);
      
      // Hedef tüpteki sıvı seviyesinin konumu
      const wall = toR.w * 0.085;
      const ibot = toR.y + toR.h - wall;
      const rt = toR.w * 0.17;
      const neck = toR.h * 0.11;
      const itop = toR.y + neck;
      const segH = (ibot - itop) / CAP;
      
      const targetUnits = tubes[a.to];
      const L_solid = targetUnits.length - a.n;
      const targetTopY = ibot - (L_solid * segH) - (segH * a.fillP);
      
      // Akış çizgisini çiz (yuvarlatılmış uçlarla dikey hat)
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(targetLipX, targetLipY);
      ctx.lineTo(targetLipX, targetTopY);
      ctx.strokeStyle = COLORS[a.color];
      ctx.lineWidth = Math.max(3, toR.w * 0.09);
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.restore();
    }
  }

  for (const overlay of sourceOverlays) drawTube(overlay.rect, overlay.spec);

  drawBottomBar(L);

  // zafer katmanı
  if (won) {
    ctx.fillStyle = 'rgba(6,8,24,0.55)';
    ctx.fillRect(0, 0, W, H);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = THEME.win;
    ctx.font = `900 ${Math.floor(Math.min(W * 0.1, 44))}px 'Segoe UI', sans-serif`;
    ctx.fillText('SEVİYE TAMAM', W / 2, H * 0.4);
    ctx.fillStyle = THEME.accent;
    ctx.font = `800 ${Math.floor(Math.min(W * 0.05, 22))}px 'Segoe UI', sans-serif`;
    ctx.fillText('+' + WIN_COINS + ' altın', W / 2, H * 0.4 + 44);

    const bw = Math.min(220, W * 0.6), bh = 54, bx = W / 2 - bw / 2, by = H * 0.56;
    roundRectPath(bx, by, bw, bh, bh / 2);
    ctx.fillStyle = THEME.win; ctx.fill();
    ctx.fillStyle = '#08210f';
    ctx.font = `800 ${Math.floor(bh * 0.4)}px 'Segoe UI', sans-serif`;
    ctx.fillText('DEVAM  ▶', W / 2, by + bh / 2 + 1);
    won_btn = { x: bx, y: by, w: bw, h: bh };
  }

  // toast
  if (toast.until > now && !won) {
    const tp = (now - toast.start) / (toast.until - toast.start);
    const a = tp < 0.15 ? tp / 0.15 : (tp > 0.8 ? (1 - tp) / 0.2 : 1);
    ctx.save();
    ctx.globalAlpha = Math.max(0, a);
    ctx.fillStyle = toast.color;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = `800 ${Math.floor(Math.min(W * 0.055, 24))}px 'Segoe UI', sans-serif`;
    ctx.fillText(toast.msg, W / 2, H * 0.3);
    ctx.restore();
  }
}
let won_btn = null;

// ─── DÖNGÜ (talep-üzerine) ───────────────────────────────────────────────────
// Bir şey hareket etmiyorsa (animasyon / parçacık / toast / ipucu / zafer)
// döngü durur; tek kare çizilip beklenir. Girişte kick() ile yeniden başlar.
function animating(now) {
  return anims.length > 0 || hasAnimatedSprinkles() || won || toast.until > now || (hint && hint.until > now);
}
function loop(now) {
  const dt = Math.max(0, Math.min(0.1, (now - last) / 1000));
  last = now;
  if (anims.some(a => now - a.t0 >= a.dur)) finishAnimations(now);

  let liftsChanged = false;
  for (let i = 0; i < tubes.length; i++) {
    const target = (i === selected) ? 16 : 0;
    const current = tubeLifts[i] || 0;
    if (Math.abs(current - target) > 0.05) {
      // Lerp smoothly towards target
      tubeLifts[i] = current + (target - current) * (1 - Math.exp(-14 * dt));
      liftsChanged = true;
    } else {
      tubeLifts[i] = target;
    }
  }

  draw(now);
  if (animating(now) || liftsChanged) requestAnimationFrame(loop);
  else running = false;
}
function kick() {
  if (running) return;
  running = true;
  last = performance.now();
  requestAnimationFrame(loop);
}

// ─── GİRİŞ ───────────────────────────────────────────────────────────────────
function inRect(px, py, r, pad) {
  pad = pad || 0;
  return px >= r.x - pad && px <= r.x + r.w + pad && py >= r.y - pad && py <= r.y + r.h + pad;
}
function inCircle(px, py, x, y, r) { const dx = px - x, dy = py - y; return dx * dx + dy * dy <= r * r; }

function tubeAt(px, py, L) {
  for (const r of L.rects) if (inRect(px, py, r, 4)) return r.i;
  return -1;
}

function onTap(px, py) {
  const L = layout();

  if (won) {
    if (!won_btn || inRect(px, py, won_btn)) nextLevel();
    return;
  }
  if (inCircle(px, py, L.restart.x, L.restart.y, L.restart.r * 1.3)) return doRestart();
  if (inCircle(
    px,
    py,
    L.coinPill.x + L.coinPill.w - L.coinPill.h * 0.5,
    L.coinPill.y + L.coinPill.h / 2,
    L.coinPill.h * 0.46
  )) return doCoinBonus();

  for (const b of L.btns) {
    if (inRect(px, py, b)) {
      if (b.id === 'hint') return doHint();
      if (b.id === 'undo') return doUndo();
      if (b.id === 'add') return doAdd();
    }
  }

  const idx = tubeAt(px, py, L);
  if (idx < 0) { selected = -1; return; }

  if (selected < 0) {
    if (tubes[idx].length) selected = idx;
  } else if (idx === selected) {
    selected = -1;
  } else {
    if (tryPour(selected, idx)) selected = -1;
    else selected = tubes[idx].length ? idx : -1;
  }
}

canvas.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  onTap(e.clientX - rect.left, e.clientY - rect.top);
  kick();
}, { passive: false });

window.addEventListener('keydown', (e) => {
  const k = e.key.toLowerCase();
  if (k === 'r') doRestart();
  else if (k === 'u') doUndo();
  else if (k === 'h') doHint();
  else if (k === 'escape') selected = -1;
  else if (k === 'enter' && won) nextLevel();
  kick();
});

// ─── BAŞLAT ──────────────────────────────────────────────────────────────────
startLevel(S.levelIndex);
