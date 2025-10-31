
import React from 'react';
import ReactDOM from 'react-dom/client';
import './src/index.css';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Remover loader inicial assim que React montar
const initialLoader = document.querySelector('.initial-loader');
if (initialLoader) {
  initialLoader.remove();
}

const root = ReactDOM.createRoot(rootElement);
// StrictMode REMOVIDO - causava deadlock nas chamadas Supabase
root.render(<App />);
