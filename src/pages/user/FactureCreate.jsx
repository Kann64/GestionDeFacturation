import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, CircularProgress, Alert, Button } from '@mui/material'
import { firebaseService } from '../../services/firebaseService'
import { jsonService } from '../../services/jsonService'
import { useAuth } from '../../contexts/AuthContext'
import FactureForm from '../../components/FactureForm'
import { PageHeader } from '../../components/ui'
import { genererNumeroFacture } from '../../utils/format'
import { STATUTS } from '../../utils/constants'

export default function FactureCreate() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [clients, setClients] = useState([])
  const [articles, setArticles] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      setLoadError('')
      try {
        const [cl, art, cat] = await Promise.all([
          firebaseService.getClients(),
          jsonService.getArticles(),
          jsonService.getCategories(),
        ])
        setClients(cl)
        setArticles(art)
        setCategories(cat)
      } catch (e) {
        setLoadError(
          "Impossible de charger les données. Vérifiez que JSON Server est démarré (npm run server) et que Firebase est configuré.",
        )
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const handleSubmit = async (data) => {
    setSubmitting(true)
    try {
      const factures = await firebaseService.getFactures()
      const numero = genererNumeroFacture(factures.length + 1)
      const facture = {
        ...data,
        numero,
        date_creation: new Date().toISOString(),
        statut: STATUTS.EN_ATTENTE,
        date_depot: '',
        date_encaissement: '',
        type_virement: '',
        validated_by_admin: false,
        created_by: user.uid,
      }
      const saved = await firebaseService.addFacture(facture)
      navigate(`/app/factures/${saved.id}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Box>
      <PageHeader title="Nouvelle facture" subtitle="Composez la facture et laissez le calcul se faire." />
      {loading ? (
        <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : loadError ? (
        <Alert
          severity="warning"
          action={
            <Button color="inherit" size="small" onClick={() => window.location.reload()}>
              Réessayer
            </Button>
          }
        >
          {loadError}
        </Alert>
      ) : (
        <FactureForm
          clients={clients}
          articles={articles}
          categories={categories}
          onSubmit={handleSubmit}
          submitting={submitting}
        />
      )}
    </Box>
  )
}
