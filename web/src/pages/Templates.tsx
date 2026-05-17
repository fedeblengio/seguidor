import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'

export default function Templates() {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({ name: '', body: '' })
  const [editing, setEditing] = useState<number | null>(null)

  const { data: templates, isLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: () => api.get('/templates').then(r => r.data.data),
  })

  const save = useMutation({
    mutationFn: (data: { name: string; body: string }) =>
      editing ? api.put(`/templates/${editing}`, data) : api.post('/templates', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] })
      setForm({ name: '', body: '' })
      setEditing(null)
    },
  })

  const remove = useMutation({
    mutationFn: (id: number) => api.delete(`/templates/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['templates'] }),
  })

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold mb-6">Plantillas de mensajes</h2>

      <form onSubmit={e => { e.preventDefault(); save.mutate(form) }} className="bg-white rounded-lg shadow p-4 mb-6 space-y-3">
        <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
          placeholder="Nombre de la plantilla" className="w-full border rounded px-3 py-2" />
        <textarea value={form.body} onChange={e => setForm({ ...form, body: e.target.value })}
          placeholder="Mensaje. Variables: {nombre}, {negocio}" rows={3} className="w-full border rounded px-3 py-2" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          {editing ? 'Guardar cambios' : 'Crear plantilla'}
        </button>
        {editing && <button type="button" onClick={() => { setEditing(null); setForm({ name: '', body: '' }) }}
          className="ml-2 text-gray-500">Cancelar</button>}
      </form>

      {isLoading ? <p>Cargando...</p> : (
        <div className="space-y-3">
          {(templates || []).map((t: any) => (
            <div key={t.id} className="bg-white rounded-lg shadow p-4 flex justify-between">
              <div>
                <p className="font-medium">{t.name}</p>
                <p className="text-sm text-gray-500">{t.body}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setEditing(t.id); setForm({ name: t.name, body: t.body }) }}
                  className="text-sm text-blue-600">Editar</button>
                <button onClick={() => remove.mutate(t.id)} className="text-sm text-red-600">Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
