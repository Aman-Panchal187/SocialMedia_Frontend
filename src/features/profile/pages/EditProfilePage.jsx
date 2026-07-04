import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import AvatarUploader from '../components/AvatarUploader'
import EditProfileForm from '../components/EditProfileForm'
import { usersApi } from '../../../api/usersApi'
import { useAuthStore } from '../../../app/store'

export default function EditProfilePage() {
  const user = useAuthStore((state) => state.user)
  const setAuth = useAuthStore((state) => state.setAuth)
  const queryClient = useQueryClient()

  const privacyMutation = useMutation({
    mutationFn: usersApi.updatePrivacy,
    onSuccess: (res) => {
      // The API responds with { data: { user: {...} } } — read isPrivate off
      // the nested user, and write it back into authStore so this toggle's
      // state survives a refresh instead of reverting until some other fetch
      // happens to re-sync it.
      const updatedUser = res.data.user
      toast.success('Privacy setting updated')
      setAuth({ user: { ...user, ...updatedUser } })
      queryClient.setQueryData(['profile', user.username], (old) =>
        old ? { ...old, data: { ...old.data, ...updatedUser } } : old
      )
      queryClient.invalidateQueries({ queryKey: ['profile', user.username] })
    },
  })

  return (
    <div className="mx-auto max-w-lg p-4">
      <h1 className="mb-6 text-lg font-semibold">Edit profile</h1>

      <AvatarUploader />

      <div className="mt-6">
        <EditProfileForm />
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-800">
        <div>
          <p className="text-sm font-medium">Private account</p>
          <p className="text-xs text-gray-500">Only approved followers can see your posts</p>
        </div>
        <input
          type="checkbox"
          defaultChecked={user?.isPrivate}
          onChange={(e) => privacyMutation.mutate(e.target.checked)}
          className="h-5 w-5"
        />
      </div>
    </div>
  )
}
