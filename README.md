# Art Helper — la boîte à outils créative

Une page d'accueil dessinée à la main pour réunir tes logiciels HTML. Les huit outils du dossier Google Drive **Art helper** sont maintenant copiés dans `apps/` et accessibles depuis le carrousel. Le site et les outils sont des fichiers statiques : pas d'installation, de compte ou de contenu à ajouter pour les visiteurs.

## Outils inclus

- ASCII Glyph
- Atelier 95
- Type Garden — Herbier
- WigglyPaint
- Pixel Converter
- Stochaster
- Tellybox
- Paper Free

Les fichiers sont servis par le site lui-même, plutôt que renvoyés vers les aperçus Google Drive, qui ne lanceraient pas les applications HTML comme des pages web. Les fichiers copiés sont des instantanés : une modification ultérieure dans Drive ne met pas automatiquement à jour la copie ici.

## Ajouter ou mettre à jour un outil

Place la page HTML dans un dossier sous `apps/` (par exemple `apps/mon-outil/index.html`), puis ajoute une entrée dans `apps.json` :

```json
{
  "id": "mon-outil",
  "title": "Mon outil",
  "description": "Une courte description.",
  "category": "Création",
  "emoji": "🎨",
  "url": "./apps/mon-outil/index.html",
  "type": "HTML",
  "color": "#f4d875"
}
```

## Publication pour les visiteurs

Après la fusion de la pull request, active **Settings → Pages** dans GitHub, en choisissant la branche `main` et le dossier `/ (root)`. GitHub Pages donnera une adresse publique à partager. Les visiteurs n'auront rien à téléverser ou configurer.

Pour tester localement, lance un serveur statique à la racine du dépôt :

```bash
python3 -m http.server 8000
```

Puis ouvre `http://localhost:8000`.
