import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import ProtectedRoute from './ProtectedRoute'
import PublicRoute from './PublicRoute'
import PageLoader from '../components/common/PageLoader'

const RegisterPage = lazy(() => import('../features/auth/pages/RegisterPage'))
const VerifyOtpPage = lazy(() => import('../features/auth/pages/VerifyOtpPage'))
const LoginPage = lazy(() => import('../features/auth/pages/LoginPage'))
const ForgotPasswordPage = lazy(() => import('../features/auth/pages/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('../features/auth/pages/ResetPasswordPage'))

const FeedPage = lazy(() => import('../features/feed/pages/FeedPage'))
const ProfilePage = lazy(() => import('../features/profile/pages/ProfilePage'))
const EditProfilePage = lazy(() => import('../features/profile/pages/EditProfilePage'))
const ChatListPage = lazy(() => import('../features/chat/pages/ChatListPage'))
const ChatConversationPage = lazy(() => import('../features/chat/pages/ChatConversationPage'))
const CallHistoryPage = lazy(() => import('../features/calls/pages/CallHistoryPage'))
const SearchPage = lazy(() => import('../features/search/pages/SearchPage'))

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<PublicRoute />}>
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-otp" element={<VerifyOtpPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<FeedPage />} />
              <Route path="/edit-profile" element={<EditProfilePage />} />
              <Route path="/messages" element={<ChatListPage />} />
              <Route path="/messages/:username" element={<ChatConversationPage />} />
              <Route path="/calls" element={<CallHistoryPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/:username" element={<ProfilePage />} />
            </Route>
          </Route>

          <Route path="*" element={<FeedPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
