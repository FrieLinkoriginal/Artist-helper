const rail = document.querySelector('#tool-rail');
const searchInput = document.querySelector('#search');
const categoriesEl = document.querySelector('#categories');
const emptyState = document.querySelector('#empty-state');
const countEl = document.querySelector('#tool-count');
const countLabel = document.querySelector('#count-label');
const startMenu = document.querySelector('#start-menu');
const startButton = document.querySelector('#start-button');
const startPrograms = document.querySelector('#start-programs');

let tools = [];
let activeCategory = 'Tout';
let searchTerm = '';
let favoritesOnly = false;
let transformFrame = 0;
const favoriteKey = 'art-helper-favorites';
const colors = ['#f7d967', '#b8d9f2', '#f0c6c6', '#d9e6be', '#f4c99f', '#d7c8e7'];

function loadFavorites() {
  try {
    const value = JSON.parse(window.localStorage.getItem(favoriteKey) || '[]');
    return Array.isArray(value) ? value.map(String) : [];
  } catch {
    return [];
  }
}
const favoriteIds = new Set(loadFavorites());

function saveFavorites() {
  try { window.localStorage.setItem(favoriteKey, JSON.stringify([...favoriteIds])); } catch { /* Storage can be disabled; favorites still work for this page view. */ }
}

