import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Button,
  Table,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material'
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined'
import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined'
import HourglassEmptyOutlinedIcon from '@mui/icons-material/HourglassEmptyOutlined'
import AddIcon from '@mui/icons-material/Add'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { firebaseService } from '../../services/firebaseService'
import { useAuth } from '../../contexts/AuthContext'
import { KpiCard } from '../../components/KpiCard'
import { PageHeader, StatutChip } from '../../components/ui'
import { computeKpis, caMensuel } from '../../utils/stats'
import { formatMAD, formatDate } from '../../utils/format'

export default function UserDashboard() {
  const { user, profil } = useAuth()
  const navigate = useNavigate()
  const [factures, setFactures] = useState([])
  const [clients, setClients] = useState({})
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
      } finally {
        setLoading(false)
      }
    })()
  }, [user.uid])

  if (loading)
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    )

  const k = computeKpis(factures)
  const serie = caMensuel(factures)
  const recent = factures.slice(0, 5)

  return (
    <Box>
      <PageHeader
        title={`Bonjour ${profil?.nom?.split(' ')[0] || ''}`.trim()}
        subtitle="Voici l'état de vos factures."
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/app/factures/nouvelle')}>
            Nouvelle facture
          </Button>
        }
      />

      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard label="TOTAL FACTURES" value={k.total} icon={<ReceiptLongOutlinedIcon />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            label="TOTAL ENCAISSÉ"
            value={formatMAD(k.encaisse)}
            icon={<PaidOutlinedIcon />}
            accent="success.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            label="EN ATTENTE"
            value={k.enAttente}
            icon={<HourglassEmptyOutlinedIcon />}
            accent="warning.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard label="MONTANT MOYEN" value={formatMAD(k.moyenne)} sub="par facture" />
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={7}>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Activité mensuelle (CA encaissé)
            </Typography>
            <Box sx={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={serie} margin={{ left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef0f3" />
                  <XAxis dataKey="mois" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} />
                  <Tooltip formatter={(v) => formatMAD(v)} />
                  <Bar dataKey="ca" fill="#B07A1E" radius={[4, 4, 0, 0]} maxBarSize={36} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={5}>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Dernières factures
            </Typography>
            {recent.length === 0 ? (
              <Typography color="text.secondary" variant="body2" sx={{ py: 3 }}>
                Aucune facture pour le moment.
              </Typography>
            ) : (
              <Table size="small">
                <TableBody>
                  {recent.map((f) => (
                    <TableRow
                      key={f.id}
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/app/factures/${f.id}`)}
                    >
                      <TableCell sx={{ border: 0 }}>
                        <Typography variant="body2" fontWeight={600}>
                          {clients[f.client_id]?.nom || '—'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(f.date_creation)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ border: 0, fontFamily: 'JetBrains Mono, monospace' }}>
                        {formatMAD(f.total_ttc)}
                      </TableCell>
                      <TableCell align="right" sx={{ border: 0 }}>
                        <StatutChip statut={f.statut} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}
