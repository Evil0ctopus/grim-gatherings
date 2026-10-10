(async () => {
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const status = document.querySelector('#status');
const replay = document.querySelector('#replay');
const pause = document.querySelector('#pause');
const effects = document.querySelector('#effects');
const motion = document.querySelector('#motion');
motion.checked = matchMedia('(prefers-reduced-motion: reduce)').matches;
const names = ['gate', 'fence', 'pillar', 'lantern', 'rounded', 'broken', 'cross',
  'angel', 'large-tree', 'arch-tree', 'distant-tree', 'grass', 'weeds', 'moon',
  'cloud', 'bat', 'lightning', 'rain', 'fog', 'candle', 'glow', 'soil', 'paving'];
const images = new Map();
const smooth = value => {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
};
let frame;
let start;
let frozen = 0;
let paused = false;
const scene = { gateOpening: 0, passage: 0, elapsed: 0, markers: 10 };
// Exposes deterministic frames for local visual and timing checks.
window.estateReview = { scene, render: time => draw(time) };

function image(name, x, y, width, brightness = 0.65, alpha = 1) {
  const asset = images.get(name);
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.filter = name === 'house' ? 'none' : `brightness(${brightness}) saturate(.75)`;
  ctx.drawImage(asset, x, y, width, width * asset.height / asset.width);
  ctx.restore();
}
function grounded(name, x, base, height, brightness = 0.65, alpha = 1) {
  const asset = images.get(name);
  image(name, x, base - height, height * asset.width / asset.height, brightness, alpha);
}
function groundShadow(x, y, width, height, alpha) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(width, height);
  const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
  gradient.addColorStop(0, `rgba(0,5,8,${alpha})`);
  gradient.addColorStop(1, 'rgba(0,5,8,0)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(0, 0, 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
const graves = [
  ['rounded', 145, 755, 84], ['broken', 350, 765, 60],
  ['cross', 215, 875, 135], ['rounded', 395, 855, 105],
  ['angel', 80, 890, 225],
  ['broken', 1150, 745, 55], ['rounded', 1290, 770, 85],
  ['cross', 1410, 855, 145], ['rounded', 1160, 865, 105],
  ['broken', 1320, 920, 75],
];
function gateLeaf(left, opening) {
  const asset = images.get('gate');
  const half = asset.width / 2;
  const hinge = left ? 548 : 1052;
  const width = 252;
  ctx.save();
  ctx.translate(hinge, 690);
  ctx.scale(Math.max(.045, Math.cos(opening * Math.PI / 2)), 1);
  ctx.filter = 'brightness(.68) saturate(.75)';
  ctx.drawImage(asset, left ? 0 : half, 0, half, asset.height,
    left ? 0 : -width, 0, width, width * asset.height / half);
  ctx.restore();
}
function gateway(opening, passage) {
  ctx.save();
  ctx.translate(800, 530);
  const zoom = 1 + passage * 4;
  ctx.scale(zoom, zoom);
  ctx.translate(-800, -530);
  ctx.globalAlpha = 1 - smooth((passage - .65) / .35);
  // Overlap panel ends into masonry instead of aligning transparent crop boxes.
  const fenceHeight = 158;
  const fenceWidth = fenceHeight * images.get('fence').width / images.get('fence').height;
  for (let i = 0; i < 3; i++) {
    grounded('fence', 520 - (i + 1) * (fenceWidth - 5), 974, fenceHeight);
    grounded('fence', 1080 + i * (fenceWidth - 5), 974, fenceHeight);
  }
  gateLeaf(true, opening);
  gateLeaf(false, opening);
  grounded('pillar', 485, 980, 255);
  grounded('pillar', 1027, 980, 255);
  grounded('lantern', 514, 775, 56);
  grounded('lantern', 1055, 775, 56);
  ctx.restore();
}
function draw(time) {
  if (images.size !== names.length + 1) return;
  const reduced = motion.checked;
  const t = reduced ? 0 : time;
  const opening = reduced ? 1 : smooth((t - 1) / 9);
  const passage = reduced ? 0 : smooth((t - 10) / 10);
  Object.assign(scene, { gateOpening: opening, passage, elapsed: time });
  ctx.clearRect(0, 0, 1600, 1000);
  ctx.save();
  ctx.translate(800, 430);
  ctx.scale(1 + passage * .12, 1 + passage * .12);
  ctx.translate(-800, -430);
  const sky = ctx.createLinearGradient(0, 0, 0, 1000);
  sky.addColorStop(0, '#0a1926');
  sky.addColorStop(1, '#223f46');
  ctx.fillStyle = sky;
  ctx.fillRect(-200, -150, 2000, 1300);
  image('moon', 350, 60, 205, .9);
  const drift = reduced || !effects.checked ? 0 : Math.sin(t / 20) * 30;
  image('cloud', -50 + drift, 45, 950, .65, .7);
  image('cloud', 740 - drift, 65, 920, .7, .7);
  for (const x of [120, 280, 1320, 1460]) grounded('distant-tree', x, 720, 180, .32, .55);
  ctx.fillStyle = '#14272b';
  ctx.fillRect(0, 620, 1600, 380);
  ctx.save();
  ctx.globalAlpha = .22;
  const soil = ctx.createPattern(images.get('soil'), 'repeat');
  ctx.fillStyle = soil;
  ctx.fillRect(0, 630, 1600, 370);
  ctx.restore();
  const horizon = ctx.createLinearGradient(0, 600, 0, 690);
  horizon.addColorStop(0, '#1b343c00');
  horizon.addColorStop(.4, '#1b343c');
  horizon.addColorStop(1, '#1b343c00');
  ctx.fillStyle = horizon;
  ctx.fillRect(0, 600, 1600, 90);
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(763, 658); ctx.lineTo(837, 658);
  ctx.lineTo(1100, 1000); ctx.lineTo(500, 1000); ctx.closePath();
  ctx.clip();
  ctx.fillStyle = ctx.createPattern(images.get('paving'), 'repeat');
  ctx.fillRect(450, 658, 700, 342);
  ctx.fillStyle = '#071d25bb';
  ctx.fillRect(450, 658, 700, 342);
  ctx.restore();
  // House-base grounding is below the art, not hidden by a row of grave tops.
  groundShadow(800, 659, 330, 18, .9);
  groundShadow(800, 674, 150, 20, .65);
  image('house', 485, 235, 630, 1);
  graves.forEach(([name, x, base, height]) => {
    groundShadow(x + height * .2, base, height * .35, 9, .65);
    grounded(name, x, base, height);
  });
  for (let i = 0; i < 9; i++) {
    grounded(i % 2 ? 'grass' : 'weeds', i < 4 ? 60 + i * 110 : 1120 + (i - 4) * 100,
      960 - (i % 3) * 25, 32 + (i % 2) * 12, .55);
  }
  // Foreground branches now overlap the facade edges; the right tree is 38% smaller.
  image('large-tree', -530, 195, 1100, .35);
  image('arch-tree', 1010, 280, 650, .4);
  for (let i = 0; i < 5; i++) {
    const y = 707 + i * 49;
    const spread = 50 + i * 26;
    const flicker = effects.checked && !reduced ? .9 + Math.sin(t * 4 + i) * .09 : 1;
    for (const x of [800 - spread, 800 + spread]) {
      grounded('candle', x, y, 18 + i * 6, flicker);
      if (effects.checked) image('glow', x - 15, y - 40, 42, 1, .35 * flicker);
    }
  }
  gateway(opening, passage);
  if (effects.checked) {
    image('fog', -50 + drift, 800, 1700, .75, .25);
    for (let i = 0; i < 5; i++) image('bat', 660 + i * 70 + drift, 150 + (i % 3) * 30, 23, .45);
    if (!reduced) {
      // One restrained bolt appearance per 17 seconds, without repeated full-screen flashes.
      const flash = t % 17;
      if (flash > 12 && flash < 12.5) image('lightning', 1190, 180, 235, .8, Math.sin((flash - 12) * Math.PI * 2));
      const rainY = -70 + (t * 65) % 70;
      const rainHeight = 1640 * images.get('rain').height / images.get('rain').width;
      image('rain', -10, rainY, 1640, .7, .15);
      image('rain', -10, rainY + rainHeight, 1640, .7, .15);
    }
  }
  ctx.restore();
  status.textContent = reduced ? 'Reduced motion: static scene, gates open.' :
    t < 1 ? 'Entrance: gates closed.' : t < 10 ? 'Gates opening; camera remains outside.' :
      t < 20 ? 'Gates open; camera moving through the entrance.' : 'Arrived. Weather continues.';
}
function tick(now) {
  if (start === undefined) start = now - frozen * 1000;
  frozen = (now - start) / 1000;
  draw(frozen);
  if (!paused && !motion.checked) frame = requestAnimationFrame(tick);
}
function restart() {
  cancelAnimationFrame(frame);
  frozen = 0; start = undefined; paused = false;
  pause.textContent = 'Pause';
  draw(0);
  if (!motion.checked) frame = requestAnimationFrame(tick);
}
replay.addEventListener('click', restart);
pause.addEventListener('click', () => {
  paused = !paused;
  pause.textContent = paused ? 'Resume' : 'Pause';
  if (paused) cancelAnimationFrame(frame);
  else { start = undefined; if (!motion.checked) frame = requestAnimationFrame(tick); }
});
motion.addEventListener('change', restart);
effects.addEventListener('change', () => draw(frozen));
document.addEventListener('visibilitychange', () => {
  cancelAnimationFrame(frame);
  if (!document.hidden && !paused && !motion.checked) {
    start = undefined;
    frame = requestAnimationFrame(tick);
  }
});
try {
  for (const name of [...names, 'house']) {
    const asset = new Image();
    asset.src = name === 'house' ? '../../../../assets/estate-generated-manor.png' :
      `../working/supporting-preview-v5/${name}.png`;
    await asset.decode();
    images.set(name, asset);
  }
  replay.disabled = false; pause.disabled = false;
  restart();
} catch (error) {
  status.textContent = `Artwork could not load: ${error.message}`;
  console.error('Estate review load failed', error);
}
})();
