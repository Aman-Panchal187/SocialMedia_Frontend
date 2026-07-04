import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Button from '../../../components/common/Button'
import Logo from '../../../components/common/Logo'
import { useAuth } from '../hooks/useAuth'

const loginSchema = z.object({
  identifier: z.string().min(1, 'Enter your email or username'),
  password: z.string().min(1, 'Enter your password'),
})

export default function LoginPage() {
  const { login, isLoginLoading } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (values) => {
    try {
      await login(values)
    } catch {
      // Error toast already surfaced by the axios interceptor.
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <div className="mb-6 flex justify-center">
        <Logo iconClassName="h-12 w-12" wordmarkClassName="text-2xl" />
      </div>
      <h1 className="mb-6 text-center text-2xl font-bold">Log in</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        <div>
          <label htmlFor="login-identifier" className="mb-1 block text-sm font-medium">
            Email or username
          </label>
          <input
            id="login-identifier"
            type="text"
            placeholder="Email or username"
            {...register('identifier')}
            className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand dark:border-gray-700"
          />
          {errors.identifier && <p className="mt-1 text-xs text-danger">{errors.identifier.message}</p>}
        </div>
        <div>
          <label htmlFor="login-password" className="mb-1 block text-sm font-medium">
            Password
          </label>
          <input
            id="login-password"
            type="password"
            placeholder="Password"
            {...register('password')}
            className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand dark:border-gray-700"
          />
          {errors.password && <p className="mt-1 text-xs text-danger">{errors.password.message}</p>}
        </div>
        <Button type="submit" isLoading={isLoginLoading}>
          Log in
        </Button>
      </form>
      <p className="mt-3 text-center text-sm">
        <Link to="/forgot-password" className="font-semibold text-brand">
          Forgot password?
        </Link>
      </p>
      <p className="mt-4 text-center text-sm">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="font-semibold text-brand">
          Sign up
        </Link>
      </p>
    </div>
  )
}