function safeText(value, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function safeHref(value) {
  const url = safeText(value, '#');
  if (/^(https?:\/\/|\.\.?\/|\/|#)/i.test(url)) return url;
  return '#';
}

function updateCategories() {
  const names = [...new Set(tools.map(tool => safeText(tool.category, 'Autre')).filter(Boolean))];
  categoriesEl.replaceChildren();
  const addChip = (label, selected, action) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `category-chip win-button${selected ? ' active' : ''}`;
    button.textContent = label;
    button.setAttribute('aria-pressed', String(selected));
    button.addEventListener('click', action);
    categoriesEl.append(button);
  };
  addChip('Tout', activeCategory === 'Tout' && !favoritesOnly, () => { activeCategory = 'Tout'; favoritesOnly = false; render(); });
  addChip('★ Favoris', favoritesOnly, () => { favoritesOnly = !favoritesOnly; activeCategory = 'Tout'; render(); });
  names.forEach(name => addChip(name, activeCategory === name && !favoritesOnly, () => { activeCategory = name; favoritesOnly = false; render(); }));
}

function matches(tool) {
  const category = safeText(tool.category, 'Autre');
  const text = `${safeText(tool.title)} ${safeText(tool.description)} ${category} ${safeText(tool.tags, '')}`.toLocaleLowerCase('fr');
  return (!searchTerm || text.includes(searchTerm))
    && (activeCategory === 'Tout' || category === activeCategory)
    && (!favoritesOnly || favoriteIds.has(String(tool.id)));
}

function createCard(tool, index) {
  const id = String(tool.id ?? `outil-${index}`);
  const card = document.createElement('article');
  card.className = 'tool-card';
  card.style.setProperty('--card-color', safeText(tool.color, colors[index % colors.length]));

  const titlebar = document.createElement('div');
  titlebar.className = 'card-titlebar';
  const miniIcon = document.createElement('span');
  miniIcon.className = 'mini-icon';
  miniIcon.textContent = safeText(tool.emoji, '✦');
  miniIcon.setAttribute('aria-hidden', 'true');
  const windowName = document.createElement('span');
  windowName.className = 'window-name';
  windowName.textContent = safeText(tool.title, 'Programme');
  const favorite = document.createElement('button');
  favorite.type = 'button';
  favorite.className = `favorite${favoriteIds.has(id) ? ' is-favorite' : ''}`;
  favorite.textContent = favoriteIds.has(id) ? '★' : '☆';
  favorite.setAttribute('aria-label', favoriteIds.has(id) ? 'Retirer des favoris' : 'Ajouter aux favoris');
  favorite.setAttribute('aria-pressed', String(favoriteIds.has(id)));
  favorite.addEventListener('click', () => {
    if (favoriteIds.has(id)) favoriteIds.delete(id); else favoriteIds.add(id);
    saveFavorites();
    render();
  });
  const closeGlyph = document.createElement('span');
  closeGlyph.className = 'card-close';
  closeGlyph.setAttribute('aria-hidden', 'true');
  closeGlyph.textContent = '×';
  titlebar.append(miniIcon, windowName, favorite, closeGlyph);

  const content = document.createElement('div');
  content.className = 'card-content';
  const emoji = document.createElement('div');
  emoji.className = 'tool-emoji';
  emoji.setAttribute('aria-hidden', 'true');
  emoji.textContent = safeText(tool.emoji, '✦');
  const category = document.createElement('p');
  category.className = 'card-category';
  category.textContent = safeText(tool.category, 'Autre');
  const title = document.createElement('h3');
  title.textContent = safeText(tool.title, 'Sans titre');
  const description = document.createElement('p');
  description.className = 'card-description';
  description.textContent = safeText(tool.description, 'Un logiciel créatif à découvrir.');

  const bottom = document.createElement('div');
  bottom.className = 'card-bottom';
  const link = document.createElement('a');
  link.className = 'open-tool win-button';
  link.href = safeHref(tool.url);
  link.textContent = 'Lancer';
  const arrow = document.createElement('span');
  arrow.setAttribute('aria-hidden', 'true');
  arrow.textContent = ' ▶';
  link.append(arrow);
  if (/^https?:\/\//i.test(link.href)) {
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  }
  const type = document.createElement('span');
  type.className = 'card-type';
  type.textContent = safeText(tool.type, 'HTML');
  bottom.append(link, type);
  content.append(emoji, category, title, description, bottom);
  card.append(titlebar, content);
  return card;
}

function renderStartMenu() {
  startPrograms.replaceChildren();
  tools.forEach(tool => {
    const item = document.createElement('a');
    item.className = 'start-program';
    item.href = safeHref(tool.url);
    const icon = document.createElement('span');
    icon.textContent = safeText(tool.emoji, '✦');
    icon.setAttribute('aria-hidden', 'true');
    const name = document.createElement('span');
    name.textContent = safeText(tool.title, 'Programme');
    item.append(icon, name);
    item.addEventListener('click', () => closeStartMenu());
    startPrograms.append(item);
  });
}

function updateCarousel3D() {
  cancelAnimationFrame(transformFrame);
  transformFrame = requestAnimationFrame(() => {
    const width = rail.clientWidth || 1;
    const center = rail.scrollLeft + width / 2;
    rail.querySelectorAll('.tool-card').forEach(card => {
      const offset = Math.max(-1.5, Math.min(1.5, (card.offsetLeft + card.offsetWidth / 2 - center) / (width * 0.53)));
      const proximity = Math.max(0, 1 - Math.abs(offset) / 1.5);
      card.style.setProperty('--turn', `${-offset * 23}deg`);
      card.style.setProperty('--tilt', `${Math.sign(offset) * proximity * 3}deg`);
      card.style.setProperty('--push', `${proximity * 24}px`);
      card.style.setProperty('--scale', `${0.91 + proximity * 0.09}`);
    });
  });
}

function render() {
  updateCategories();
  const filtered = tools.filter(matches);
  rail.replaceChildren(...filtered.map(createCard));
  countEl.textContent = String(tools.length);
  countLabel.textContent = tools.length === 1 ? 'programme' : 'programmes';
  document.querySelector('#catalog-status').textContent = `${filtered.length} objet${filtered.length === 1 ? '' : 's'} affiché${filtered.length === 1 ? '' : 's'}`;
  emptyState.hidden = filtered.length > 0;
  if (tools.length === 0) emptyState.querySelector('strong').textContent = 'Aucun logiciel trouvé';
  else if (filtered.length === 0) emptyState.querySelector('strong').textContent = 'Aucun résultat';
  else emptyState.querySelector('strong').textContent = 'Catalogue indisponible';
  rail.setAttribute('aria-label', `${filtered.length} logiciels affichés, carrousel 3D horizontal`);
  renderStartMenu();
  updateCarousel3D();
}

searchInput.addEventListener('input', event => {
  searchTerm = event.target.value.trim().toLocaleLowerCase('fr');
  render();
});
document.querySelector('#scroll-left').addEventListener('click', () => rail.scrollBy({ left: -500, behavior: 'smooth' }));
document.querySelector('#scroll-right').addEventListener('click', () => rail.scrollBy({ left: 500, behavior: 'smooth' }));
rail.addEventListener('scroll', updateCarousel3D, { passive: true });
window.addEventListener('resize', updateCarousel3D);

// Wheel and pointer gestures rotate the cover-flow rail horizontally.
rail.addEventListener('wheel', event => {
  if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
    event.preventDefault();
    rail.scrollLeft += event.deltaY;
  }
}, { passive: false });
let dragStart = null;
rail.addEventListener('pointerdown', event => {
  if (event.pointerType === 'touch' || event.target.closest('a, button')) return;
  dragStart = { x: event.clientX, scroll: rail.scrollLeft };
  rail.classList.add('dragging');
  rail.setPointerCapture(event.pointerId);
});
rail.addEventListener('pointermove', event => {
  if (dragStart) rail.scrollLeft = dragStart.scroll - (event.clientX - dragStart.x);
});
const endDrag = () => { dragStart = null; rail.classList.remove('dragging'); };
rail.addEventListener('pointerup', endDrag);
rail.addEventListener('pointercancel', endDrag);

function closeStartMenu() {
  startMenu.hidden = true;
  startButton.setAttribute('aria-expanded', 'false');
}
startButton.addEventListener('click', () => {
  const open = startMenu.hidden;
  startMenu.hidden = !open;
  startButton.setAttribute('aria-expanded', String(open));
});
document.addEventListener('pointerdown', event => {
  if (!startMenu.hidden && !startMenu.contains(event.target) && !startButton.contains(event.target)) closeStartMenu();
});

function updateClock() {
  document.querySelector('#clock').textContent = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(new Date());
}
updateClock();
setInterval(updateClock, 30000);

document.addEventListener('keydown', event => {
  if (event.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
    event.preventDefault();
    searchInput.focus();
  }
  if (event.key === 'Escape') {
    closeStartMenu();
    if (document.activeElement === searchInput) {
      searchInput.value = '';
      searchTerm = '';
      searchInput.blur();
      render();
    }
  }
});

fetch('./apps.json')
  .then(response => {
    if (!response.ok) throw new Error(`apps.json: ${response.status}`);
    return response.json();
  })
  .then(data => {
    if (!Array.isArray(data)) throw new Error('apps.json doit contenir une liste.');
    tools = data.filter(tool => tool && typeof tool === 'object');
    render();
  })
  .catch(error => {
    console.error(error);
    rail.replaceChildren();
    emptyState.hidden = false;
    emptyState.querySelector('strong').textContent = 'Catalogue indisponible';
    emptyState.querySelector('span:last-child').textContent = 'Impossible de charger les programmes. Recharge la page dans quelques instants.';
  });
