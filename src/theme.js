import { createTheme } from '@mui/material/styles'

// Palette pensée pour un outil de facturation : encre profonde + or (l'argent),
// neutres froids, statuts lisibles. On évite le bleu MUI par défaut.
const ink = '#1F2A44'
const gold = '#B07A1E'

const theme = createTheme({
  palette: {
    primary: { main: ink, light: '#33425f', dark: '#141d31', contrastText: '#fff' },
    secondary: { main: gold, light: '#cd9a45', dark: '#8a5e12', contrastText: '#fff' },
    success: { main: '#2E7D5B' },
    warning: { main: '#C9821A' },
    error: { main: '#C0392B' },
    info: { main: '#2D6A9F' },
    background: { default: '#F5F6F8', paper: '#FFFFFF' },
    text: { primary: '#1B2233', secondary: '#5A6478' },
    divider: 'rgba(31,42,68,0.10)',
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
    h4: { fontFamily: '"Fraunces", serif', fontWeight: 600, letterSpacing: '-0.01em' },
    h5: { fontFamily: '"Fraunces", serif', fontWeight: 600, letterSpacing: '-0.01em' },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
    subtitle2: { fontWeight: 600 },
  },
  components: {
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
        outlined: { borderColor: 'rgba(31,42,68,0.12)' },
      },
    },
    MuiAppBar: {
      styleOverrides: { root: { backgroundColor: ink } },
    },
    MuiTableCell: {
      styleOverrides: {
        head: { fontWeight: 600, color: '#5A6478', backgroundColor: '#FAFBFC' },
      },
    },
  },
})

export default theme
