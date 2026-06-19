import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Paper,
  Grid,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TextField,
  MenuItem,
  Button,
  Divider,
  CircularProgress,
  Stack,
  Snackbar,
  Alert,
  Chip,
} from '@mui/material'
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined'
import DrawOutlinedIcon from '@mui/icons-material/DrawOutlined'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import { firebaseService } from '../../services/firebaseService'
import { jsonService } from '../../services/jsonService'
import { genererFacturePDF } from '../../services/pdfService'
import { PageHeader, StatutChip } from '../../components/ui'
import SignatureDialog from '../../components/SignatureDialog'
import { formatMontant, formatDate } from '../../utils/format'
import {
  STATUTS,
  STATUT_LABELS,
  TYPES_VIREMENT,
  METHODE_LABELS,
} from '../../utils/constants'

export default function FactureDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [facture, setFacture] = useState(null)
  const [client, setClient] = useState(null)
  const [societe, setSociete] = useState({})
  const [loading, setLoading] = useState(true)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [suivi, setSuivi] = useState({ date_depot: '', date_encaissement: '', type_virement: '', statut: '' })
  const [saved, setSaved] = useState(false)
  const [sigOpen, setSigOpen] = useState(false)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      const f = await firebaseService.getFacture(id)
      setFacture(f)
      if (f) {
        setSuivi({
          date_depot: f.date_depot || '',
          date_encaissement: f.date_encaissement || '',
          type_virement: f.type_virement || '',
          statut: f.statut || STATUTS.EN_ATTENTE,
        })
        if (f.client_id) setClient(await firebaseService.getClient(f.client_id))
        try {
          if (f.societe_id) {
            setSociete(await jsonService.getSociete(f.societe_id))
          } else {
            setSociete((await jsonService.getParametres()) || {})
          }
        } catch {
          try { setSociete((await jsonService.getParametres()) || {}) } catch {}
        }
      }
      setLoading(false)
    })()
  }, [id])

  const change = (k) => (e) => setSuivi((s) => ({ ...s, [k]: e.target.value }))

  const saveSuivi = async () => {
    await firebaseService.updateFacture(id, suivi)
    setFacture((f) => ({ ...f, ...suivi }))
    setSaved(true)
  }

  const handleSaveSignature = async (dataUrl) => {
    setSigOpen(false)
    await firebaseService.updateFacture(id, { signature: dataUrl })
    setFacture((f) => ({ ...f, signature: dataUrl }))
  }

  const handleDownloadPDF = async () => {
    setPdfLoading(true)
    try {
      await genererFacturePDF(facture, client, societe)
    } finally {
      setPdfLoading(false)
    }
  }

  const devise = facture?.devise || 'MAD'

  if (loading)
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    )

  if (!facture)
    return (
      <Box>
        <Typography variant="h6">Facture introuvable.</Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/app/factures')} sx={{ mt: 2 }}>
          Retour
        </Button>
      </Box>
    )

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 1 }}>
        Retour
      </Button>
      <PageHeader
        title={facture.numero}
        subtitle={METHODE_LABELS[facture.methode]}
        action={
          <Stack direction="row" spacing={1.5} alignItems="center">
            <StatutChip statut={facture.statut} size="medium" />
            <Button
              variant="outlined"
              startIcon={<DrawOutlinedIcon />}
              onClick={() => setSigOpen(true)}
            >
              {facture.signature ? 'Modifier signature' : 'Signer'}
            </Button>
            <Button
              variant="contained"
              startIcon={<PictureAsPdfOutlinedIcon />}
              onClick={handleDownloadPDF}
              disabled={pdfLoading}
            >
              {pdfLoading ? 'Génération…' : 'PDF'}
            </Button>
          </Stack>
        }
      />

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={8}>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, mb: 2.5 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              FACTURÉ À
            </Typography>
            <Typography fontWeight={600}>{client?.nom || '—'}</Typography>
            <Typography variant="body2" color="text.secondary">
              {[client?.adresse, client?.email, client?.tel].filter(Boolean).join(' · ')}
            </Typography>
          </Paper>

          <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Box sx={{ overflowX: 'auto' }}>
              <Table sx={{ minWidth: 560 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Désignation</TableCell>
                    <TableCell align="right">Qté</TableCell>
                    <TableCell align="right">P.U.</TableCell>
                    <TableCell align="right">TVA</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(facture.lignes || []).map((l, i) => (
                    <TableRow key={i}>
                      <TableCell>{l.designation}</TableCell>
                      <TableCell align="right">{l.qte}</TableCell>
                      <TableCell align="right">{formatMontant(l.prix_unitaire, devise)}</TableCell>
                      <TableCell align="right">{l.tauxTVA}%</TableCell>
                      <TableCell align="right" sx={{ fontFamily: 'JetBrains Mono, monospace' }}>
                        {formatMontant(l.totalLigne, devise)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
            <Box sx={{ p: 2.5, maxWidth: 320, ml: 'auto' }}>
              <Row label="Total HT" value={formatMontant(facture.total_ht, devise)} />
              {facture.total_remise > 0 && (
                <Row label="Remise" value={`−${formatMontant(facture.total_remise, devise)}`} />
              )}
              <Row label="TVA" value={formatMontant(facture.tva, devise)} />
              <Divider sx={{ my: 1 }} />
              <Row label="Total TTC" value={formatMontant(facture.total_ttc, devise)} strong />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, mb: 2.5 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Suivi du paiement
            </Typography>
            <Stack spacing={2}>
              <TextField
                label="Date de dépôt"
                type="date"
                value={suivi.date_depot}
                onChange={change('date_depot')}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <TextField
                label="Date d'encaissement"
                type="date"
                value={suivi.date_encaissement}
                onChange={change('date_encaissement')}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <TextField
                select
                label="Type de virement"
                value={suivi.type_virement}
                onChange={change('type_virement')}
                fullWidth
              >
                <MenuItem value="">
                  <em>Non défini</em>
                </MenuItem>
                {TYPES_VIREMENT.map((t) => (
                  <MenuItem key={t} value={t}>
                    {t}
                  </MenuItem>
                ))}
              </TextField>
              <TextField select label="Statut" value={suivi.statut} onChange={change('statut')} fullWidth>
                {Object.values(STATUTS).map((s) => (
                  <MenuItem key={s} value={s}>
                    {STATUT_LABELS[s]}
                  </MenuItem>
                ))}
              </TextField>
              <Button variant="contained" onClick={saveSuivi}>
                Enregistrer le suivi
              </Button>
            </Stack>
            <Divider sx={{ my: 2 }} />
            <Typography variant="caption" color="text.secondary">
              Créée le {formatDate(facture.date_creation)}
              {facture.validated_by_admin ? " · Validée par l'administrateur" : ' · En attente de validation'}
            </Typography>
          </Paper>

          {/* Signature */}
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
              <Typography variant="h6">Signature</Typography>
              {facture.signature && (
                <Chip icon={<CheckCircleOutlineIcon />} label="Signée" color="success" size="small" />
              )}
            </Stack>
            {facture.signature ? (
              <Box
                component="img"
                src={facture.signature}
                alt="Signature"
                sx={{
                  width: '100%',
                  maxHeight: 100,
                  objectFit: 'contain',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  bgcolor: '#fafafa',
                  p: 0.5,
                }}
              />
            ) : (
              <Typography variant="body2" color="text.secondary">
                Aucune signature apposée. Cliquez sur "Signer" pour en ajouter une.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Snackbar open={saved} autoHideDuration={2500} onClose={() => setSaved(false)}>
        <Alert severity="success" variant="filled" onClose={() => setSaved(false)}>
          Suivi enregistré.
        </Alert>
      </Snackbar>

      <SignatureDialog
        open={sigOpen}
        onClose={() => setSigOpen(false)}
        onConfirm={handleSaveSignature}
      />
    </Box>
  )
}

function Row({ label, value, strong }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
      <Typography color={strong ? 'text.primary' : 'text.secondary'} fontWeight={strong ? 700 : 400}>
        {label}
      </Typography>
      <Typography
        fontWeight={strong ? 700 : 400}
        sx={{ fontFamily: 'JetBrains Mono, monospace', color: strong ? 'secondary.dark' : 'inherit' }}
      >
        {value}
      </Typography>
    </Box>
  )
}
