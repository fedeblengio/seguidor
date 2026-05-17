import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import { useNavigate } from 'react-router-dom'

export function useAuth() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { data: user, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => api.get('/me').then(r => r.data.user),
    retry: false,
  })

  const login = useMutation({
    mutationFn: (data: { email: string; password: string }) => api.post('/login', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] })
      navigate('/dashboard')
    },
  })

  const register = useMutation({
    mutationFn: (data: { business_name: string; name: string; email: string; password: string; password_confirmation: string }) =>
      api.post('/register', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] })
      navigate('/dashboard')
    },
  })

  const logout = useMutation({
    mutationFn: () => api.post('/logout'),
    onSuccess: () => {
      queryClient.clear()
      navigate('/login')
    },
  })

  return { user, isLoading, login, register, logout }
}
