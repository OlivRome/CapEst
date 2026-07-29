# Architecture — CAPEX Suite

## Vue d'ensemble

Monorepo séparant le client (`frontend/`) du futur serveur (`backend/`).
Les deux couches communiquent uniquement via une API HTTP. Cette séparation
permet d'ajouter un back-end et une base de données sans réécrire le client.

```
Navigateur (frontend/)  ──HTTP/JSON──►  Serveur (backend/)  ──►  Base de données
```

## Frontend

Application web en HTML5 + JavaScript vanilla (modules ES) + Tailwind CSS (CDN).
Aucune étape de build : les fichiers sont servis tels quels.

### Organisation par module

Chaque outil vit dans `frontend/modules/<module>/` et est autonome (son propre
`index.html` et sa logique). Un module opérationnel (`equipment-estimation`)
sert de patron aux modules à venir.

### Code partagé (`frontend/shared/`)

| Fichier | Rôle |
|---|---|
| `config/tailwind-config.js` | Thème corporate (palette brand/accent, police) |
| `css/base.css` | Styles communs (animations, spinner, formulaires) |
| `js/modules.js` | Registre des modules — source unique pour le portail et la nav |
| `js/layout.js` | En-tête + navigation + pied de page communs |
| `js/format.js` | Formateurs fr-FR (€, kg, nombres) |
| `js/placeholder.js` | Page « module à venir » réutilisable |

Ajouter un module = créer `modules/<module>/` + une entrée dans `js/modules.js`.
Il apparaît alors automatiquement dans le portail et la navigation.

## Frontière avec le back-end

Le calcul métier est déjà isolé derrière une fonction asynchrone au contrat
JSON stable (voir `modules/equipment-estimation/model.js`) :

```js
const result = await estimate({ equipmentId, params });
```

Aujourd'hui `estimate()` calcule en local. Pour brancher le back-end, on
remplace uniquement son corps par un `fetch('/api/estimate', …)` : le reste
de l'interface reste inchangé, et les formules migrent côté serveur (donc
invisibles pour l'utilisateur).

## Back-end (à venir)

Voir [../backend/README.md](../backend/README.md). Principe : un endpoint par
module, la base de données remplaçant les données de référence actuellement
codées dans les fichiers `model.js`.

## Base de données (à venir)

Les données de référence aujourd'hui en dur (catalogue d'équipements,
matériaux, pays, coefficients de coût…) ont vocation à être stockées en base
et lues par le back-end. Le contrat d'échange avec le frontend ne changera pas.
