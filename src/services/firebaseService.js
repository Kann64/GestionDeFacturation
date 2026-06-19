import { ref, push, set, update, remove, get, child } from 'firebase/database'
import { db } from '../firebase'

// Convertit un objet { id1: {...}, id2: {...} } Firebase en tableau [{ id, ... }]
const toArray = (snapshotVal) =>
  snapshotVal
    ? Object.entries(snapshotVal).map(([id, value]) => ({ id, ...value }))
    : []

export const firebaseService = {
  // ───────────── Clients ─────────────
  async getClients() {
    const snap = await get(ref(db, 'clients'))
    return toArray(snap.val())
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
  async getFactures() {
    const snap = await get(ref(db, 'factures'))
    return toArray(snap.val()).sort(
      (a, b) => new Date(b.date_creation) - new Date(a.date_creation),
    )
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
}

export default firebaseService
