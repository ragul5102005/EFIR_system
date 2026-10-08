import React from 'react'
import { Clock, Search, ShieldAlert, CheckCircle2, Archive } from 'lucide-react'

const STATUS_CONFIG = {
  SUBMITTED: {
    label: 'Submitted',
    color: 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/20',
    dot: 'bg-blue-500',
    icon: Clock
  },
  UNDER_REVIEW: {
    label: 'Under Review',
    color: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20',
    dot: 'bg-amber-500',
    icon: Search
  },
  INVESTIGATION: {
    label: 'Investigation',
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-indigo-500/20',
    dot: 'bg-indigo-500',
    icon: ShieldAlert
  },
  ACTION_TAKEN: {
    label: 'Action Taken',
    color: 'bg-teal-50 text-teal-700 border-teal-200 ring-teal-500/20',
    dot: 'bg-teal-500',
    icon: CheckCircle2
  },
  CLOSED: {
    label: 'Closed',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20',
    dot: 'bg-emerald-500',
    icon: Archive
  }
}

export default function StatusBadge({ status, size = 'md' }) {
  const normStatus = (status || 'SUBMITTED').toUpperCase().replace(' ', '_')
  const config = STATUS_CONFIG[normStatus] || STATUS_CONFIG.SUBMITTED
  const Icon = config.icon

  const sizeClasses = size === 'sm' 
    ? 'text-xs px-2.5 py-0.5 gap-1.5' 
    : 'text-xs font-semibold px-3 py-1 gap-2'

  return (
    <span className={`status-badge inline-flex items-center rounded-full border ring-1 ${config.color} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <Icon className="w-3.5 h-3.5" />
      <span>{config.label}</span>
    </span>
  )
}
