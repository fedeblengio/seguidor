import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Register() {
  const { register } = useAuth()
  const [form, setForm] = useState({
    business_name: '', name: '', email: '', password: '', password_confirmation: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    register.mutate(form)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold text-center">Crear cuenta</h1>
        <input placeholder="Nombre del negocio" value={form.business_name}
          onChange={e => setForm({ ...form, business_name: e.target.value })}
          className="w-full border rounded px-3 py-2" />
        <input placeholder="Tu nombre" value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          className="w-full border rounded px-3 py-2" />
        <input type="email" placeholder="Email" value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
          className="w-full border rounded px-3 py-2" />
        <input type="password" placeholder="Contraseña" value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
          className="w-full border rounded px-3 py-2" />
        <input type="password" placeholder="Confirmar contraseña" value={form.password_confirmation}
          onChange={e => setForm({ ...form, password_confirmation: e.target.value })}
          className="w-full border rounded px-3 py-2" />
        {register.isError && <p className="text-red-500 text-sm">Error al registrar</p>}
        <button type="submit" disabled={register.isPending}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Registrarme
        </button>
        <p className="text-center text-sm text-gray-500">
          Ya tenes cuenta? <Link to="/login" className="text-blue-600">Inicia sesion</Link>
        </p>
      </form>
    </div>
  )
}
