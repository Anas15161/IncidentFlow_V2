package com.netmar.incidentflow.service;

import com.netmar.incidentflow.exception.ResourceNotFoundException;
import com.netmar.incidentflow.model.*;
import com.netmar.incidentflow.repository.IncidentRepository;
import com.netmar.incidentflow.repository.UserRepository;
import com.netmar.incidentflow.repository.AttachmentRepository;
import com.netmar.incidentflow.repository.CommentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class IncidentService {

    private final IncidentRepository incidentRepository;
    private final UserRepository userRepository;
    private final WorkflowService workflowService;
    private final AttachmentRepository attachmentRepository;
    private final CommentRepository commentRepository;
    private final org.flowable.engine.RuntimeService runtimeService;
    private final org.flowable.engine.TaskService taskService;

    public IncidentService(IncidentRepository incidentRepository,
                           UserRepository userRepository,
                           WorkflowService workflowService,
                           AttachmentRepository attachmentRepository,
                           CommentRepository commentRepository,
                           org.flowable.engine.RuntimeService runtimeService,
                           org.flowable.engine.TaskService taskService) {
        this.incidentRepository = incidentRepository;
        this.userRepository = userRepository;
        this.workflowService = workflowService;
        this.attachmentRepository = attachmentRepository;
        this.commentRepository = commentRepository;
        this.runtimeService = runtimeService;
        this.taskService = taskService;
    }

    public List<Incident> getIncidents(String category, String priority, String status, Long assignedToId, String search) {
        return incidentRepository.findAll((root, query, cb) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();

            if (category != null && !category.isEmpty()) {
                predicates.add(cb.equal(root.get("category"), category));
            }
            if (priority != null && !priority.isEmpty()) {
                predicates.add(cb.equal(root.get("priority"), priority));
            }
            if (status != null && !status.isEmpty()) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (assignedToId != null) {
                predicates.add(cb.equal(root.get("assignedTo").get("id"), assignedToId));
            }
            if (search != null && !search.isEmpty()) {
                String pattern = "%" + search.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("title")), pattern),
                        cb.like(cb.lower(root.get("description")), pattern),
                        cb.like(cb.lower(root.get("incidentCode")), pattern)
                ));
            }

            query.orderBy(cb.desc(root.get("createdAt")));
            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        });
    }

    public Incident getIncidentByCode(String code) {
        return incidentRepository.findByIncidentCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Incident non trouvé avec le code: " + code));
    }

    @Transactional
    public Incident createIncident(Incident incident, User author) {
        incident.setAuthor(author);

        // Generer le code incident unique (ex: INC-2026-005)
        int year = LocalDateTime.now().getYear();
        String prefix = "INC-" + year + "-";
        String maxCode = incidentRepository.findMaxIncidentCodeByPrefix(prefix);
        int seq = 1;
        if (maxCode != null && maxCode.startsWith(prefix)) {
            try {
                String seqStr = maxCode.substring(prefix.length());
                seq = Integer.parseInt(seqStr) + 1;
            } catch (NumberFormatException ignored) {}
        }
        incident.setIncidentCode(String.format("%s%03d", prefix, seq));

        // =========================================================================
        // ÉTAPE C-1 : Démarrage d'une Instance Flowable & Clé Étrangère Souple (Soft FK)
        // 1. runtimeService.startProcessInstanceByKey démarre une exécution vivante du BPMN
        //    dans le schéma 'flowable' (tables act_ru_execution, act_ru_task).
        // 2. L'identifiant 'processInstance.getId()' est stocké dans 'incidentflow.incidents.process_instance_id'.
        //    Il s'agit d'une Soft Foreign Key (sans contrainte SQL rigide inter-schémas).
        // 3. Le statut initial de l'incident est synchronisé directement depuis la 1ère UserTask Flowable.
        // =========================================================================
        java.util.Map<String, Object> variables = new java.util.HashMap<>();
        variables.put("incidentCode", incident.getIncidentCode());
        variables.put("initiator", author.getName());
        try {
            org.flowable.engine.runtime.ProcessInstance processInstance = runtimeService.startProcessInstanceByKey("incidentWorkflow", variables);
            incident.setProcessInstanceId(processInstance.getId());
            
            org.flowable.task.api.Task currentTask = taskService.createTaskQuery().processInstanceId(processInstance.getId()).singleResult();
            if (currentTask != null) {
                incident.setStatus(currentTask.getName());
            } else {
                incident.setStatus("Nouveau");
            }
        } catch (Exception e) {
            System.err.println("Flowable process start failed, falling back to Nouveau: " + e.getMessage());
            incident.setStatus("Nouveau");
        }

        // Regle d'affectation automatique pour le medical
        if ("Médical".equalsIgnoreCase(incident.getCategory())) {
            userRepository.findAll().stream()
                    .filter(u -> u.getRole() != null && "Opérateur médical".equalsIgnoreCase(u.getRole().getName()))
                    .findFirst()
                    .ifPresent(incident::setAssignedTo);
        } else if (incident.getAssignedTo() != null && incident.getAssignedTo().getId() != null) {
            User assigned = userRepository.findById(incident.getAssignedTo().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Assignee user not found with ID: " + incident.getAssignedTo().getId()));
            incident.setAssignedTo(assigned);
        }

        // Creer le premier log d'historique
        List<IncidentHistory> historyList = new ArrayList<>();
        historyList.add(IncidentHistory.builder()
                .action("Incident déclaré")
                .username(author.getName())
                .incident(incident)
                .build());

        if (incident.getAssignedTo() != null) {
            String systemMsg = "Médical".equalsIgnoreCase(incident.getCategory())
                    ? "Assigné automatiquement à " + incident.getAssignedTo().getName() + " (Règle d'incident médical)"
                    : "Assigné à " + incident.getAssignedTo().getName();
            historyList.add(IncidentHistory.builder()
                    .action(systemMsg)
                    .username("Système")
                    .incident(incident)
                    .build());
        }

        incident.setHistory(historyList);
        return incidentRepository.save(incident);
    }

    @Transactional
    public Incident updateIncident(String code, Incident details, User user) {
        Incident incident = getIncidentByCode(code);

        incident.setTitle(details.getTitle());
        incident.setDescription(details.getDescription());
        incident.setCategory(details.getCategory());
        incident.setPriority(details.getPriority());
        if (details.getSeverity() != null && !details.getSeverity().isEmpty()) {
            incident.setSeverity(details.getSeverity());
        }

        // Verifier le changement d'assignataire
        User oldAssignee = incident.getAssignedTo();
        User newAssignee = details.getAssignedTo();

        if (newAssignee != null && (oldAssignee == null || !oldAssignee.getId().equals(newAssignee.getId()))) {
            // Recharger l'assignataire de la base
            User dbAssignee = userRepository.findById(newAssignee.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Assignee user not found"));
            incident.setAssignedTo(dbAssignee);

            // Log dans l'historique
            IncidentHistory history = IncidentHistory.builder()
                    .action("Assigné à " + dbAssignee.getName())
                    .username(user.getName())
                    .incident(incident)
                    .build();
            incident.getHistory().add(history);
        } else if (newAssignee == null && oldAssignee != null) {
            incident.setAssignedTo(null);
            IncidentHistory history = IncidentHistory.builder()
                    .action("Désassigné")
                    .username(user.getName())
                    .incident(incident)
                    .build();
            incident.getHistory().add(history);
        }

        return incidentRepository.save(incident);
    }

    @Transactional
    public Incident performTransition(String code, String toState, String commentText, User user) {
        Incident incident = getIncidentByCode(code);
        String oldState = incident.getStatus();

        if (incident.getProcessInstanceId() != null) {
            org.flowable.task.api.Task currentTask = taskService.createTaskQuery().processInstanceId(incident.getProcessInstanceId()).singleResult();
            if (currentTask != null) {
                java.util.Map<String, Object> variables = new java.util.HashMap<>();
                // Logique conditionnelle pour la passerelle (Gateway)
                if ("Résolu".equalsIgnoreCase(toState) || "Clôture de l'incident".equalsIgnoreCase(toState)) {
                    variables.put("resolved", true);
                } else if ("En cours".equalsIgnoreCase(toState)) {
                    variables.put("resolved", false);
                }
                
                try {
                    // =========================================================================
                    // ÉTAPE C-2 : Avancement d'un Incident lors d'une Transition Kanban (Flowable Runtime)
                    // 1. taskService.complete() valide la tâche courante et avance le jeton le long du SequenceFlow.
                    // 2. Flowable détermine automatiquement la tâche suivante selon le XML BPMN.
                    // 3. Le statut de l'incident en BDD prend le nom littéral de cette nouvelle tâche.
                    // 4. Flowable archive automatiquement la tâche passée dans 'flowable.act_hi_taskinst' (Audit).
                    // =========================================================================
                    taskService.complete(currentTask.getId(), variables);
                } catch (Exception e) {
                    System.err.println("Erreur d'exécution de la tâche Flowable: " + e.getMessage());
                }
                
                org.flowable.task.api.Task nextTask = taskService.createTaskQuery().processInstanceId(incident.getProcessInstanceId()).singleResult();
                if (nextTask != null) {
                    incident.setStatus(nextTask.getName());
                } else {
                    incident.setStatus(toState); // Processus terminé ou sans tâche
                }
            } else {
                incident.setStatus(toState);
            }
        } else {
            // Rétrocompatibilité si aucun processus Flowable n'est attaché
            workflowService.validateTransitionForIncident(incident, oldState, toState, user, commentText);
            incident.setStatus(toState);
        }

        // 3. Ajouter le commentaire si present
        if (commentText != null && !commentText.trim().isEmpty()) {
            Comment comment = Comment.builder()
                    .content(commentText)
                    .author(user)
                    .incident(incident)
                    .build();
            incident.getComments().add(comment);
        }

        // 4. Ajouter l'historique
        IncidentHistory history = IncidentHistory.builder()
                .action(String.format("Statut modifié à %s", incident.getStatus()))
                .username(user.getName())
                .incident(incident)
                .build();
        incident.getHistory().add(history);

        return incidentRepository.save(incident);
    }

    @Transactional
    public Comment addComment(String code, String content, User user) {
        Incident incident = getIncidentByCode(code);

        Comment comment = Comment.builder()
                .content(content)
                .author(user)
                .incident(incident)
                .build();

        incident.getComments().add(comment);

        IncidentHistory history = IncidentHistory.builder()
                .action("Commentaire ajouté")
                .username(user.getName())
                .incident(incident)
                .build();
        incident.getHistory().add(history);

        incidentRepository.save(incident);
        return comment;
    }

    @Transactional
    public Attachment addAttachment(String code, String filename, String filePath, String fileSize, String contentType) {
        Incident incident = getIncidentByCode(code);

        Attachment attachment = Attachment.builder()
                .filename(filename)
                .filePath(filePath)
                .fileSize(fileSize)
                .contentType(contentType)
                .incident(incident)
                .build();

        incident.getAttachments().add(attachment);

        IncidentHistory history = IncidentHistory.builder()
                .action("Pièce jointe ajoutée : " + filename)
                .username("Système")
                .incident(incident)
                .build();
        incident.getHistory().add(history);

        incidentRepository.save(incident);
        return attachment;
    }

    @Transactional
    public void deleteAttachment(Long id, User user) {
        Attachment attachment = attachmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Piece jointe introuvable avec l'ID: " + id));

        Incident incident = attachment.getIncident();
        incident.getAttachments().remove(attachment);

        IncidentHistory history = IncidentHistory.builder()
                .action("Pièce jointe supprimée : " + attachment.getFilename())
                .username(user != null ? user.getName() : "Système")
                .incident(incident)
                .build();
        incident.getHistory().add(history);

        incidentRepository.save(incident);

        // Supprimer le fichier sur le disque
        try {
            java.nio.file.Files.deleteIfExists(java.nio.file.Paths.get(attachment.getFilePath()));
        } catch (java.io.IOException e) {
            System.err.println("Impossible de supprimer le fichier physique: " + attachment.getFilePath() + " - " + e.getMessage());
        }
    }

    @Transactional
    public Attachment renameAttachment(Long id, String newName, User user) {
        Attachment attachment = attachmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Piece jointe introuvable avec l'ID: " + id));

        String oldName = attachment.getFilename();
        attachment.setFilename(newName);
        
        Incident incident = attachment.getIncident();
        
        IncidentHistory history = IncidentHistory.builder()
                .action("Pièce jointe renommée de '" + oldName + "' vers '" + newName + "'")
                .username(user != null ? user.getName() : "Système")
                .incident(incident)
                .build();
        incident.getHistory().add(history);

        incidentRepository.save(incident);
        return attachmentRepository.save(attachment);
    }

    @Transactional
    public Comment updateComment(Long commentId, String content, User user) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Commentaire introuvable avec l'ID: " + commentId));

        if (user == null || !comment.getAuthor().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Vous n'êtes pas autorisé à modifier ce commentaire");
        }

        comment.setContent(content);
        
        Incident incident = comment.getIncident();
        IncidentHistory history = IncidentHistory.builder()
                .action("Commentaire modifié")
                .username(user.getName())
                .incident(incident)
                .build();
        incident.getHistory().add(history);

        incidentRepository.save(incident);
        return commentRepository.save(comment);
    }

    @Transactional
    public void deleteComment(Long commentId, User user) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Commentaire introuvable avec l'ID: " + commentId));

        if (user == null || !comment.getAuthor().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Vous n'êtes pas autorisé à supprimer ce commentaire");
        }

        Incident incident = comment.getIncident();
        incident.getComments().remove(comment);

        IncidentHistory history = IncidentHistory.builder()
                .action("Commentaire supprimé")
                .username(user.getName())
                .incident(incident)
                .build();
        incident.getHistory().add(history);

        incidentRepository.save(incident);
    }

    @Transactional
    public void deleteIncident(String code, User user) {
        if (user == null) {
            throw new IllegalArgumentException("Utilisateur non authentifié.");
        }
        boolean isAdmin = user.getRole() != null && 
                ("Administrateur".equalsIgnoreCase(user.getRole().getName()) || 
                 "Admin".equalsIgnoreCase(user.getRole().getName()) ||
                 "Administrateur Système".equalsIgnoreCase(user.getRole().getName()));
                 
        if (!isAdmin) {
            throw new IllegalArgumentException("Seul un Administrateur est autorisé à supprimer un incident.");
        }
        Incident incident = getIncidentByCode(code);
        if (incident.getAttachments() != null) {
            for (Attachment attachment : incident.getAttachments()) {
                try {
                    if (attachment.getFilePath() != null) {
                        java.nio.file.Files.deleteIfExists(java.nio.file.Paths.get(attachment.getFilePath()));
                    }
                } catch (java.io.IOException e) {
                    System.err.println("Impossible de supprimer le fichier: " + attachment.getFilePath() + " - " + e.getMessage());
                }
            }
        }
        incidentRepository.delete(incident);
    }
}
