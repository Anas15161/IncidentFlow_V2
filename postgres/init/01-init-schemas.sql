-- Création des 3 schémas dédiés (en plus du schéma public)
CREATE SCHEMA IF NOT EXISTS keycloak;
CREATE SCHEMA IF NOT EXISTS flowable;
CREATE SCHEMA IF NOT EXISTS incidentflow;

-- Attribution des droits complets à l'utilisateur IncidentFlow_user
GRANT ALL ON SCHEMA public TO "IncidentFlow_user";
GRANT ALL ON SCHEMA keycloak TO "IncidentFlow_user";
GRANT ALL ON SCHEMA flowable TO "IncidentFlow_user";
GRANT ALL ON SCHEMA incidentflow TO "IncidentFlow_user";

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO "IncidentFlow_user";
ALTER DEFAULT PRIVILEGES IN SCHEMA keycloak GRANT ALL ON TABLES TO "IncidentFlow_user";
ALTER DEFAULT PRIVILEGES IN SCHEMA flowable GRANT ALL ON TABLES TO "IncidentFlow_user";
ALTER DEFAULT PRIVILEGES IN SCHEMA incidentflow GRANT ALL ON TABLES TO "IncidentFlow_user";
