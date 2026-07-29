# CAPEX Suite

Suite d'outils web d'ingénierie CAPEX pour les secteurs Life Sciences et
Oil & Gas : estimation d'équipements, structures de projet, estimation de
projet et contrôle des coûts.

## Structure du dépôt

```
CapEst/
├── frontend/                     Application web (client, exécutée dans le navigateur)
│   ├── index.html                Portail : cartes vers chaque module
│   ├── home.js                   Logique de la page d'accueil
│   ├── shared/                   Code commun à tous les modules
│   │   ├── config/               Configuration Tailwind (thème corporate)
│   │   ├── css/                  Styles partagés (base.css)
│   │   └── js/                   Layout, formateurs, registre des modules…
│   └── modules/                  Un dossier par module fonctionnel
│       ├── equipment-estimation/ Estimation coût & poids d'un équipement (opérationnel)
│       ├── project-breakdown/    PBS / WBS / CBS / OBS (à venir)
│       ├── project-estimation/   Estimation du coût total projet (à venir)
│       └── cost-control/         Cost Book & rapports (à venir)
│
├── backend/                      API + accès base de données (à venir — voir backend/README.md)
├── docs/                         Documentation d'architecture
└── .ona/ .devcontainer/          Outillage d'environnement Ona (non requis pour le site)
```

## Lancer en local

L'application utilise des modules ES : elle doit être servie par un serveur HTTP
(l'ouverture directe en `file://` ne fonctionne pas).

```bash
python3 -m http.server 8080 --directory frontend
# puis ouvrir http://localhost:8080
```

Dans Ona, le service `preview` (voir `.ona/automations.yaml`) le fait automatiquement.

## Architecture

Voir [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) pour le détail de l'organisation
et de la stratégie de migration vers un back-end.

## Versions

| Tag  | Contenu |
|------|---------|
| v1   | Modèle Cuves (PoC) |
| v2   | Modèle Pompes + schémas d'équipement |
| v3   | Architecture modulaire (préparation back-end) |
| v3.1 | Portail multi-modules + structure frontend/backend |
