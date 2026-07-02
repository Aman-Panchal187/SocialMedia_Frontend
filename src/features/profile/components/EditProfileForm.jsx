import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import Button from '../../../components/common/Button'
import { usersApi } from '../../../api/usersApi'
import { useAuthStore } from '../../../app/store'

const editProfileSchema = z.object({
  fullName: z.string().max(50, 'Full name is too long').optional().or(z.literal('')),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username is too long')
    .regex(/^[a-zA-Z0-9._]+$/, 'Only letters, numbers, dots and underscores'),
  bio: z.string().max(150, 'Bio must be under 150 characters').optional().or(z.literal('')),
})

export default function EditProfileForm() {
  const user = useAuthStore((state) => state.user)
  const setAuth = useAuthStore((state) => state.setAuth)
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      fullName: user?.fullName || '',
      username: user?.username || '',
      bio: user?.bio || '',
    },
  })

  const updateMutation = useMutation({
    mutationFn: usersApi.updateMe,
    onSuccess: (res) => {
      toast.success('Profile updated')
      setAuth({ user: { ...user, ...res.data } })
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
    onError: (error) => {
      const details = error?.response?.data?.error?.details
      if (Array.isArray(details)) {
        details.forEach((detail) => {
          if (detail.field) {
            setError(detail.field, { message: detail.message })
          }
        })
      }
    },
  })

  const onSubmit = (values) => updateMutation.mutate(values)

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Full name</label>
        <input
          type="text"
          {...register('fullName')}
          className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand dark:border-gray-700"
        />
        {errors.fullName && <p className="mt-1 text-xs text-danger">{errors.fullName.message}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Username</label>
        <input
          type="text"
          {...register('username')}
          className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand dark:border-gray-700"
        />
        {errors.username && <p className="mt-1 text-xs text-danger">{errors.username.message}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Bio</label>
        <textarea
          rows={3}
          {...register('bio')}
          className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand dark:border-gray-700"
        />
        {errors.bio && <p className="mt-1 text-xs text-danger">{errors.bio.message}</p>}
      </div>

      <Button type="submit" isLoading={updateMutation.isPending} className="self-start">
        Save changes
      </Button>
    </form>
  )
}
