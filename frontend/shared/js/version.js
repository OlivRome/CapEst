/* =========================================================================
 *  CAPEX Suite — VERSION DE L'APPLICATION
 * -------------------------------------------------------------------------
 *  Source unique de vérité pour le numéro de version.
 *  Utilisée :
 *    - pour l'affichage (badge à côté du titre « CAPEX Suite »),
 *    - comme « cache-buster » : la même valeur est ajoutée en query string
 *      (?v=...) aux scripts/imports dans les pages HTML, ce qui force le
 *      navigateur à recharger les fichiers à chaque nouvelle version.
 *
 *  >>> À CHAQUE NOUVELLE VERSION : incrémenter APP_VERSION ici ET mettre à
 *      jour le paramètre ?v=... dans les balises <script> des pages HTML. <<<
 * ========================================================================= */

export const APP_VERSION = '3.3';
