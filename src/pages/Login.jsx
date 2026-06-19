import { useState } from 'react'
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom'
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Link,
  Stack,
} from '@mui/material'
import { useAuth } from '../contexts/AuthContext'
import { ROLES } from '../utils/constants'
import { authService } from '../services/authService'

export function AuthShell({ children }) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1.1fr 1fr' },
        bgcolor: 'background.default',
      }}
    >
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: 6,
          color: '#fff',
          bgcolor: 'primary.main',
          backgroundImage:
            'radial-gradient(900px 500px at 80% -10%, rgba(176,122,30,0.35), transparent)',
        }}
      >
        <Typography sx={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 600 }}>
          Facturation
        </Typography>
        <Box>
          <Typography
            sx={{ fontFamily: 'Fraunces, serif', fontSize: 38, fontWeight: 600, lineHeight: 1.15 }}
          >
            Vos factures,
            <br />
            de la saisie au paiement.
          </Typography>
          <Typography sx={{ mt: 2, opacity: 0.8, maxWidth: 420 }}>
            Clients, articles, calcul automatique, génération PDF et suivi des encaissements — dans
            une seule interface.
          </Typography>
        </Box>
        <Typography variant="caption" sx={{ opacity: 0.6 }}>
          React · Material UI · Firebase · JSON Server
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', placeItems: 'center', p: { xs: 3, md: 6 } }}>
        <Paper variant="outlined" sx={{ p: { xs: 3, md: 4 }, width: '100%', maxWidth: 400, borderRadius: 3 }}>
          {children}
        </Paper>
      </Box>
    </Box>
  )
}

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login({ email, password })
      const profil = await authService.getProfil(user.uid)
      const dest =
        profil?.role === ROLES.ADMIN ? '/admin' : location.state?.from?.pathname || '/app'
      navigate(dest, { replace: true })
    } catch (err) {
      setError(traduireErreur(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell>
      <Typography variant="h5" sx={{ mb: 0.5 }}>
        Connexion
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Accédez à votre espace de facturation.
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            required
          />
          <TextField
            label="Mot de passe"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            required
          />
          <Button type="submit" variant="contained" size="large" disabled={loading}>
            {loading ? 'Connexion…' : 'Se connecter'}
          </Button>
        </Stack>
      </form>
      <Typography variant="body2" sx={{ mt: 3 }} color="text.secondary">
        Pas encore de compte ?{' '}
        <Link component={RouterLink} to="/register" underline="hover">
          Créer un compte
        </Link>
      </Typography>
    </AuthShell>
  )
}

export function traduireErreur(err) {
  const code = err?.code || ''

  // RTDB write succeeded only after Auth user was created — distinct failure mode
  if (err?.isRtdbError) {
    const msg = err.originalMessage || ''
    if (msg.includes('PERMISSION_DENIED') || msg.includes('permission denied')) {
      return "Compte créé mais l'enregistrement du profil a été refusé (règles de sécurité RTDB). Vérifiez les règles de votre Realtime Database dans la console Firebase."
    }
    return `Compte créé mais l'enregistrement du profil a échoué. Le compte Firebase Auth existe — contactez l'administrateur. [${err.originalCode || 'inconnu'}]`
  }

  const map = {
    'auth/invalid-credential': 'Email ou mot de passe incorrect.',
    'auth/invalid-email': "L'adresse email n'est pas valide.",
    'auth/user-not-found': 'Aucun compte associé à cet email.',
    'auth/wrong-password': 'Mot de passe incorrect.',
    'auth/email-already-in-use': 'Un compte existe déjà avec cet email.',
    'auth/weak-password': 'Le mot de passe doit contenir au moins 6 caractères.',
    'auth/network-request-failed': 'Problème de connexion réseau. Vérifiez votre connexion internet.',
    'auth/operation-not-allowed':
      "La connexion par email/mot de passe n'est pas activée. Activez-la dans Firebase Authentication → Sign-in method.",
    'auth/configuration-not-found':
      'Configuration Firebase incorrecte ou méthode de connexion désactivée. Vérifiez votre fichier .env et le projet Firebase.',
    'auth/invalid-api-key':
      'Clé API Firebase invalide. Vérifiez VITE_FIREBASE_API_KEY dans votre fichier .env.',
    'auth/app-not-authorized':
      "Cette application n'est pas autorisée à utiliser Firebase Authentication. Vérifiez le domaine dans la console Firebase.",
  }
  return map[code] || `Une erreur est survenue. Réessayez.${code ? ` [${code}]` : ''}`
}
