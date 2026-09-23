# IncidentFlow V2 - Gestion d'Incidents & Moteur de Workflow BPMN

IncidentFlow V2 est une évolution majeure de la plateforme de gestion d'incidents. Cette version abandonne la machine à états manuelle de la V1 pour intégrer un véritable moteur de workflow industriel (**Flowable BPMN**), et remplace les mocks d'authentification par une gestion d'identité robuste avec **Keycloak**.

---

## ✨ Nouveautés de la Version 2

- **Moteur de Workflow BPMN (Flowable)** : L'application est désormais pilotée par un fichier BPMN 2.0 (`incident_workflow_v2.bpmn20.xml`). La logique de transition (qui peut faire quoi, quand et comment) n'est plus codée en dur dans Java, mais déléguée à Flowable.
- **Visualiseur BPMN Dynamique** : Intégration d'un outil d'analyse interactif et de génération de rapports PDF (basé sur `bpmn-js`) pour inspecter visuellement le flux de travail, avec un dashboard statistique intégré.
- **Sécurité OAuth2 & IAM** : Véritable intégration de Keycloak. Spring Boot agit comme un *Resource Server* qui valide les tokens JWT, garantissant une architecture Zero-Trust.
- **Base de Données Multi-schémas** : Utilisation d'un conteneur PostgreSQL unique hébergeant deux schémas étanches (`incidentflow` et `keycloak`), optimisant les ressources tout en garantissant l'isolation des données.

---

## 🚀 Architecture Technique

- **Backend API** : Spring Boot 3, Java 17, Spring Security (OAuth2), Flowable Engine, Hibernate/JPA.
- **Frontend** : React 19, Vite, bpmn-js (pour le rendu SVG vectoriel interactif).
- **Identity Provider (IAM)** : Keycloak (Port `8180`).
- **Base de Données** : PostgreSQL (Port `5433`).

---

## 📂 Structure du Projet

```text
├── backend/            # API Spring Boot & Logique Métier (Flowable)
├── frontend/           # Interface Utilisateur React
├── docker-compose.yml  # Orchestration de l'infrastructure
├── postgres/           # Scripts d'initialisation (Multi-schemas)
├── keycloak/           # Configurations et exports de Realm Keycloak
├── rapports/           # Ensemble des documentations techniques (PDF/HTML/PUML)
└── flowable_dynamic_analyzer.html # Outil d'analyse graphique et export PDF des BPMN
```

---

## 🛠️ Démarrage Rapide (Environnement de Développement)

### 1. Démarrer l'infrastructure (Base de données & Keycloak)
À la racine du projet, lancez l'infrastructure vitale via Docker :
```bash
docker compose up -d incidentflow-postgres keycloak
```
> **Note** : PostgreSQL créera automatiquement les bases de données et les rôles nécessaires au premier lancement grâce au script `postgres/init/01-init-schemas.sql`.

### 2. Démarrer le Backend (Spring Boot)
Ouvrez un nouveau terminal et lancez le backend :
```bash
cd backend
mvn spring-boot:run
```
Le backend démarrera sur le port **`8080`**. Au démarrage, il importera automatiquement le fichier BPMN situé dans `src/main/resources/processes/`.

### 3. Démarrer le Frontend (React)
Dans un troisième terminal :
```bash
cd frontend
npm install
npm run dev
```
Accédez à l'application via : **[http://localhost:3000](http://localhost:3000)**.

---

## 📊 Outils & Documentation

Cette version est livrée avec un écosystème documentaire complet généré lors du développement :

### 1. L'Analyseur Dynamique BPMN
Ouvrez le fichier `flowable_dynamic_analyzer.html` directement dans votre navigateur web.
- Importez le fichier XML du workflow pour voir le **schéma interactif**.
- Un mode "Spotlight" (focus laser) et un tableau d'inventaire permettent de comprendre le rôle de chaque tâche.
- Un bouton d'**export PDF vectoriel** permet de générer des rapports techniques de haute qualité pour la validation métier.

### 2. Les Rapports d'Architecture
Dans le dossier `/rapports`, vous trouverez les versions PDF et HTML des décisions d'architecture :
- **Architecture de Base de données (V2)**
- **Architecture RBAC & Intégration Keycloak**
- **Logiques de transition & Cycles de vie Kanban**
- **Parcours technique Flowable XML**

---

## 🔐 Identifiants par Défaut

**Keycloak Admin Console** (http://localhost:8180/admin) :
- User: `admin`
- Password: *(Défini dans le `.env` à la racine)*

**Comptes de l'Application (Test)** :
Référez-vous à la documentation Keycloak et au script de Seed initial pour la liste des utilisateurs de test (Administrateur, Superviseur, Opérateur, etc.).
