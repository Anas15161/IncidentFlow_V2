import React from 'react';
import {
  Shield, Plus, Users, Search, X, Edit3, Trash2, CheckSquare, AlertTriangle
} from 'lucide-react';

export function RoleManagementView({
  currentUser,
  getRoleName,
  setCurrentView,
  setShowRoleCreateModal,
  currentView,
  rolesList = [],
  usersList = [],
  searchRoleQuery,
  setSearchRoleQuery,
  filteredRoles = [],
  setEditRoleForm,
  setShowRoleEditModal,
  handleRoleDelete,
  permissionsList = [],
  handleTogglePermission
}) {
  if (getRoleName(currentUser?.role) !== 'Administrateur') {
    return (
      <div className="animate-fade-in" style={{ padding: '40px', textAlign: 'center' }}>
        <div className="dashboard-card" style={{ maxWidth: '500px', margin: '0 auto', padding: '40px' }}>
          <AlertTriangle size={48} style={{ margin: '0 auto 16px', color: '#f59e0b' }} />
          <h2>Accès Restreint</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
            La gestion des rôles est strictement réservée aux Administrateurs du système.
          </p>
          <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={() => setCurrentView('dashboard')}>
            Retour au Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ padding: '24px' }}>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Gestion des Rôles & Habilitations</h1>
          <p className="page-subtitle">Définissez les rôles, administrez leurs privilèges et supervisez l'affectation des utilisateurs.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowRoleCreateModal(true)}>
          <Plus size={16} />
          Nouveau Rôle
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="admin-tab-bar">
        <button
          className={`admin-tab-btn ${currentView === 'users' ? 'active' : ''}`}
          onClick={() => setCurrentView('users')}
        >
          <Users size={16} />
          Gestion Utilisateurs
        </button>
        <button
          className={`admin-tab-btn ${currentView === 'roles' ? 'active' : ''}`}
          onClick={() => setCurrentView('roles')}
        >
          <Shield size={16} />
          Rôles & Habilitations
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Total Rôles Configurés</span>
            <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
              <Shield className="text-blue-600" size={20} />
            </div>
          </div>
          <div className="stat-value">{rolesList.length}</div>
          <div className="stat-subtext">Rôles d'accès dans le système</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Comptes Administrateurs</span>
            <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: 'rgba(147, 51, 234, 0.1)' }}>
              <Users className="text-purple-600" size={20} />
            </div>
          </div>
          <div className="stat-value">
            {usersList.filter(u => getRoleName && getRoleName(u.role).toLowerCase().includes('admin')).length}
          </div>
          <div className="stat-subtext">Utilisateurs avec privilèges système</div>
        </div>
      </div>

      {/* Filter panel for roles */}
      <div className="filter-panel-premium" style={{ marginBottom: '20px' }}>
        <div className="filter-item" style={{ flexGrow: 1 }}>
          <label>Rechercher un rôle</label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={14} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="filter-select"
              placeholder="Rechercher par nom du rôle ou description..."
              value={searchRoleQuery}
              onChange={(e) => setSearchRoleQuery(e.target.value)}
              style={{ paddingLeft: '34px', width: '100%', height: '38px' }}
            />
            {searchRoleQuery && (
              <button
                onClick={() => setSearchRoleQuery('')}
                style={{ position: 'absolute', right: '10px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Roles List Card */}
      <div className="dashboard-card" style={{ padding: '24px' }}>
        <div className="datagrid-container">
          <table className="datagrid">
            <thead>
              <tr>
                <th>Rôle</th>
                <th>Description</th>
                <th>Utilisateurs Assignés</th>
                <th>Niveau de Privilège</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRoles.map(r => {
                const assignedUsers = usersList.filter(u => u.role && u.role.id === r.id);
                const roleLower = r.name.toLowerCase();
                let privilegeLabel = "Standard";
                let privilegeStyle = { backgroundColor: 'var(--slate-100)', color: 'var(--slate-700)' };

                if (roleLower.includes('admin')) {
                  privilegeLabel = "Accès Total";
                  privilegeStyle = { backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' };
                } else if (roleLower.includes('support') || roleLower.includes('manager')) {
                  privilegeLabel = "Accès Étendu";
                  privilegeStyle = { backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' };
                }

                return (
                  <tr key={r.id} className="hoverable">
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'var(--slate-100)' }}>
                          <Shield size={16} className="text-primary-600" />
                        </div>
                        <span style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-color)' }}>{r.name}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                        {r.description || 'Aucune description'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {assignedUsers.length > 0 ? (
                          <>
                            <div className="avatar-group">
                              {assignedUsers.slice(0, 3).map((u, i) => (
                                <div key={u.id} className={`avatar-circle ${u.avatarColor || 'bg-gray-500'}`} style={{ width: '24px', height: '24px', fontSize: '10px', zIndex: 3 - i }}>
                                  {u.name ? u.name.split(' ').map(n => n[0]).join('') : 'U'}
                                </div>
                              ))}
                              {assignedUsers.length > 3 && (
                                <div className="avatar-circle bg-slate-200 text-slate-600" style={{ width: '24px', height: '24px', fontSize: '10px', zIndex: 0 }}>
                                  +{assignedUsers.length - 3}
                                </div>
                              )}
                            </div>
                            <span style={{ fontSize: '12px', fontWeight: '600' }}>
                              {assignedUsers.length} membre{assignedUsers.length > 1 ? 's' : ''}
                            </span>
                          </>
                        ) : (
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>Aucun utilisateur</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          fontSize: '11px',
                          padding: '3px 9px',
                          borderRadius: '12px',
                          fontWeight: '600',
                          ...privilegeStyle
                        }}
                      >
                        {privilegeLabel}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          className="icon-btn btn-secondary"
                          onClick={() => {
                            setEditRoleForm({
                              id: r.id,
                              name: r.name,
                              description: r.description || ''
                            });
                            setShowRoleEditModal(true);
                          }}
                          style={{ width: '30px', height: '30px', border: 'none' }}
                          title="Modifier le rôle"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          className="icon-btn btn-secondary"
                          onClick={() => handleRoleDelete(r.id, r.name)}
                          style={{ width: '30px', height: '30px', color: '#ef4444', border: 'none' }}
                          title="Supprimer le rôle"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredRoles.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <Shield size={32} style={{ opacity: 0.4 }} />
                      <span>Aucun rôle ne correspond à votre recherche.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Matrice Dynamique des Permissions RBAC (Cases à cocher) */}
      <div className="dashboard-card" style={{ padding: '24px', marginTop: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: 'var(--text-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckSquare size={20} className="text-primary-600" />
              Matrice Dynamique des Habilitations RBAC
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
              Cochez ou décochez les fonctionnalités autorisées pour chaque rôle en temps réel. La mise à jour est instantanée.
            </p>
          </div>
        </div>

        <div className="datagrid-container" style={{ overflowX: 'auto' }}>
          <table className="datagrid">
            <thead>
              <tr>
                <th style={{ width: '280px' }}>Module & Fonctionnalité</th>
                <th style={{ width: '150px' }}>Code Permission</th>
                {rolesList.map(role => (
                  <th key={role.id} style={{ textAlign: 'center', width: '160px' }}>
                    <span className="badge" style={{ backgroundColor: 'var(--slate-100)', color: 'var(--slate-800)', padding: '6px 10px', fontSize: '12px', fontWeight: '700' }}>
                      {role.name}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permissionsList.length === 0 ? (
                <tr>
                  <td colSpan={2 + rolesList.length} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                    Chargement de la matrice de permissions...
                  </td>
                </tr>
              ) : (
                permissionsList.map((perm) => (
                  <tr key={perm.id || perm.code}>
                    <td>
                      <strong style={{ fontSize: '13px', color: 'var(--text-color)' }}>{perm.label}</strong>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{perm.description}</div>
                    </td>
                    <td>
                      <span style={{ fontSize: '11px', fontFamily: 'monospace', padding: '2px 6px', backgroundColor: 'var(--slate-100)', borderRadius: '4px', color: 'var(--slate-700)' }}>
                        {perm.code}
                      </span>
                    </td>
                    {rolesList.map((role) => {
                      const rolePermCodes = (role.permissions || []).map(p => typeof p === 'string' ? p : p.code);
                      const isChecked = rolePermCodes.includes(perm.code) || role.name === 'Administrateur';
                      const isAdminRole = role.name === 'Administrateur';

                      return (
                        <td key={role.id} style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            disabled={isAdminRole}
                            onChange={() => handleTogglePermission && handleTogglePermission(role.id, perm.code)}
                            style={{
                              width: '18px',
                              height: '18px',
                              cursor: isAdminRole ? 'not-allowed' : 'pointer',
                              accentColor: 'var(--primary-600)'
                            }}
                            title={isAdminRole ? "L'Administrateur possède tous les privilèges système" : `Bascule de la permission ${perm.label} pour ${role.name}`}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
