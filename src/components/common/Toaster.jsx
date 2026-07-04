import { Toaster as HotToaster } from 'react-hot-toast'

export default function Toaster() {
  return (
    <HotToaster
      position="top-center"
      toastOptions={{
        duration: 3500,
        className: 'text-sm font-medium',
        style: {
          background: 'var(--color-surface)',
          color: 'var(--color-text)',
          border: '1px solid var(--color-border)',
          borderRadius: '0.75rem',
          boxShadow: '0 12px 32px -8px rgba(0, 0, 0, 0.25)',
          padding: '10px 14px',
        },
        success: { iconTheme: { primary: '#0095f6', secondary: '#ffffff' } },
        error: { iconTheme: { primary: '#ed4956', secondary: '#ffffff' } },
      }}
    />
  )
}
