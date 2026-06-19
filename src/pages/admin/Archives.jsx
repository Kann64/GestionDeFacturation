import { useEffect, useState } from 'react'
import {
  Box,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  CircularProgress,
  ToggleButtonGroup,
  ToggleButton,
  Typography,
} from '@mui/material'
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined'
import { firebaseService } from '../../services/firebaseService'
import { PageHeader, EmptyState, StatutChip } from '../../components/ui'
import { formatMontant, formatDate } from '../../utils/format'

export default function Archives() {
  const [annees, setAnnees] = useState([])
  const [anneeActive, setAnneeActive] = useState(null)
  const [factures, setFactures] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const ans = await firebaseService.getAnneesArchivees()
        setAnnees(ans)
        if (ans.length > 0) {
          setAnneeActive(ans[0])
          setFactures(await firebaseService.getArchives(ans[0]))
        }
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const handleAnnee = async (_, annee) => {
    if (!annee) return
    setAnneeActive(annee)
    setLoading(true)
    try {
      setFactures(await firebaseService.getArchives(annee))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box>
      <PageHeader
        title="Archives"
        subtitle="Factures archivées — lecture seule."
      />

      {annees.length > 0 && (
        <ToggleButtonGroup
          size="small"
          value={anneeActive}
          exclusive
          onChange={handleAnnee}
          sx={{ mb: 2.5 }}
        >
          {annees.map((a) => (
            <ToggleButton key={a} value={a}>
              {a}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      )}

      {loading ? (
        <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : annees.length === 0 ? (
        <EmptyState
          icon={<ArchiveOutlinedIcon sx={{ fontSize: 40 }} />}
          title="Aucune archive"
          message="Utilisez le bouton « Archiver » sur le tableau de bord pour déplacer les factures d'une année ici."
        />
      ) : factures.length === 0 ? (
        <EmptyState
          icon={<ArchiveOutlinedIcon sx={{ fontSize: 40 }} />}
          title={`Aucune facture archivée pour ${anneeActive}`}
          message=""
        />
      ) : (
        <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Box sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: 720 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Numéro</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Total HT</TableCell>
                  <TableCell align="right">TVA</TableCell>
                  <TableCell align="right">Total TTC</TableCell>
                  <TableCell>Devise</TableCell>
                  <TableCell>Statut</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {factures.map((f) => (
                  <TableRow key={f.id} hover>
                    <TableCell sx={{ fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>
                      {f.numero}
                    </TableCell>
                    <TableCell>{formatDate(f.date_creation)}</TableCell>
                    <TableCell align="right" sx={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      {formatMontant(f.total_ht, f.devise)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      {formatMontant(f.tva, f.devise)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      {formatMontant(f.total_ttc, f.devise)}
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ fontFamily: 'JetBrains Mono, monospace' }}>
                        {f.devise || 'MAD'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <StatutChip statut={f.statut} />
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
