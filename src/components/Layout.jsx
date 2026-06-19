import { useState } from 'react'
import { Outlet, useNavigate, useLocation, Link as RouterLink } from 'react-router-dom'
import {
  AppBar,
  Badge,
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Chip,
  Popover,
  Stack,
  Button,
  useMediaQuery,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import MenuIcon from '@mui/icons-material/Menu'
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined'
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined'
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined'
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined'
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined'
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined'
import LogoutIcon from '@mui/icons-material/Logout'
import { useAuth } from '../contexts/AuthContext'
import { useNotifications } from '../contexts/NotificationContext'
import { ROLES } from '../utils/constants'
import { formatDate } from '../utils/format'

const DRAWER_W = 248

const NAV = {
  [ROLES.USER]: [
    { to: '/app', label: 'Tableau de bord', icon: <DashboardOutlinedIcon /> },
    { to: '/app/factures/nouvelle', label: 'Nouvelle facture', icon: <AddCircleOutlineIcon /> },
    { to: '/app/factures', label: 'Mes factures', icon: <ReceiptLongOutlinedIcon /> },
    { to: '/app/clients', label: 'Clients', icon: <PeopleOutlinedIcon /> },
  ],
  [ROLES.ADMIN]: [
    { to: '/admin', label: 'Tableau de bord', icon: <DashboardOutlinedIcon /> },
    { to: '/admin/validation', label: 'Validation factures', icon: <FactCheckOutlinedIcon /> },
    { to: '/admin/articles', label: 'Articles', icon: <Inventory2OutlinedIcon /> },
    { to: '/admin/categories', label: 'Catégories', icon: <CategoryOutlinedIcon /> },
    { to: '/admin/archives', label: 'Archives', icon: <ArchiveOutlinedIcon /> },
  ],
}

export default function Layout() {
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'))
  const [mobileOpen, setMobileOpen] = useState(false)
  const [anchor, setAnchor] = useState(null)
  const [notifAnchor, setNotifAnchor] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, profil, role, isAdmin, logout } = useAuth()
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()

  const items = NAV[role] || NAV[ROLES.USER]

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const initials = (profil?.nom || user?.email || '?').charAt(0).toUpperCase()

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar sx={{ gap: 1.25 }}>
        <Box
          sx={{
            width: 30,
            height: 30,
            borderRadius: 1.5,
            bgcolor: 'secondary.main',
            color: '#fff',
            display: 'grid',
            placeItems: 'center',
            fontFamily: 'Fraunces, serif',
            fontWeight: 700,
          }}
        >
          F
        </Box>
        <Typography sx={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 18 }}>
          Facturation
        </Typography>
      </Toolbar>
      <Divider />
      <List sx={{ px: 1, py: 1.5, flexGrow: 1 }}>
        {items.map((it) => {
          const active =
            location.pathname === it.to ||
            (it.to !== '/app' && it.to !== '/admin' && location.pathname.startsWith(it.to))
          return (
            <ListItemButton
              key={it.to}
              component={RouterLink}
              to={it.to}
              onClick={() => setMobileOpen(false)}
              selected={active}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                '&.Mui-selected': { bgcolor: 'rgba(31,42,68,0.08)' },
                '&.Mui-selected:hover': { bgcolor: 'rgba(31,42,68,0.12)' },
              }}
            >
              <ListItemIcon sx={{ minWidth: 38, color: active ? 'primary.main' : 'text.secondary' }}>
                {it.icon}
              </ListItemIcon>
              <ListItemText
                primary={it.label}
                primaryTypographyProps={{ fontSize: 14, fontWeight: active ? 600 : 500 }}
              />
            </ListItemButton>
          )
        })}
      </List>
      <Box sx={{ p: 2 }}>
        <Chip
          size="small"
          label={isAdmin ? 'Administrateur' : 'Agent'}
          color={isAdmin ? 'secondary' : 'default'}
          variant="outlined"
        />
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${DRAWER_W}px)` },
          ml: { md: `${DRAWER_W}px` },
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileOpen(true)}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography sx={{ flexGrow: 1, fontWeight: 600 }}>
            {isAdmin ? 'Espace administrateur' : 'Espace agent'}
          </Typography>

          {/* Cloche de notifications */}
          <IconButton color="inherit" onClick={(e) => setNotifAnchor(e.currentTarget)} size="small" sx={{ mr: 1 }}>
            <Badge badgeContent={unreadCount} color="error" max={99}>
              <NotificationsOutlinedIcon />
            </Badge>
          </IconButton>
          <Popover
            open={Boolean(notifAnchor)}
            anchorEl={notifAnchor}
            onClose={() => setNotifAnchor(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            PaperProps={{ sx: { width: 340, maxHeight: 420 } }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle2" fontWeight={700}>Notifications</Typography>
              {unreadCount > 0 && (
                <Button size="small" onClick={markAllAsRead} sx={{ fontSize: 11 }}>
                  Tout marquer lu
                </Button>
              )}
            </Stack>
            <Box sx={{ overflowY: 'auto', maxHeight: 340 }}>
              {notifications.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ p: 2.5, textAlign: 'center' }}>
                  Aucune notification
                </Typography>
              ) : (
                notifications.map((n) => (
                  <Box
                    key={n.id}
                    onClick={() => {
                      markAsRead(n.id)
                      if (n.facture_id) {
                        setNotifAnchor(null)
                        navigate(
                          isAdmin
                            ? '/admin/validation'
                            : `/app/factures/${n.facture_id}`,
                        )
                      }
                    }}
                    sx={{
                      px: 2,
                      py: 1.25,
                      cursor: n.facture_id ? 'pointer' : 'default',
                      bgcolor: n.lue ? 'transparent' : 'action.hover',
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      '&:hover': { bgcolor: 'action.selected' },
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: n.lue ? 400 : 600 }}>
                      {n.message}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(n.createdAt)}
                    </Typography>
                  </Box>
                ))
              )}
            </Box>
          </Popover>

          <IconButton onClick={(e) => setAnchor(e.currentTarget)} size="small">
            <Avatar sx={{ width: 34, height: 34, bgcolor: 'secondary.main', fontSize: 15 }}>
              {initials}
            </Avatar>
          </IconButton>
          <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
            <MenuItem disabled sx={{ opacity: 1 }}>
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  {profil?.nom || 'Utilisateur'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user?.email}
                </Typography>
              </Box>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Se déconnecter
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: DRAWER_W }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { width: DRAWER_W },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { width: DRAWER_W, borderRight: '1px solid rgba(31,42,68,0.08)' },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, width: { md: `calc(100% - ${DRAWER_W}px)` } }}>
        <Toolbar />
        <Box sx={{ p: { xs: 2, md: 3.5 }, maxWidth: 1200, mx: 'auto' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}
