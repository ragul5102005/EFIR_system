import React, { useState } from 'react'
import { Menu, ChevronDown, BarChart3, LogOut, UserRound, ShieldCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import MLMetricsModal from './MLMetricsModal'

const pageNames = {
  dashboard: 'Overview', complaints: 'Complaints', new: 'File a complaint', profile: 'Profile settings', 'vector-lab': 'Intelligence lab'
}

export default function Navbar({ onMenuToggle }) {
  const { user, signOut, signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [showMetrics, setShowMetrics] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const isOfficer = user?.role === 'police'
  const page = location.pathname.split('/').filter(Boolean).pop()
  const pageName = pageNames[page] || (page ? `Complaint ${page}` : 'Workspace')

  const quickSwitch = () => {
    const persona = isOfficer
      ? { id: 1, name: 'Ravi Kumar', email: 'ravi@gmail.com', role: 'citizen' }
      : { id: 10, name: 'Inspector K. Vijay', email: 'police@aegisfir.gov', role: 'police' }
    signIn(persona)
    setMenuOpen(false)
    navigate(isOfficer ? '/citizen/dashboard' : '/police/dashboard')
  }

  return <>
    <MLMetricsModal isOpen={showMetrics} onClose={() => setShowMetrics(false)} />
    <header className="app-topbar">
      <div className="topbar-left">
        <button className="mobile-menu-button" aria-label="Open navigation" onClick={onMenuToggle}><Menu size={20} /></button>
        <div className="breadcrumb"><span>Workspace</span><span className="breadcrumb-divider">/</span><strong>{pageName}</strong></div>
      </div>
      <div className="topbar-actions">
        <span className="secure-label"><ShieldCheck size={15} /> Secure portal</span>
        <button className="metrics-button" onClick={() => setShowMetrics(true)}><BarChart3 size={16} /><span>Model overview</span></button>
        <div className="user-menu-wrap">
          <button className="user-menu-trigger" onClick={() => setMenuOpen(value => !value)} aria-expanded={menuOpen}>
            <span className={`user-avatar ${isOfficer ? 'officer' : ''}`}>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
            <span className="user-menu-copy"><strong>{user?.name || 'Account'}</strong><small>{isOfficer ? 'Police officer' : 'Citizen'}</small></span>
            <ChevronDown size={15} className="user-chevron" />
          </button>
          {menuOpen && <>
            <button className="menu-dismiss" aria-label="Close account menu" onClick={() => setMenuOpen(false)} />
            <div className="user-dropdown">
              <Link to="/profile" onClick={() => setMenuOpen(false)}><UserRound size={15} /> Account settings</Link>
              <button onClick={quickSwitch}><ShieldCheck size={15} /> Switch demo role</button>
              <button className="logout-link" onClick={() => { signOut(); setMenuOpen(false); navigate('/login') }}><LogOut size={15} /> Sign out</button>
            </div>
          </>}
        </div>
      </div>
    </header>
  </>
}
