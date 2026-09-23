import Keycloak from 'keycloak-js';

const keycloakConfig = {
  url: 'http://localhost:8181/',
  realm: 'incidentflow-realm',
  clientId: 'incidentflow-frontend'
};

const keycloak = new Keycloak(keycloakConfig);
export default keycloak;
