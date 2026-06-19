import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { Alert, Snackbar } from '@mui/material'
import { useAuth } from './AuthContext'
import { notificationService } from '../services/notificationService'

const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'info' })
  const seenIds = useRef(new Set())
  const isFirst = useRef(true)

  useEffect(() => {
    if (!user) {
      setNotifications([])
      seenIds.current = new Set()
      isFirst.current = true
      return
    }

    const unsub = notificationService.listen(user.uid, (notifs) => {
      if (isFirst.current) {
        isFirst.current = false
        notifs.forEach((n) => seenIds.current.add(n.id))
        setNotifications(notifs)
        return
      }

      const newOnes = notifs.filter((n) => !seenIds.current.has(n.id) && !n.lue)
      notifs.forEach((n) => seenIds.current.add(n.id))
      setNotifications(notifs)

      if (newOnes.length > 0) {
        const first = newOnes[0]
        const severity =
          first.type === 'facture_validee'
            ? 'success'
            : first.type === 'facture_rejetee'
              ? 'error'
              : 'info'
        setSnack({ open: true, message: first.message, severity })
      }
    })

    return unsub
  }, [user])

  const markAsRead = (notifId) => {
    if (user) notificationService.markAsRead(user.uid, notifId)
  }

  const markAllAsRead = () => {
    if (user) notificationService.markAllAsRead(user.uid)
  }

  const unreadCount = notifications.filter((n) => !n.lue).length

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead }}>
      {children}
      <Snackbar
        open={snack.open}
        autoHideDuration={5000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snack.severity}
          variant="filled"
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          sx={{ width: '100%' }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotifications doit être utilisé dans <NotificationProvider>')
  return ctx
}
