import { useQuery } from '@tanstack/react-query'
import api from '../lib/api'

const STATUS_LABELS: Record<string, string> = {
  nuevo: 'Nuevos',
  contactado: 'Contactados',
  presupuesto_enviado: 'Presupuestos enviados',
  seguimiento_pendiente: 'Seguimiento pendiente',
  vendido: 'Vendidos',
  perdido: 'Perdidos',
  reminders_pending: 'Seguimientos atrasados',
}

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/dashboard').then(r => r.data),
  })

  if (isLoading) return <div>Cargando...</div>

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(data || {}).map(([key, value]) => (
          <div key={key} className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">{STATUS_LABELS[key] || key}</p>
            <p className="text-3xl font-bold">{value as number}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
