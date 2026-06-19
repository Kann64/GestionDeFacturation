import { useMemo, useState } from 'react'
import {
  Paper,
  Box,
  Grid,
  TextField,
  MenuItem,
  Typography,
  IconButton,
  Button,
  Divider,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  InputAdornment,
  Tooltip,
} from '@mui/material'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import AddIcon from '@mui/icons-material/Add'
import {
  METHODES,
  METHODE_LABELS,
  TVA_DEFAUT,
  TVA_PAR_CATEGORIE,
} from '../utils/constants'
import { calculerFacture } from '../utils/billing'
import { formatMAD } from '../utils/format'

const emptyLine = () => ({
  article_id: '',
  designation: '',
  categorie: '',
  categorie_id: '',
  prix_unitaire: 0,
  qte: 1,
  remise: 0,
  tva: TVA_DEFAUT,
})

export default function FactureForm({ clients, articles, categories, onSubmit, submitting }) {
  const [clientId, setClientId] = useState('')
  const [methode, setMethode] = useState(METHODES.SIMPLE)
  const [tvaGlobale, setTvaGlobale] = useState(TVA_DEFAUT)
  const [remiseGlobale, setRemiseGlobale] = useState(0)
  const [lignes, setLignes] = useState([emptyLine()])
  const [error, setError] = useState('')

  const catNom = (id) => categories.find((c) => String(c.id) === String(id))?.nom || ''
  const catTva = (nom) => {
    const c = categories.find((x) => x.nom === nom)
    if (c && c.tva != null) return Number(c.tva)
    return TVA_PAR_CATEGORIE[nom] ?? 0
  }

  const updateLine = (idx, patch) =>
    setLignes((prev) => prev.map((l, i) => (i === idx ? { ...l, ...patch } : l)))

  const onPickArticle = (idx, articleId) => {
    const a = articles.find((x) => String(x.id) === String(articleId))
    if (!a) return updateLine(idx, emptyLine())
    const nom = catNom(a.categorie_id)
    updateLine(idx, {
      article_id: a.id,
      designation: a.designation,
      prix_unitaire: Number(a.prix_unitaire) || 0,
      categorie_id: a.categorie_id,
      categorie: nom,
      tva: catTva(nom),
    })
  }

  const addLine = () => setLignes((p) => [...p, emptyLine()])
  const removeLine = (idx) =>
    setLignes((p) => (p.length > 1 ? p.filter((_, i) => i !== idx) : p))

  const calcul = useMemo(
    () =>
      calculerFacture(lignes, methode, {
        tvaGlobale: Number(tvaGlobale),
        remiseGlobale: Number(remiseGlobale),
      }),
    [lignes, methode, tvaGlobale, remiseGlobale],
  )

  const handleSubmit = () => {
    setError('')
    if (!clientId) return setError('Veuillez sélectionner un client.')
    const valides = lignes.filter((l) => l.designation && Number(l.qte) > 0)
    if (valides.length === 0) return setError('Ajoutez au moins une ligne valide.')
    onSubmit({
      client_id: clientId,
      methode,
      tva_globale: Number(tvaGlobale),
      remise_globale: Number(remiseGlobale),
      lignes: calcul.lignes,
      total_ht: calcul.totalHT,
      total_remise: calcul.totalRemise,
      tva: calcul.totalTVA,
      total_ttc: calcul.totalTTC,
    })
  }

  const showRemiseLigne = methode === METHODES.REMISE_LIGNE
  const showRemiseGlobale = methode === METHODES.REMISE_GLOBALE
  const showTvaCol = methode === METHODES.PAR_CATEGORIE

  return (
    <Box>
      {/* En-tête : client + méthode */}
      <Paper variant="outlined" sx={{ p: 2.5, mb: 2.5, borderRadius: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={5}>
            <TextField
              select
              fullWidth
              label="Client"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
            >
              {clients.length === 0 && (
                <MenuItem disabled value="">
                  Aucun client — créez-en un d'abord
                </MenuItem>
              )}
              {clients.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.nom}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={7}>
            <TextField
              select
              fullWidth
              label="Méthode de facturation"
              value={methode}
              onChange={(e) => setMethode(e.target.value)}
            >
              {Object.values(METHODES).map((m) => (
                <MenuItem key={m} value={m}>
                  {METHODE_LABELS[m]}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          {!showTvaCol && (
            <Grid item xs={6} md={3}>
              <TextField
                fullWidth
                type="number"
                label="TVA (%)"
                value={tvaGlobale}
                onChange={(e) => setTvaGlobale(e.target.value)}
                InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
              />
            </Grid>
          )}
          {showRemiseGlobale && (
            <Grid item xs={6} md={3}>
              <TextField
                fullWidth
                type="number"
                label="Remise globale (%)"
                value={remiseGlobale}
                onChange={(e) => setRemiseGlobale(e.target.value)}
                InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
              />
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Lignes */}
      <Paper variant="outlined" sx={{ p: 2.5, mb: 2.5, borderRadius: 3, overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: 720 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ minWidth: 220 }}>Article</TableCell>
              <TableCell align="right">Qté</TableCell>
              <TableCell align="right">P.U.</TableCell>
              {showRemiseLigne && <TableCell align="right">Remise %</TableCell>}
              {showTvaCol && <TableCell align="right">TVA %</TableCell>}
              <TableCell align="right">Total ligne</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {lignes.map((l, idx) => (
              <TableRow key={idx}>
                <TableCell>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    value={l.article_id}
                    onChange={(e) => onPickArticle(idx, e.target.value)}
                    SelectProps={{ displayEmpty: true }}
                  >
                    <MenuItem value="">
                      <em>Choisir…</em>
                    </MenuItem>
                    {articles.map((a) => (
                      <MenuItem key={a.id} value={a.id}>
                        {a.designation}
                      </MenuItem>
                    ))}
                  </TextField>
                  {showTvaCol && l.categorie && (
                    <Typography variant="caption" color="text.secondary">
                      {l.categorie}
                    </Typography>
                  )}
                </TableCell>
                <TableCell align="right" sx={{ width: 90 }}>
                  <TextField
                    type="number"
                    size="small"
                    value={l.qte}
                    onChange={(e) => updateLine(idx, { qte: e.target.value })}
                    inputProps={{ min: 0, style: { textAlign: 'right' } }}
                  />
                </TableCell>
                <TableCell align="right" sx={{ width: 120 }}>
                  <TextField
                    type="number"
                    size="small"
                    value={l.prix_unitaire}
                    onChange={(e) => updateLine(idx, { prix_unitaire: e.target.value })}
                    inputProps={{ min: 0, style: { textAlign: 'right' } }}
                  />
                </TableCell>
                {showRemiseLigne && (
                  <TableCell align="right" sx={{ width: 100 }}>
                    <TextField
                      type="number"
                      size="small"
                      value={l.remise}
                      onChange={(e) => updateLine(idx, { remise: e.target.value })}
                      inputProps={{ min: 0, max: 100, style: { textAlign: 'right' } }}
                    />
                  </TableCell>
                )}
                {showTvaCol && (
                  <TableCell align="right" sx={{ width: 90 }}>
                    <TextField
                      type="number"
                      size="small"
                      value={l.tva}
                      onChange={(e) => updateLine(idx, { tva: e.target.value })}
                      inputProps={{ min: 0, style: { textAlign: 'right' } }}
                    />
                  </TableCell>
                )}
                <TableCell align="right">
                  <Typography variant="body2" sx={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    {formatMAD(calcul.lignes[idx]?.totalLigne || 0)}
                  </Typography>
                </TableCell>
                <TableCell align="right" sx={{ width: 48 }}>
                  <Tooltip title="Supprimer la ligne">
                    <span>
                      <IconButton
                        size="small"
                        onClick={() => removeLine(idx)}
                        disabled={lignes.length === 1}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Button startIcon={<AddIcon />} onClick={addLine} sx={{ mt: 1.5 }}>
          Ajouter une ligne
        </Button>
      </Paper>

      {/* Totaux + action */}
      <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={7}>
            {error && (
              <Typography color="error" variant="body2" sx={{ mb: 1 }}>
                {error}
              </Typography>
            )}
            <Typography variant="body2" color="text.secondary">
              Les totaux se recalculent automatiquement selon la méthode choisie.
            </Typography>
          </Grid>
          <Grid item xs={12} md={5}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography color="text.secondary">Total HT</Typography>
              <Typography sx={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {formatMAD(calcul.totalHT)}
              </Typography>
            </Box>
            {calcul.totalRemise > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography color="text.secondary">Remise</Typography>
                <Typography sx={{ fontFamily: 'JetBrains Mono, monospace' }} color="error.main">
                  −{formatMAD(calcul.totalRemise)}
                </Typography>
              </Box>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography color="text.secondary">TVA</Typography>
              <Typography sx={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {formatMAD(calcul.totalTVA)}
              </Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography fontWeight={700}>Total TTC</Typography>
              <Typography
                fontWeight={700}
                sx={{ fontFamily: 'JetBrains Mono, monospace', color: 'secondary.dark' }}
              >
                {formatMAD(calcul.totalTTC)}
              </Typography>
            </Box>
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleSubmit}
              disabled={submitting}
            >
              Créer la facture
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  )
}
