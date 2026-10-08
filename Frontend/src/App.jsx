import React, { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'

import Login from './pages/Login'
import Register from './pages/Register'
import CitizenDashboard from './pages/CitizenDashboard'
import PoliceDashboard from './pages/PoliceDashboard'
import ComplaintNew from './pages/ComplaintNew'
import ComplaintDetail from './pages/ComplaintDetail'
import ComplaintList from './pages/ComplaintList'
import Profile from './pages/Profile'
import VectorIntelligenceLab from './pages/VectorIntelligenceLab'

function PrivateRoute({ children, requiredRole }) {
  const { user } = useAuth()
  if (!user) {
    return <Navigate to="/login" replace />
  }
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === 'police' ? '/police/dashboard' : '/citizen/dashboard'} replace />
  }
  return children
}

function Layout({ children }) {
  const [navigationOpen, setNavigationOpen] = useState(false)
  return (
    <div className="app-shell">
      <Sidebar open={navigationOpen} onClose={() => setNavigationOpen(false)} />
      <div className="app-workspace">
        <Navbar onMenuToggle={() => setNavigationOpen(value => !value)} />
        <main className="app-main">{children}</main>
        <footer className="app-footer"><span>AEGISFIR · CITIZEN SERVICES</span><span>Academic demonstration platform</span></footer>
      </div>
    </div>
  )
}

export default function App() {
  const { user } = useAuth()

  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Root Redirect based on role */}
      <Route
        path="/"
        element={
          user ? (
            <Navigate to={user.role === 'police' ? '/police/dashboard' : '/citizen/dashboard'} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Citizen Portal Routes */}
      <Route
        path="/citizen/dashboard"
        element={
          <PrivateRoute requiredRole="citizen">
            <Layout><CitizenDashboard /></Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/citizen/complaints"
        element={
          <PrivateRoute requiredRole="citizen">
            <Layout><ComplaintList /></Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/citizen/complaints/new"
        element={
          <PrivateRoute requiredRole="citizen">
            <Layout><ComplaintNew /></Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/citizen/complaints/:id"
        element={
          <PrivateRoute requiredRole="citizen">
            <Layout><ComplaintDetail /></Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/citizen/vector-lab"
        element={
          <PrivateRoute requiredRole="citizen">
            <Layout><VectorIntelligenceLab /></Layout>
          </PrivateRoute>
        }
      />

      {/* Police Console Routes */}
      <Route
        path="/police/dashboard"
        element={
          <PrivateRoute requiredRole="police">
            <Layout><PoliceDashboard /></Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/police/vector-lab"
        element={
          <PrivateRoute requiredRole="police">
            <Layout><VectorIntelligenceLab /></Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/police/complaints"
        element={
          <PrivateRoute requiredRole="police">
            <Layout><ComplaintList /></Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/police/complaints/:id"
        element={
          <PrivateRoute requiredRole="police">
            <Layout><ComplaintDetail /></Layout>
          </PrivateRoute>
        }
      />

      {/* Shared Profile & Fallback Routes */}
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <Layout><Profile /></Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/vector-lab"
        element={
          <PrivateRoute>
            <Layout><VectorIntelligenceLab /></Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/complaints"
        element={
          <PrivateRoute>
            <Layout><ComplaintList /></Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/complaints/:id"
        element={
          <PrivateRoute>
            <Layout><ComplaintDetail /></Layout>
          </PrivateRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
