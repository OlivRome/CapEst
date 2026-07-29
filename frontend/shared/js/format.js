/* =========================================================================
 *  CAPEX Suite — FORMATEURS D'AFFICHAGE PARTAGÉS
 * -------------------------------------------------------------------------
 *  Formateurs de nombres réutilisables par tous les modules (locale fr-FR).
 *  Centralisés ici pour garantir une présentation homogène des montants,
 *  poids et facteurs dans toute la suite d'outils.
 * ========================================================================= */

/* Montant en euros, sans décimales (ex. « 62 104 € »). */
export const fmtEUR = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0
});

/* Nombre entier (ex. poids en kg). */
export const fmtKg = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 });

/* Nombre avec jusqu'à 2 décimales (facteurs, volumes…). */
export const fmtNum = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 });
