package com.netmar.incidentflow.service;

import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.keycloak.admin.client.resource.RealmResource;
import org.keycloak.admin.client.resource.UsersResource;
import org.keycloak.admin.client.resource.UserResource;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import javax.ws.rs.core.Response;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class KeycloakAdminService {

    @Value("${keycloak.admin.server-url}")
    private String serverUrl;

    @Value("${keycloak.admin.realm}")
    private String realm;

    @Value("${keycloak.admin.username}")
    private String username;

    @Value("${keycloak.admin.password}")
    private String password;

    @Value("${keycloak.admin.clientId}")
    private String clientId;

    @Value("${keycloak.admin.target-realm}")
    private String targetRealm;

    private Keycloak keycloak;

    private Keycloak getKeycloak() {
        if (keycloak == null || keycloak.isClosed()) {
            keycloak = KeycloakBuilder.builder()
                    .serverUrl(serverUrl)
                    .realm(realm)
                    .username(username)
                    .password(password)
                    .clientId(clientId)
                    .build();
        }
        return keycloak;
    }

    private RealmResource getTargetRealm() {
        return getKeycloak().realm(targetRealm);
    }

    public void createUser(String email, String firstName, String lastName, String rawPassword, String roleName) {
        UserRepresentation user = new UserRepresentation();
        user.setUsername(email);
        user.setEmail(email);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setEnabled(true);
        user.setEmailVerified(true);
        
        if (roleName != null && !roleName.isEmpty()) {
            Map<String, List<String>> attributes = new HashMap<>();
            attributes.put("role", Collections.singletonList(roleName));
            user.setAttributes(attributes);
        }

        UsersResource usersResource = getTargetRealm().users();
        Response response = usersResource.create(user);
        
        if (response.getStatus() == 201) {
            String userId = response.getLocation().getPath().replaceAll(".*/([^/]+)$", "$1");
            
            // Set password
            CredentialRepresentation passwordCred = new CredentialRepresentation();
            passwordCred.setTemporary(false);
            passwordCred.setType(CredentialRepresentation.PASSWORD);
            passwordCred.setValue(rawPassword);
            
            usersResource.get(userId).resetPassword(passwordCred);
        } else {
            throw new RuntimeException("Erreur lors de la création de l'utilisateur Keycloak : HTTP " + response.getStatus());
        }
    }

    public void updateUser(String email, String firstName, String lastName, String rawPassword, String roleName) {
        UsersResource usersResource = getTargetRealm().users();
        List<UserRepresentation> search = usersResource.search(email, true);
        if (!search.isEmpty()) {
            UserRepresentation user = search.get(0);
            user.setFirstName(firstName);
            user.setLastName(lastName);
            
            if (roleName != null && !roleName.isEmpty()) {
                Map<String, List<String>> attributes = user.getAttributes();
                if (attributes == null) {
                    attributes = new HashMap<>();
                }
                attributes.put("role", Collections.singletonList(roleName));
                user.setAttributes(attributes);
            }
            
            UserResource userResource = usersResource.get(user.getId());
            userResource.update(user);
            
            if (rawPassword != null && !rawPassword.isEmpty()) {
                CredentialRepresentation passwordCred = new CredentialRepresentation();
                passwordCred.setTemporary(false);
                passwordCred.setType(CredentialRepresentation.PASSWORD);
                passwordCred.setValue(rawPassword);
                userResource.resetPassword(passwordCred);
            }
        }
    }

    public void deleteUser(String email) {
        UsersResource usersResource = getTargetRealm().users();
        List<UserRepresentation> search = usersResource.search(email, true);
        if (!search.isEmpty()) {
            usersResource.get(search.get(0).getId()).remove();
        }
    }
}
