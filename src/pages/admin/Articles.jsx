import { useEffect, useState } from 'react'
import {
  Box,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Stack,
  Alert,
  Chip,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import { jsonService } from '../../services/jsonService'
import { PageHeader, EmptyState } from '../../components/ui'
import ConfirmDialog from '../../components/ConfirmDialog'
import { formatMAD } from '../../utils/format'

const empty = { designation: '', prix_unitaire: '', categorie_id: '' }

export default function Articles() {
  const [articles, setArticles] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState(null) // null = fermé
  const [toDelete, setToDelete] = useState(null)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [a, c] = await Promise.all([jsonService.getArticles(), jsonService.getCategories()])
      setArticles(a)
      setCategories(c)
    } catch {
      setError('JSON Server est-il démarré ? Lancez « npm run server ».')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    load()
  }, [])

  const catNom = (id) => categories.find((c) => String(c.id) === String(id))?.nom || '—'

  const save = async () => {
    const payload = {
      designation: form.designation,
      prix_unitaire: Number(form.prix_unitaire) || 0,
      categorie_id: form.categorie_id ? Number(form.categorie_id) : null,
    }
    if (form.id) await jsonService.updateArticle(form.id, payload)
    else await jsonService.addArticle(payload)
    setForm(null)
    load()
  }

  const remove = async () => {
    await jsonService.deleteArticle(toDelete.id)
    setToDelete(null)
    load()
  }

  return (
    <Box>
      <PageHeader
        title="Articles"
        subtitle="Catalogue des produits et services facturables."
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setForm(empty)}>
            Nouvel article
          </Button>
        }
      />

      {error && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : articles.length === 0 && !error ? (
        <EmptyState
          icon={<Inventory2OutlinedIcon sx={{ fontSize: 40 }} />}
          title="Catalogue vide"
          message="Ajoutez vos premiers articles pour les rendre disponibles à la facturation."
          action={
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setForm(empty)}>
              Ajouter un article
            </Button>
          }
        />
      ) : (
        <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Désignation</TableCell>
                <TableCell>Catégorie</TableCell>
                <TableCell align="right">Prix unitaire</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {articles.map((a) => (
                <TableRow key={a.id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{a.designation}</TableCell>
                  <TableCell>
                    <Chip size="small" variant="outlined" label={catNom(a.categorie_id)} />
                  </TableCell>
                  <TableCell align="right" sx={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    {formatMAD(a.prix_unitaire)}
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                      <IconButton size="small" onClick={() => setForm({ ...a, prix_unitaire: a.prix_unitaire, categorie_id: a.categorie_id ?? '' })}>
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => setToDelete(a)}>
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      <Dialog open={Boolean(form)} onClose={() => setForm(null)} maxWidth="sm" fullWidth>
        <DialogTitle>{form?.id ? "Modifier l'article" : 'Nouvel article'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Désignation"
              value={form?.designation || ''}
              onChange={(e) => setForm((f) => ({ ...f, designation: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Prix unitaire (DH)"
              type="number"
              value={form?.prix_unitaire ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, prix_unitaire: e.target.value }))}
              fullWidth
            />
            <TextField
              select
              label="Catégorie"
              value={form?.categorie_id ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, categorie_id: e.target.value }))}
              fullWidth
            >
              <MenuItem value="">
                <em>Aucune</em>
              </MenuItem>
              {categories.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.nom}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button color="inherit" onClick={() => setForm(null)}>
            Annuler
          </Button>
          <Button variant="contained" onClick={save} disabled={!form?.designation}>
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Supprimer l'article"
        message={`Supprimer « ${toDelete?.designation} » du catalogue ?`}
        confirmLabel="Supprimer"
        onConfirm={remove}
        onClose={() => setToDelete(null)}
      />
    </Box>
  )
}
