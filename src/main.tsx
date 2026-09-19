import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { reportCrash } from './lib/crashLog';

window.addEventListener('error', (event) => {
  reportCrash('global', event.error ?? new Error(event.message));
});
window.addEventListener('unhandledrejection', (event) => {
  reportCrash('unhandledrejection', event.reason);
});

createRoot(document.getElementById('root')!).render(<App />);