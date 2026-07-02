import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import MobileTabBar from './MobileTabBar'
import CreatePostModal from '../../features/posts/components/CreatePostModal'

export default function AppLayout() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Navbar onCreateClick={() => setIsCreateOpen(true)} />
      <main className="pb-16 pt-4 sm:pb-4">
        <Outlet />
      </main>
      <MobileTabBar onCreateClick={() => setIsCreateOpen(true)} />
      <CreatePostModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </div>
  )
}
