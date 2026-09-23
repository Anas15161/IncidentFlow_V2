import React from 'react';
import { Users } from 'lucide-react';

export function UserManagementView() {
  return (
    <div className="animate-fade-in" style={{ padding: '24px' }}>
      <div className="page-header" style={{ borderBottom: 'none', marginBottom: '16px' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users className="text-primary-600" />
            Gestion des Utilisateurs (V2 - Keycloak)
          </h1>
          <p className="page-subtitle" style={{ color: '#059669', fontWeight: 'bold' }}>
            ⚡ L'Identity and Access Management (IAM) est désormais délégué à Keycloak.
          </p>
        </div>
      </div>

      <div className="card" style={{ padding: '40px', textAlign: 'center', maxWidth: '800px', margin: '0 auto', border: '2px solid #3b82f6', boxShadow: '0 10px 25px rgba(59, 130, 246, 0.1)' }}>
        <img src="https://upload.wikimedia.org/wikipedia/commons/2/29/Keycloak_Logo.png" alt="Keycloak Logo" style={{ height: '60px', marginBottom: '24px' }} />
        <h2 style={{ fontSize: '24px', marginBottom: '16px', color: '#111827' }}>Centralisation des Identités</h2>
        <p style={{ fontSize: '15px', color: '#4b5563', marginBottom: '32px', lineHeight: '1.6' }}>
          Dans la V1, les utilisateurs et les mots de passe étaient stockés manuellement dans la base de données de l'application. 
          Pour répondre aux exigences de sécurité d'Entreprise, IncidentFlow ne gère plus les comptes locaux. 
          Toute la création d'utilisateurs, la réinitialisation de mots de passe, et les politiques de sécurité sont gérées dans <strong>Keycloak</strong>.
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
          <a 
            href="http://localhost:8181/admin" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{ padding: '16px 32px', fontSize: '16px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#3b82f6', borderColor: '#3b82f6' }}
          >
            Ouvrir la Console Keycloak (IAM)
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
          </a>
          <span style={{ fontSize: '13px', color: '#6b7280' }}>
            Identifiants Administrateur : <strong>admin</strong> / <strong>admin_secure_keycloak_pass</strong> (Realm: master ou incidentflow-realm)
          </span>
        </div>
      </div>
    </div>
  );
}
