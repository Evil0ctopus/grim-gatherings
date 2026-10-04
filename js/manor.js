export function hauntedManorHtml() {
  return `<div class="manor-scene" aria-hidden="true">
    <svg class="manor-landscape" viewBox="0 0 1000 480" xmlns="http://www.w3.org/2000/svg" focusable="false">
      <defs>
        <linearGradient id="manor-sky" x2="0" y2="1"><stop stop-color="#121728"/><stop offset=".65" stop-color="#394458"/><stop offset="1" stop-color="#181c24"/></linearGradient>
        <linearGradient id="manor-stone" x2="0" y2="1"><stop stop-color="#414452"/><stop offset="1" stop-color="#191c25"/></linearGradient>
        <linearGradient id="manor-path" x2="0" y2="1"><stop stop-color="#55545e"/><stop offset="1" stop-color="#181822"/></linearGradient>
        <radialGradient id="manor-moon"><stop stop-color="#dce3e4" stop-opacity=".45"/><stop offset="1" stop-color="#dce3e4" stop-opacity="0"/></radialGradient>
        <clipPath id="manor-window-clip"><path d="M477 230v-39a23 23 0 0 1 46 0v39z"/></clipPath>
      </defs>
      <path fill="url(#manor-sky)" d="M0 0h1000v480H0z"/>
      <circle cx="720" cy="95" r="88" fill="url(#manor-moon)"/>
      <circle cx="720" cy="95" r="30" fill="#c5ced3"/>
      <path class="manor-cloud cloud-near" d="M565 80q45-25 92-6t90 0 122 6" fill="none" stroke="#232c3c" stroke-width="26" opacity=".6"/>
      <path class="manor-cloud cloud-far" d="M160 115q75-40 170-10t130 0" fill="none" stroke="#283346" stroke-width="36" opacity=".7"/>
      <path d="M0 260q130-70 230-10t190-15 220 10 200-10 160 25v220H0z" fill="#151e29"/>
      <path d="M0 315q120-35 230-10t205 0 210 8 200-25 155 22v170H0z" fill="#0d141c"/>
      <g class="manor-house">
        <path d="M305 300V198h110V132h170v66h110v102z" fill="url(#manor-stone)" stroke="#565766" stroke-width="2"/>
        <path d="M282 204l78-77 76 77zM395 141l105-86 105 86zM564 204l77-77 77 77z" fill="#151823" stroke="#565766" stroke-width="3"/>
        <path d="M451 97V57h22v25M556 100V63h19v52" fill="#282c38" stroke="#565766" stroke-width="2"/>
        <path d="M299 300V212M700 300V212M420 300V148M580 300V148" stroke="#6a6570" stroke-width="3"/>
        <path d="M306 251h108m172 0h108M422 241h156" stroke="#77717b" opacity=".35"/>
        <g fill="#bd844b" stroke="#080c13" stroke-width="5">
          <path class="manor-window window-left" d="M328 236v-21a16 16 0 0 1 32 0v21z"/>
          <path class="manor-window window-right" d="M638 236v-21a16 16 0 0 1 32 0v21z"/>
          <path class="manor-window window-upper" d="M477 230v-39a23 23 0 0 1 46 0v39z"/>
          <path class="manor-window window-attic" d="M488 134v-13a12 12 0 0 1 24 0v13z"/>
        </g>
        <g clip-path="url(#manor-window-clip)">
          <g class="manor-shadow" fill="#11121a">
            <ellipse cx="482" cy="193" rx="7" ry="9"/>
            <path d="M475 203q7-6 14 0l6 28h-26z"/>
          </g>
        </g>
        <path d="M344 198v38m-16-13h32M654 198v38m-16-13h32M500 168v62m-23-22h46" stroke="#10131c" stroke-width="3"/>
        <path d="M469 300v-34a31 31 0 0 1 62 0v34z" fill="#090d14" stroke="#6b6368" stroke-width="3"/>
        <path class="manor-door" d="M472 300v-32q2-27 27-30v62z" fill="#42312c" stroke="#745440" stroke-width="2"/>
        <circle cx="491" cy="277" r="2" fill="#e7bc70"/>
        <path d="M457 302h86v8h-86m-9 2h104v8H448" fill="#4b4650" stroke="#161922" stroke-width="2"/>
      </g>
      <path d="M482 319h37l125 161H345z" fill="url(#manor-path)" opacity=".7"/>
      <g stroke="#11151c" fill="#151821" stroke-width="4">
        <path d="M182 360v-58h39v58m-42-58q23-40 45 0M781 360v-58h39v58m-42-58q23-40 45 0"/>
        <path d="M0 350h180m42 0h98m360 0h98m44 0h178"/>
        <path d="M45 379v-70m35 70v-70m35 70v-70m35 70v-70m90 70v-70m35 70v-70m450 70v-70m35 70v-70m90 70v-70m35 70v-70m35 70v-70m35 70v-70"/>
      </g>
      <g class="manor-tree tree-left" fill="none" stroke="#070d14" stroke-linecap="round">
        <path d="M110 420l15-120-32-92 8-81" stroke-width="17"/>
        <path d="M117 333L56 278l-14-65m61 59l-49-64-30-15m86 58l56-81 6-73m-80 108l-51-65m82 168l69-42 26-51m-45 104l48-3" stroke-width="8"/>
      </g>
      <g class="manor-tree tree-right" fill="none" stroke="#070d14" stroke-linecap="round">
        <path d="M895 420l-12-135 38-73-8-90" stroke-width="19"/>
        <path d="M886 309l67-56 23-71m-71 58l-68-62-19-70m67 178l-57-20-28-49m123-3l53-51m-84 180l77-25" stroke-width="8"/>
      </g>
      <g class="manor-bat" fill="none" stroke="#060a11" stroke-width="4"><path d="M365 105q-12-15-22-5 13-2 22 11 9-13 22-11-10-10-22 5"/></g>
      <path d="M0 420q100-45 200-12t180 20 250-5 210-20 160 22v55H0z" fill="#070b11"/>
    </svg>
    <div class="manor-mist mist-back"></div><div class="manor-mist mist-front"></div>
    <div class="manor-scene-shade"></div>
    <p class="manor-caption">The house is waiting. Someone is already inside.</p>
  </div>`;
}
