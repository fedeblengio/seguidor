import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import api from '../lib/api'

export default function Reminders() {
  const queryClient = useQueryClient()

  const { data: reminders, isLoading } = useQuery({
    queryKey: ['reminders'],
    queryFn: () => api.get('/reminders').then(r => r.data.data),
  })

  const complete = useMutation({
    mutationFn: (id: number) => api.patch(`/reminders/${id}`, { completed: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reminders'] }),
  })

  if (isLoading) return <div>Cargando...</div>

  const overdue = (reminders || []).filter((r: any) => new Date(r.due_at) < new Date())
  const upcoming = (reminders || []).filter((r: any) => new Date(r.due_at) >= new Date())

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Seguimientos pendientes</h2>

      {overdue.length > 0 && (
        <div className="mb-6">
          <h3 className="text-red-600 font-semibold mb-2">Atrasados ({overdue.length})</h3>
          <div className="space-y-2">
            {overdue.map((r: any) => (
              <div key={r.id} className="bg-red-50 border border-red-200 rounded p-3 flex justify-between items-center">
                <div>
                  <p className="font-medium">{r.title}</p>
                  <Link to={`/clients/${r.client_id}`} className="text-sm text-blue-600">{r.client?.name}</Link>
                  <p className="text-xs text-gray-500">{new Date(r.due_at).toLocaleString()}</p>
                </div>
                <button onClick={() => complete.mutate(r.id)} className="text-sm bg-white border px-3 py-1 rounded">
                  Completar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="font-semibold mb-2">Proximos ({upcoming.length})</h3>
        <div className="space-y-2">
          {upcoming.map((r: any) => (
            <div key={r.id} className="bg-white border rounded p-3 flex justify-between items-center">
              <div>
                <p className="font-medium">{r.title}</p>
                <Link to={`/clients/${r.client_id}`} className="text-sm text-blue-600">{r.client?.name}</Link>
                <p className="text-xs text-gray-500">{new Date(r.due_at).toLocaleString()}</p>
              </div>
              <button onClick={() => complete.mutate(r.id)} className="text-sm bg-white border px-3 py-1 rounded">
                Completar
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
