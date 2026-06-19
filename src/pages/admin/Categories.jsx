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
  Stack,
  Alert,
  InputAdornment,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined'
import { jsonService } from '../../services/jsonService'
import { PageHeader, EmptyState } from '../../components/ui'
import ConfirmDialog from '../../components/ConfirmDialog'

const empty = { nom: '', tva: 20 }

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState(null)
  const [toDelete, setToDelete] = useState(null)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      setCategories(await jsonService.getCategories())
    } catch {
      setError('JSON Server est-il démarré ? Lancez « npm run server ».')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    load()
  }, [])

  const save = async () => {
    const payload = { nom: form.nom, tva: Number(form.tva) || 0 }
    if (form.id) await jsonService.updateCategorie(form.id, payload)
    else await jsonService.addCategorie(payload)
    setForm(null)
    load()
  }

  const remove = async () => {
    await jsonService.deleteCategorie(toDelete.id)
    setToDelete(null)
    load()
  }

  return (
    <Box>
      <PageHeader
        title="Catégories"
        subtitle="Familles d'articles. Le taux de TVA sert à la méthode de facturation par catégorie."
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setForm(empty)}>
            Nouvelle catégorie
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
      ) : categories.length === 0 && !error ? (
        <EmptyState
          icon={<CategoryOutlinedIcon sx={{ fontSize: 40 }} />}
          title="Aucune catégorie"
          message="Créez des catégories pour organiser le catalogue et définir des taux de TVA."
          action={
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setForm(empty)}>
              Ajouter une catégorie
            </Button>
          }
        />
      ) : (
        <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden', maxWidth: 560 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nom</TableCell>
                <TableCell align="right">TVA</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.map((c) => (
                <TableRow key={c.id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{c.nom}</TableCell>
                  <TableCell align="right">{c.tva != null ? `${c.tva}%` : '—'}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                      <IconButton size="small" onClick={() => setForm({ ...c, tva: c.tva ?? 20 })}>
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => setToDelete(c)}>
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

      <Dialog open={Boolean(form)} onClose={() => setForm(null)} maxWidth="xs" fullWidth>
        <DialogTitle>{form?.id ? 'Modifier la catégorie' : 'Nouvelle catégorie'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Nom"
              value={form?.nom || ''}
              onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Taux de TVA"
              type="number"
              value={form?.tva ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, tva: e.target.value }))}
              InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button color="inherit" onClick={() => setForm(null)}>
            Annuler
          </Button>
          <Button variant="contained" onClick={save} disabled={!form?.nom}>
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Supprimer la catégorie"
        message={`Supprimer « ${toDelete?.nom} » ?`}
        confirmLabel="Supprimer"
        onConfirm={remove}
        onClose={() => setToDelete(null)}
      />
    </Box>
  )
}
