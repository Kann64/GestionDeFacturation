import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatNumber, formatDate } from '../utils/format'
import { STATUT_LABELS, METHODE_LABELS } from '../utils/constants'

const INK = [31, 42, 68]
const GOLD = [176, 122, 30]
const GREY = [90, 100, 120]

/**
 * Génère et télécharge le PDF d'une facture.
 * @param {Object} facture - facture complète (avec lignes calculées)
 * @param {Object} client  - client destinataire
 * @param {Object} societe - paramètres entreprise (nom, adresse, ice, ...)
 */
export function genererFacturePDF(facture, client, societe = {}) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const marge = 14

  // ── En-tête : logo + société ──
  doc.setFillColor(...INK)
  doc.roundedRect(marge, 12, 12, 12, 2, 2, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text((societe.nom || 'F').charAt(0).toUpperCase(), marge + 6, 20, { align: 'center' })

  doc.setTextColor(...INK)
  doc.setFontSize(14)
  doc.text(societe.nom || 'Mon Entreprise', marge + 16, 17)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(...GREY)
  const sLines = [
    societe.adresse || 'Adresse de l\'entreprise',
    [societe.ville, societe.tel].filter(Boolean).join(' · ') || 'Casablanca, Maroc',
    societe.ice ? `ICE : ${societe.ice}` : '',
  ].filter(Boolean)
  doc.text(sLines, marge + 16, 22)

  // ── Bloc "FACTURE" à droite ──
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.setTextColor(...GOLD)
  doc.text('FACTURE', pageW - marge, 18, { align: 'right' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...INK)
  doc.text(`N° ${facture.numero}`, pageW - marge, 24, { align: 'right' })
  doc.text(`Date : ${formatDate(facture.date_creation)}`, pageW - marge, 29, { align: 'right' })
  doc.text(`Statut : ${STATUT_LABELS[facture.statut] || facture.statut}`, pageW - marge, 34, {
    align: 'right',
  })

  // ── Destinataire ──
  let y = 46
  doc.setDrawColor(230, 232, 236)
  doc.line(marge, y, pageW - marge, y)
  y += 7
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...GREY)
  doc.text('FACTURÉ À', marge, y)
  y += 5
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...INK)
  doc.text(client?.nom || 'Client', marge, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...GREY)
  const cLines = [client?.adresse, client?.email, client?.tel].filter(Boolean)
  if (cLines.length) {
    doc.text(cLines, marge, y)
    y += cLines.length * 4.5
  }

  // ── Tableau des lignes ──
  const body = (facture.lignes || []).map((l, i) => [
    i + 1,
    l.designation,
    formatNumber(l.qte),
    formatNumber(l.prix_unitaire),
    `${formatNumber(l.remiseMontant || 0)}`,
    `${l.tauxTVA}%`,
    formatNumber(l.totalLigne),
  ])

  autoTable(doc, {
    startY: y + 4,
    head: [['#', 'Désignation', 'Qté', 'P.U. (DH)', 'Remise', 'TVA', 'Total (DH)']],
    body,
    theme: 'grid',
    headStyles: { fillColor: INK, textColor: 255, fontSize: 9 },
    bodyStyles: { fontSize: 8.5, textColor: [40, 48, 66] },
    alternateRowStyles: { fillColor: [248, 249, 251] },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'right' },
      5: { halign: 'center' },
      6: { halign: 'right' },
    },
    margin: { left: marge, right: marge },
  })

  // ── Totaux ──
  let ty = doc.lastAutoTable.finalY + 8
  const boxX = pageW - marge - 72
  const ligneTotale = (label, value, bold = false) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal')
    doc.setFontSize(bold ? 11 : 9.5)
    doc.setTextColor(...(bold ? INK : GREY))
    doc.text(label, boxX, ty)
    doc.setTextColor(...INK)
    doc.text(`${formatNumber(value)} DH`, pageW - marge, ty, { align: 'right' })
    ty += bold ? 8 : 6
  }
  ligneTotale('Total HT', facture.total_ht)
  if (facture.total_remise > 0) ligneTotale('Remise', -facture.total_remise)
  ligneTotale('TVA', facture.tva)
  doc.setDrawColor(...GOLD)
  doc.setLineWidth(0.4)
  doc.line(boxX, ty - 2, pageW - marge, ty - 2)
  ty += 2
  ligneTotale('Total TTC', facture.total_ttc, true)

  // ── Pied de page : méthode + signature ──
  const footY = 270
  doc.setFontSize(8)
  doc.setFont('helvetica', 'italic')
  doc.setTextColor(...GREY)
  doc.text(METHODE_LABELS[facture.methode] || '', marge, footY)
  doc.setFont('helvetica', 'normal')
  doc.text('Signature & cachet', pageW - marge - 40, footY)
  doc.setDrawColor(200, 204, 212)
  doc.rect(pageW - marge - 45, footY + 2, 45, 18)

  doc.save(`${facture.numero}.pdf`)
}

export default genererFacturePDF
