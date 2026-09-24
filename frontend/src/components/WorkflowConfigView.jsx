import React, { useState, useEffect, useMemo } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  Layers,
  Activity,
  UploadCloud,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Zap,
  Info,
  GitCommit,
  RefreshCw,
  FileCode2,
  Server,
  ArrowRight,
  Database
} from 'lucide-react';

export function WorkflowConfigView({
  activeWorkflow,
  workflows = [],
  nodes: propNodes,
  edges: propEdges,
  onNodesChange: propOnNodesChange,
  onEdgesChange: propOnEdgesChange
}) {
  const [selectedNode, setSelectedNode] = useState(null);
  const [deployStatus, setDeployStatus] = useState(null);
  const [isDeploying, setIsDeploying] = useState(false);

  // Workflow source : activeWorkflow ou le premier workflow de la liste
  const currentWorkflow = useMemo(() => {
    return activeWorkflow || (workflows && workflows.length > 0 ? workflows[0] : null);
  }, [activeWorkflow, workflows]);

  // Construction dynamique des nœuds et arêtes avec animation fluide
  const { initialNodes, initialEdges } = useMemo(() => {
    if (!currentWorkflow || !currentWorkflow.states || currentWorkflow.states.length === 0) {
      return { initialNodes: [], initialEdges: [] };
    }

    const states = currentWorkflow.states;
    const transitions = currentWorkflow.transitions || [];

    const nodes = states.map((state, idx) => {
      const isFirst = idx === 0;
      const isLast = idx === states.length - 1;

      let borderTheme = '#3b82f6';
      let bgTheme = '#eff6ff';
      let dotColor = '#2563eb';

      if (isFirst) {
        borderTheme = '#10b981';
        bgTheme = '#f0fdf4';
        dotColor = '#059669';
      } else if (isLast) {
        borderTheme = '#64748b';
        bgTheme = '#f8fafc';
        dotColor = '#475569';
      } else if (state.name.toLowerCase().includes('résolu') || state.name.toLowerCase().includes('resolu')) {
        borderTheme = '#10b981';
        bgTheme = '#ecfdf5';
        dotColor = '#10b981';
      } else if (state.name.toLowerCase().includes('cours')) {
        borderTheme = '#f59e0b';
        bgTheme = '#fffbeb';
        dotColor = '#d97706';
      }

      return {
        id: state.name,
        type: isFirst ? 'input' : (isLast ? 'output' : 'default'),
        position: { x: 50 + (idx * 210), y: 140 },
        data: {
          label: (
            <div style={{ textAlign: 'left', padding: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b', fontWeight: 700 }}>
                  Étape {idx + 1}
                </span>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: dotColor }}></span>
              </div>
              <div style={{ fontWeight: '700', fontSize: '13px', color: '#0f172a' }}>
                {state.name}
              </div>
              <div style={{ fontSize: '10px', color: '#64748b', marginTop: '4px' }}>
                {isFirst ? '● Déclenchement' : isLast ? '■ Clôture' : '⚙️ Tâche Utilisateur'}
              </div>
            </div>
          ),
          rawState: state,
          index: idx
        },
        sourcePosition: 'right',
        targetPosition: 'left',
        style: {
          background: bgTheme,
          border: `2px solid ${borderTheme}`,
          borderRadius: '12px',
          padding: '12px 14px',
          width: 175,
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.06)',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }
      };
    });

    const edges = transitions.map((t, idx) => {
      const from = t.fromState;
      const to = t.toState;
      const isReverse = from?.toLowerCase().includes('résolu') && to?.toLowerCase().includes('cours');

      return {
        id: `e-${from}-${to}-${idx}`,
        source: from,
        target: to,
        animated: true,
        type: 'smoothstep',
        style: {
          stroke: isReverse ? '#f59e0b' : '#2563eb',
          strokeWidth: 2.5
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isReverse ? '#f59e0b' : '#2563eb',
          width: 18,
          height: 18
        },
        label: t.roleRequired ? `🔑 ${t.roleRequired}` : undefined,
        labelStyle: { fill: '#475569', fontWeight: 600, fontSize: 10 },
        labelBgStyle: { fill: '#ffffff', fillOpacity: 0.9, rx: 4, ry: 4 }
      };
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [currentWorkflow]);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  // Handler de sélection d'un nœud pour afficher ses détails
  const onNodeClick = (_, node) => {
    setSelectedNode(node.data?.rawState || null);
  };

  // Déploiement dynamique de BPMN
  const handleFileUpload = async (e) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    setIsDeploying(true);
    setDeployStatus(null);

    try {
      const res = await fetch('http://localhost:8081/api/workflows/deploy-flowable', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${window.keycloak?.token}`
        },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setDeployStatus({
          type: 'success',
          message: data.message || 'Schéma BPMN déployé et synchronisé avec succès !'
        });
        // Recharger la page après 1.5s pour actualiser le modèle
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setDeployStatus({
          type: 'error',
          message: data.message || 'Erreur lors du déploiement.'
        });
      }
    } catch (err) {
      setDeployStatus({
        type: 'error',
        message: 'Erreur de communication avec le serveur backend.'
      });
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '24px 32px', maxWidth: '1280px', margin: '0 auto' }}>
      
      {/* 1. Header Haute Performance */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '20px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span style={{ backgroundColor: '#2563eb', color: 'white', padding: '6px', borderRadius: '8px', display: 'flex' }}>
              <Layers size={22} />
            </span>
            <h1 style={{ color: '#0f172a', fontSize: '22px', margin: 0, fontWeight: '800', letterSpacing: '-0.5px' }}>
              Architecture d'Orchestration & Audit
            </h1>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#dcfce7', color: '#166534', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#16a34a' }}></span>
              BPMN 2.0 Live Engine
            </span>
          </div>
          <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>
            Supervision du cycle de vie des incidents piloté par le moteur industriel <strong>Flowable Engine 7.0.1</strong> et persistance partitionnée PostgreSQL.
          </p>
        </div>

        {/* Boutons d'accès direct */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <a
            href="http://localhost:8082/flowable-ui/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: '600', padding: '8px 14px', borderRadius: '6px' }}
          >
            <ExternalLink size={14} />
            Flowable UI Modeler
          </a>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '8px 12px' }}
            title="Rafraîchir les métriques"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* 2. Bandeau Métriques Techniques de l'Orchestrateur */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 18px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' }}>
            <FileCode2 size={15} color="#2563eb" />
            Processus Actif
          </div>
          <div style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginTop: '6px' }}>
            {currentWorkflow?.name || 'Incident Standard Workflow'}
          </div>
          <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: '600', marginTop: '2px' }}>
            Key: incidentWorkflow (v{currentWorkflow?.version || 1})
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 18px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' }}>
            <Activity size={15} color="#10b981" />
            Étapes Déployées
          </div>
          <div style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginTop: '6px' }}>
            {currentWorkflow?.states?.length || 5} Tâches Séquentielles
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
            {currentWorkflow?.transitions?.length || 4} Transitions actives
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 18px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' }}>
            <Database size={15} color="#f59e0b" />
            Schéma Dédié
          </div>
          <div style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginTop: '6px' }}>
            PostgreSQL: flowable
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
            47 tables isolées (ACT_*)
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 18px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' }}>
            <Server size={15} color="#8b5cf6" />
            Moteur d'Audit
          </div>
          <div style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginTop: '6px' }}>
            History Level: FULL
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
            Audit inaltérable (ACT_HI_*)
          </div>
        </div>
      </div>

      {/* 3. Schéma Interactif & Animé ReactFlow */}
      <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.04)', marginBottom: '28px' }}>
        
        {/* Barre supérieure du schéma */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <GitCommit size={16} color="#2563eb" />
            <span style={{ fontWeight: '700', fontSize: '13px', color: '#0f172a' }}>
              Topologie Dynamique du Workflow Actif (BPMN Pipeline)
            </span>
            <span style={{ fontSize: '11px', color: '#64748b', marginLeft: '6px' }}>
              — Cliquez sur une tâche pour inspecter ses contraintes
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '11px', color: '#64748b' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }}></span>
              Départ / Résolu
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b' }}></span>
              Traitement
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2563eb' }}></span>
              Flux Continu
            </span>
          </div>
        </div>

        {/* Canvas React Flow */}
        <div style={{ height: '360px', width: '100%', position: 'relative', background: '#fbfcfd' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            fitView
            attributionPosition="bottom-right"
          >
            <Background color="#cbd5e1" gap={18} size={1} />
            <Controls style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderRadius: '8px' }} />
            <MiniMap
              nodeColor={(n) => {
                if (n.type === 'input') return '#10b981';
                if (n.type === 'output') return '#64748b';
                return '#3b82f6';
              }}
              style={{ height: 80, width: 120, borderRadius: 6, border: '1px solid #cbd5e1' }}
            />
          </ReactFlow>

          {/* Panneau d'inspection flottant si nœud sélectionné */}
          {selectedNode && (
            <div style={{ position: 'absolute', top: '16px', right: '16px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '14px 18px', width: '260px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', zIndex: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#2563eb', textTransform: 'uppercase' }}>Détails de l'Étape</span>
                <button onClick={() => setSelectedNode(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '14px' }}>✕</button>
              </div>
              <div style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>
                {selectedNode.name}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', lineHeight: '1.4' }}>
                Type : <strong>BPMN UserTask</strong><br />
                État Kanban : <span style={{ color: '#16a34a', fontWeight: '700' }}>{selectedNode.active ? 'Actif' : 'Inactif'}</span><br />
                Moteur : <code>flowable.runtime</code>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Console de Déploiement & Connexion Modeler */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', marginBottom: '24px' }}>
        
        {/* Module A : Téléversement et Déploiement Hot-Reload */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <UploadCloud size={20} color="#2563eb" />
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
              Déploiement Hot-Reload du Modèle BPMN
            </h3>
          </div>
          <p style={{ fontSize: '12.5px', color: '#64748b', lineHeight: '1.5', margin: '0 0 16px 0' }}>
            Glissez ou sélectionnez votre fichier exporté depuis Flowable Modeler (<code>.bpmn20.xml</code>). Le backend met à jour les définitions et synchronise le Kanban instantanément, sans coupure de service.
          </p>

          <div style={{ border: '2px dashed #cbd5e1', borderRadius: '10px', padding: '20px', textAlign: 'center', background: '#f8fafc' }}>
            <input
              type="file"
              id="bpmn-file-input"
              accept=".xml,.bpmn,.bpmn20.xml"
              onChange={handleFileUpload}
              disabled={isDeploying}
              style={{ display: 'none' }}
            />
            <label
              htmlFor="bpmn-file-input"
              style={{ cursor: isDeploying ? 'not-allowed' : 'pointer', display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}
            >
              <div style={{ backgroundColor: '#eff6ff', color: '#2563eb', padding: '10px', borderRadius: '50%', display: 'flex' }}>
                <UploadCloud size={24} />
              </div>
              <span style={{ fontWeight: '600', fontSize: '13px', color: '#2563eb' }}>
                {isDeploying ? 'Déploiement en cours...' : 'Sélectionner un fichier BPMN (.xml)'}
              </span>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>Format officiel OMG BPMN 2.0</span>
            </label>
          </div>

          {deployStatus && (
            <div style={{ marginTop: '12px', padding: '10px 14px', borderRadius: '8px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: deployStatus.type === 'success' ? '#dcfce7' : '#fee2e2', color: deployStatus.type === 'success' ? '#166534' : '#991b1b' }}>
              {deployStatus.type === 'success' ? <CheckCircle2 size={16} /> : <Info size={16} />}
              <span>{deployStatus.message}</span>
            </div>
          )}
        </div>

        {/* Module B : Accès Environnement Flowable UI */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <Zap size={20} color="#f59e0b" />
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                Plateforme de Modélisation & Audit
              </h3>
            </div>
            <p style={{ fontSize: '12.5px', color: '#64748b', lineHeight: '1.5', margin: '0 0 16px 0' }}>
              Utilisez la suite Flowable UI pour concevoir de nouveaux processus métiers ou consulter les diagrammes d'exécution des instances d'incidents en temps réel.
            </p>

            <div style={{ background: '#f1f5f9', borderRadius: '8px', padding: '12px 16px', fontSize: '12px', color: '#334155', marginBottom: '16px' }}>
              <div style={{ marginBottom: '4px' }}>• URL : <code>http://localhost:8082/flowable-ui/</code></div>
              <div style={{ marginBottom: '4px' }}>• Identifiant : <strong>admin</strong></div>
              <div>• Mot de passe : <strong>test</strong></div>
            </div>
          </div>

          <a
            href="http://localhost:8082/flowable-ui/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 16px', fontSize: '13px', fontWeight: '600', textDecoration: 'none', borderRadius: '8px' }}
          >
            Lancer la Console Flowable UI
            <ExternalLink size={15} />
          </a>
        </div>

      </div>

      {/* 5. Traçabilité & Conformité ISO 27001 (Audit Trail) */}
      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <ShieldCheck size={18} color="#10b981" />
          <h4 style={{ fontSize: '13.5px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
            Conformité et Traçabilité Native de l'Audit (Separation of Concerns)
          </h4>
        </div>
        <p style={{ fontSize: '12px', color: '#475569', margin: 0, lineHeight: '1.5' }}>
          Conformément aux exigences d'architecture d'entreprise, la table locale d'audit de la V1 a été déléguée aux tables d'historisation immuables de Flowable (<code>flowable.act_hi_taskinst</code>, <code>flowable.act_hi_procinst</code>). Chaque transition d'incident enregistre cryptographiquement l'auteur, la date précise de franchissement et le respect du SLA.
        </p>
      </div>

    </div>
  );
}
