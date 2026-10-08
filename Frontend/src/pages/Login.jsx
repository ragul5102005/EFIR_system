import React, { useState } from 'react'
import { ShieldCheck, ArrowRight, UserRound, BadgeCheck, Database, Fingerprint, CircleHelp } from 'lucide-react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function Login() {
  const { user, signIn } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: 'ravi@gmail.com', password: 'demo123' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) return <Navigate to={user.role === 'police' ? '/police/dashboard' : '/citizen/dashboard'} replace />

  const handleSubmit = async event => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await api.post('/auth/login', form)
      signIn(data.user)
      navigate(data.user.role === 'police' ? '/police/dashboard' : '/citizen/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'We couldn’t sign you in. Check your email and password.')
    } finally { setLoading(false) }
  }
  const loadDemo = (email, password) => { setForm({ email, password }); setError('') }

  return <main className="auth-shell">
    <section className="auth-aside">
      <Link to="/login" className="auth-brand"><span className="auth-brand-mark"><ShieldCheck size={21} /></span><span><strong>AegisFIR</strong><small>Incident response portal</small></span></Link>
      <div className="auth-intro"><span className="auth-kicker">CITIZEN SERVICES PLATFORM</span><h1>Clear reporting.<br />Better follow-through.</h1><p>One place to submit incident reports, keep your information organized, and follow each update.</p>
        <div className="auth-feature-list"><div><span><BadgeCheck size={16} /></span><div><strong>Structured complaint intake</strong><small>Keep incident details and supporting documents together.</small></div></div><div><span><Fingerprint size={16} /></span><div><strong>Evidence integrity records</strong><small>Uploaded files receive a verifiable integrity hash.</small></div></div><div><span><Database size={16} /></span><div><strong>Research tools included</strong><small>Explore related cases and statutory references.</small></div></div></div>
      </div>
      <div className="auth-footnote">Academic demonstration platform · Not an official police lodgment</div>
    </section>
    <section className="auth-content"><div className="auth-form-wrap">
      <div className="auth-form-heading"><span className="auth-kicker">WELCOME BACK</span><h2>Sign in to your account</h2><p>Use your registered email address to continue.</p></div>
      <div className="demo-access"><div><strong>Demo accounts</strong><span>Choose a profile to fill the sign-in form.</span></div><div className="demo-buttons"><button type="button" onClick={() => loadDemo('ravi@gmail.com', 'demo123')} className={form.email === 'ravi@gmail.com' ? 'selected' : ''}><UserRound size={15} /><span><strong>Citizen</strong><small>ravi@gmail.com</small></span></button><button type="button" onClick={() => loadDemo('police@aegisfir.com', 'police123')} className={form.email === 'police@aegisfir.com' ? 'selected officer-demo' : ''}><ShieldCheck size={15} /><span><strong>Officer</strong><small>police@aegisfir.com</small></span></button></div></div>
      {error && <div className="inline-error" role="alert">{error}</div>}
      <form className="auth-form" onSubmit={handleSubmit}><div><label htmlFor="login-email">Email address</label><input id="login-email" type="email" autoComplete="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" /></div><div><div className="auth-label-line"><label htmlFor="login-password">Password</label><button type="button" className="help-link" title="Use the demo account details above"><CircleHelp size={13} /> Demo help</button></div><input id="login-password" type="password" autoComplete="current-password" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Enter your password" /></div><button className="auth-submit" type="submit" disabled={loading}>{loading ? 'Signing in…' : 'Continue'}<ArrowRight size={16} /></button></form>
      <div className="auth-switch">New to AegisFIR? <Link to="/register">Create a citizen account</Link></div>
      <div className="auth-legal">By continuing, you acknowledge this is an academic prototype for demonstration purposes.</div>
    </div></section>
  </main>
}
