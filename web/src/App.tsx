import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <h1 className="text-2xl p-4">Seguidor</h1>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
