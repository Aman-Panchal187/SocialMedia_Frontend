export function formatCallDuration(durationSec) {
  if (durationSec === null || durationSec === undefined || Number.isNaN(durationSec)) return null
  const totalSeconds = Math.max(0, Math.floor(durationSec))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

const STATUS_LABELS = {
  missed: 'Missed',
  completed: 'Completed',
  rejected: 'Declined',
  failed: 'Failed',
}

export function callStatusLabel(status) {
  return STATUS_LABELS[status] || 'Call'
}

export function isMissedCall(status) {
  return status === 'missed' || status === 'rejected' || status === 'failed'
}
