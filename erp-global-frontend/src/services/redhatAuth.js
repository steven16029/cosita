import Keycloak from 'keycloak-js';

// Configuracion inyectada en tiempo de ejecucion desde variables de entorno de OpenShift
const keycloakConfig = {
  url: window._env_?.REACT_APP_RHSSO_URL || 'https://sso.empresa-global.com/auth',
  realm: window._env_?.REACT_APP_RHSSO_REALM || 'erp-international',
  clientId: window._env_?.REACT_APP_RHSSO_CLIENT_ID || 'erp-react-web'
};

const keycloak = new Keycloak(keycloakConfig);

export default keycloak;
