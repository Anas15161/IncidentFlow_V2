import { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:8081/api'; 

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!(window.keycloak && window.keycloak.authenticated));
  const [token, setToken] = useState(() => window.keycloak ? window.keycloak.token : '');
  const [currentUser, setCurrentUser] = useState(() => {
    if (window.keycloak && window.keycloak.tokenParsed) {
      const parsed = window.keycloak.tokenParsed;
      return {
        id: parsed.sub,
        email: parsed.email || parsed.preferred_username,
        name: parsed.name || parsed.preferred_username,
        firstName: parsed.given_name || '',
        lastName: parsed.family_name || '',
        role: "Administrateur", // Simplification pour le frontend
        department: "Keycloak",
        avatarColor: "bg-blue-600"
      };
    }
    return null;
  });

  const getHeaders = () => {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${window.keycloak?.token || token}`
    };
  };

  const handleLogout = async () => {
    if (window.keycloak) {
      window.keycloak.logout();
    }
  };

  return {
    isAuthenticated,
    token,
    currentUser,
    getHeaders,
    handleLogout,
    // Stub methods for LoginPage fallback
    loginEmail: '', setLoginEmail: () => {},
    loginPassword: '', setLoginPassword: () => {},
    loginError: '', setLoginError: () => {},
    showLoginPassword: false, setShowLoginPassword: () => {},
    triggerQuickLogin: () => {},
    handleLoginSubmit: (e) => { e.preventDefault(); if (window.keycloak) window.keycloak.login(); }
  };
}
