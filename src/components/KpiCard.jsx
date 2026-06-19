import { Paper, Box, Typography } from '@mui/material'

export function KpiCard({ label, value, icon, accent = 'primary.main', sub }) {
  return (
    <Paper variant="outlined" sx={{ p: 2.5, height: '100%', borderRadius: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: 0.3 }}>
            {label}
          </Typography>
          <Typography
            sx={{ mt: 0.5, fontFamily: 'JetBrains Mono, monospace', fontSize: 24, fontWeight: 600 }}
          >
            {value}
          </Typography>
          {sub && (
            <Typography variant="caption" color="text.secondary">
              {sub}
            </Typography>
          )}
        </Box>
        {icon && (
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 2,
              display: 'grid',
              placeItems: 'center',
              bgcolor: 'rgba(31,42,68,0.06)',
              color: accent,
            }}
          >
            {icon}
          </Box>
        )}
      </Box>
    </Paper>
  )
}

export default KpiCard
