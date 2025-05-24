import axiosClient from './axiosClient'

// Get current user profile
export function getUserProfile() {
  return axiosClient.get('/auth/me').then(res => res.data)
}

// Login user
export function loginUser(email, password) {
  return axiosClient.post('/auth/login', { email, password }).then(res => res.data)
}

// Register new user
export function registerUser(userData) {
  return axiosClient.post('/auth/register', userData).then(res => res.data)
}

// Logout user
export function logoutUser() {
  return axiosClient.post('/auth/logout').then(res => res.data)
}

// Update user profile - only username and full_name
export function updateUserProfile({ username, full_name }) {
  return axiosClient.put('/auth/me', { username, full_name }).then(res => res.data)
}

// Change user password - correct parameter names
export function changeUserPassword({ old_password, new_password }) {
  return axiosClient.post('/auth/me/change-password', {
    old_password,
    new_password
  }).then(res => res.data)
}

export const getMe = async () => {
  const { data } = await axiosClient.get('/auth/me')
  return data
}

export const updateMe = async (payload) => {
  const { data } = await axiosClient.put('/auth/me', payload)
  return data
}

export const changePassword = async (payload) => {
  // payload: { old_password, new_password }
  await axiosClient.post('/auth/me/change-password', payload)
} 