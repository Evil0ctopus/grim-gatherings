let arrived = false;

const entrance = { x: 1338, y: 810, width: 76 };
const driveway = `M${entrance.x - entrance.width / 2} ${entrance.y}h${entrance.width}C1400 920 1620 1030 1818 1080H858C1056 1030 1276 920 1300 810z`;

function paving() {
  const rows = [810, 822, 839, 862, 893, 935, 990, 1080];
  return rows.slice(0, -1).map((y, row) => {
    const next = rows[row + 1];
    const spread = 38 + Math.pow((y - 810) / 270, 1.5) * 442;
    const nextSpread = 38 + Math.pow((next - 810) / 270, 1.5) * 442;
    return Array.from({ length: 8 }, (_, col) => {
      const left = entrance.x - spread + spread * col / 4;
      const right = left + spread / 4;
      const nextLeft = entrance.x - nextSpread + nextSpread * col / 4;
      const nextRight = nextLeft + nextSpread / 4;
      return `<path d="M${left + 1} ${y + 1}L${right - 1} ${y + 2}L${nextRight - 2} ${next - 2}L${nextLeft + 2} ${next - 1}z" fill="url(#manor-paver)" stroke="#101b1d" stroke-width="1.5" opacity="${.6 + (col + row) % 3 * .12}"/>`;
    }).join('');
  }).join('');
}

function lantern(x, y, scale = 1) {
  return `<g transform="translate(${x} ${y}) scale(${scale})">
    <ellipse fill="url(#manor-candle-halo)" rx="65" ry="85"/>
    <path fill="url(#manor-metal)" stroke="#101d20" stroke-width="2" d="M-25-30l8-15h34l8 15v66h-50zM-30 36h60l-5 8h-50z" filter="url(#manor-surface)"/>
    <path fill="url(#manor-glass)" stroke="#8f9270" stroke-width="1" d="M-18-24h36v53h-36z"/>
    <image class="manor-flame" href="assets/estate-candle.svg" x="-19" y="-25" width="38" height="53"/>
    <path fill="none" stroke="#a4a58a" stroke-width="2" d="M-25 36h50M-12-46q0-18 12-18t12 18m-29 22v53m34-53v53M0-24v53"/>
    <path fill="none" stroke="#f1ddab" stroke-opacity=".25" d="M-12-17l8 37M8-20l5 33"/>
  </g>`;
}

function ironPanel(width, arched = false) {
  const count = Math.round(width / 28);
  return `<g class="manor-iron-panel" fill="url(#manor-metal)" stroke="#738276" stroke-width="1">
    <path class="manor-gate-frame" d="M0 80${arched ? `Q${width / 2} -40 ${width} 80` : `h${width}`}v540H0z" fill="none" stroke="#263c35" stroke-width="12"/>
    ${Array.from({ length: count + 1 }, (_, i) => {
      const x = i * width / count;
      const top = arched ? 78 - Math.sin(i / count * Math.PI) * 60 : 80;
      return `<path d="M${x - 3} ${top}h6v${620 - top}h-6zM${x} ${top - 23}l-7 17 7 8 7-8z"/>
        <path d="M${x} 490c-22-28-22-55-4-55 14 0 13 20 2 20M${x} 490c22-28 22-55 4-55-14 0-13 20-2 20" fill="none" stroke-width="3"/>`;
    }).join('')}
    <path d="M0 115H${width}M0 395H${width}M0 510H${width}M0 606H${width}" fill="none" stroke="#344b40" stroke-width="9"/>
    <path d="M0 111H${width}M0 391H${width}M0 506H${width}" fill="none" stroke="#84907a" stroke-opacity=".5" stroke-width="2"/>
    ${arched ? `<svg x="${width / 2 - 90}" y="180" width="180" height="125" viewBox="0 0 190 450" preserveAspectRatio="none"><image class="manor-ironwork" href="assets/estate-illustrated-gate.png" width="190" height="1080"/></svg>` : ''}
  </g>`;
}

function tree(x, mirrored = false) {
  return `<g class="manor-tree" transform="translate(${x} 780) scale(${mirrored ? '-1' : '1'} 1)">
    <image href="assets/estate-withered-tree.png" x="-150" y="-300" width="300" height="300"/>
  </g>`;
}

function gate(side) {
  return `<g class="manor-gate manor-gate-${side}" transform="translate(${side === 'left' ? entrance.x - 440 : entrance.x} 445)">
    <g class="manor-gate-leaf">
      <g${side === 'right' ? ' transform="translate(440 0) scale(-1 1)"' : ''}>
        ${ironPanel(440, true)}
      </g>
    </g>
  </g>`;
}

