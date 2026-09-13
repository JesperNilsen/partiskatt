import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.tsx';
import './styles/tokens.css';
import './styles/base.css';

const root = document.getElementById('root');
if (!root) throw new Error('#root mangler');
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
