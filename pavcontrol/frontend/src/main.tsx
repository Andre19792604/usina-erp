import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ConfigProvider, theme } from 'antd'
import ptBR from 'antd/locale/pt_BR'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ConfigProvider
        locale={ptBR}
        theme={{
          algorithm: theme.darkAlgorithm,
          token: {
            colorPrimary: '#10b981',
            colorBgBase: '#0a0f1a',
            colorBgContainer: '#111827',
            borderRadius: 8,
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          },
        }}
      >
        <App />
      </ConfigProvider>
    </BrowserRouter>
  </React.StrictMode>
)
