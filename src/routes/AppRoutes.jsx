import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from '../components/ProtectedRoute'
import Layout from '../components/Layout'
import Login from '../pages/Login'
import Register from '../pages/Register'
import UserDashboard from '../pages/user/UserDashboard'
import Clients from '../pages/user/Clients'
import FactureCreate from '../pages/user/FactureCreate'
import FactureHistory from '../pages/user/FactureHistory'
import FactureDetail from '../pages/user/FactureDetail'
import AdminDashboard from '../pages/admin/AdminDashboard'
import Articles from '../pages/admin/Articles'
import Categories from '../pages/admin/Categories'
import ValidationFactures from '../pages/admin/ValidationFactures'
import Archives from '../pages/admin/Archives'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Espace agent / comptable */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<UserDashboard />} />
        <Route path="clients" element={<Clients />} />
        <Route path="factures" element={<FactureHistory />} />
        <Route path="factures/nouvelle" element={<FactureCreate />} />
        <Route path="factures/:id" element={<FactureDetail />} />
      </Route>

      {/* Espace administrateur */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requireAdmin>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="validation" element={<ValidationFactures />} />
        <Route path="articles" element={<Articles />} />
        <Route path="categories" element={<Categories />} />
        <Route path="archives" element={<Archives />} />
      </Route>

      <Route path="/" element={<Navigate to="/app" replace />} />
      <Route path="*" element={<Navigate to="/app" replace />} />
    </Routes>
  )
}
