import { Toaster as HotToaster } from 'react-hot-toast'

export default function Toaster() {
  return (
    <HotToaster
      position="top-center"
      toastOptions={{
        duration: 3500,
        className: 'text-sm',
      }}
    />
  )
}
