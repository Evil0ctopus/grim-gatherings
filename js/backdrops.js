export const BACKDROPS = Object.freeze({
  corridor: 'assets/abandoned-corridor.jpg',
  manor: 'assets/abandoned-corridor.jpg',
  witch: 'assets/witch-forest.jpg',
  farm: 'assets/old-barn.jpg',
  victorian: 'assets/gothic-door.jpg',
});

export function backdropFor(phase, theme) {
  if (phase === 'home') return null;
  if (['setup', 'connecting'].includes(phase)) return 'corridor';
  return Object.hasOwn(BACKDROPS, theme) ? theme : 'manor';
}

export function backdropHtml() {
  return `<div class="story-camera"><img class="story-photograph" alt="" decoding="async"></div>
    <div class="story-light"></div>
    <div class="story-mist mist-back"></div><div class="story-mist mist-front"></div>
    <div class="story-weather"></div>
    <div class="atmosphere-vignette"></div>`;
}
