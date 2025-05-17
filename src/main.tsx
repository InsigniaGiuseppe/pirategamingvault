
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log("Application starting up - initializing main element");

createRoot(document.getElementById("root")!).render(<App />);

console.log("Application rendered");
