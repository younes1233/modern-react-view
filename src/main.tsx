import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { CountryCurrencyProvider } from './contexts/CountryCurrencyContext.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(
  <CountryCurrencyProvider>
    <App />
  </CountryCurrencyProvider>
);
