import { useState } from 'react'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import { TextField, Button, Typography, Alert, Link, Stack, MenuItem } from '@mui/material'
import { useAuth } from '../contexts/AuthContext'
import { ROLES } from '../utils/constants'
import { AuthShell, traduireErreur } from './Login'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ nom: '', email: '', password: '', role: ROLES.USER })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const change = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password.length < 6) return setError('Le mot de passe doit faire au moins 6 caractères.')
    setLoading(true)
    try {
      await register(form)
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
