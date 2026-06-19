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
  Button,
  CircularProgress,
  Stack,
  Chip,
  Tooltip,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined'
import { firebaseService } from '../../services/firebaseService'
import { PageHeader, EmptyState, StatutChip } from '../../components/ui'
import { formatMAD, formatDate } from '../../utils/format'
import { STATUTS } from '../../utils/constants'

export default function ValidationFactures() {
  const navigate = useNavigate()
  const [factures, setFactures] = useState([])
  const [clients, setClients] = useState({})
  const [loading, setLoading] = useState(true)
  const [filtre, setFiltre] = useState('all')

  const load = async () => {
    setLoading(true)
    try {
      const [fs, cl] = await Promise.all([
        firebaseService.getFactures(),
        firebaseService.getClients(),
      ])
      setFactures(fs)
      setClients(Object.fromEntries(cl.map((c) => [c.id, c])))
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    load()
  }, [])

  const valider = async (f) => {
    await firebaseService.updateFacture(f.id, { validated_by_admin: true, statut: STATUTS.PAYEE })
    load()
  }
  const rejeter = async (f) => {
    await firebaseService.updateFacture(f.id, { validated_by_admin: true, statut: STATUTS.REJETEE })
    load()
  }

  const visibles = factures.filter((f) => {
    if (filtre === 'pending') return !f.validated_by_admin
    if (filtre === 'validated') return f.validated_by_admin
    return true
  })

  return (
    <Box>
      <PageHeader
        title="Validation des factures"
        subtitle="Contrôlez et validez les factures émises par les agents."
      />

      <ToggleButtonGroup
        size="small"
        value={filtre}
        exclusive
        onChange={(_, v) => v && setFiltre(v)}
        sx={{ mb: 2.5 }}
      >
        <ToggleButton value="all">Toutes</ToggleButton>
        <ToggleButton value="pending">À valider</ToggleButton>
        <ToggleButton value="validated">Validées</ToggleButton>
      </ToggleButtonGroup>

      {loading ? (
        <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : visibles.length === 0 ? (
        <EmptyState
          icon={<FactCheckOutlinedIcon sx={{ fontSize: 40 }} />}
          title="Rien à afficher"
          message="Aucune facture ne correspond à ce filtre."
        />
      ) : (
        <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Box sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: 760 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Numéro</TableCell>
                  <TableCell>Client</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">TTC</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Validation</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visibles.map((f) => (
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
                    <TableCell>
                      <Chip
                        size="small"
                        label={f.validated_by_admin ? 'Validée' : 'En attente'}
                        color={f.validated_by_admin ? 'success' : 'default'}
                        variant={f.validated_by_admin ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Tooltip title="Voir">
                          <IconButton size="small" onClick={() => navigate(`/app/factures/${f.id}`)}>
                            <VisibilityOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Valider (payée)">
                          <span>
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => valider(f)}
                              disabled={f.statut === STATUTS.PAYEE}
                            >
                              <CheckCircleOutlineIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Rejeter">
                          <span>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => rejeter(f)}
                              disabled={f.statut === STATUTS.REJETEE}
                            >
                              <CancelOutlinedIcon fontSize="small" />
                            </IconButton>
                          </span>
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
