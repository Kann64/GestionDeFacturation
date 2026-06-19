import { METHODES, TVA_DEFAUT, TVA_PAR_CATEGORIE } from './constants'

const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100

/**
 * Calcule les totaux d'une facture selon la méthode choisie.
 *
 * @param {Array} lignes  - [{ designation, categorie, qte, prix_unitaire, remise, tva }]
 * @param {string} methode - une des valeurs de METHODES
 * @param {Object} options - { tvaGlobale, remiseGlobale, tvaParCategorie }
 * @returns {{ lignes, totalHT, totalRemise, totalTVA, totalTTC, methode }}
 */
export function calculerFacture(lignes = [], methode = METHODES.SIMPLE, options = {}) {
  const tvaGlobale = options.tvaGlobale ?? TVA_DEFAUT
  const remiseGlobalePct = options.remiseGlobale ?? 0
  const tvaCats = options.tvaParCategorie ?? TVA_PAR_CATEGORIE

  // Détail par ligne : structure homogène quelle que soit la méthode.
  const detail = lignes.map((l) => {
    const qte = Number(l.qte) || 0
    const pu = Number(l.prix_unitaire) || 0
    const sousTotal = round2(qte * pu)

    let remiseMontant = 0
    if (methode === METHODES.REMISE_LIGNE) {
      remiseMontant = round2(sousTotal * ((Number(l.remise) || 0) / 100))
    }

    const ht = round2(sousTotal - remiseMontant)

    // Taux de TVA appliqué à la ligne
    let tauxTVA = tvaGlobale
    if (methode === METHODES.PAR_CATEGORIE) {
      tauxTVA = l.tva != null ? Number(l.tva) : (tvaCats[l.categorie] ?? 0)
    }
    const tvaMontant = round2(ht * (tauxTVA / 100))

    return {
      ...l,
      qte,
      prix_unitaire: pu,
      sousTotal,
      remiseMontant,
      ht,
      tauxTVA,
      tvaMontant,
      totalLigne: round2(ht + tvaMontant),
    }
  })

  const sommeHT = round2(detail.reduce((s, l) => s + l.ht, 0))

  let totalHT = sommeHT
  let totalRemise = round2(detail.reduce((s, l) => s + l.remiseMontant, 0))
  let totalTVA = 0
  let totalTTC = 0

  switch (methode) {
    case METHODES.SIMPLE:
    case METHODES.REMISE_LIGNE: {
      totalTVA = round2(totalHT * (tvaGlobale / 100))
      totalTTC = round2(totalHT + totalTVA)
      break
    }
    case METHODES.REMISE_GLOBALE: {
      const remise = round2(sommeHT * (remiseGlobalePct / 100))
      totalHT = round2(sommeHT - remise)
      totalRemise = remise
      totalTVA = round2(totalHT * (tvaGlobale / 100))
      totalTTC = round2(totalHT + totalTVA)
      break
    }
    case METHODES.PAR_CATEGORIE: {
      totalTVA = round2(detail.reduce((s, l) => s + l.tvaMontant, 0))
      totalTTC = round2(totalHT + totalTVA)
      break
    }
    default: {
      totalTVA = round2(totalHT * (tvaGlobale / 100))
      totalTTC = round2(totalHT + totalTVA)
    }
  }

  return { lignes: detail, totalHT, totalRemise, totalTVA, totalTTC, methode }
}
