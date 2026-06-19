import { useFormik } from 'formik'
import * as Yup from 'yup'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
} from '@mui/material'

const schema = Yup.object({
  nom: Yup.string().trim().required('Le nom est obligatoire').min(2, 'Trop court'),
  email: Yup.string().email('Email invalide').required('Email obligatoire'),
  tel: Yup.string()
    .matches(/^[0-9+\s().-]{6,}$/, 'Téléphone invalide')
    .required('Téléphone obligatoire'),
  adresse: Yup.string().trim().required('Adresse obligatoire'),
})

export default function ClientForm({ open, initial, onSubmit, onClose }) {
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      nom: initial?.nom || '',
      email: initial?.email || '',
      tel: initial?.tel || '',
      adresse: initial?.adresse || '',
    },
    validationSchema: schema,
    onSubmit: async (values, helpers) => {
      await onSubmit(values)
      helpers.resetForm()
    },
  })

  const field = (name, label, props = {}) => (
    <TextField
      fullWidth
      name={name}
      label={label}
      value={formik.values[name]}
      onChange={formik.handleChange}
      onBlur={formik.handleBlur}
      error={formik.touched[name] && Boolean(formik.errors[name])}
      helperText={formik.touched[name] && formik.errors[name]}
      {...props}
    />
  )

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initial ? 'Modifier le client' : 'Nouveau client'}</DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={12}>
              {field('nom', 'Nom / Raison sociale')}
            </Grid>
            <Grid item xs={12} sm={6}>
              {field('email', 'Email', { type: 'email' })}
            </Grid>
            <Grid item xs={12} sm={6}>
              {field('tel', 'Téléphone')}
            </Grid>
            <Grid item xs={12}>
              {field('adresse', 'Adresse', { multiline: true, rows: 2 })}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} color="inherit">
            Annuler
          </Button>
          <Button type="submit" variant="contained" disabled={formik.isSubmitting}>
            {initial ? 'Enregistrer' : 'Ajouter'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
