import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MotionConfig } from 'framer-motion'
import App from './App.jsx'
import { FavoritesProvider } from './state/favorites.jsx'
import { ROUTER_FUTURE } from './lib/router.js'
import './styles.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 10 * 60 * 1000, retry: 1, refetchOnWindowFocus: false },
  },
})

if (import.meta.env.DEV) window.__queryClient = queryClient // inspect the cache from DevTools while developing

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <FavoritesProvider>
        {/* reducedMotion="user": every animation respects the OS "reduce motion" setting */}
        <MotionConfig reducedMotion="user">
          <BrowserRouter basename={import.meta.env.BASE_URL} future={ROUTER_FUTURE}>
            <App />
          </BrowserRouter>
        </MotionConfig>
      </FavoritesProvider>
    </QueryClientProvider>
  </React.StrictMode>
)
