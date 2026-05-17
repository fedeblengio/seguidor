import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    login.mutate(form)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold text-center">Seguidor</h1>
        <input
          type="email" placeholder="Email" value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
          className="w-full border rounded px-3 py-2"
        />
        <input
          type="password" placeholder="Contraseña" value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
          className="w-full border rounded px-3 py-2"
        />
        {login.isError && <p className="text-red-500 text-sm">Credenciales incorrectas</p>}
        <button type="submit" disabled={login.isPending}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Iniciar sesion
        </button>
        <p className="text-center text-sm text-gray-500">
          No tenes cuenta? <Link to="/register" className="text-blue-600">Registrate</Link>
        </p>
      </form>
    </div>
  )
}
