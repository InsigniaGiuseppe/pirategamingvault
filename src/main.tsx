
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initializeErrorMonitoring } from './services/errorLoggingService';
import { Toaster } from './components/ui/toaster';
import './index.css';

// Initialize error monitoring before rendering the app
initializeErrorMonitoring();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
    <Toaster />
  </React.StrictMode>,
);
