---
marp: true
theme: default
class: lead
paginate: true
backgroundColor: #f8fafc
color: #1e293b
style: |
  h1 { color: #1D4ED8; }
  h2 { color: #0A2647; }
  a { color: #1D4ED8; text-decoration: none; }
  li { margin-bottom: 0.5em; }
---

# 🚀 IncidentFlow
**Plateforme de Gestion d'Incidents Moderne**
*Soutenance de Stage - Netmar*

---

## Slide 1 : Introduction et Contexte
![bg right:45% fit](/home/anas/Desktop/stage/App/screens/login.png)

- **Nom du projet :** IncidentFlow
- **Cadre :** Stage au sein de l'entreprise Netmar (Encadrante : Sophie MARTIN).
- **Problématique :** Les outils de gestion des services informatiques traditionnels sur le marché ont souvent des cycles de vie d'incidents rigides et "codés en dur", ce qui empêche une adaptation rapide.
- **Solution proposée :** Création d'une plateforme de gestion d'incidents dynamique, adaptative et moderne.

---

## Slide 2 : Objectifs Principaux
![bg right:45% fit](/home/anas/Desktop/stage/App/screens/dashboard.png)

1. **Agilité Opérationnelle :** Permettre aux administrateurs de modifier graphiquement les règles de transition d'un incident sans interruption de service.
2. **Conformité SLA :** Planificateur d'escalade automatique pour assurer le respect des délais (MTTR, MTTA).
3. **Sécurité et Traçabilité :** Contrôle d'accès avancé (RBAC), journal d'audit complet et révocation immédiate des sessions.

---

## Slide 3 : Conception et Architecture (N-Tiers)
![bg right:45% fit](/home/anas/Desktop/stage/App/screens/workflow_manager.png)

- **Frontend (Client Web) :** React 19, Vite, et ReactFlow pour le rendu visuel et interactif des workflows.
- **Backend (API REST) :** Java 17 (LTS) et Spring Boot 3 avec Spring Security.
- **Bases de données & Cache :** 
  - *PostgreSQL 15* pour le stockage relationnel.
  - *Redis 7* pour le cache distribué.
- **Sécurité (IAM) :** Keycloak (OIDC / OAuth 2.0).

---

## Slide 4 : Préparation et Révision (NotebookLM)
![bg right:45% fit](/home/anas/Desktop/stage/App/lessons/Screenshot%20From%202026-08-19%2013-52-42.png)

- **Phase Préparatoire :** Révision approfondie des concepts techniques et du cahier des charges avant le début du développement.
- **Utilisation de NotebookLM :**
  - Centralisation de la documentation technique et des notes.
  - Création de synthèses intelligentes et de guides de révision interactifs.
  - Génération de résumés pour s'imprégner des processus métiers et des exigences d'architecture.
- **Bénéfices :** Démarrage structuré du projet, avec une vision claire de l'architecture N-Tiers, et un développement plus fluide.

---

## Slide 5 : Développement et "Vibe Coding"
![bg right:45% fit](/home/anas/Desktop/stage/App/screens/addIncident.png)

- **Méthodologie :** Utilisation active du **"Vibe Coding"** avec un assistant IA.
- **Bénéfices :** 
  - Génération de code et débogage en temps réel.
  - Structuration d'architecture optimisée.
- **Itération rapide :** Accélération de l'implémentation de fonctionnalités complexes comme le Journal d'Audit, les exports PDF, et le moteur de validation de Graphe DFS.

---

## Slide 6 : Résolution des Erreurs de Développement
![bg right:45% fit](/home/anas/Desktop/stage/App/screens/permissions_matrice.png)

Défis techniques identifiés et corrigés :
1. **Erreurs React :** Résolution d'un problème d'ordre d'appel des hooks et correction de référence de cache (`commandPaletteInputRef`).
2. **Erreurs Backend :** Correction de l'erreur "Detached Entity" (Hibernate) lors de l'édition des workflows.
3. **Bugs d'UI :** Correction de l'affichage du dépassement de SLA et ajustements sur la matrice des permissions RBAC.

---

## Slide 7 : Utilisation de Git (Versionnement)
![bg right:45% fit](/home/anas/Desktop/stage/App/screens/kanban_incidents.png)

- Le projet a été géré de manière professionnelle via **Git**.
- **Traçabilité :** Utilisation de commits atomiques et descriptifs (`feat`, `fix`, `refactor`, `docs`) pour bien scinder les évolutions.
- **Collaboration et Sécurité :** L'historique incrémental propre illustre une grande rigueur de développement, indispensable en entreprise.

---

## Slide 8 : Continuité et Reprise de Contexte (Antigravity CLI)
![bg right:45% fit](/home/anas/Desktop/stage/App/screens/workflow_manager_text.png)

- **Complément au "Vibe Coding" :** Utilisation avancée de l'assistant IA avec **Antigravity CLI**.
- **La commande `/resume` :** 
  - Permet à l'IA de reprendre le contexte exact de développement d'une session à l'autre.
  - Synchronisation instantanée avec l'état actuel du code et de l'historique.
- **Impact :** Maintien du "flow" de développement, élimination des tâches répétitives pour ré-expliquer le projet, et productivité maximisée.

---

## Slide 9 : Scénario de Démonstration
![bg right:45% fit](/home/anas/Desktop/stage/App/screens/Log_Incidents.png)

1. **Opérateur :** Connexion, création d'un incident et génération du code (ex: `INC-2026-xxx`).
2. **Administrateur :** Édition du workflow via l'interface graphique (ReactFlow) et validation de l'absence d'impasses.
3. **Moteur SLA :** Escalade automatique en priorité "Critical" après dépassement du temps limite.
4. **Audit Trail :** Visualisation de l'historique complet pour prouver la traçabilité.

---

## Slide 10 : Conclusion et Perspectives IA
![bg right:45% fit](/home/anas/Desktop/stage/App/screens/Incident_Details.png)

- **Bilan :** IncidentFlow répond aux besoins de flexibilité de Netmar tout en respectant les plus hauts standards de sécurité.
- **Perspectives Futures (IA) :** 
  - Classification automatique des incidents via LLM.
  - Estimation de la sévérité grâce au NLP.
  - Assistant de résolution "RAG" pour aider les techniciens avec l'historique des pannes.
