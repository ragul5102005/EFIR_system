import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, FilePlus2, FolderKanban, UserRound, Cpu, Shield, X, CircleHelp } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth()
  const location = useLocation()
  const isOfficer = user?.role === 'police'
  const root = isOfficer ? '/police' : '/citizen'
  const links = [
    { to: `${root}/dashboard`, label: 'Overview', icon: LayoutDashboard, end: true },
    { to: `${root}/complaints`, label: isOfficer ? 'Case management' : 'My complaints', icon: FolderKanban },
    ...(!isOfficer ? [{ to: `${root}/complaints/new`, label: 'File a complaint', icon: FilePlus2 }] : []),
    { to: `${root}/vector-lab`, label: 'Intelligence lab', icon: Cpu },
    { to: '/profile', label: 'Profile settings', icon: UserRound },
  ]
  const title = links.find(item => location.pathname === item.to || (item.to !== `${root}/dashboard` && location.pathname.startsWith(item.to)))?.label || (isOfficer ? 'Police workspace' : 'Citizen workspace')

  return <>
    {open && <button aria-label="Close navigation" className="sidebar-scrim" onClick={onClose} />}
    <aside className={`app-sidebar ${open ? 'is-open' : ''}`} aria-label="Main navigation">
      <div className="sidebar-brand">
        <div className="brand-mark"><Shield size={19} strokeWidth={2.2} /></div>
        <div className="brand-copy"><strong>Aegis<span>FIR</span></strong><small>Incident response portal</small></div>
        <button className="sidebar-close" aria-label="Close navigation" onClick={onClose}><X size={18} /></button>
      </div>

      <div className="workspace-switcher">
        <div className={`workspace-avatar ${isOfficer ? 'officer' : ''}`}>{isOfficer ? 'PO' : 'CU'}</div>
        <div className="workspace-copy"><span>{isOfficer ? 'Officer workspace' : 'Citizen workspace'}</span><small>{user?.name || 'Account'}</small></div>
        <span className="workspace-dot" />
      </div>

      <div className="nav-caption">WORKSPACE</div>
      <nav className="primary-nav">
        {links.map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} onClick={onClose} className={() => {
          const isSelected = location.pathname === to || (to === `${root}/complaints` && location.pathname.startsWith(`${root}/complaints/`) && !location.pathname.endsWith('/new'))
          return `nav-link ${isSelected ? 'active' : ''}`
        }}>
          <Icon size={17} strokeWidth={1.9} /><span>{label}</span>{label === title && <span className="nav-current" />}
        </NavLink>)}
      </nav>

      <div className="sidebar-bottom">
        <div className="help-card"><div className="help-icon"><CircleHelp size={16} /></div><div><strong>Need assistance?</strong><span>Read about the portal</span></div></div>
        <div className="sidebar-foot"><span className="status-indicator" /> <span>All systems operational</span><span className="version-label">v2.0</span></div>
      </div>
    </aside>
  </>
}
