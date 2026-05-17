import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import api from '../lib/api'

const STATUSES = ['todos', 'nuevo', 'contactado', 'presupuesto_enviado', 'seguimiento_pendiente', 'vendido', 'perdido']

export default function Clients() {
  const [status, setStatus] = useState('todos')
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['clients', status, search],
    queryFn: () => {
      const params: Record<string, string> = {}
      if (status !== 'todos') params.status = status
      if (search) params.search = search
      return api.get('/clients', { params }).then(r => r.data.data)
    },
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Clientes</h2>
        <Link to="/clients/new" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          + Nuevo cliente
        </Link>
      </div>

      <div className="flex gap-4 mb-4">
        <input placeholder="Buscar..." value={search}
          onChange={e => setSearch(e.target.value)}
          className="border rounded px-3 py-2 flex-1" />
        <select value={status} onChange={e => setStatus(e.target.value)}
          className="border rounded px-3 py-2">
          {STATUSES.map(s => <option key={s} value={s}>{s === 'todos' ? 'Todos' : s.replace(/_/g, ' ')}</option>)}
        </select>
      </div>

      {isLoading ? <p>Cargando...</p> : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Nombre</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Telefono</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Origen</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {(data?.data || []).map((client: any) => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link to={`/clients/${client.id}`} className="text-blue-600 hover:underline">{client.name}</Link>
                  </td>
                  <td className="px-4 py-3 text-sm">{client.phone || '-'}</td>
                  <td className="px-4 py-3 text-sm">{client.source}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-1 bg-gray-100 rounded">{client.status.replace(/_/g, ' ')}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
