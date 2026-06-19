import { ref, push, set, update, remove, get, child } from 'firebase/database'
import { db } from '../firebase'

const toArray = (snapshotVal) =>
  snapshotVal
    ? Object.entries(snapshotVal).map(([id, value]) => ({ id, ...value }))
    : []

export const firebaseService = {
  // ───────────── Clients ─────────────
  async getClients(societeId = null) {
    const snap = await get(ref(db, 'clients'))
    const all = toArray(snap.val())
    if (!societeId) return all
    return all.filter((c) => !c.societe_id || c.societe_id === societeId)
  },

  async getClient(id) {
    const snap = await get(child(ref(db), `clients/${id}`))
    return snap.exists() ? { id, ...snap.val() } : null
  },

  async addClient(client) {
    const newRef = push(ref(db, 'clients'))
    await set(newRef, { ...client, createdAt: new Date().toISOString() })
    return { id: newRef.key, ...client }
  },

  async updateClient(id, data) {
    await update(ref(db, `clients/${id}`), data)
    return { id, ...data }
  },

  async deleteClient(id) {
    await remove(ref(db, `clients/${id}`))
  },

  // ───────────── Factures ─────────────
  async getFactures(societeId = null) {
    const snap = await get(ref(db, 'factures'))
    const all = toArray(snap.val()).sort(
      (a, b) => new Date(b.date_creation) - new Date(a.date_creation),
    )
    if (!societeId) return all
    return all.filter((f) => !f.societe_id || f.societe_id === societeId)
  },

  async getFacturesByUser(uid) {
    const all = await this.getFactures()
    return all.filter((f) => f.created_by === uid)
  },

  async getFacture(id) {
    const snap = await get(child(ref(db), `factures/${id}`))
    return snap.exists() ? { id, ...snap.val() } : null
  },

  async addFacture(facture) {
    const newRef = push(ref(db, 'factures'))
    const payload = { ...facture, createdAt: new Date().toISOString() }
    await set(newRef, payload)
    return { id: newRef.key, ...payload }
  },

  async updateFacture(id, data) {
    await update(ref(db, `factures/${id}`), data)
    return { id, ...data }
  },

  async deleteFacture(id) {
    await remove(ref(db, `factures/${id}`))
  },

  // ───────────── Archivage annuel ─────────────
  async archiverAnnee(annee) {
    const toutes = await this.getFactures()
    const aArchiver = toutes.filter(
      (f) => new Date(f.date_creation).getFullYear() === Number(annee),
    )
    if (aArchiver.length === 0) return 0

    const copies = {}
    const suppressions = {}
    aArchiver.forEach((f) => {
      const { id, ...data } = f
      copies[`factures_archives/${annee}/${id}`] = data
      suppressions[`factures/${id}`] = null
    })

    await update(ref(db), { ...copies, ...suppressions })
    return aArchiver.length
  },

  async getArchives(annee = null) {
    if (annee) {
      const snap = await get(ref(db, `factures_archives/${annee}`))
      return toArray(snap.val()).sort(
        (a, b) => new Date(b.date_creation) - new Date(a.date_creation),
      )
    }
    const snap = await get(ref(db, 'factures_archives'))
    if (!snap.exists()) return []
    const all = []
    snap.forEach((yearSnap) => {
      yearSnap.forEach((fSnap) => {
        all.push({ id: fSnap.key, annee: yearSnap.key, ...fSnap.val() })
      })
    })
    return all.sort((a, b) => new Date(b.date_creation) - new Date(a.date_creation))
  },

  async getAnneesArchivees() {
    const snap = await get(ref(db, 'factures_archives'))
    if (!snap.exists()) return []
    return Object.keys(snap.val()).sort((a, b) => b - a)
  },
}

export default firebaseService
