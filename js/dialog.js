let pending = Promise.resolve();
let lastTrigger = null;
document.addEventListener('click', event => {
  const control = event.target instanceof Element ? event.target.closest('button, a') : null;
  if (control && !control.closest('dialog')) lastTrigger = control;
}, { capture: true });

export function confirmAction(message, { title = 'Please confirm', acceptLabel = 'Continue', cancelLabel = 'Cancel' } = {}) {
  const show = () => new Promise(resolve => {
    const previousFocus = document.activeElement === document.body && lastTrigger?.isConnected
      ? lastTrigger : document.activeElement;
    const dialog = document.createElement('dialog');
    dialog.className = 'game-dialog';
    dialog.setAttribute('aria-labelledby', 'game-dialog-title');
    dialog.setAttribute('aria-describedby', 'game-dialog-message');
    dialog.innerHTML = `<form method="dialog">
      <p class="label">Grim Gatherings</p><h2 id="game-dialog-title"></h2>
      <p id="game-dialog-message"></p>
      <div class="dialog-actions"><button type="submit" class="secondary" value="cancel" data-dialog-cancel autofocus></button>
      <button type="submit" value="accept" data-dialog-accept></button></div>
    </form>`;
    dialog.querySelector('h2').textContent = title;
    dialog.querySelector('#game-dialog-message').textContent = message;
    dialog.querySelector('[data-dialog-accept]').textContent = acceptLabel;
    dialog.querySelector('[data-dialog-cancel]').textContent = cancelLabel;
    dialog.addEventListener('keydown', event => {
      if (event.key !== 'Tab') return;
      const buttons = [...dialog.querySelectorAll('button')];
      const first = buttons[0], last = buttons.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    });
    dialog.addEventListener('close', () => {
      const accepted = dialog.returnValue === 'accept';
      dialog.remove();
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
      resolve(accepted);
    }, { once: true });
    document.body.append(dialog);
    dialog.showModal();
  });
  const result = pending.then(show);
  pending = result.then(() => {}, () => {});
  return result;
}
