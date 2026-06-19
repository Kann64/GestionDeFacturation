import { useRef } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
} from '@mui/material'

export default function SignatureDialog({ open, onClose, onConfirm }) {
  const padRef = useRef(null)

  const handleClear = () => padRef.current?.clear()

  const handleConfirm = () => {
    if (!padRef.current || padRef.current.isEmpty()) return
    const dataUrl = padRef.current.getTrimmedCanvas().toDataURL('image/png')
    onConfirm(dataUrl)
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Apposer votre signature</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          Signez dans le cadre ci-dessous, puis confirmez pour enregistrer la signature sur la facture.
        </Typography>
        <Box
          sx={{
            border: '1.5px solid',
            borderColor: 'divider',
            borderRadius: 2,
            overflow: 'hidden',
            bgcolor: '#fafafa',
            cursor: 'crosshair',
          }}
        >
          <SignatureCanvas
            ref={padRef}
            penColor="#1F2A44"
            canvasProps={{ width: 520, height: 180, style: { display: 'block' } }}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClear} color="inherit">
          Effacer
        </Button>
        <Button onClick={onClose} color="inherit">
          Annuler
        </Button>
        <Button onClick={handleConfirm} variant="contained">
          Valider la signature
        </Button>
      </DialogActions>
    </Dialog>
  )
}