export function hauntedManorHtml() {
  const arrival = arrived ? ' manor-arrived' : '';
  arrived = true;
  return `<div class="manor-scene${arrival}" aria-hidden="true">
    <div class="manor-camera">
      <svg class="manor-landscape" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" focusable="false">
        <defs>
          <linearGradient id="manor-sky" x2="0" y2="1"><stop stop-color="#101d32"/><stop offset=".55" stop-color="#334b52"/><stop offset="1" stop-color="#101c23"/></linearGradient>
          <radialGradient id="manor-moon"><stop stop-color="#c1d2be" stop-opacity=".6"/><stop offset=".2" stop-color="#adceba" stop-opacity=".2"/><stop offset="1" stop-color="#adceba" stop-opacity="0"/></radialGradient>
          <linearGradient id="manor-ground" x2="0" y2="1"><stop stop-color="#24352b"/><stop offset="1" stop-color="#060f13"/></linearGradient>
          <linearGradient id="manor-path" x2=".4" y2="1"><stop stop-color="#5c6556"/><stop offset=".5" stop-color="#303b37"/><stop offset="1" stop-color="#19232b"/></linearGradient>
          <linearGradient id="manor-paver" x2=".3" y2="1"><stop stop-color="#748070"/><stop offset=".12" stop-color="#4b584e"/><stop offset=".8" stop-color="#283935"/><stop offset="1" stop-color="#182423"/></linearGradient>
          <radialGradient id="manor-glass"><stop stop-color="#dfa960" stop-opacity=".3"/><stop offset="1" stop-color="#535e50" stop-opacity=".15"/></radialGradient>
          <linearGradient id="manor-metal"><stop stop-color="#111e21"/><stop offset=".45" stop-color="#526c60"/><stop offset=".65" stop-color="#233833"/><stop offset="1" stop-color="#101b20"/></linearGradient>
          <linearGradient id="manor-stone"><stop stop-color="#172924"/><stop offset=".15" stop-color="#718069"/><stop offset=".25" stop-color="#455b49"/><stop offset=".7" stop-color="#354b3d"/><stop offset="1" stop-color="#101f1e"/></linearGradient>
          <pattern id="manor-stone-detail" width="58" height="150" patternUnits="userSpaceOnUse"><image href="assets/estate-stone-pillar.png" width="58" height="150"/></pattern>
          <radialGradient id="manor-candle-halo"><stop stop-color="#edb956" stop-opacity=".42"/><stop offset="1" stop-color="#edb956" stop-opacity="0"/></radialGradient>
          <filter id="manor-surface" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency=".14" numOctaves="3" seed="11" result="grain"/>
            <feColorMatrix in="grain" type="saturate" values="0"/>
            <feComponentTransfer result="subtle-grain"><feFuncA type="linear" slope=".1"/></feComponentTransfer>
            <feBlend in="SourceGraphic" in2="subtle-grain" mode="soft-light"/>
            <feComposite in2="SourceGraphic" operator="in"/>
          </filter>
          <filter id="manor-cloud-texture" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency=".003 .009" numOctaves="3" seed="8"/>
            <feColorMatrix type="matrix" values="0 0 0 0 .35 0 0 0 0 .43 0 0 0 0 .45 0 0 0 .6 -.18"/>
          </filter>
          <linearGradient id="manor-storm-fade" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="235"><stop stop-color="white"/><stop offset=".85" stop-color="white"/><stop offset="1" stop-color="black"/></linearGradient>
          <mask id="manor-storm-mask" maskUnits="userSpaceOnUse" x="-200" y="-100" width="2320" height="335"><path fill="url(#manor-storm-fade)" d="M-200-100h2320v335H-200z"/></mask>
          <filter id="manor-storm-texture" x="-15%" y="-30%" width="130%" height="160%">
            <feTurbulence type="fractalNoise" baseFrequency=".008 .018" numOctaves="4" seed="19" result="billows"/>
            <feDisplacementMap in="SourceGraphic" in2="billows" scale="75" xChannelSelector="R" yChannelSelector="G" result="cloud-shape"/>
            <feColorMatrix in="billows" type="saturate" values="0" result="gray-billows"/>
            <feColorMatrix in="gray-billows" type="matrix" values=".24 0 0 0 .015 .27 0 0 0 .025 .32 0 0 0 .04 0 0 0 1 0" result="cloud-grain"/>
            <feComposite in="cloud-grain" in2="cloud-shape" operator="in" result="textured-cloud"/>
            <feBlend in="textured-cloud" in2="cloud-shape" mode="screen"/>
            <feGaussianBlur stdDeviation="3"/>
          </filter>
          <radialGradient id="manor-window-light"><stop stop-color="#ffc46b" stop-opacity=".4"/><stop offset="1" stop-color="#e9a341" stop-opacity="0"/></radialGradient>
          <clipPath id="manor-window-clip"><path d="M1227 580v-53a19 19 0 0 1 38 0v53z"/></clipPath>
        </defs>
        <path fill="url(#manor-sky)" d="M0 0h1920v1080H0z"/>
        <path d="M0 0h1920v750H0z" filter="url(#manor-cloud-texture)" opacity=".5"/>
        <ellipse cx="1460" cy="175" rx="480" ry="300" fill="url(#manor-moon)"/>
        <g class="manor-storm-clouds" mask="url(#manor-storm-mask)">
          <path fill="#030811" filter="url(#manor-storm-texture)" d="M-200-100H2120V180Q1990 250 1840 185Q1710 245 1560 180Q1430 240 1270 170Q1120 240 970 185Q800 245 650 175Q490 245 330 180Q160 245-20 180Q-110 230-200 170z"/>
          <path fill="#030710" opacity=".9" filter="url(#manor-storm-texture)" d="M-200-100H2120V90Q1900 175 1670 110Q1440 185 1200 100Q940 180 710 110Q470 180 230 100Q0 170-200 95z"/>
        </g>
        <g class="manor-strike" fill="none" stroke-linejoin="round" stroke-linecap="round">
          <path class="manor-bolt-glow" d="M1654 0l9 28-17 31 5 37-23 21 14 40-19 27 4 46-20 19 9 31-17 42 7 32-24 29 10 38-13 26 4 38-19 25 9 35-21 31 6 32-15 38 8 34-14 31 4 36-13 40 5 36m111-549 28 34-3 23 25 29-5 31 22 25m-88 29-32 18-8 30-27 23 4 27-19 31m20 95 24 18-6 34 13 24"/>
          <path class="manor-bolt-core" d="M1654 0l9 28-17 31 5 37-23 21 14 40-19 27 4 46-20 19 9 31-17 42 7 32-24 29 10 38-13 26 4 38-19 25 9 35-21 31 6 32-15 38 8 34-14 31 4 36-13 40 5 36m111-549 28 34-3 23 25 29-5 31 22 25m-88 29-32 18-8 30-27 23 4 27-19 31m20 95 24 18-6 34 13 24"/>
        </g>
        <path fill="url(#manor-ground)" d="M0 750Q520 680 950 755T1920 735V1080H0z" filter="url(#manor-surface)"/>
        ${tree(850)}${tree(1770, true)}
        <g class="manor-driveway">
          <path fill="url(#manor-path)" d="${driveway}"/>
          <g filter="url(#manor-surface)">${paving()}</g>
        </g>
        <g class="manor-door-anchor" transform="translate(${entrance.x} ${entrance.y})"></g>
        <image class="manor-artwork" href="assets/estate-cartoon-manor.png" x="1080" y="240" width="517" height="600"/>
        <path class="manor-window window-last" fill="url(#manor-window-light)" d="M1227 580v-53a19 19 0 0 1 38 0v53z"/>
        <g clip-path="url(#manor-window-clip)">
          <g class="manor-shadow" fill="#080c12"><ellipse cx="1245" cy="540" rx="6" ry="8"/><path d="M1238 549q7-5 14 0l5 32h-24z"/></g>
        </g>
        ${lantern(1278, 850, .35)}${lantern(1398, 850, .35)}
        ${lantern(1158, 935, .55)}${lantern(1518, 935, .55)}
        ${lantern(958, 1045, .8)}${lantern(1718, 1045, .8)}
        <g class="manor-gateway">
          <g class="manor-fence manor-fence-left" transform="translate(-120 445)">${ironPanel(888)}</g>
          <g class="manor-fence manor-fence-right" transform="translate(1908 445)">${ironPanel(888)}</g>
          ${[768, 1778].map(x => `<g class="manor-pillar" transform="translate(${x} 385)">
            <path fill="url(#manor-stone)" stroke="#101e1c" stroke-width="3" d="M0 42h130v648H0z"/>
            ${Array.from({ length: 7 }, (_, row) => `<g transform="translate(0 ${52 + row * 87})">
              <path d="M8 0h114l-4 80H11z" fill="url(#manor-stone)" stroke="#111f1c" stroke-width="3"/>
              <path d="M11 4h105M11 4v69" fill="none" stroke="#a0ab89" stroke-opacity=".24" stroke-width="2"/>
              <path d="M10 5h108v70H10z" fill="url(#manor-stone-detail)" opacity=".24"/>
            </g>`).join('')}
            <path fill="url(#manor-stone)" stroke="#6c7a5d" stroke-width="2" d="M-12 20l77-28 77 28v24H-12zM-16 648h162v32H-16z"/>
            <path d="M-12 22h154M-16 650h162M20 220l17 22-10 26M96 489l-18 20 7 24" fill="none" stroke="#15251f" stroke-width="3"/>
          </g>`).join('')}
          ${gate('left')}${gate('right')}
          ${lantern(833, 365, 1.1)}${lantern(1843, 365, 1.1)}
        </g>
      </svg>
    </div>
    <div class="manor-cloud-shadow"></div>
    <div class="manor-mist mist-back"></div>
    <div class="manor-mist mist-front"></div>
    <div class="manor-rain"></div>
    <div class="manor-rain rain-near"></div>
    <div class="manor-scene-shade"></div>
    <div class="manor-lightning"></div>
  </div>`;
}
