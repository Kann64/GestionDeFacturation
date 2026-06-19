import { STATUTS } from './constants'
import { moisLabel } from './format'

export function computeKpis(factures = []) {
  const total = factures.length
  const payees = factures.filter((f) => f.statut === STATUTS.PAYEE)
  const enAttente = factures.filter((f) => f.statut === STATUTS.EN_ATTENTE).length
  const rejetees = factures.filter((f) => f.statut === STATUTS.REJETEE).length
  const encaisse = payees.reduce((s, f) => s + (Number(f.total_ttc) || 0), 0)
  const totalTTC = factures.reduce((s, f) => s + (Number(f.total_ttc) || 0), 0)
  const moyenne = total ? totalTTC / total : 0
  return { total, encaisse, enAttente, rejetees, moyenne, payees: payees.length }
}

// CA mensuel (TTC encaissé) sur l'année en cours
export function caMensuel(factures = []) {
  const year = new Date().getFullYear()
  const base = Array.from({ length: 12 }, (_, i) => ({ mois: moisLabel(i), ca: 0, count: 0 }))
  factures.forEach((f) => {
    const d = new Date(f.date_creation)
    if (Number.isNaN(d.getTime()) || d.getFullYear() !== year) return
    const i = d.getMonth()
    base[i].count += 1
    if (f.statut === STATUTS.PAYEE) base[i].ca += Number(f.total_ttc) || 0
  })
  return base
}

export function repartitionStatuts(factures = []) {
  const k = computeKpis(factures)
  return [
    { name: 'Payées', value: k.payees, key: STATUTS.PAYEE },
    { name: 'En attente', value: k.enAttente, key: STATUTS.EN_ATTENTE },
    { name: 'Rejetées', value: k.rejetees, key: STATUTS.REJETEE },
  ]
}
