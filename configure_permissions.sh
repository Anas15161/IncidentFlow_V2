#!/bin/bash
docker exec incidentflow-keycloak-v2 /opt/keycloak/bin/kcadm.sh config credentials --server http://localhost:8080 --realm master --user admin --password admin_secure_keycloak_pass
# Create permission roles
for PERM in PAGE_DASHBOARD PAGE_INCIDENTS PAGE_WORKFLOWS PAGE_SLA PAGE_USERS INCIDENT_CREATE INCIDENT_EDIT INCIDENT_DELETE INCIDENT_REASSIGN INCIDENT_EXPORT_PDF INCIDENT_VIEW_MEDICAL WORKFLOW_EDIT; do
  docker exec incidentflow-keycloak-v2 /opt/keycloak/bin/kcadm.sh create roles -r incidentflow-realm -s name=$PERM -s description="Permission: $PERM" 2>/dev/null || true
done

# Convert Administrateur to composite role
docker exec incidentflow-keycloak-v2 /opt/keycloak/bin/kcadm.sh add-roles -r incidentflow-realm --rname Administrateur --rolename PAGE_DASHBOARD --rolename PAGE_INCIDENTS --rolename PAGE_WORKFLOWS --rolename PAGE_SLA --rolename PAGE_USERS --rolename INCIDENT_CREATE --rolename INCIDENT_EDIT --rolename INCIDENT_DELETE --rolename INCIDENT_REASSIGN --rolename INCIDENT_EXPORT_PDF --rolename INCIDENT_VIEW_MEDICAL --rolename WORKFLOW_EDIT

# Convert Responsable
docker exec incidentflow-keycloak-v2 /opt/keycloak/bin/kcadm.sh add-roles -r incidentflow-realm --rname Responsable --rolename PAGE_DASHBOARD --rolename PAGE_INCIDENTS --rolename PAGE_WORKFLOWS --rolename PAGE_SLA --rolename INCIDENT_CREATE --rolename INCIDENT_EDIT --rolename INCIDENT_EXPORT_PDF --rolename INCIDENT_VIEW_MEDICAL --rolename WORKFLOW_EDIT

# Convert Opérateur
docker exec incidentflow-keycloak-v2 /opt/keycloak/bin/kcadm.sh add-roles -r incidentflow-realm --rname Opérateur --rolename PAGE_DASHBOARD --rolename PAGE_INCIDENTS --rolename PAGE_SLA --rolename INCIDENT_CREATE --rolename INCIDENT_EDIT --rolename INCIDENT_EXPORT_PDF

