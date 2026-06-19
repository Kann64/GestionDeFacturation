// Rôles
export const ROLES = { ADMIN: 'admin', USER: 'user' }

// Statuts de facture
export const STATUTS = {
  EN_ATTENTE: 'en_attente',
  PAYEE: 'payee',
  REJETEE: 'rejetee',
}

export const STATUT_LABELS = {
  [STATUTS.EN_ATTENTE]: 'En attente',
  [STATUTS.PAYEE]: 'Payée',
  [STATUTS.REJETEE]: 'Rejetée',
}

export const STATUT_COLORS = {
  [STATUTS.EN_ATTENTE]: 'warning',
  [STATUTS.PAYEE]: 'success',
  [STATUTS.REJETEE]: 'error',
}

// Types de virement / encaissement
export const TYPES_VIREMENT = ['Virement bancaire', 'Chèque', 'Espèces', 'Carte', 'Effet']

// Les 4 méthodes de facturation sélectionnables dans l'UI
export const METHODES = {
  SIMPLE: 'simple', // HT + TVA 20%
  REMISE_LIGNE: 'remise_ligne', // remise par ligne
  REMISE_GLOBALE: 'remise_globale', // remise globale
  PAR_CATEGORIE: 'par_categorie', // TVA différente selon catégorie
}

export const METHODE_LABELS = {
  [METHODES.SIMPLE]: 'Méthode 1 — Simple (HT + TVA 20%)',
  [METHODES.REMISE_LIGNE]: 'Méthode 2 — Remise par ligne',
  [METHODES.REMISE_GLOBALE]: 'Méthode 3 — Remise globale',
  [METHODES.PAR_CATEGORIE]: 'Méthode 4 — TVA par catégorie',
}

export const TVA_DEFAUT = 20 // %

// Taux de TVA par catégorie pour la méthode 4 (fallback si non défini)
export const TVA_PAR_CATEGORIE = {
  Informatique: 20,
  Services: 10,
  Formation: 0,
}
