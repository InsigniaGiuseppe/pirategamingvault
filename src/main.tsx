
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { initializeErrorMonitoring } from './services/errorLoggingService';
import './index.css';

// Initialize error monitoring before rendering the app
initializeErrorMonitoring();

// Create root and render app with strict mode and router
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
