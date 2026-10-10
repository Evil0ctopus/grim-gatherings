import { estateSceneHtml } from './estate-scene.js?v=estate-supporting-v14';

let arrived = false;
const windows = [
  { x: 1114, y: 449, width: 32, height: 37 },
  { x: 1317, y: 443, width: 41, height: 40 },
  { x: 1531, y: 449, width: 32, height: 37 },
  { x: 1107, y: 565, width: 43, height: 43 },
  { x: 1524, y: 565, width: 43, height: 43 },
  { x: 1107, y: 692, width: 43, height: 43 },
  { x: 1524, y: 692, width: 43, height: 43 },
];
// The nested house SVG preserves these approved pane coordinates.
const windowPath = ({ x, y, width, height }) => {
  const pane = width / 2 - 1.5;
  return `M${x} ${y}h${pane}v${height}h-${pane}zM${x + width / 2 + 1.5} ${y}h${pane}v${height}h-${pane}z`;
};

export function manorShadowSequence(random = Math.random, previousWindow = -1) {
  const order = windows.map((_, index) => index);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  if (order[0] === previousWindow) [order[0], order[1]] = [order[1], order[0]];
  const duration = 60000;
  const frames = order.flatMap((index, slot) => {
    const window = windows[index];
    const scale = window.height / 75;
    const y = window.y + window.height * .3;
    return [[0, window.x - 12 * scale, 0], [.2, window.x + window.width * .35, .8],
      [.55, window.x + window.width * .65, .85], [.8, window.x + window.width + 12 * scale, 0],
      [1, window.x + window.width + 12 * scale, 0]].map(([progress, x, opacity]) => ({
      offset: (slot + progress) / windows.length,
      x, y, scale, opacity,
    }));
  });
  const css = `@keyframes manor-passing-shadow{${frames.map(frame =>
    `${(frame.offset * 100).toFixed(6)}%{opacity:${frame.opacity};transform:translate(${frame.x}px,${frame.y}px) scale(${frame.scale})}`).join('')}}`;
  return { order, duration, frames, css };
}

export function startManorShadow(scene) {
  const shadow = scene.querySelector('.manor-shadow');
  const style = scene.querySelector('[data-manor-shadow-style]');
  let previousWindow = -1;
  const renew = () => {
    const sequence = manorShadowSequence(Math.random, previousWindow);
    previousWindow = sequence.order.at(-1);
    style.textContent = sequence.css;
    shadow.style.animationDuration = `${sequence.duration}ms`;
  };
  renew();
  shadow.addEventListener('animationiteration', event => {
    if (event.animationName === 'manor-passing-shadow') renew();
  });
}

export function hauntedManorHtml() {
  const arrival = arrived ? ' manor-arrived' : '';
  arrived = true;
  return estateSceneHtml(arrival, `<defs>
    <radialGradient id="manor-window-light"><stop stop-color="#ffc46b" stop-opacity=".6"/><stop offset="1" stop-color="#e9a341" stop-opacity="0"/></radialGradient>
    <clipPath id="manor-window-clip">${windows.map(window => `<path d="${windowPath(window)}"/>`).join('')}</clipPath>
    </defs>${windows.map((window, i) => `<path class="manor-window" style="animation-delay:-${i * 2}s" fill="url(#manor-window-light)" d="${windowPath(window)}"/>`).join('')}
    <g clip-path="url(#manor-window-clip)"><g class="manor-shadow" fill="#080c12"><ellipse cx="0" cy="0" rx="6" ry="8"/><path d="M-7 9q7-5 14 0l5 32h-24z"/></g></g>`);
}
