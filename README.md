# IncidentFlow V2 🚀

**IncidentFlow V2** est une application moderne de gestion et de résolution d'incidents, s'appuyant sur une architecture micro-services complète. L'application intègre une authentification sécurisée via **Keycloak** (IAM) et l'orchestration des processus métier via le moteur **Flowable** (BPMN).

---

## 🛠 Prérequis

Pour lancer le projet sur votre machine locale, vous aurez uniquement besoin de :
- [Docker](https://docs.docker.com/get-docker/) installé et en cours d'exécution.
- [Docker Compose](https://docs.docker.com/compose/install/) (intégré aux versions récentes de Docker Desktop).
- *Il n'est pas nécessaire d'installer Java, Node.js ou PostgreSQL localement, tout est entièrement conteneurisé !*

---

## 🚀 Démarrage Rapide (Launch)

1. **Cloner le projet** et se placer à la racine :
   ```bash
   git clone <URL_DU_DEPOT>
   cd IncidentFlow_V2
   ```

2. **Lancer l'ensemble des services** (Frontend, Backend, BDD, IAM, BPMN) avec Docker Compose :
   ```bash
   docker compose up -d --build
   ```
   *(La première exécution peut prendre quelques minutes le temps de télécharger les images de base et de builder le projet Java/React).*

3. **Vérifier les logs** (si besoin) :
   ```bash
   docker compose logs -f incidentflow-backend-v2
   ```

*(Note architecturale : Ne lancez pas le backend avec `mvn spring-boot:run`, toute recompilation ou lancement doit se faire via le conteneur Docker afin de respecter la liaison des réseaux isolés).*

---

## 🔗 Liens & Accès (Identifiants)

Une fois tous les conteneurs démarrés, voici les différents portails accessibles :

### 1. 🖥 Application Web Principale (React)
- **URL** : [http://localhost:3001](http://localhost:3001)
- **Comptes de test (Authentification gérée par Keycloak)** :
  - *Administrateur* : `admin@netmar.com` / **Mot de passe** : `password`
  - *Opérateur* : `operateur@netmar.com` / **Mot de passe** : `password`

### 2. 🔐 Keycloak (Gestion des Identités et Accès)
- **URL** : [http://localhost:8181](http://localhost:8181)
- **Identifiants Administrateur (Master Realm)** : 
  - **Login** : `admin`
  - **Mot de passe** : `admin_secure_keycloak_pass`

### 3. ⚙️ Flowable UI (Moteur de Workflow BPMN)
- **URL** : [http://localhost:8082/flowable-ui](http://localhost:8082/flowable-ui)
- **Identifiants par défaut** :
  - **Login** : `admin`
  - **Mot de passe** : `test`

---

## 📚 Documentation Interactive de Soutenance

Un guide technique interactif détaillé a été rédigé pour la soutenance. Il cartographie tout le parcours de la donnée, du "Shadow User" jusqu'à l'exécution BPMN.
👉 Pour le consulter, ouvrez simplement le fichier suivant dans n'importe quel navigateur web :
`docs/presentation_soutenance.html`

---

## 🏗 Architecture Technique Globale
- **Frontend** : React.js (Port `3001`)
- **Backend** : Spring Boot 3 (Port `8081`)
- **Base de Données** : PostgreSQL 16 (Port `5434`)
- **Cache** : Redis 7 (Port `6381`)
- **IAM** : Keycloak 21.1 (Port `8181`)
- **BPMN** : Flowable 6.8 (Port `8082`)
