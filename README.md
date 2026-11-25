# Art Helper — Bureau 95

Un bureau créatif inspiré de Windows 95, avec une roue de logiciels

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
- PUPPET.studio
- Flora — laboratoire de couleurs
- ROTO.studio

Chaque programme est embarqué comme page HTML dans `apps/`. La fenêtre entière d'un programme, ainsi que son bouton « Lancer », l'ouvre. Un lecteur MP3 rétro est aussi accessible depuis le menu « Sons » et la barre des tâches. Il lit et permet de télécharger les 18 morceaux copiés du dossier Google Drive « Dossier sans titre » ; leurs titres dans le lecteur sont des noms fantaisie. La fenêtre du lecteur se déplace en faisant glisser sa barre de titre, et fermer la fenêtre ne coupe pas la musique : utilise Pause ou Stop pour l'arrêter.

Le compteur en haut à droite affiche les navigateurs uniques du jour (UTC), partagé entre tous les visiteurs via Supabase. Il conserve un identifiant aléatoire uniquement pour la journée en cours.

ROTO.studio peut réduire la fréquence d'extraction d'une vidéo (par exemple de 60 à 24 images par seconde). Les exports animés des logiciels vidéo proposent une durée maximale; ils conservent la cadence choisie et s'arrêtent à la fin de la source sans la répéter. WigglyPaint permet aussi de régler la durée et la cadence de son GIF. Certains logiciels chargent des polices ou bibliothèques depuis Internet. Les fichiers importés depuis Drive sont des copies : leurs changements ne se synchronisent pas automatiquement.

## Publier avec GitHub Pages

Dans **Settings → Pages**, choisis la branche de publication et le dossier `/ (root)`. Le dépôt est déjà configuré pour GitHub Pages.

Pour tester localement :

```bash
python3 -m http.server 8000
```

Puis ouvre `http://localhost:8000`.
