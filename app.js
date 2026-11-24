const rail = document.querySelector('#tool-rail');
const searchInput = document.querySelector('#search');
const categoriesEl = document.querySelector('#categories');
const emptyState = document.querySelector('#empty-state');
const countEl = document.querySelector('#tool-count');
const countLabel = document.querySelector('#count-label');
const startMenu = document.querySelector('#start-menu');
const startButton = document.querySelector('#start-button');
const startPrograms = document.querySelector('#start-programs');
const musicWindow = document.querySelector('#music-window');
const musicAudio = document.querySelector('#music-audio');
const musicStatus = document.querySelector('#music-status');
const playButton = document.querySelector('#play-track');
const tracks = [
  { title: 'Fusée en origami', file: 'Fusee-en-origami.mp3', url: './assets/music/3ds.mp3' },
  { title: 'Bossa du grille-pain', file: 'Bossa-du-grille-pain.mp3', url: './assets/music/bosa.mp3' },
  { title: 'Lapin à réaction', file: 'Lapin-a-reaction.mp3', url: './assets/music/bun.mp3' },
  { title: 'Prisme en cavale', file: 'Prisme-en-cavale.mp3', url: './assets/music/cromacore.mp3' },
  { title: 'Fantôme dans le brouillard', file: 'Fantome-dans-le-brouillard.mp3', url: './assets/music/ghost-in-the-smoke.mp3' },
  { title: 'Le klaxon de Saturne', file: 'Le-klaxon-de-Saturne.mp3', url: './assets/music/honk.mp3' },
  { title: 'Champignon turbo', file: 'Champignon-turbo.mp3', url: './assets/music/mario.mp3' },
  { title: 'Merci les étoiles', file: 'Merci-les-etoiles.mp3', url: './assets/music/merci-cece.mp3' },
  { title: 'Minuit en chaussettes', file: 'Minuit-en-chaussettes.mp3', url: './assets/music/midnigt.mp3' },
  { title: "L'œil de la comète", file: 'Oeil-de-la-comete.mp3', url: './assets/music/night-eye.mp3' },
  { title: "Rien d'anormal", file: 'Rien-d-anormal.mp3', url: './assets/music/normal.mp3' },
  { title: 'Projet 404', file: 'Projet-404.mp3', url: './assets/music/project-1-1.mp3' },
  { title: 'Biscuit électrique', file: 'Biscuit-electrique.mp3', url: './assets/music/project-1.mp3' },
  { title: 'Le docteur danse', file: 'Le-docteur-danse.mp3', url: './assets/music/robotnik.mp3' },
  { title: "Lapin d'Halloween", file: 'Lapin-d-Halloween.mp3', url: './assets/music/spoopy-bun.mp3' },
  { title: 'Supernova en skate', file: 'Supernova-en-skate.mp3', url: './assets/music/super.mp3' },
  { title: 'Citrouille atomique', file: 'Citrouille-atomique.mp3', url: './assets/music/test-spooke-2.mp3' },
  { title: 'Vent dans les néons', file: 'Vent-dans-les-neons.mp3', url: './assets/music/wind.mp3' },
];

let tools = [];
let activeCategory = 'Tout';
let searchTerm = '';
let favoritesOnly = false;
let transformFrame = 0;
let currentTrack = 0;
let dragStart = null;
let suppressCardClickUntil = 0;
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
  const titleText = safeText(tool.title, 'Sans titre');
  const card = document.createElement('article');
  card.className = 'tool-card';
  card.tabIndex = 0;
  card.setAttribute('role', 'link');
  card.setAttribute('aria-label', `Lancer ${titleText}`);
  card.style.setProperty('--card-color', safeText(tool.color, colors[index % colors.length]));

  const titlebar = document.createElement('div');
  titlebar.className = 'card-titlebar';
  const miniIcon = document.createElement('span');
  miniIcon.className = 'mini-icon';
  miniIcon.textContent = safeText(tool.emoji, '✦');
  miniIcon.setAttribute('aria-hidden', 'true');
  const windowName = document.createElement('span');
  windowName.className = 'window-name';
  windowName.textContent = titleText;
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
  title.textContent = titleText;
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

  // The whole program window opens on click; the star and explicit Launch button keep their own actions.
  card.addEventListener('click', event => {
    if (performance.now() < suppressCardClickUntil) { event.preventDefault(); return; }
    if (event.target.closest('button, a')) return;
    window.location.assign(link.href);
  });
  card.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      window.location.assign(link.href);
    }
  });
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

