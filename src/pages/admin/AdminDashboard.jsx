import { useEffect, useState } from 'react'
import { Box, Grid, Paper, Typography, CircularProgress } from '@mui/material'
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined'
import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined'
import HourglassEmptyOutlinedIcon from '@mui/icons-material/HourglassEmptyOutlined'
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined'
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
import { KpiCard } from '../../components/KpiCard'
import { PageHeader } from '../../components/ui'
import { computeKpis, caMensuel, repartitionStatuts } from '../../utils/stats'
import { formatMAD } from '../../utils/format'

const STATUT_COLORS = ['#2E7D5B', '#C9821A', '#C0392B']

export default function AdminDashboard() {
  const [factures, setFactures] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        setFactures(await firebaseService.getFactures())
      } finally {
        setLoading(false)
      }
    })()
  }, [])

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
      <PageHeader title="Tableau de bord" subtitle="Vue d'ensemble de l'activité de facturation." />

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
    </Box>
  )
}
