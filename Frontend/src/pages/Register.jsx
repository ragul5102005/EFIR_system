import React, { useState } from 'react'
import { ShieldCheck, ArrowRight, UserRound, Mail, LockKeyhole } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function Register() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async event => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await api.post('/auth/register', form)
      signIn(data.user)
      navigate('/citizen/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'We couldn’t create your account. Please try again.')
    } finally { setLoading(false) }
  }

  return <main className="auth-shell">
    <section className="auth-aside">
      <Link to="/login" className="auth-brand"><span className="auth-brand-mark"><ShieldCheck size={21} /></span><span><strong>AegisFIR</strong><small>Incident response portal</small></span></Link>
      <div className="auth-intro"><span className="auth-kicker">CITIZEN SERVICES PLATFORM</span><h1>Report an incident.<br />Stay informed.</h1><p>Create an account to submit a complaint, attach supporting evidence, and keep track of case updates.</p><div className="auth-feature-list"><div><span><UserRound size={16} /></span><div><strong>Your reports in one place</strong><small>Review complaint details and status changes.</small></div></div><div><span><Mail size={16} /></span><div><strong>Contact details saved securely</strong><small>Manage the information used for follow-up.</small></div></div></div></div>
      <div className="auth-footnote">Academic demonstration platform · Not an official police lodgment</div>
    </section>
    <section className="auth-content"><div className="auth-form-wrap">
      <div className="auth-form-heading"><span className="auth-kicker">GET STARTED</span><h2>Create your account</h2><p>Registration is available for citizens.</p></div>
      {error && <div className="inline-error" role="alert">{error}</div>}
      <form className="auth-form" onSubmit={handleSubmit}><div><label htmlFor="register-name">Full name</label><div className="auth-input-icon"><UserRound size={15} /><input id="register-name" type="text" autoComplete="name" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Enter your full name" /></div></div><div><label htmlFor="register-email">Email address</label><div className="auth-input-icon"><Mail size={15} /><input id="register-email" type="email" autoComplete="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" /></div></div><div><label htmlFor="register-password">Password</label><div className="auth-input-icon"><LockKeyhole size={15} /><input id="register-password" type="password" autoComplete="new-password" minLength={4} required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="At least 4 characters" /></div><small className="field-help">Use at least 4 characters.</small></div><button className="auth-submit" type="submit" disabled={loading}>{loading ? 'Creating account…' : 'Create account'}<ArrowRight size={16} /></button></form>
      <div className="auth-switch">Already registered? <Link to="/login">Sign in</Link></div>
    </div></section>
  </main>
}

