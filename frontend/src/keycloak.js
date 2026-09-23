import Keycloak from 'keycloak-js';

const keycloakConfig = {
  url: 'http://localhost:8180/',
  realm: 'incidentflow',
  clientId: 'incidentflow-frontend'
};

const keycloak = new Keycloak(keycloakConfig);
export default keycloak;
