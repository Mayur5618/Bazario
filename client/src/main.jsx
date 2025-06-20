// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './styles/main.css';
import { Provider } from 'react-redux';
import { store } from './store/store.js';

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}> {/* Wrap App with Provider */}
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </Provider>
);