// Wheel and pointer gestures scroll the cover-flow rail without stealing card clicks.
rail.addEventListener('wheel', event => {
  if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
    event.preventDefault();
    rail.scrollLeft += event.deltaY;
  }
}, { passive: false });
rail.addEventListener('pointerdown', event => {
  if (event.pointerType === 'touch' || event.target.closest('a, button')) return;
  dragStart = { x: event.clientX, scroll: rail.scrollLeft, moved: false };
  rail.classList.add('dragging');
});
rail.addEventListener('pointermove', event => {
  if (!dragStart || event.buttons === 0) return;
  const delta = event.clientX - dragStart.x;
  if (Math.abs(delta) > 5) dragStart.moved = true;
  if (dragStart.moved) {
    event.preventDefault();
    rail.scrollLeft = dragStart.scroll - delta;
  }
});
function endDrag() {
  if (dragStart?.moved) suppressCardClickUntil = performance.now() + 300;
  dragStart = null;
  rail.classList.remove('dragging');
}
document.addEventListener('pointerup', endDrag);
document.addEventListener('pointercancel', endDrag);

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

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
}

function renderPlaylist() {
  const playlist = document.querySelector('#playlist');
  playlist.replaceChildren();
  tracks.forEach((track, index) => {
    const row = document.createElement('li');
    row.className = `playlist-row${index === currentTrack ? ' active' : ''}`;
    const select = document.createElement('button');
    select.type = 'button';
    select.className = 'track-select';
    select.setAttribute('aria-label', `Lire ${track.title}`);
    const number = document.createElement('span');
    number.className = 'track-index';
    number.textContent = `${String(index + 1).padStart(2, '0')}.`;
    const title = document.createElement('span');
    title.textContent = `${index === currentTrack ? '♫ ' : ''}${track.title}`;
    select.append(number, title);
    select.addEventListener('click', () => selectTrack(index, true));
    const download = document.createElement('a');
    download.className = 'track-download';
    download.href = track.url;
    download.download = track.file;
    download.textContent = '⬇';
    download.setAttribute('aria-label', `Télécharger ${track.title}`);
    row.append(select, download);
    playlist.append(row);
  });
}

function updateTrackDisplay() {
  const track = tracks[currentTrack];
  document.querySelector('#now-playing').textContent = track.title;
  const download = document.querySelector('#download-current');
  download.href = track.url;
  download.download = track.file;
  download.setAttribute('aria-label', `Télécharger ${track.title}`);
  document.querySelectorAll('.playlist-row').forEach((row, index) => {
    row.classList.toggle('active', index === currentTrack);
    const title = row.querySelector('.track-select span:last-child');
    if (title) title.textContent = `${index === currentTrack ? '♫ ' : ''}${tracks[index].title}`;
  });
}

function selectTrack(index, autoplay = false) {
  currentTrack = (index + tracks.length) % tracks.length;
  musicAudio.src = tracks[currentTrack].url;
  musicAudio.load();
  updateTrackDisplay();
  document.querySelector('#audio-current').textContent = '00:00';
  document.querySelector('#audio-duration').textContent = '00:00';
  document.querySelector('#audio-seek').value = '0';
  musicStatus.textContent = autoplay ? `Lecture : ${tracks[currentTrack].title}` : `Prêt : ${tracks[currentTrack].title}`;
  if (autoplay) musicAudio.play().catch(() => { musicStatus.textContent = 'Appuie sur Lecture pour démarrer'; });
}

