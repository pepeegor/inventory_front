import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { useAuth } from '../../hooks/useAuth'
import AnimatedSection from '../../components/AnimatedSection'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Loader from '../../components/ui/Loader'
import { FiUser, FiMail, FiKey, FiSave } from 'react-icons/fi'
import { getUserProfile, updateUserProfile, changeUserPassword } from '../../api/auth'

export default function ProfilePage() {
  const { updateUserInfo } = useAuth()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  
  // Form state - only include fields we can update
  const [formData, setFormData] = useState({
    username: '',
    full_name: ''
  })
  
  // Password state - using correct field names
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  })

  // Fetch user profile data
  const { data: profile, isLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: getUserProfile,
    onSuccess: (data) => {
      setFormData({
        username: data.username || '',
        full_name: data.full_name || ''
      })
    }
  })

  // Update profile mutation - only send username and full_name
  const updateProfileMutation = useMutation({
    mutationFn: (data) => updateUserProfile({
      username: data.username,
      full_name: data.full_name
    }),
    onSuccess: (data) => {
      toast.success('Профиль обновлен')
      queryClient.invalidateQueries(['userProfile'])
      setIsEditing(false)
      // Update auth context with new user info
      updateUserInfo(data)
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Ошибка при обновлении профиля')
    }
  })
  
  // Change password mutation - use correct parameter names
  const changePasswordMutation = useMutation({
    mutationFn: (data) => changeUserPassword({
      old_password: data.old_password,
      new_password: data.new_password
    }),
    onSuccess: () => {
      toast.success('Пароль успешно изменен')
      setIsChangingPassword(false)
      setPasswordData({
        old_password: '',
        new_password: '',
        confirm_password: ''
      })
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Ошибка при смене пароля')
    }
  })

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    })
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

  if (isLoading) return <Loader />

  return (
    <AnimatedSection className="p-6 bg-[#1f2937] rounded-lg text-gray-100">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <FiUser className="text-[#8e6fff]" /> Мой профиль
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Info Section */}
        <div className="bg-[#111827] p-6 rounded-lg border border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">Личные данные</h3>
            <Button 
              onClick={() => setIsEditing(!isEditing)} 
              variant={isEditing ? "secondary" : "primary"}
              size="sm"
            >
              {isEditing ? 'Отмена' : 'Редактировать'}
            </Button>
          </div>
          
          {isEditing ? (
            <form onSubmit={handleSubmitProfile} className="space-y-4">
              <Input
                label="Имя пользователя"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                icon={<FiUser />}
              />
              <Input
                label="Полное имя"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
              />
              <Button 
                type="submit" 
                className="w-full mt-4"
                isLoading={updateProfileMutation.isLoading}
              >
                <FiSave className="mr-2" /> Сохранить
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="text-gray-300">
                <span className="text-sm text-gray-500">Имя пользователя</span>
                <p className="font-medium">{profile?.username || '—'}</p>
              </div>
              <div className="text-gray-300">
                <span className="text-sm text-gray-500">Полное имя</span>
                <p className="font-medium">{profile?.full_name || '—'}</p>
              </div>
              <div className="text-gray-300">
                <span className="text-sm text-gray-500">Email</span>
                <p className="font-medium">{profile?.email || '—'}</p>
              </div>
              <div className="text-gray-300">
                <span className="text-sm text-gray-500">Роль</span>
                <p className="font-medium">{profile?.role || 'Пользователь'}</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Password Change Section - updated field name from current_password to old_password */}
        <div className="bg-[#111827] p-6 rounded-lg border border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">Безопасность</h3>
            <Button 
              onClick={() => setIsChangingPassword(!isChangingPassword)} 
              variant={isChangingPassword ? "secondary" : "primary"}
              size="sm"
            >
              {isChangingPassword ? 'Отмена' : 'Сменить пароль'}
            </Button>
          </div>
          
          {isChangingPassword ? (
            <form onSubmit={handleSubmitPassword} className="space-y-4">
              <Input
                label="Текущий пароль"
                name="old_password"
                type="password"
                value={passwordData.old_password}
                onChange={handlePasswordChange}
                icon={<FiKey />}
              />
              <Input
                label="Новый пароль"
                name="new_password"
                type="password"
                value={passwordData.new_password}
                onChange={handlePasswordChange}
                icon={<FiKey />}
              />
              <Input
                label="Подтверждение пароля"
                name="confirm_password"
                type="password"
                value={passwordData.confirm_password}
                onChange={handlePasswordChange}
                icon={<FiKey />}
              />
              <Button 
                type="submit" 
                className="w-full mt-4"
                isLoading={changePasswordMutation.isLoading}
              >
                <FiSave className="mr-2" /> Сменить пароль
              </Button>
            </form>
          ) : (
            <div className="text-gray-400 py-4">
              <p>Здесь вы можете изменить свой пароль.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Activity Section */}
      <div className="mt-8 bg-[#111827] p-6 rounded-lg border border-gray-700">
        <h3 className="text-xl font-semibold mb-4">Активность</h3>
        <div className="text-gray-400">
          <p>Email: {profile?.email || 'Нет данных'}</p>
          <p>Роль: {profile?.role || 'Пользователь'}</p>
        </div>
      </div>
    </AnimatedSection>
  )
}