# Backend — CAPEX Suite (à venir)

Ce dossier accueillera l'API et l'accès à la base de données. Il est vide pour
l'instant : le projet fonctionne aujourd'hui en frontend seul.

## Rôle prévu

- Exposer une API HTTP (un endpoint par module), par ex. :
  - `POST /api/equipment/estimate` — calcul d'estimation d'équipement
  - `GET  /api/reference/materials` — données de référence (matériaux, pays…)
- Héberger le **modèle mathématique** (formules + coefficients), aujourd'hui
  dans `frontend/modules/equipment-estimation/model.js`. Une fois déplacé ici,
  il devient **invisible** pour l'utilisateur.
- Lire/écrire dans une **base de données** (données de référence, projets,
  cost books…).

## Migration depuis le frontend

Le frontend appelle déjà le calcul via une fonction asynchrone au contrat
JSON stable (`estimate({ equipmentId, params })`). La bascule consistera à :

1. Copier les fonctions pures de `model.js` (`computeTank`, `computePump`,
   `MODEL_PARAMS`, validation) côté serveur.
2. Exposer `POST /api/equipment/estimate` renvoyant le même objet `result`.
3. Remplacer le corps de `estimate()` côté frontend par un `fetch(...)`.

Aucune modification de l'interface (`app.js`) ne sera nécessaire.

## Choix techniques (à décider)

- **Runtime** : Node.js (permettrait de partager le code du modèle avec le
  frontend) ou Python/FastAPI.
- **Base de données** : PostgreSQL recommandé pour les données relationnelles
  (projets, structures, cost objects).

Voir [../docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md).
