const rail = document.querySelector('#tool-rail');
const searchInput = document.querySelector('#search');
const categoriesEl = document.querySelector('#categories');
const emptyState = document.querySelector('#empty-state');
const countEl = document.querySelector('#tool-count');
const countLabel = document.querySelector('#count-label');

let tools = [];
let activeCategory = 'Tout';
let searchTerm = '';
let favoritesOnly = false;
const favoriteKey = 'art-helper-favorites';
const favoriteIds = new Set(JSON.parse(localStorage.getItem(favoriteKey) || '[]'));
const colors = ['#f8d96b', '#b7dce6', '#f2b6c2', '#c5dfa9', '#f5bf91', '#d4c1e5'];

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
  categoriesEl.innerHTML = '';
  const addChip = (label, selected, action) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `category-chip${selected ? ' active' : ''}`;
    button.textContent = label;
    button.setAttribute('aria-pressed', String(selected));
    button.addEventListener('click', action);
    categoriesEl.append(button);
  };
  addChip('Tout', activeCategory === 'Tout' && !favoritesOnly, () => { activeCategory = 'Tout'; favoritesOnly = false; render(); });
  addChip('♥ Favoris', favoritesOnly, () => { favoritesOnly = !favoritesOnly; activeCategory = 'Tout'; render(); });
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

  const top = document.createElement('div');
  top.className = 'card-top';
  const emoji = document.createElement('div');
  emoji.className = 'tool-emoji';
  emoji.setAttribute('aria-hidden', 'true');
  emoji.textContent = safeText(tool.emoji, '✦');
  const favorite = document.createElement('button');
  favorite.type = 'button';
  favorite.className = `favorite${favoriteIds.has(id) ? ' is-favorite' : ''}`;
  favorite.textContent = favoriteIds.has(id) ? '♥' : '♡';
  favorite.setAttribute('aria-label', favoriteIds.has(id) ? 'Retirer des favoris' : 'Ajouter aux favoris');
  favorite.setAttribute('aria-pressed', String(favoriteIds.has(id)));
  favorite.addEventListener('click', () => {
    if (favoriteIds.has(id)) favoriteIds.delete(id); else favoriteIds.add(id);
    localStorage.setItem(favoriteKey, JSON.stringify([...favoriteIds]));
    render();
  });
  top.append(emoji, favorite);

  const category = document.createElement('p');
  category.className = 'card-category';
  category.textContent = safeText(tool.category, 'Autre');
  const title = document.createElement('h3');
  title.textContent = safeText(tool.title, 'Sans titre');
  const description = document.createElement('p');
  description.className = 'card-description';
  description.textContent = safeText(tool.description, 'Un petit outil créatif à découvrir.');
  const bottom = document.createElement('div');
  bottom.className = 'card-bottom';
  const link = document.createElement('a');
  link.className = 'open-tool';
  link.href = safeHref(tool.url);
  link.textContent = 'Ouvrir';
  const arrow = document.createElement('span');
  arrow.setAttribute('aria-hidden', 'true');
  arrow.textContent = '↗';
  link.append(arrow);
  if (/^https?:\/\//i.test(link.href)) {
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  }
  const type = document.createElement('span');
  type.className = 'card-type';
  type.textContent = safeText(tool.type, 'HTML');
  bottom.append(link, type);
  card.append(top, category, title, description, bottom);
  return card;
}

function render() {
  updateCategories();
  const filtered = tools.filter(matches);
  rail.replaceChildren(...filtered.map(createCard));
  countEl.textContent = String(tools.length);
  countLabel.textContent = tools.length === 1 ? 'outil' : 'outils';
  const isEmptyCatalog = tools.length === 0;
  emptyState.hidden = !isEmptyCatalog && filtered.length > 0;
  if (!isEmptyCatalog && filtered.length === 0) {
    emptyState.hidden = false;
    emptyState.querySelector('h3').textContent = 'Rien par ici…';
    emptyState.querySelector('p').textContent = 'Essaie un autre mot-clé ou enlève un filtre pour retrouver tes outils.';
    emptyState.querySelector('.empty-link').hidden = true;
  } else if (isEmptyCatalog) {
    emptyState.querySelector('h3').textContent = 'La boîte attend tes outils !';
    emptyState.querySelector('p').innerHTML = 'Dépose tes logiciels HTML dans le dossier <code>apps/</code>, puis ajoute-les dans <code>apps.json</code> pour les voir apparaître ici.';
    emptyState.querySelector('.empty-link').hidden = false;
  }
  rail.setAttribute('aria-label', `${filtered.length} outils affichés, défilement horizontal`);
}

searchInput.addEventListener('input', event => {
  searchTerm = event.target.value.trim().toLocaleLowerCase('fr');
  render();
});
document.querySelector('#scroll-left').addEventListener('click', () => rail.scrollBy({ left: -500, behavior: 'smooth' }));
document.querySelector('#scroll-right').addEventListener('click', () => rail.scrollBy({ left: 500, behavior: 'smooth' }));

// Transforme la molette verticale en défilement horizontal sur la rangée.
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

document.addEventListener('keydown', event => {
  if (event.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
    event.preventDefault();
    searchInput.focus();
  }
  if (event.key === 'Escape' && document.activeElement === searchInput) {
    searchInput.value = '';
    searchTerm = '';
    searchInput.blur();
    render();
  }
});

fetch('./apps.json')
  .then(response => {
    if (!response.ok) throw new Error(`Impossible de lire apps.json (${response.status})`);
    return response.json();
  })
  .then(data => {
    if (!Array.isArray(data)) throw new Error('apps.json doit contenir une liste d’outils.');
    tools = data.filter(tool => tool && typeof tool === 'object');
    render();
  })
  .catch(error => {
    console.error(error);
    emptyState.hidden = false;
    emptyState.querySelector('h3').textContent = 'Oups, la boîte est coincée !';
    emptyState.querySelector('p').textContent = 'Vérifie que le fichier apps.json est bien présent et contient une liste JSON valide.';
    emptyState.querySelector('.empty-link').hidden = true;
  });
