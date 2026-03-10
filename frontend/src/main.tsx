import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConfigProvider, theme } from 'antd'
import ptBR from 'antd/locale/pt_BR'
import App from './App'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30000 } },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        locale={ptBR}
        theme={{
          algorithm: theme.darkAlgorithm,
          token: {
            colorPrimary: '#f59e0b',
            colorBgBase: '#0f172a',
            colorBgContainer: '#1e293b',
            colorBgElevated: '#263248',
            colorBorder: '#334155',
            borderRadius: 8,
            fontFamily: "'Inter', sans-serif",
          },
          components: {
            Layout: { siderBg: '#0f172a', headerBg: '#1e293b' },
            Menu: { darkItemBg: '#0f172a', darkSubMenuItemBg: '#162032' },
          },
        }}
      >
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ConfigProvider>
    </QueryClientProvider>
  </React.StrictMode>
)
