import { Link, Outlet } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../hooks/useAuth'
import api from '../lib/api'

export default function Layout() {
  const { user, logout } = useAuth()

  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications').then(r => r.data.data),
    refetchInterval: 30000,
  })

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-gray-900 text-white p-4 space-y-2 flex flex-col">
        <h1 className="text-xl font-bold mb-6">Seguidor</h1>
        <Link to="/dashboard" className="block px-3 py-2 rounded hover:bg-gray-700">Dashboard</Link>
        <Link to="/clients" className="block px-3 py-2 rounded hover:bg-gray-700">Clientes</Link>
        <Link to="/reminders" className="block px-3 py-2 rounded hover:bg-gray-700 relative">
          Seguimientos
          {notifications && notifications.length > 0 && (
            <span className="absolute right-2 top-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {notifications.length}
            </span>
          )}
        </Link>
        <Link to="/templates" className="block px-3 py-2 rounded hover:bg-gray-700">Plantillas</Link>
        <Link to="/settings" className="block px-3 py-2 rounded hover:bg-gray-700">Configuracion</Link>
        <div className="mt-auto pt-8">
          <p className="text-sm text-gray-400">{user?.name}</p>
          <button onClick={() => logout.mutate()} className="text-sm text-red-400 hover:text-red-300">
            Cerrar sesion
          </button>
        </div>
      </aside>
      <main className="flex-1 p-6 bg-gray-50 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
