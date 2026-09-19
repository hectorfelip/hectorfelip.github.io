(() => {
  'use strict';
  const filters = document.querySelector('[data-filters]');
  const cards = Array.from(document.querySelectorAll('[data-category]'));
  const empty = document.querySelector('[data-empty]');
  const count = document.querySelector('[data-count]');
  if (!filters || !empty || !count) return;
  const buttons = Array.from(filters.querySelectorAll('[data-filter]'));
  const apply = (category) => {
    let visible = 0;
    cards.forEach(card => {
      card.hidden = category !== 'all' && card.dataset.category !== category;
      if (!card.hidden) visible += 1;
    });
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === category)));
    empty.hidden = visible > 0;
    count.textContent = `${visible} ${visible === 1 ? count.dataset.singular : count.dataset.plural}`;
  };
  filters.addEventListener('click', event => {
    const button = event.target.closest('[data-filter]');
    if (button) apply(button.dataset.filter);
  });
  document.querySelector('[data-reset-filter]')?.addEventListener('click', () => {
    apply('all'); buttons[0].focus();
  });
  filters.hidden = false;
  apply('all');
})();
