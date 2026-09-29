# Atelier Teinte 3D

Configurateur web de teinte de vitres automobiles avec aperçu 3D en direct.

## Fonctionnalités

- Choix du véhicule par **marque** puis **modèle** (Peugeot, Renault, Citroën, Volkswagen, BMW, Mercedes-Benz, Audi, Tesla, Toyota).
- **Visuel 3D** interactif (Three.js) : rotation à la souris ou au doigt, zoom, vues prédéfinies (3/4 arrière, 3/4 avant, profil, arrière), rotation automatique.
- Teinte réglable séparément pour deux zones :
  - **Vitres avant** (portières conducteur et passager) ;
  - **3/4 arrière** (vitres des portières arrière, custodes et lunette arrière).
- Teintes disponibles : **5 %, 15 %, 25 %, 35 %, 50 %** (TLV, taux de transmission lumineuse ; 5 % est le plus foncé), ou verre d'origine.
- Les vitres se teintent en direct sur le modèle 3D, avec une transition progressive.
- Choix de la couleur de carrosserie, récapitulatif de la configuration et rappel de la réglementation française pour les vitres avant (70 % minimum).

## Lancer l'application

Aucune installation n'est nécessaire, mais les modules ES exigent un serveur HTTP :

```bash
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

Three.js est chargé depuis le CDN jsDelivr.

## Structure

| Fichier | Rôle |
| --- | --- |
| `index.html` | Interface |
| `css/style.css` | Styles (thèmes clair et sombre, mobile) |
| `js/data.js` | Catalogue des marques et modèles, teintes, couleurs |
| `js/car.js` | Génération du modèle 3D d'après le type de carrosserie et les dimensions |
| `js/app.js` | Scène 3D, caméra et logique de l'interface |

## Ajouter un véhicule

Dans `js/data.js`, ajoutez une entrée au tableau `models` de la marque :

```js
{ name: 'Nouveau modèle', body: 'suv', L: 4.5, W: 1.85, H: 1.65 }
```

`body` accepte `citadine`, `berline`, `break`, `suv` ou `coupe`. `L`, `W` et `H` sont la longueur, la largeur et la hauteur en mètres.

Le modèle 3D est une silhouette générée et indicative. Pour un rendu fidèle à chaque véhicule, vous pouvez remplacer `buildCar` par le chargement d'un modèle glTF, en nommant les meshes de vitres pour leur appliquer les matériaux teintés.
