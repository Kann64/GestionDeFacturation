import { useEffect, useState } from 'react'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import { TextField, Button, Typography, Alert, Link, Stack, MenuItem } from '@mui/material'
import { useAuth } from '../contexts/AuthContext'
import { jsonService } from '../services/jsonService'
import { authService } from '../services/authService'
import { ROLES } from '../utils/constants'
import { AuthShell, traduireErreur } from './Login'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ nom: '', email: '', password: '', role: ROLES.USER, societe_id: '' })
  const [societes, setSocietes] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    jsonService.getSocietes().then(setSocietes).catch(() => {})
  }, [])

  const change = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password.length < 6) return setError('Le mot de passe doit faire au moins 6 caractères.')
    setLoading(true)
    try {
      const fbUser = await register(form)
      if (form.societe_id && fbUser?.uid) {
        await authService.updateUserSociete(fbUser.uid, Number(form.societe_id))
      }
      navigate(form.role === ROLES.ADMIN ? '/admin' : '/app', { replace: true })
    } catch (err) {
      console.error('[Register] error — code:', err.code, '| message:', err.message)
      setError(traduireErreur(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell>
      <Typography variant="h5" sx={{ mb: 0.5 }}>
        Créer un compte
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Quelques informations pour démarrer.
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField label="Nom complet" value={form.nom} onChange={change('nom')} fullWidth required />
          <TextField
            label="Email"
            type="email"
            value={form.email}
            onChange={change('email')}
            fullWidth
            required
          />
          <TextField
            label="Mot de passe"
            type="password"
            value={form.password}
            onChange={change('password')}
            fullWidth
            required
            helperText="6 caractères minimum"
          />
          <TextField select label="Profil" value={form.role} onChange={change('role')} fullWidth>
            <MenuItem value={ROLES.USER}>Agent / Comptable</MenuItem>
            <MenuItem value={ROLES.ADMIN}>Administrateur</MenuItem>
          </TextField>
          {societes.length > 0 && (
            <TextField select label="Société (optionnel)" value={form.societe_id} onChange={change('societe_id')} fullWidth>
              <MenuItem value="">
                <em>Aucune</em>
              </MenuItem>
              {societes.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.nom}
                </MenuItem>
              ))}
            </TextField>
          )}
          <Button type="submit" variant="contained" size="large" disabled={loading}>
            {loading ? 'Création…' : 'Créer le compte'}
          </Button>
        </Stack>
      </form>
      <Typography variant="body2" sx={{ mt: 3 }} color="text.secondary">
        Déjà inscrit ?{' '}
        <Link component={RouterLink} to="/login" underline="hover">
          Se connecter
        </Link>
      </Typography>
    </AuthShell>
  )
}
