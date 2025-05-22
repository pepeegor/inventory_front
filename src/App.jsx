import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import AuthProvider from './context/AuthProvider'
import AppRouter from './router'

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AppRouter />
          <ToastContainer position="top-right" theme="dark" />
        </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
