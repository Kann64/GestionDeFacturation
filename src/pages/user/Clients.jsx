import { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  CircularProgress,
  Stack,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined'
import { firebaseService } from '../../services/firebaseService'
import { useAuth } from '../../contexts/AuthContext'
import ClientForm from '../../components/ClientForm'
import ConfirmDialog from '../../components/ConfirmDialog'
import { EmptyState, PageHeader } from '../../components/ui'

export default function Clients() {
  const { profil } = useAuth()
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [toDelete, setToDelete] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      setClients(await firebaseService.getClients(profil?.societe_id))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profil?.societe_id])

  const handleSubmit = async (values) => {
    if (editing) await firebaseService.updateClient(editing.id, values)
    else await firebaseService.addClient({ ...values, societe_id: profil?.societe_id || null })
    setFormOpen(false)
    setEditing(null)
    load()
  }

  const handleDelete = async () => {
    await firebaseService.deleteClient(toDelete.id)
    setToDelete(null)
    load()
  }

  return (
    <Box>
      <PageHeader
        title="Clients"
        subtitle="Gérez votre carnet de clients."
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditing(null)
              setFormOpen(true)
            }}
          >
            Nouveau client
          </Button>
        }
      />

      {loading ? (
        <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : clients.length === 0 ? (
        <EmptyState
          icon={<PeopleOutlinedIcon sx={{ fontSize: 40 }} />}
          title="Aucun client pour l'instant"
          message="Ajoutez votre premier client pour commencer à facturer."
          action={
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setFormOpen(true)}>
              Ajouter un client
            </Button>
          }
        />
      ) : (
        <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nom</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Téléphone</TableCell>
                <TableCell>Adresse</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clients.map((c) => (
                <TableRow key={c.id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{c.nom}</TableCell>
                  <TableCell>{c.email}</TableCell>
                  <TableCell>{c.tel}</TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>{c.adresse}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setEditing(c)
                          setFormOpen(true)
                        }}
                      >
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

      <ClientForm
        open={formOpen}
        initial={editing}
        onSubmit={handleSubmit}
        onClose={() => {
          setFormOpen(false)
          setEditing(null)
        }}
      />
      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Supprimer le client"
        message={`Voulez-vous vraiment supprimer « ${toDelete?.nom} » ? Cette action est définitive.`}
        confirmLabel="Supprimer"
        onConfirm={handleDelete}
        onClose={() => setToDelete(null)}
      />
    </Box>
  )
}
