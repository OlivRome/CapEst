/* =========================================================================
 *  CAPEX Suite — DÉPÔT DES PROJETS (ProjectRepository)
 * -------------------------------------------------------------------------
 *  >>> COUCHE DE PERSISTANCE — POINT UNIQUE DE MIGRATION VERS UNE BDD <<<
 *
 *  Toute l'application accède aux projets UNIQUEMENT via cet objet.
 *  Aujourd'hui les données sont stockées dans le localStorage du navigateur ;
 *  demain, il suffira de remplacer le CORPS de chaque méthode par un appel
 *  réseau (fetch vers une API REST) — sans toucher au reste du code.
 *
 *  Toutes les méthodes sont ASYNCHRONES (renvoient des Promesses), exactement
 *  comme le seront les futurs appels HTTP. L'interface est donc déjà écrite
 *  « comme si » les données venaient du réseau.
 *
 *  CONTRAT DE DONNÉES (identique au futur schéma d'API / de base) :
 *
 *    Project = {
 *      id: string,              // identifiant unique
 *      name: string,            // nom du projet
 *      client: string,          // client
 *      country: string,         // pays
 *      estimationDate: string,  // date d'estimation (AAAA-MM-JJ)
 *      createdAt: string,       // horodatage ISO de création
 *      updatedAt: string,       // horodatage ISO de dernière modification
 *      items: EstimationItem[]  // équipements ajoutés au projet
 *    }
 *
 *    EstimationItem = {
 *      id: string,
 *      equipmentId: string,     // ex. 'ut_pump'
 *      equipmentLabel: string,  // libellé lisible
 *      category: string,        // code catégorie de la grille (ex. '09' Pumps)
 *      quantity: number,        // nombre d'unités
 *      characteristic: string,  // grandeur caractéristique (ex. '4.09 kW')
 *      unitCost: number,        // coût unitaire nominal (€ HT)
 *      unitWeightKg: number,    // poids unitaire nominal (kg)
 *      params: object,          // paramètres de calcul (traçabilité)
 *      addedAt: string          // horodatage ISO d'ajout
 *    }
 * ========================================================================= */

/* Clé de stockage localStorage (versionnée pour faciliter d'éventuelles migrations). */
const STORAGE_KEY = 'capex_suite.projects.v1';

/* Simule la latence asynchrone d'un appel réseau (permet à l'UI d'être
   déjà écrite en async). Valeur nulle en pratique. */
const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

/* Génère un identifiant unique (compatible navigateur ; fallback si besoin). */
function newId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

/* --- Lecture/écriture bas niveau du localStorage (privées au module) --- */
function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Lecture des projets impossible :', err);
    return [];
  }
}

function writeAll(projects) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

/* =========================================================================
 *  API PUBLIQUE — ProjectRepository
 *  C'est le SEUL objet que le reste de l'application doit utiliser.
 * ========================================================================= */
export const ProjectRepository = {
  /* Liste tous les projets (les plus récents d'abord). */
  async list() {
    await tick();
    return readAll().sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
    /* Futur back-end : return (await fetch('/api/projects')).json(); */
  },

  /* Récupère un projet par son id (ou null). */
  async get(id) {
    await tick();
    return readAll().find((p) => p.id === id) || null;
    /* Futur back-end : return (await fetch(`/api/projects/${id}`)).json(); */
  },

  /* Crée un projet. `data` = { name, client, country, estimationDate }. */
  async create(data) {
    await tick();
    const now = new Date().toISOString();
    const project = {
      id: newId(),
      name: (data.name || '').trim(),
      client: (data.client || '').trim(),
      country: data.country || '',
      estimationDate: data.estimationDate || now.slice(0, 10),
      createdAt: now,
      updatedAt: now,
      items: []
    };
    const projects = readAll();
    projects.push(project);
    writeAll(projects);
    return project;
    /* Futur back-end : POST /api/projects */
  },

  /* Met à jour les métadonnées d'un projet. */
  async update(id, patch) {
    await tick();
    const projects = readAll();
    const idx = projects.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Projet introuvable');
    projects[idx] = { ...projects[idx], ...patch, updatedAt: new Date().toISOString() };
    writeAll(projects);
    return projects[idx];
    /* Futur back-end : PUT /api/projects/:id */
  },

  /* Supprime un projet. */
  async remove(id) {
    await tick();
    writeAll(readAll().filter((p) => p.id !== id));
    /* Futur back-end : DELETE /api/projects/:id */
  },

  /* Ajoute un équipement estimé à un projet. `item` = EstimationItem (partiel). */
  async addItem(projectId, item) {
    await tick();
    const projects = readAll();
    const idx = projects.findIndex((p) => p.id === projectId);
    if (idx === -1) throw new Error('Projet introuvable');
    const fullItem = { id: newId(), addedAt: new Date().toISOString(), ...item };
    projects[idx].items.push(fullItem);
    projects[idx].updatedAt = new Date().toISOString();
    writeAll(projects);
    return fullItem;
    /* Futur back-end : POST /api/projects/:id/items */
  },

  /* Supprime une ligne d'équipement d'un projet. */
  async removeItem(projectId, itemId) {
    await tick();
    const projects = readAll();
    const idx = projects.findIndex((p) => p.id === projectId);
    if (idx === -1) throw new Error('Projet introuvable');
    projects[idx].items = projects[idx].items.filter((it) => it.id !== itemId);
    projects[idx].updatedAt = new Date().toISOString();
    writeAll(projects);
    /* Futur back-end : DELETE /api/projects/:id/items/:itemId */
  }
};
