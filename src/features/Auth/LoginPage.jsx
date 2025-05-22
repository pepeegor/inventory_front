import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { FiMail, FiLock } from 'react-icons/fi'

export default function LoginPage() {
  const { login, loading } = useAuth()
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      await login(data.email, data.password)
      // Navigate is handled by the auth provider
    } catch {
      // Error handling is done in the AuthProvider
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121212]">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-[#1f1f25] p-8 rounded-lg w-full max-w-sm space-y-6"
      >
        <h2 className="text-2xl font-bold text-center">Вход</h2>

        <Input
          label="E-mail"
          type="email"
          icon={<FiMail />}
          {...register('email', { required: 'Введите e-mail' })}
          error={errors.email?.message}
        />

        <Input
          label="Пароль"
          type="password"
          icon={<FiLock />}
          {...register('password', { required: 'Введите пароль' })}
          error={errors.password?.message}
        />

        <Button 
          type="submit" 
          disabled={isSubmitting || loading} 
          className="w-full"
        >
          {isSubmitting ? 'Вход...' : 'Войти'}
        </Button>

        <p className="text-sm text-gray-400 text-center">
          Нет аккаунта?{' '}
          <Link to="/register" className="text-blue-400 hover:underline">
            Регистрация
          </Link>
        </p>
      </form>
    </div>
  )
}
