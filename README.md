# Art Helper — la boîte à outils créative

Une petite page d'accueil dessinée à la main pour réunir les logiciels HTML du projet. Elle fonctionne sans installation ni dépendance : HTML, CSS et JavaScript natifs, prête pour GitHub Pages.

## Ajouter un logiciel

1. Place le fichier (ou le dossier) de ton logiciel dans `apps/`. Par exemple : `apps/palette/index.html`.
2. Ajoute une entrée dans `apps.json` :

```json
[
  {
    "id": "palette-magique",
    "title": "Palette magique",
    "description": "Crée une palette de couleurs pour ton prochain dessin.",
    "category": "Couleurs",
    "emoji": "🎨",
    "url": "./apps/palette/index.html",
    "type": "HTML"
  }
]
```

Les chemins peuvent aussi pointer vers une autre page du dépôt (`./mon-outil.html`) ou vers un site externe en HTTPS. Tu peux ajouter `color` (couleur pastel CSS) et `tags` (mots-clés, sous forme de texte) en option. Les champs `id`, `title` et `url` doivent être uniques/adaptés à chaque outil. Les pages externes qui interdisent l'intégration restent ouvrables dans un nouvel onglet.

3. Enregistre tes changements et publie le dépôt. Dans GitHub, ouvre **Settings → Pages**, choisis la branche du dépôt et le dossier `/ (root)`. La page sera ensuite servie par GitHub Pages.

## En local

Ouvre `index.html` depuis un petit serveur statique (la page charge `apps.json` avec `fetch`, qui ne fonctionne pas toujours depuis une URL `file://`). Par exemple, avec Python :

```bash
python3 -m http.server 8000
```

Puis ouvre `http://localhost:8000`.
