import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App.tsx'
import { QueryProvider } from './providers/QueryProvider.tsx'
import { Provider } from 'react-redux'
import AppInit from './app/init/AppInit.tsx'
import { store } from './app/store/store.ts'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <QueryProvider>
        <AppInit>
          <App />
        </AppInit>
      </QueryProvider>
    </Provider>
  </StrictMode>
)
