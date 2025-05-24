import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { getMe, updateMe, changePassword } from '../../api/auth'
import AnimatedSection from '../../components/AnimatedSection'
import Loader from '../../components/ui/Loader'
import { FiUser, FiMail, FiKey, FiSave, FiShield, FiEdit2 } from 'react-icons/fi'
import { motion as Motion } from 'framer-motion'

export default function ProfilePage() {
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [formData, setFormData] = useState({ username: '', full_name: '' })
  const [passwordData, setPasswordData] = useState({ old_password: '', new_password: '', confirm_password: '' })

  // Получение профиля
  const { data: profile, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: getMe,
    onSuccess: (data) => {
      setFormData({ username: data.username || '', full_name: data.full_name || '' })
    }
  })

  // Мутация обновления профиля
  const updateProfileMutation = useMutation({
    mutationFn: (data) => updateMe(data),
    onSuccess: () => {
      toast.success('Профиль обновлен')
      queryClient.invalidateQueries(['me'])
      setIsEditing(false)
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Ошибка при обновлении профиля')
    }
  })

  // Мутация смены пароля
  const changePasswordMutation = useMutation({
    mutationFn: (data) => changePassword(data),
    onSuccess: () => {
      toast.success('Пароль успешно изменен')
      setIsChangingPassword(false)
      setPasswordData({ old_password: '', new_password: '', confirm_password: '' })
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Ошибка при смене пароля')
    }
  })

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }
  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value })
  }
  const handleSubmitProfile = (e) => {
    e.preventDefault()
    updateProfileMutation.mutate(formData)
  }
  const handleSubmitPassword = (e) => {
    e.preventDefault()
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('Пароли не совпадают')
      return
    }
    changePasswordMutation.mutate({
      old_password: passwordData.old_password,
      new_password: passwordData.new_password
    })
  }

  // Проверка: изменено ли хотя бы одно поле и не пустое ли оно
  const isProfileChanged = profile && (
    (formData.username !== profile.username && formData.username.trim() !== '') ||
    (formData.full_name !== profile.full_name && formData.full_name.trim() !== '')
  )

  if (isLoading) return <Loader />

  return (
    <AnimatedSection className="p-6 rounded-2xl bg-gradient-to-br from-[#181825] via-[#23233a] to-[#312e81] text-gray-100 animate-fadeIn overflow-hidden relative">
      {/* Фоновые эффекты */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-gradient-radial from-violet-600/30 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-radial from-amber-400/20 to-transparent rounded-full blur-2xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 w-1/2 h-1/2 bg-gradient-to-br from-pink-500/10 to-transparent rounded-full blur-2xl opacity-60" style={{ transform: 'translate(-50%, -50%)' }} />
      </div>
      <div className="relative z-10">
        <h2 className="text-3xl font-bold flex items-center gap-3 mb-8 drop-shadow-glow">
          <FiUser className="text-violet-400" /> Мой профиль
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Профиль */}
          <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-gradient-to-br from-violet-900/30 to-violet-800/20 border border-violet-500/20 rounded-xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2 text-xl font-semibold text-white"><FiUser className="text-violet-400" /> Личные данные</div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all border border-violet-500/20 ${isEditing ? 'bg-violet-700/30 text-violet-200' : 'bg-violet-700/10 text-violet-300 hover:bg-violet-700/20 hover:text-white'}`}
              >
                <FiEdit2 /> {isEditing ? 'Отмена' : 'Редактировать'}
              </button>
            </div>
            {isEditing ? (
              <form onSubmit={handleSubmitProfile} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Имя пользователя</label>
                  <div className="flex items-center gap-2 bg-[#23233a]/80 rounded-lg px-3 py-2">
                    <FiUser className="text-violet-400" />
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="bg-transparent outline-none text-white flex-1"
                      autoComplete="username"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Полное имя</label>
                  <div className="flex items-center gap-2 bg-[#23233a]/80 rounded-lg px-3 py-2">
                    <FiUser className="text-violet-400" />
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      className="bg-transparent outline-none text-white flex-1"
                      autoComplete="name"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 mt-2 bg-gradient-to-r from-violet-700 to-indigo-700 hover:from-violet-800 hover:to-indigo-800 text-white rounded-lg shadow transition-all border border-violet-500/20 disabled:opacity-60"
                  disabled={updateProfileMutation.isLoading || !isProfileChanged}
                >
                  <FiSave /> Сохранить
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <span className="text-sm text-gray-400">Имя пользователя</span>
                  <div className="flex items-center gap-2 text-lg font-medium text-white"><FiUser className="text-violet-400" /> {profile?.username || '—'}</div>
                </div>
                <div>
                  <span className="text-sm text-gray-400">Полное имя</span>
                  <div className="flex items-center gap-2 text-lg font-medium text-white">{profile?.full_name || '—'}</div>
                </div>
                <div>
                  <span className="text-sm text-gray-400">Email</span>
                  <div className="flex items-center gap-2 text-lg font-medium text-white"><FiMail className="text-violet-400" /> {profile?.email || '—'}</div>
                </div>
                <div>
                  <span className="text-sm text-gray-400">Роль</span>
                  <div className="flex items-center gap-2 text-lg font-medium text-white"><FiShield className="text-violet-400" /> {profile?.role || 'Пользователь'}</div>
                </div>
              </div>
            )}
          </Motion.div>
          {/* Смена пароля */}
          <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-gradient-to-br from-amber-900/30 to-amber-800/20 border border-amber-500/20 rounded-xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2 text-xl font-semibold text-white"><FiKey className="text-amber-400" /> Безопасность</div>
              <button
                onClick={() => setIsChangingPassword(!isChangingPassword)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all border border-amber-500/20 ${isChangingPassword ? 'bg-amber-700/30 text-amber-200' : 'bg-amber-700/10 text-amber-300 hover:bg-amber-700/20 hover:text-white'}`}
              >
                <FiEdit2 /> {isChangingPassword ? 'Отмена' : 'Сменить пароль'}
              </button>
            </div>
            {isChangingPassword ? (
              <form onSubmit={handleSubmitPassword} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Текущий пароль</label>
                  <div className="flex items-center gap-2 bg-[#23233a]/80 rounded-lg px-3 py-2">
                    <FiKey className="text-amber-400" />
                    <input
                      type="password"
                      name="old_password"
                      value={passwordData.old_password}
                      onChange={handlePasswordChange}
                      className="bg-transparent outline-none text-white flex-1"
                      autoComplete="current-password"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Новый пароль</label>
                  <div className="flex items-center gap-2 bg-[#23233a]/80 rounded-lg px-3 py-2">
                    <FiKey className="text-amber-400" />
                    <input
                      type="password"
                      name="new_password"
                      value={passwordData.new_password}
                      onChange={handlePasswordChange}
                      className="bg-transparent outline-none text-white flex-1"
                      autoComplete="new-password"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Подтверждение пароля</label>
                  <div className="flex items-center gap-2 bg-[#23233a]/80 rounded-lg px-3 py-2">
                    <FiKey className="text-amber-400" />
                    <input
                      type="password"
                      name="confirm_password"
                      value={passwordData.confirm_password}
                      onChange={handlePasswordChange}
                      className="bg-transparent outline-none text-white flex-1"
                      autoComplete="new-password"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 mt-2 bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white rounded-lg shadow transition-all border border-amber-500/20 disabled:opacity-60"
                  disabled={changePasswordMutation.isLoading}
                >
                  <FiSave /> Сменить пароль
                </button>
              </form>
            ) : (
              <div className="text-gray-400 py-4">
                <p>Здесь вы можете изменить свой пароль.</p>
              </div>
            )}
          </Motion.div>
        </div>
      </div>
    </AnimatedSection>
  )
}