import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'

export default function ClientNew() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', phone: '', email: '', source: 'otro' })

  const create = useMutation({
    mutationFn: (data: typeof form) => api.post('/clients', data),
    onSuccess: (res) => navigate(`/clients/${res.data.data.id}`),
  })

  return (
    <div className="max-w-lg">
      <h2 className="text-2xl font-bold mb-6">Nuevo cliente</h2>
      <form onSubmit={e => { e.preventDefault(); create.mutate(form) }} className="bg-white rounded-lg shadow p-6 space-y-4">
        <input placeholder="Nombre *" value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          className="w-full border rounded px-3 py-2" required />
        <input placeholder="Telefono" value={form.phone}
          onChange={e => setForm({ ...form, phone: e.target.value })}
          className="w-full border rounded px-3 py-2" />
        <input type="email" placeholder="Email" value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
          className="w-full border rounded px-3 py-2" />
        <select value={form.source} onChange={e => setForm({ ...form, source: e.target.value })}
          className="w-full border rounded px-3 py-2">
          <option value="whatsapp">WhatsApp</option>
          <option value="instagram">Instagram</option>
          <option value="web">Web</option>
          <option value="otro">Otro</option>
        </select>
        <button type="submit" disabled={create.isPending}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Crear cliente
        </button>
      </form>
    </div>
  )
}
