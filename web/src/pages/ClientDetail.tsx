import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'

export default function ClientDetail() {
  const { id } = useParams()
  const queryClient = useQueryClient()
  const [note, setNote] = useState('')

  const { data: client, isLoading } = useQuery({
    queryKey: ['client', id],
    queryFn: () => api.get(`/clients/${id}`).then(r => r.data.data),
  })

  const { data: templates } = useQuery({
    queryKey: ['templates'],
    queryFn: () => api.get('/templates').then(r => r.data.data),
  })

  const addNote = useMutation({
    mutationFn: (body: string) => api.post(`/clients/${id}/notes`, { body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client', id] })
      setNote('')
    },
  })

  const updateStatus = useMutation({
    mutationFn: (status: string) => api.patch(`/clients/${id}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['client', id] }),
  })

  const openWhatsapp = async (templateId?: number) => {
    const params = templateId ? `?template_id=${templateId}` : ''
    const { data } = await api.get(`/whatsapp-link/${id}${params}`)
    window.open(data.url, '_blank')
  }

  if (isLoading) return <div>Cargando...</div>

  return (
    <div className="max-w-3xl">
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-2xl font-bold">{client.name}</h2>
        <p className="text-gray-500">{client.phone} | {client.email || 'Sin email'}</p>
        <p className="text-sm mt-1">Origen: {client.source} | Estado: {client.status.replace(/_/g, ' ')}</p>

        <div className="flex gap-2 mt-4 flex-wrap">
          <select onChange={e => updateStatus.mutate(e.target.value)} value={client.status}
            className="border rounded px-3 py-1 text-sm">
            {['nuevo','contactado','presupuesto_enviado','seguimiento_pendiente','vendido','perdido'].map(s =>
              <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
            )}
          </select>

          <button onClick={() => openWhatsapp()} className="bg-green-500 text-white px-3 py-1 rounded text-sm">
            WhatsApp
          </button>
          {(templates || []).map((t: any) => (
            <button key={t.id} onClick={() => openWhatsapp(t.id)}
              className="bg-green-100 text-green-700 px-3 py-1 rounded text-sm">
              WA: {t.name}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-bold mb-4">Notas</h3>
        <form onSubmit={e => { e.preventDefault(); if (note.trim()) addNote.mutate(note) }} className="flex gap-2 mb-4">
          <input value={note} onChange={e => setNote(e.target.value)}
            placeholder="Agregar nota..." className="flex-1 border rounded px-3 py-2" />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Agregar</button>
        </form>
        <div className="space-y-3">
          {(client.notes || []).map((n: any) => (
            <div key={n.id} className="border-l-2 border-gray-200 pl-3">
              <p>{n.body}</p>
              <p className="text-xs text-gray-400">{n.user?.name} - {new Date(n.created_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
