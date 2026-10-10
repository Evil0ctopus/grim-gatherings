const sizes = {
  gate: [1259, 727], fence: [1379, 735], pillar: [256, 704], lantern: [494, 610],
  rounded: [707, 1053], broken: [424, 555], cross: [699, 1036], angel: [551, 1098],
};
const art = (name, x, y, width, height, className = '') =>
  `<image class="${className}" href="assets/estate-supporting/${name}.png" x="${x}" y="${y}" width="${width}" height="${height}" preserveAspectRatio="xMidYMid meet"/>`;
const grounded = (name, x, base, height, className = '') => {
  const [width, nativeHeight] = sizes[name];
  return art(name, x, base - height, height * width / nativeHeight, height, className);
};
const graves = [
  ['rounded', 145, 755, 84], ['broken', 350, 765, 60], ['cross', 215, 875, 135],
  ['rounded', 395, 855, 105], ['angel', 80, 890, 225], ['broken', 1150, 745, 55],
  ['rounded', 1290, 770, 85], ['cross', 1410, 855, 145], ['rounded', 1160, 865, 105],
  ['broken', 1320, 920, 75],
];

export function estateSceneHtml(arrival, shadowHtml) {
  const fenceWidth = 158 * sizes.fence[0] / sizes.fence[1];
  const leaf = side => {
    const left = side === 'left';
    return `<g class="manor-gate manor-gate-${side}" transform="translate(${left ? 548 : 800} 690)">
      <g class="manor-gate-leaf"><svg width="252" height="291.04" viewBox="${left ? 0 : 629.5} 0 629.5 727" overflow="hidden">
        ${art('gate', 0, 0, 1259, 727)}
      </svg></g></g>`;
  };
  return `<div class="manor-scene${arrival}" aria-hidden="true">
    <style data-manor-shadow-style></style>
    <div class="manor-camera">
      <svg class="manor-landscape" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" focusable="false">
        <defs>
          <linearGradient id="estate-sky" x2="0" y2="1"><stop stop-color="#0a1926"/><stop offset="1" stop-color="#223f46"/></linearGradient>
          <radialGradient id="estate-contact"><stop stop-color="#000508" stop-opacity=".9"/><stop offset="1" stop-color="#000508" stop-opacity="0"/></radialGradient>
          <linearGradient id="estate-horizon" x2="0" y2="1"><stop stop-color="#1b343c" stop-opacity="0"/><stop offset=".4" stop-color="#1b343c"/><stop offset="1" stop-color="#1b343c" stop-opacity="0"/></linearGradient>
          <pattern id="estate-soil" width="1024" height="1024" patternUnits="userSpaceOnUse">${art('soil', 0, 0, 1024, 1024)}</pattern>
          <pattern id="estate-paving" width="1024" height="1024" patternUnits="userSpaceOnUse">${art('paving', 0, 0, 1024, 1024)}</pattern>
        </defs>
        <path fill="url(#estate-sky)" d="M0 0h1600v1000H0z"/>
        ${art('moon', 350, 60, 205, 209.51, 'manor-moon')}
        <g class="estate-clouds">${art('cloud', -50, 45, 950, 423.12)}${art('cloud', 740, 65, 920, 409.75)}</g>
        ${[120, 280, 1320, 1460].map(x => art('distant-tree', x, 540, 55.74, 180, 'estate-distant-tree')).join('')}
        <path fill="#14272b" d="M0 620h1600v380H0z"/>
        <path fill="url(#estate-soil)" opacity=".22" d="M0 630h1600v370H0z"/>
        <path fill="url(#estate-horizon)" d="M0 600h1600v90H0z"/>
        <g class="manor-driveway"><path fill="url(#estate-paving)" d="M763 658h74L1100 1000H500z"/><path fill="#071d25" opacity=".73" d="M763 658h74L1100 1000H500z"/></g>
        <ellipse cx="800" cy="659" rx="330" ry="18" fill="url(#estate-contact)"/>
        <ellipse cx="800" cy="674" rx="150" ry="20" fill="url(#estate-contact)"/>
        <g class="manor-door-anchor" transform="translate(800 668.125)"></g>
        <image class="manor-artwork" href="assets/estate-generated-manor.png" x="485" y="235" width="630" height="435.75"/>
        <svg x="485" y="235" width="630" height="435.75" viewBox="978 315 720 498" overflow="visible">${shadowHtml}</svg>
        ${graves.map(([name, x, base, height]) => `<g class="manor-grave"><ellipse cx="${x + height * .2}" cy="${base}" rx="${height * .35}" ry="9" fill="url(#estate-contact)"/>${grounded(name, x, base, height)}</g>`).join('')}
        ${Array.from({length: 9}, (_, i) => art(i % 2 ? 'grass' : 'weeds', i < 4 ? 60 + i * 110 : 1120 + (i - 4) * 100, 920 - (i % 3) * 25, 100, 44)).join('')}
        ${art('large-tree', -530, 195, 1100, 640.22, 'manor-tree tree-near')}
        ${art('arch-tree', 1010, 280, 650, 625.52, 'manor-tree tree-near')}
        ${Array.from({length: 5}, (_, i) => {
          const y = 707 + i * 49, spread = 50 + i * 26, height = 18 + i * 6;
          return [800 - spread, 800 + spread].map(x => `<g class="estate-candle">${art('glow', x - 15, y - 40, 42, 42, 'estate-glow')}${art('candle', x, y - height, height * .5, height, 'manor-flame')}</g>`).join('');
        }).join('')}
        <g class="manor-bats">${Array.from({length: 5}, (_, i) => `<g class="manor-bat-flight" style="--bat-delay:-${i * 3}s">${art('bat', 660 + i * 70, 150 + (i % 3) * 30, 23, 14, 'manor-bat')}</g>`).join('')}</g>
        ${art('lightning', 1190, 180, 235, 303.24, 'estate-lightning')}
        <g class="manor-gateway">
          ${Array.from({length: 3}, (_, i) => grounded('fence', 520 - (i + 1) * (fenceWidth - 5), 974, 158) + grounded('fence', 1080 + i * (fenceWidth - 5), 974, 158)).join('')}
          ${leaf('left')}${leaf('right')}
          ${grounded('pillar', 485, 980, 255, 'manor-pillar')}${grounded('pillar', 1027, 980, 255, 'manor-pillar')}
          ${grounded('lantern', 514, 775, 56)}${grounded('lantern', 1055, 775, 56)}
        </g>
      </svg>
    </div>
    <div class="manor-mist mist-back"></div><div class="manor-mist mist-front"></div>
    <div class="manor-rain"></div><div class="manor-scene-shade"></div>
  </div>`;
}
