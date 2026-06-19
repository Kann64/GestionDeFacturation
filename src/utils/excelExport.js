import * as XLSX from 'xlsx'
import { formatDate } from './format'
import { STATUT_LABELS } from './constants'

export function exporterFacturesExcel(factures, clients = {}, nomFichier = 'factures') {
  const rows = factures.map((f) => ({
    Numéro: f.numero || '',
    Client: clients[f.client_id]?.nom || '—',
    Date: formatDate(f.date_creation),
    'Total HT': Number(f.total_ht) || 0,
    'Remise': Number(f.total_remise) || 0,
    TVA: Number(f.tva) || 0,
    'Total TTC': Number(f.total_ttc) || 0,
    Devise: f.devise || 'MAD',
    Statut: STATUT_LABELS[f.statut] || f.statut || '',
  }))

  const ws = XLSX.utils.json_to_sheet(rows)

  ws['!cols'] = [
    { wch: 18 },
    { wch: 25 },
    { wch: 12 },
    { wch: 12 },
    { wch: 10 },
    { wch: 10 },
    { wch: 12 },
    { wch: 8 },
    { wch: 12 },
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Factures')
  XLSX.writeFile(wb, `${nomFichier}_${new Date().toISOString().slice(0, 10)}.xlsx`)
}
