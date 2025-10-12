import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

if ('scrollRestoration' in history) {
  history.scrollRestoration = 'auto';
}

createRoot(document.getElementById("root")!).render(
  <App />
);
