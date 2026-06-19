import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
} from '@mui/material'
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined'
import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined'
import HourglassEmptyOutlinedIcon from '@mui/icons-material/HourglassEmptyOutlined'
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined'
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined'
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { firebaseService } from '../../services/firebaseService'
import { exporterFacturesExcel } from '../../utils/excelExport'
import { KpiCard } from '../../components/KpiCard'
import { PageHeader } from '../../components/ui'
import { computeKpis, caMensuel, repartitionStatuts } from '../../utils/stats'
import { formatMAD } from '../../utils/format'

const STATUT_COLORS = ['#2E7D5B', '#C9821A', '#C0392B']

const currentYear = new Date().getFullYear()
const years = Array.from({ length: 5 }, (_, i) => currentYear - i)

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { profil } = useAuth()
  const [factures, setFactures] = useState([])
  const [clients, setClients] = useState({})
  const [loading, setLoading] = useState(true)
  const [archiveOpen, setArchiveOpen] = useState(false)
  const [archiveAnnee, setArchiveAnnee] = useState(String(currentYear - 1))
  const [archiving, setArchiving] = useState(false)
  const [archiveResult, setArchiveResult] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const [fs, cl] = await Promise.all([
        firebaseService.getFactures(profil?.societe_id),
        firebaseService.getClients(profil?.societe_id),
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

  const handleArchiver = async () => {
    setArchiving(true)
    setArchiveResult(null)
    try {
      const count = await firebaseService.archiverAnnee(Number(archiveAnnee))
      setArchiveResult({ success: true, count })
      load()
    } catch (e) {
      setArchiveResult({ success: false, message: e.message })
    } finally {
      setArchiving(false)
    }
  }

  if (loading)
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    )

  const k = computeKpis(factures)
  const serie = caMensuel(factures)
  const repartition = repartitionStatuts(factures)

  return (
    <Box>
      <PageHeader
        title="Tableau de bord"
        subtitle="Vue d'ensemble de l'activité de facturation."
        action={
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<TableChartOutlinedIcon />}
              onClick={() => exporterFacturesExcel(factures, clients, 'factures_admin')}
              disabled={factures.length === 0}
            >
              Excel
            </Button>
            <Button
              variant="outlined"
              startIcon={<ArchiveOutlinedIcon />}
              onClick={() => { setArchiveResult(null); setArchiveOpen(true) }}
            >
              Archiver
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/admin/archives')}
            >
              Voir archives
            </Button>
          </Stack>
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
          <KpiCard label="REJETÉES" value={k.rejetees} icon={<BlockOutlinedIcon />} accent="error.main" />
        </Grid>
      </Grid>

      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
        <Grid item xs={12} sm={6}>
          <KpiCard label="MONTANT MOYEN / FACTURE" value={formatMAD(k.moyenne)} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <KpiCard label="FACTURES PAYÉES" value={k.payees} accent="success.main" />
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={8}>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              CA mensuel encaissé
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={serie} margin={{ left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef0f3" />
                  <XAxis dataKey="mois" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} />
                  <Tooltip formatter={(v) => formatMAD(v)} />
                  <Line type="monotone" dataKey="ca" stroke="#1F2A44" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Répartition des statuts
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={repartition}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={2}
                  >
                    {repartition.map((entry, i) => (
                      <Cell key={i} fill={STATUT_COLORS[i % STATUT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Nombre de factures par mois
            </Typography>
            <Box sx={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={serie} margin={{ left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef0f3" />
                  <XAxis dataKey="mois" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="count" name="Factures" fill="#B07A1E" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Dialog archivage */}
      <Dialog open={archiveOpen} onClose={() => setArchiveOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Archiver une année</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Les factures de l'année sélectionnée seront déplacées vers les archives
            (lecture seule). Cette action est irréversible depuis l'interface.
          </Typography>
          <TextField
            select
            fullWidth
            label="Année à archiver"
            value={archiveAnnee}
            onChange={(e) => setArchiveAnnee(e.target.value)}
          >
            {years.map((y) => (
              <MenuItem key={y} value={String(y)}>
                {y}
              </MenuItem>
            ))}
          </TextField>
          {archiveResult && (
            <Alert
              severity={archiveResult.success ? 'success' : 'error'}
              sx={{ mt: 2 }}
            >
              {archiveResult.success
                ? `${archiveResult.count} facture(s) archivée(s) avec succès.`
                : `Erreur : ${archiveResult.message}`}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setArchiveOpen(false)} color="inherit">
            Fermer
          </Button>
          <Button
            variant="contained"
            color="warning"
            onClick={handleArchiver}
            disabled={archiving}
          >
            {archiving ? 'Archivage…' : 'Archiver'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
