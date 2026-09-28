package com.netmar.incidentflow.service;

import com.netmar.incidentflow.exception.ResourceNotFoundException;
import com.netmar.incidentflow.model.Role;
import com.netmar.incidentflow.model.User;
import com.netmar.incidentflow.repository.RoleRepository;
import com.netmar.incidentflow.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.List;

import com.netmar.incidentflow.model.Permission;
import com.netmar.incidentflow.repository.PermissionRepository;
import java.util.HashSet;
import java.util.Set;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final HttpServletRequest request;
    private final PasswordEncoder passwordEncoder;
    private final KeycloakAdminService keycloakAdminService;

    public UserService(UserRepository userRepository, RoleRepository roleRepository, PermissionRepository permissionRepository, HttpServletRequest request, PasswordEncoder passwordEncoder, KeycloakAdminService keycloakAdminService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.permissionRepository = permissionRepository;
        this.request = request;
        this.passwordEncoder = passwordEncoder;
        this.keycloakAdminService = keycloakAdminService;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }

    public List<Permission> getAllPermissions() {
        return permissionRepository.findAll();
    }

    public Role updateRolePermissions(Long roleId, List<String> permissionCodes) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Rôle non trouvé avec l'ID : " + roleId));

        Set<Permission> newPermissions = new HashSet<>();
        if (permissionCodes != null) {
            for (String code : permissionCodes) {
                permissionRepository.findByCode(code).ifPresent(newPermissions::add);
            }
        }
        role.setPermissions(newPermissions);
        return roleRepository.save(role);
    }

    public Role saveRole(Role role) {
        if (role.getName() == null || role.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Le nom du rôle ne peut pas être vide.");
        }
        if (roleRepository.findByName(role.getName().trim()).isPresent()) {
            throw new IllegalArgumentException("Un rôle avec ce nom existe déjà : " + role.getName());
        }
        role.setName(role.getName().trim());
        return roleRepository.save(role);
    }

    public Role updateRole(Long id, Role details) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rôle non trouvé avec l'ID : " + id));
        if (details.getName() != null && !details.getName().trim().isEmpty()) {
            String newName = details.getName().trim();
            roleRepository.findByName(newName).ifPresent(existing -> {
                if (!existing.getId().equals(id)) {
                    throw new IllegalArgumentException("Un autre rôle porte déjà ce nom : " + newName);
                }
            });
            role.setName(newName);
        }
        if (details.getDescription() != null) {
            role.setDescription(details.getDescription().trim());
        }
        return roleRepository.save(role);
    }

    public void deleteRole(Long id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rôle non trouvé avec l'ID : " + id));
        
        long userCount = userRepository.countByRole(role);
        if (userCount > 0) {
            throw new IllegalStateException("Impossible de supprimer le rôle '" + role.getName() + "' car " + userCount + " utilisateur(s) y sont assigné(s).");
        }
        
        roleRepository.delete(role);
    }

    public User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && auth.getPrincipal() instanceof org.springframework.security.oauth2.jwt.Jwt) {
            org.springframework.security.oauth2.jwt.Jwt jwt = (org.springframework.security.oauth2.jwt.Jwt) auth.getPrincipal();
            String email = jwt.getClaimAsString("email");
            if (email == null) {
                email = jwt.getClaimAsString("preferred_username");
            }
            if (email != null) {
                final String finalEmail = email;
                return userRepository.findByEmail(finalEmail)
                        .orElseThrow(() -> new ResourceNotFoundException("User not found for email: " + finalEmail));
            }
        }

        String mockEmail = request.getHeader("X-Mock-User");
        if (mockEmail == null || mockEmail.trim().isEmpty()) {
            mockEmail = "admin@netmar.com"; 
        }
        final String finalMockEmail = mockEmail;
        return userRepository.findByEmail(finalMockEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Simulated user not found: " + finalMockEmail));
    }

    @Transactional
    public User saveUser(User user) {
        String rawPassword = user.getPassword();
        if (rawPassword == null || rawPassword.isEmpty()) {
            rawPassword = "password";
        }
        
        if (user.getName() == null && user.getFirstName() != null) {
            user.setName(user.getFirstName() + " " + (user.getLastName() != null ? user.getLastName() : ""));
        }
        
        try {
            keycloakAdminService.createUser(user.getEmail(), user.getFirstName(), user.getLastName(), rawPassword, user.getRole() != null ? user.getRole().getName() : null);
        } catch(Exception e) {
            System.err.println("Warning: Impossible de créer l'utilisateur dans Keycloak: " + e.getMessage());
            e.printStackTrace();
        }
        
        user.setPassword(passwordEncoder.encode(rawPassword));
        return userRepository.save(user);
    }

    @Transactional
    public User updateUser(Long id, User details) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));
                
        String rawPassword = null;
        if (details.getPassword() != null && !details.getPassword().isEmpty() && !details.getPassword().startsWith("$2a$")) {
            rawPassword = details.getPassword();
            user.setPassword(passwordEncoder.encode(rawPassword));
        }
        
        try {
            keycloakAdminService.updateUser(user.getEmail(), details.getFirstName(), details.getLastName(), rawPassword, details.getRole() != null ? details.getRole().getName() : (user.getRole() != null ? user.getRole().getName() : null));
        } catch(Exception e) {
            System.err.println("Warning: Impossible de mettre à jour l'utilisateur dans Keycloak: " + e.getMessage());
        }

        user.setFirstName(details.getFirstName());
        user.setLastName(details.getLastName());
        user.setName(details.getFirstName() + " " + (details.getLastName() != null ? details.getLastName() : ""));
        
        // Attention : Changer l'email dans KC est complexe, on le met à jour seulement localement ici si KC échoue/n'est pas supporté.
        user.setEmail(details.getEmail()); 
        
        user.setTelephone(details.getTelephone());
        user.setDepartment(details.getDepartment());
        user.setPost(details.getPost());
        user.setActive(details.isActive());
        if (details.getAvatarColor() != null) {
            user.setAvatarColor(details.getAvatarColor());
        }
        if (details.getRole() != null) {
            user.setRole(details.getRole());
        }
        
        return userRepository.save(user);
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));
        
        try {
            keycloakAdminService.deleteUser(user.getEmail());
        } catch(Exception e) {
            System.err.println("Warning: Impossible de supprimer l'utilisateur dans Keycloak: " + e.getMessage());
        }
        
        userRepository.delete(user);
    }
}
