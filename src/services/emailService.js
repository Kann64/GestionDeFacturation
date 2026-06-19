import emailjs from '@emailjs/browser'
import { formatMontant, formatDate } from '../utils/format'
import { STATUT_LABELS } from '../utils/constants'

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

export const emailService = {
  isConfigured() {
    return Boolean(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY)
  },

  async sendFactureEmail(facture, client, societe = {}) {
    if (!this.isConfigured()) {
      console.warn('[emailService] EmailJS non configuré — ajoutez VITE_EMAILJS_* dans .env')
      return
    }
    if (!client?.email) {
      console.warn('[emailService] Client sans email — envoi ignoré')
      return
    }

    const params = {
      to_email: client.email,
      to_name: client.nom || 'Client',
      company_name: societe.nom || 'Notre société',
      company_email: societe.email || '',
      invoice_number: facture.numero || '',
      invoice_date: formatDate(facture.date_creation),
      invoice_total: formatMontant(facture.total_ttc, facture.devise),
      invoice_status: STATUT_LABELS[facture.statut] || facture.statut || '',
    }

    await emailjs.send(SERVICE_ID, TEMPLATE_ID, params, PUBLIC_KEY)
  },
}

export default emailService
