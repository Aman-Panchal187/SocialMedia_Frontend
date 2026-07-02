import { describe, it, expect } from 'vitest'
import { callStatusLabel, formatCallDuration, isMissedCall } from './callHelpers'

describe('formatCallDuration', () => {
  it('formats seconds as m:ss', () => {
    expect(formatCallDuration(125)).toBe('2:05')
  })

  it('pads single-digit seconds', () => {
    expect(formatCallDuration(61)).toBe('1:01')
  })

  it('formats zero seconds', () => {
    expect(formatCallDuration(0)).toBe('0:00')
  })

  it('formats durations under a minute', () => {
    expect(formatCallDuration(45)).toBe('0:45')
  })

  it('returns null for missing duration', () => {
    expect(formatCallDuration(null)).toBeNull()
    expect(formatCallDuration(undefined)).toBeNull()
  })
})

describe('callStatusLabel', () => {
  it('maps known statuses to display labels', () => {
    expect(callStatusLabel('missed')).toBe('Missed')
    expect(callStatusLabel('completed')).toBe('Completed')
    expect(callStatusLabel('rejected')).toBe('Declined')
    expect(callStatusLabel('failed')).toBe('Failed')
  })

  it('falls back to a generic label for an unknown status', () => {
    expect(callStatusLabel('unknown')).toBe('Call')
  })
})

describe('isMissedCall', () => {
  it('flags missed, rejected, and failed as missed-style', () => {
    expect(isMissedCall('missed')).toBe(true)
    expect(isMissedCall('rejected')).toBe(true)
    expect(isMissedCall('failed')).toBe(true)
  })

  it('does not flag completed calls', () => {
    expect(isMissedCall('completed')).toBe(false)
  })
})
