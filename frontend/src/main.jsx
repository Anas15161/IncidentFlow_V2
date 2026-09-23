import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import keycloak from './keycloak.js'

keycloak.init({ onLoad: 'login-required', checkLoginIframe: false }).then((authenticated) => {
  if (authenticated) {
    window.keycloak = keycloak;
    
    // Auto-refresh token
    setInterval(() => {
      keycloak.updateToken(70).catch(() => {
        console.error('Failed to refresh token');
      });
    }, 60000);

    createRoot(document.getElementById('root')).render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  } else {
    window.location.reload();
  }
}).catch((err) => {
  console.error("Keycloak init error", err);
  document.getElementById('root').innerHTML = '<h2>Erreur de connexion au serveur d\'authentification (Keycloak).</h2>';
});
