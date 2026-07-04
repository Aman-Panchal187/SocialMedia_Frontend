import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Button from '../../../components/common/Button'
import Input from '../../../components/common/Input'
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
      <div className="animate-scale-in rounded-2xl border border-gray-200 bg-white p-6 shadow-card dark:border-gray-800 dark:bg-gray-900 sm:p-8">
        <h1 className="mb-6 text-center text-2xl font-bold">Log in</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
          <Input
            id="login-identifier"
            label="Email or username"
            type="text"
            placeholder="Email or username"
            error={errors.identifier?.message}
            {...register('identifier')}
          />
          <Input
            id="login-password"
            label="Password"
            type="password"
            placeholder="Password"
            error={errors.password?.message}
            {...register('password')}
          />
          <Button type="submit" isLoading={isLoginLoading} className="mt-2 w-full">
            Log in
          </Button>
        </form>
        <p className="mt-4 text-center text-sm">
          <Link to="/forgot-password" className="font-semibold text-brand transition-colors hover:text-brand-hover">
            Forgot password?
          </Link>
        </p>
      </div>
      <p className="mt-4 text-center text-sm">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="font-semibold text-brand transition-colors hover:text-brand-hover">
          Sign up
        </Link>
      </p>
    </div>
  )
}
