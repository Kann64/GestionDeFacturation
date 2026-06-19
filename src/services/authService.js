import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { ref, set, get } from 'firebase/database'
import { auth, db } from '../firebase'
import { ROLES } from '../utils/constants'

export const authService = {
  async register({ email, password, nom, role = ROLES.USER }) {
    let cred
    try {
      cred = await createUserWithEmailAndPassword(auth, email, password)
      if (nom) await updateProfile(cred.user, { displayName: nom })
    } catch (err) {
      console.error('[authService.register] Auth error — code:', err.code, '| message:', err.message)
      throw err
    }

    try {
      await set(ref(db, `users/${cred.user.uid}`), {
        email,
        nom: nom || '',
        role,
        createdAt: new Date().toISOString(),
      })
    } catch (err) {
      console.error('[authService.register] RTDB write error — code:', err.code, '| message:', err.message)
      // Auth user was created but profile write failed — surface a distinct error
      const rtdbErr = new Error(err.message || 'Erreur écriture base de données')
      rtdbErr.code = 'rtdb/write-failed'
      rtdbErr.originalCode = err.code
      rtdbErr.originalMessage = err.message
      rtdbErr.isRtdbError = true
      rtdbErr.orphanedUid = cred.user.uid
      throw rtdbErr
    }

    return cred.user
  },

  async login({ email, password }) {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    return cred.user
  },

  async logout() {
    await signOut(auth)
  },

  async getProfil(uid) {
    const snap = await get(ref(db, `users/${uid}`))
    return snap.exists() ? snap.val() : null
  },
}

export default authService
