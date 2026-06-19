import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  CircularProgress,
  Button,
  Stack,
  Tooltip,
} from '@mui/material'
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import AddIcon from '@mui/icons-material/Add'
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined'
import { firebaseService } from '../../services/firebaseService'
import { jsonService } from '../../services/jsonService'
import { useAuth } from '../../contexts/AuthContext'
import { genererFacturePDF } from '../../services/pdfService'
import { PageHeader, EmptyState, StatutChip } from '../../components/ui'
import { formatMAD, formatDate } from '../../utils/format'

export default function FactureHistory() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [factures, setFactures] = useState([])
  const [clients, setClients] = useState({})
  const [societe, setSociete] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const [fs, cl] = await Promise.all([
          firebaseService.getFacturesByUser(user.uid),
          firebaseService.getClients(),
        ])
        setFactures(fs)
        setClients(Object.fromEntries(cl.map((c) => [c.id, c])))
        try {
          const params = await jsonService.getParametres()
          setSociete(params || {})
        } catch {
          /* paramètres optionnels */
        }
      } finally {
        setLoading(false)
      }
    })()
  }, [user.uid])

  const downloadPDF = (f) => genererFacturePDF(f, clients[f.client_id], societe)

  return (
    <Box>
      <PageHeader
        title="Mes factures"
        subtitle="Historique de vos factures et leur statut."
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/app/factures/nouvelle')}>
            Nouvelle facture
          </Button>
        }
      />
      {loading ? (
        <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : factures.length === 0 ? (
        <EmptyState
          icon={<ReceiptLongOutlinedIcon sx={{ fontSize: 40 }} />}
          title="Aucune facture"
          message="Créez votre première facture pour la voir apparaître ici."
          action={
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/app/factures/nouvelle')}>
              Créer une facture
            </Button>
          }
        />
      ) : (
        <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Box sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: 720 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Numéro</TableCell>
                  <TableCell>Client</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Total TTC</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {factures.map((f) => (
                  <TableRow key={f.id} hover>
                    <TableCell sx={{ fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>
                      {f.numero}
                    </TableCell>
                    <TableCell>{clients[f.client_id]?.nom || '—'}</TableCell>
                    <TableCell>{formatDate(f.date_creation)}</TableCell>
                    <TableCell align="right" sx={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      {formatMAD(f.total_ttc)}
                    </TableCell>
                    <TableCell>
                      <StatutChip statut={f.statut} />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Tooltip title="Détails & suivi">
                          <IconButton size="small" onClick={() => navigate(`/app/factures/${f.id}`)}>
                            <VisibilityOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Télécharger le PDF">
                          <IconButton size="small" onClick={() => downloadPDF(f)}>
                            <PictureAsPdfOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </Paper>
      )}
    </Box>
  )
}