function openMusicPlayer() {
  closeStartMenu();
  musicWindow.hidden = false;
  document.querySelector('#open-sound').setAttribute('aria-expanded', 'true');
  document.querySelector('#task-sound').setAttribute('aria-expanded', 'true');
}
function closeMusicPlayer() {
  // Hiding the player does not stop playback; use Stop or Pause explicitly.
  musicWindow.hidden = true;
  document.querySelector('#open-sound').setAttribute('aria-expanded', 'false');
  document.querySelector('#task-sound').setAttribute('aria-expanded', 'false');
}
const playerTitlebar = musicWindow.querySelector('.music-titlebar');
let playerDrag = null;
playerTitlebar.addEventListener('pointerdown', event => {
  if (event.target.closest('button') || event.button !== 0) return;
  const bounds = musicWindow.getBoundingClientRect();
  musicWindow.style.left = `${bounds.left}px`;
  musicWindow.style.top = `${bounds.top}px`;
  musicWindow.style.transform = 'none';
  playerDrag = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
  playerTitlebar.classList.add('is-dragging');
  playerTitlebar.setPointerCapture(event.pointerId);
  event.preventDefault();
});
playerTitlebar.addEventListener('pointermove', event => {
  if (!playerDrag) return;
  const left = Math.max(80 - musicWindow.offsetWidth, Math.min(window.innerWidth - 80, event.clientX - playerDrag.x));
  const top = Math.max(0, Math.min(window.innerHeight - 55, event.clientY - playerDrag.y));
  musicWindow.style.left = `${left}px`;
  musicWindow.style.top = `${top}px`;
});
function stopMovingPlayer() {
  playerDrag = null;
  playerTitlebar.classList.remove('is-dragging');
}
playerTitlebar.addEventListener('pointerup', stopMovingPlayer);
playerTitlebar.addEventListener('pointercancel', stopMovingPlayer);
document.querySelector('#open-sound').addEventListener('click', openMusicPlayer);
document.querySelector('#task-sound').addEventListener('click', openMusicPlayer);
document.querySelector('#close-sound').addEventListener('click', closeMusicPlayer);
document.querySelector('#play-track').addEventListener('click', () => {
  if (musicAudio.paused) musicAudio.play().catch(() => { musicStatus.textContent = 'Lecture impossible pour ce fichier'; });
  else musicAudio.pause();
});
document.querySelector('#stop-track').addEventListener('click', () => {
  musicAudio.pause();
  musicAudio.currentTime = 0;
  musicStatus.textContent = 'Arrêté';
});
document.querySelector('#previous-track').addEventListener('click', () => selectTrack(currentTrack - 1, true));
document.querySelector('#next-track').addEventListener('click', () => selectTrack(currentTrack + 1, true));
document.querySelector('#audio-seek').addEventListener('input', event => {
  if (Number.isFinite(musicAudio.duration)) musicAudio.currentTime = (Number(event.target.value) / 1000) * musicAudio.duration;
});
document.querySelector('#audio-volume').addEventListener('input', event => { musicAudio.volume = Number(event.target.value); });
musicAudio.volume = 0.8;
musicAudio.addEventListener('loadedmetadata', () => {
  document.querySelector('#audio-duration').textContent = formatTime(musicAudio.duration);
});
musicAudio.addEventListener('timeupdate', () => {
  document.querySelector('#audio-current').textContent = formatTime(musicAudio.currentTime);
  document.querySelector('#audio-duration').textContent = formatTime(musicAudio.duration);
  if (Number.isFinite(musicAudio.duration) && musicAudio.duration > 0) {
    document.querySelector('#audio-seek').value = String((musicAudio.currentTime / musicAudio.duration) * 1000);
  }
});
musicAudio.addEventListener('play', () => {
  playButton.textContent = '❚❚';
  playButton.setAttribute('aria-label', 'Mettre en pause');
  document.querySelector('.equalizer').classList.add('is-playing');
  document.querySelector('#task-sound').classList.add('is-playing');
  document.querySelector('#task-sound').setAttribute('aria-label', `Ouvrir le lecteur MP3 — lecture : ${tracks[currentTrack].title}`);
  musicStatus.textContent = `Lecture : ${tracks[currentTrack].title}`;
});
musicAudio.addEventListener('pause', () => {
  playButton.textContent = '▶';
  playButton.setAttribute('aria-label', 'Lire');
  document.querySelector('.equalizer').classList.remove('is-playing');
  document.querySelector('#task-sound').classList.remove('is-playing');
  document.querySelector('#task-sound').setAttribute('aria-label', 'Ouvrir le lecteur MP3');
});
musicAudio.addEventListener('ended', () => selectTrack(currentTrack + 1, true));
renderPlaylist();
selectTrack(0, false);

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
    if (!musicWindow.hidden) closeMusicPlayer();
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
