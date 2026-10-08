import React, { useState } from 'react'
import { Check, Save, UserRound, Mail, ShieldCheck, Phone, LockKeyhole } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function Profile() {
  const { user, signIn } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [contactInfo, setContactInfo] = useState(user?.contact_info || '')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async event => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)
    try {
      const { data } = await api.patch(`/auth/profile/${user.id}`, { name, contact_info: contactInfo })
      signIn(data)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not update your profile. Please try again.')
    } finally { setSaving(false) }
  }

  return <div className="page-stack settings-page">
    <section className="page-heading"><div><div className="eyebrow"><span className="eyebrow-icon"><UserRound size={14} /></span> ACCOUNT</div><h1>Profile settings</h1><p>Update the contact details associated with your account.</p></div></section>
    <div className="settings-grid">
      <section className="settings-card"><h2>Personal details</h2>
        {success && <div className="success-message"><Check size={15} /> Your profile has been updated.</div>}
        {error && <div className="inline-error" role="alert">{error}</div>}
        <form onSubmit={handleSave}>
          <div><label htmlFor="profile-name">Full name</label><input id="profile-name" type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Enter your full name" /><small className="field-help">This name appears on your complaint records.</small></div>
          <div><label htmlFor="profile-email">Email address</label><div className="input-with-icon"><Mail size={15} /><input id="profile-email" type="email" disabled value={user?.email || ''} /><LockKeyhole size={13} className="input-lock" /></div><small className="field-help">Email cannot be changed in this demonstration.</small></div>
          <div><label htmlFor="profile-contact">Phone or alternate contact</label><div className="input-with-icon"><Phone size={15} /><input id="profile-contact" type="text" value={contactInfo} onChange={e => setContactInfo(e.target.value)} placeholder="Add a phone number or alternate email" /></div><small className="field-help">Optional contact information for follow-up.</small></div>
          <div className="settings-actions"><button className="primary-button" type="submit" disabled={saving}><Save size={15} />{saving ? 'Saving changes…' : 'Save changes'}</button></div>
        </form>
      </section>
      <aside className="settings-aside"><div className="profile-avatar">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</div><h2>{user?.name || 'Account holder'}</h2><p>{user?.role === 'police' ? 'Police officer' : 'Registered citizen'}</p><div className="profile-detail"><span>Account type</span><strong>{user?.role === 'police' ? 'Officer' : 'Citizen'}</strong></div><div className="profile-detail"><span>Email</span><strong>{user?.email}</strong></div><div className="profile-security"><ShieldCheck size={15} /><span>Profile information is stored with your account.</span></div></aside>
    </div>
  </div>
}
