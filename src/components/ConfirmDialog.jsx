import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material'

export default function ConfirmDialog({
  open,
  title = 'Confirmer',
  message,
  confirmLabel = 'Confirmer',
  confirmColor = 'error',
  onConfirm,
  onClose,
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          Annuler
        </Button>
        <Button onClick={onConfirm} variant="contained" color={confirmColor}>
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
