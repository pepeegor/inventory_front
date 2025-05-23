import axiosClient from './axiosClient'

// Get a user by ID
export const getUserById = async (id) => {
  const response = await axiosClient.get(`/users/${id}`)
  return response.data
}

// Get all users (admin only)
export const getAllUsers = async () => {
  const response = await axiosClient.get('/users/')
  return response.data
} 