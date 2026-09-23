#!/bin/bash
docker exec incidentflow-keycloak-v2 /opt/keycloak/bin/kcadm.sh config credentials --server http://localhost:8080 --realm master --user admin --password admin_secure_keycloak_pass

# Get client ID
CID=$(docker exec incidentflow-keycloak-v2 /opt/keycloak/bin/kcadm.sh get clients -r incidentflow-realm -q clientId=incidentflow-frontend | grep '"id"' | cut -d '"' -f 4)

# Create Client Roles (Permissions)
for PERM in PAGE_DASHBOARD PAGE_INCIDENTS PAGE_WORKFLOWS PAGE_SLA PAGE_USERS INCIDENT_CREATE INCIDENT_EDIT INCIDENT_DELETE INCIDENT_REASSIGN INCIDENT_EXPORT_PDF INCIDENT_VIEW_MEDICAL WORKFLOW_EDIT; do
  docker exec incidentflow-keycloak-v2 /opt/keycloak/bin/kcadm.sh create clients/$CID/roles -r incidentflow-realm -s name=$PERM -s description="Permission: $PERM" 2>/dev/null || true
done

# Assign Client Roles to Realm Roles
docker exec incidentflow-keycloak-v2 /opt/keycloak/bin/kcadm.sh add-roles -r incidentflow-realm --rname Administrateur --cclientid incidentflow-frontend --rolename PAGE_DASHBOARD --rolename PAGE_INCIDENTS --rolename PAGE_WORKFLOWS --rolename PAGE_SLA --rolename PAGE_USERS --rolename INCIDENT_CREATE --rolename INCIDENT_EDIT --rolename INCIDENT_DELETE --rolename INCIDENT_REASSIGN --rolename INCIDENT_EXPORT_PDF --rolename INCIDENT_VIEW_MEDICAL --rolename WORKFLOW_EDIT

docker exec incidentflow-keycloak-v2 /opt/keycloak/bin/kcadm.sh add-roles -r incidentflow-realm --rname Responsable --cclientid incidentflow-frontend --rolename PAGE_DASHBOARD --rolename PAGE_INCIDENTS --rolename PAGE_WORKFLOWS --rolename PAGE_SLA --rolename INCIDENT_CREATE --rolename INCIDENT_EDIT --rolename INCIDENT_EXPORT_PDF --rolename INCIDENT_VIEW_MEDICAL --rolename WORKFLOW_EDIT

docker exec incidentflow-keycloak-v2 /opt/keycloak/bin/kcadm.sh add-roles -r incidentflow-realm --rname Opérateur --cclientid incidentflow-frontend --rolename PAGE_DASHBOARD --rolename PAGE_INCIDENTS --rolename PAGE_SLA --rolename INCIDENT_CREATE --rolename INCIDENT_EDIT --rolename INCIDENT_EXPORT_PDF

# Delete Realm Roles (Permissions)
for PERM in PAGE_DASHBOARD PAGE_INCIDENTS PAGE_WORKFLOWS PAGE_SLA PAGE_USERS INCIDENT_CREATE INCIDENT_EDIT INCIDENT_DELETE INCIDENT_REASSIGN INCIDENT_EXPORT_PDF INCIDENT_VIEW_MEDICAL WORKFLOW_EDIT; do
  docker exec incidentflow-keycloak-v2 /opt/keycloak/bin/kcadm.sh delete roles/$PERM -r incidentflow-realm 2>/dev/null || true
done

