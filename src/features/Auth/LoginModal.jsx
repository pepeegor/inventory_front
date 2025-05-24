import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../hooks/useAuth'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { FiMail, FiLock, FiX } from 'react-icons/fi'

export default function LoginModal({ isOpen, onClose, onSwitch }) {
  const { login, loading } = useAuth()
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      await login(data.email, data.password)
      onClose()
    } catch {
      // Error handled in AuthProvider
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#1f1f25] p-8 rounded-2xl w-full max-w-sm shadow-2xl relative animate-fadeInUp">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white text-xl">
          <FiX />
        </button>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
          <Button type="submit" disabled={isSubmitting || loading} className="w-full">
            {isSubmitting ? 'Вход...' : 'Войти'}
          </Button>
          <p className="text-sm text-gray-400 text-center">
            Нет аккаунта?{' '}
            <span className="text-blue-400 hover:underline cursor-pointer" onClick={onSwitch}>
              Зарегистрироваться
            </span>
          </p>
        </form>
      </div>
      <style>{`
        .animate-fadeIn { animation: fadeIn 0.2s; }
        .animate-fadeInUp { animation: fadeInUp 0.3s; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(40px);} to { opacity: 1; transform: none; } }
      `}</style>
    </div>
  )
} 