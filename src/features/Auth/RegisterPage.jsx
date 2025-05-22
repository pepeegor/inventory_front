import React from 'react'
import { useForm } from 'react-hook-form'
import axios from '../../api/axiosClient'
import { useNavigate } from 'react-router-dom'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { toast } from 'react-toastify'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()

  const onSubmit = async (data) => {
    try {
      await axios.post('/auth/register', data)
      toast.success('Регистрация прошла успешно')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Ошибка регистрации')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121212]">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-[#1f1f25] p-8 rounded-lg w-full max-w-sm space-y-6"
      >
        <h2 className="text-2xl font-bold text-center">Регистрация</h2>

        <Input
          label="Имя пользователя"
          {...register('username', { required: 'Введите имя' })}
          error={errors.username?.message}
        />

        <Input
          label="Полное имя"
          {...register('full_name', { required: 'Введите полное имя' })}
          error={errors.full_name?.message}
        />

        <Input
          label="E-mail"
          type="email"
          {...register('email', { required: 'Введите e-mail' })}
          error={errors.email?.message}
        />

        <Input
          label="Пароль"
          type="password"
          {...register('password', { required: 'Введите пароль' })}
          error={errors.password?.message}
        />

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Регистрирую...' : 'Зарегистрироваться'}
        </Button>

        <p className="text-sm text-gray-400 text-center">
          Уже есть аккаунт?{' '}
          <span
            className="text-blue-400 hover:underline cursor-pointer"
            onClick={() => navigate('/login')}
          >
            Войти
          </span>
        </p>
      </form>
    </div>
  )
}
