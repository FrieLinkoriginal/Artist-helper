# Art Helper — Bureau 95

Un bureau créatif inspiré de Windows 95, avec une roue de logiciels en perspective 3D. Les visiteurs ouvrent les programmes préinstallés depuis le carrousel ou le menu Démarrer : il n'y a pas de fonction pour ajouter, téléverser ou configurer ses propres sites.

## Logiciels intégrés

- ASCII Glyph
- Atelier 95
- Type Garden — Herbier
- WigglyPaint
- Pixel Converter
- Stochaster
- Tellybox
- Paper Free
- Orbit — Studio de texte 3D (depuis Google Drive)

Chaque programme est embarqué comme page HTML dans `apps/`. La fenêtre entière d'un programme, ainsi que son bouton « Lancer », l'ouvre. Un lecteur MP3 rétro est aussi accessible depuis le menu « Sons » et la barre des tâches. Il lit et permet de télécharger les 18 morceaux copiés du dossier Google Drive « Dossier sans titre » ; leurs titres dans le lecteur sont des noms fantaisie.

Certains logiciels peuvent charger des polices ou bibliothèques depuis Internet. Les fichiers importés depuis Drive sont des copies : leurs changements ne se synchronisent pas automatiquement.

## Publier avec GitHub Pages

Dans **Settings → Pages**, choisis la branche de publication et le dossier `/ (root)`. Le dépôt est déjà configuré pour GitHub Pages.

Pour tester localement :

```bash
python3 -m http.server 8000
```

Puis ouvre `http://localhost:8000`.
