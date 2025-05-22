import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from './useAuth'


export default function useQueryClientRefresh() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  useEffect(() => {
    queryClient.clear()
    queryClient.invalidateQueries()
  }, [user, queryClient])
}
