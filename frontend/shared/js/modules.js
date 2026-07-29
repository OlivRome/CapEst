/* =========================================================================
 *  CAPEX Suite — REGISTRE DES MODULES
 * -------------------------------------------------------------------------
 *  Source unique de vérité décrivant les modules de l'application.
 *  Utilisé par :
 *    - la page d'accueil (frontend/index.html) pour générer les cartes,
 *    - le layout partagé (layout.js) pour la barre de navigation.
 *
 *  Ajouter un module = ajouter une entrée ici. Rien d'autre à modifier
 *  pour qu'il apparaisse dans le portail et la navigation.
 *
 *  Champs :
 *    id       : identifiant technique (unique)
 *    title    : nom affiché
 *    tagline  : description courte
 *    path     : chemin relatif vers l'index du module (depuis frontend/)
 *    status   : 'available' | 'planned'  (planned = « bientôt disponible »)
 *    accent   : classe de couleur Tailwind pour l'accent visuel
 *    icon     : markup SVG (chemin interne) de l'icône
 * ========================================================================= */

export const MODULES = [
  {
    id: 'project-breakdown',
    title: 'Project Breakdown Structures',
    tagline:
      'Construire les structures du projet CAPEX : PBS, WBS, CBS, OBS, Cost Objects…',
    path: 'modules/project-breakdown/index.html',
    status: 'planned',
    accent: 'brand',
    icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />'
  },
  {
    id: 'equipment-estimation',
    title: 'Equipment Estimation',
    tagline:
      "Estimer le coût et le poids d'un équipement industriel (Classe 5, ±30 % / ±20 %).",
    path: 'modules/equipment-estimation/index.html',
    status: 'available',
    accent: 'accent',
    icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 15.75V18m3-3.75V18m3-6v6M4.5 19.5h15a.75.75 0 00.75-.75V5.25a.75.75 0 00-.75-.75h-15a.75.75 0 00-.75.75v13.5c0 .414.336.75.75.75zM8.25 8.25h7.5M8.25 12h4.5" />'
  },
  {
    id: 'project-estimation',
    title: 'Project Estimation',
    tagline:
      "Estimer le coût total d'un projet CAPEX en agrégeant équipements et lots.",
    path: 'modules/project-estimation/index.html',
    status: 'available',
    accent: 'accent',
    icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18 9 11.25l4.306 4.307a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />'
  },
  {
    id: 'cost-control',
    title: 'Cost Control',
    tagline:
      'Piloter le Cost Control via un « Cost Book » et produire les rapports associés.',
    path: 'modules/cost-control/index.html',
    status: 'planned',
    accent: 'brand',
    icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" />'
  }
];

/* Recherche d'un module par son id (ex. pour marquer l'onglet actif). */
export const findModule = (id) => MODULES.find((m) => m.id === id) || null;
