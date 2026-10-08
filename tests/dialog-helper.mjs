export async function acceptDialogs(page) {
  await page.addInitScript(() => {
    const accept = () => document.querySelector('dialog[open] [data-dialog-accept]')?.click();
    const start = () => new MutationObserver(accept).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['open'] });
    if (document.body) start();
    else document.addEventListener('DOMContentLoaded', start, { once: true });
  });
}
