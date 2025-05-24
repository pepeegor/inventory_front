import { useForm } from 'react-hook-form'
import axios from '../../api/axiosClient'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { toast } from 'react-toastify'
import { FiUser, FiMail, FiLock, FiX, FiUserPlus } from 'react-icons/fi'

export default function RegisterModal({ isOpen, onClose, onSwitch }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()

  if (!isOpen) return null

  const onSubmit = async (data) => {
    try {
      await axios.post('/auth/register', data)
      toast.success('Регистрация прошла успешно')
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Ошибка регистрации')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-sm p-8 rounded-2xl shadow-2xl animate-fadeInUp bg-gradient-to-br from-[#23233a] via-[#181825] to-[#312e81] border border-violet-700/40 shadow-violet-900/40">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white text-xl">
          <FiX />
        </button>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex flex-col items-center gap-2 mb-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-violet-600 flex items-center justify-center text-white text-2xl shadow-lg shadow-violet-900/30 mb-1">
              <FiUserPlus />
            </div>
            <h2 className="text-2xl font-semibold text-center text-white mb-1 tracking-tight">Регистрация</h2>
            <div className="mx-auto w-12 h-1 rounded bg-gradient-to-r from-emerald-400 via-violet-500 to-pink-400 opacity-70 mb-2" />
          </div>
          <Input
            label="Имя пользователя"
            icon={<FiUser />}
            placeholder="Придумайте имя пользователя"
            className="focus:ring-2 focus:ring-violet-500/60 focus:border-violet-400/80 shadow-md shadow-violet-900/10"
            {...register('username', { required: 'Введите имя' })}
            error={errors.username?.message}
          />
          <Input
            label="Полное имя"
            icon={<FiUser />}
            placeholder="Введите ваше полное имя"
            className="focus:ring-2 focus:ring-violet-500/60 focus:border-violet-400/80 shadow-md shadow-violet-900/10"
            {...register('full_name', { required: 'Введите полное имя' })}
            error={errors.full_name?.message}
          />
          <Input
            label="E-mail"
            type="email"
            icon={<FiMail />}
            placeholder="Введите ваш e-mail"
            className="focus:ring-2 focus:ring-violet-500/60 focus:border-violet-400/80 shadow-md shadow-violet-900/10"
            {...register('email', { required: 'Введите e-mail' })}
            error={errors.email?.message}
          />
          <Input
            label="Пароль"
            type="password"
            icon={<FiLock />}
            placeholder="Придумайте пароль"
            className="focus:ring-2 focus:ring-violet-500/60 focus:border-violet-400/80 shadow-md shadow-violet-900/10"
            {...register('password', { required: 'Введите пароль' })}
            error={errors.password?.message}
          />
          <Button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-emerald-500 to-violet-600 hover:from-emerald-600 hover:to-violet-700 text-white font-semibold shadow-lg shadow-violet-900/20 transition-all">
            {isSubmitting ? 'Регистрирую...' : 'Зарегистрироваться'}
          </Button>
          <p className="text-sm text-gray-400 text-center mt-2">
            Уже есть аккаунт?{' '}
            <span className="text-violet-300 hover:underline cursor-pointer font-medium" onClick={onSwitch}>
              Войти
            </span>
          </p>
        </form>
      </div>
      <style>{`
        .drop-shadow-glow { text-shadow: 0 2px 16px #a78bfa44, 0 1px 2px #000; }
        .animate-fadeIn { animation: fadeIn 0.2s; }
        .animate-fadeInUp { animation: fadeInUp 0.3s; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(40px);} to { opacity: 1; transform: none; } }
      `}</style>
    </div>
  )
} 