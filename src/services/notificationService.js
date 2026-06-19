import { ref, push, set, update, onValue, off, get } from 'firebase/database'
import { db } from '../firebase'
import { ROLES } from '../utils/constants'

export const NOTIF_TYPES = {
  FACTURE_VALIDEE: 'facture_validee',
  FACTURE_REJETEE: 'facture_rejetee',
  NOUVELLE_FACTURE: 'nouvelle_facture',
}

export const notificationService = {
  async sendToUser(uid, { type, message, facture_id = '', facture_numero = '' }) {
    const newRef = push(ref(db, `notifications/${uid}`))
    await set(newRef, {
      type,
      message,
      facture_id,
      facture_numero,
      lue: false,
      createdAt: new Date().toISOString(),
    })
    return newRef.key
  },

  async notifyAdmins(payload) {
    const snap = await get(ref(db, 'users'))
    if (!snap.exists()) return
    const users = snap.val()
    await Promise.all(
      Object.entries(users)
        .filter(([, u]) => u.role === ROLES.ADMIN)
        .map(([uid]) => this.sendToUser(uid, payload)),
    )
  },

  listen(uid, callback) {
    const r = ref(db, `notifications/${uid}`)
    onValue(r, (snap) => {
      const val = snap.val()
      const notifs = val
        ? Object.entries(val)
            .map(([id, n]) => ({ id, ...n }))
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        : []
      callback(notifs)
    })
    return () => off(r)
  },

  async markAsRead(uid, notifId) {
    await update(ref(db, `notifications/${uid}/${notifId}`), { lue: true })
  },

  async markAllAsRead(uid) {
    const snap = await get(ref(db, `notifications/${uid}`))
    if (!snap.exists()) return
    const updates = {}
    Object.keys(snap.val()).forEach((id) => {
      updates[`notifications/${uid}/${id}/lue`] = true
    })
    await update(ref(db), updates)
  },
}

export default notificationService
