/* =========================================================================
 *  Project Estimation — LOGIQUE DU MODULE
 * -------------------------------------------------------------------------
 *  SPA à 2 vues, routées par le hash de l'URL :
 *    #/            -> liste des projets + création
 *    #/p/<id>      -> détail d'un projet (grille d'estimation)
 *
 *  Toute la persistance passe par ProjectRepository (async) : aucune donnée
 *  n'est manipulée directement ici, ce qui prépare la migration vers une BDD.
 * ========================================================================= */

import { renderHeader, renderFooter } from '../../shared/js/layout.js';
import { fmtEUR, fmtKg, fmtNum } from '../../shared/js/format.js';
import { ProjectRepository } from '../../shared/js/projects-repo.js';
import { renderProjectList } from './views/list.js';
import { renderProjectDetail } from './views/detail.js';

/* Conteneur unique où les vues sont rendues. */
const viewEl = () => document.getElementById('view');

/* -----------------------------------------------------------------------
 *  Routeur minimal basé sur le hash.
 * --------------------------------------------------------------------- */
async function router() {
  const host = viewEl();
  if (!host) return;

  const hash = window.location.hash || '#/';
  const match = hash.match(/^#\/p\/(.+)$/); // détail projet ?

  try {
    if (match) {
      await renderProjectDetail(host, match[1]);
    } else {
      await renderProjectList(host);
    }
  } catch (err) {
    console.error(err);
    host.innerHTML = `
      <div class="rounded-lg border border-red-300 bg-red-50 text-red-800 px-4 py-3 text-sm">
        Une erreur est survenue : ${err.message || err}
      </div>`;
  }
}

/* -----------------------------------------------------------------------
 *  Initialisation.
 * --------------------------------------------------------------------- */
function init() {
  renderHeader();
  renderFooter();
  window.addEventListener('hashchange', router);
  router();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
