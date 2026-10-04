export function hauntedManorHtml() {
  return `<div class="manor-scene" aria-hidden="true">
    <div class="manor-camera">
      <svg class="manor-landscape" viewBox="0 0 1920 1228" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" focusable="false">
        <defs>
          <linearGradient id="manor-night" x2="0" y2="1">
            <stop stop-color="#071426" stop-opacity=".38"/>
            <stop offset=".65" stop-color="#06111c" stop-opacity=".12"/>
            <stop offset="1" stop-color="#030709" stop-opacity=".6"/>
          </linearGradient>
          <radialGradient id="manor-lamplight">
            <stop stop-color="#ffd49a" stop-opacity=".7"/>
            <stop offset=".5" stop-color="#c78439" stop-opacity=".48"/>
            <stop offset="1" stop-color="#ad6022" stop-opacity=".08"/>
          </radialGradient>
          <clipPath id="manor-window-clip"><path d="M1169 381h72v83h-72z"/></clipPath>
          <filter id="manor-soft-shadow"><feGaussianBlur stdDeviation="2"/></filter>
        </defs>
        <image class="manor-photograph" href="assets/haunted-manor.jpg" width="1920" height="1228"/>
        <path fill="url(#manor-night)" d="M0 0h1920v1228H0z"/>
        <g fill="url(#manor-lamplight)">
          <path class="manor-window window-upper" d="M1169 381h72v83h-72z"/>
          <path class="manor-window window-left" d="M842 383h30v60h-30z"/>
          <path class="manor-window window-lower" d="M1235 684h26v72h-26z"/>
        </g>
        <g clip-path="url(#manor-window-clip)">
          <g class="manor-shadow" fill="#06080b" filter="url(#manor-soft-shadow)">
            <ellipse cx="1183" cy="414" rx="9" ry="12"/>
            <path d="M1176 425q7-4 14 0l9 42h-32z"/>
          </g>
        </g>
      </svg>
    </div>
    <div class="manor-cloud-shadow"></div>
    <div class="manor-mist mist-back"></div>
    <div class="manor-mist mist-front"></div>
    <div class="manor-rain"></div>
    <div class="manor-scene-shade"></div>
  </div>`;
}
