import { Box, Typography, Paper, Chip } from '@mui/material'
import { STATUT_LABELS, STATUT_COLORS } from '../utils/constants'

export function PageHeader({ title, subtitle, action }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 2,
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        mb: 3,
      }}
    >
      <Box>
        <Typography variant="h4" sx={{ fontSize: { xs: 26, md: 30 } }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {action}
    </Box>
  )
}

export function EmptyState({ icon, title, message, action }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 3,
        borderStyle: 'dashed',
        p: 6,
        textAlign: 'center',
        display: 'grid',
        placeItems: 'center',
        gap: 1.5,
      }}
    >
      <Box sx={{ color: 'text.secondary' }}>{icon}</Box>
      <Typography variant="h6">{title}</Typography>
      <Typography color="text.secondary" sx={{ maxWidth: 420 }}>
        {message}
      </Typography>
      {action && <Box sx={{ mt: 1 }}>{action}</Box>}
    </Paper>
  )
}

export function StatutChip({ statut, size = 'small' }) {
  return (
    <Chip
      size={size}
      label={STATUT_LABELS[statut] || statut}
      color={STATUT_COLORS[statut] || 'default'}
      variant="outlined"
    />
  )
}
