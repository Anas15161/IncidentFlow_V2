package com.netmar.incidentflow.controller;

import com.netmar.incidentflow.model.Workflow;
import com.netmar.incidentflow.service.WorkflowService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workflows")
public class WorkflowController {

    private final WorkflowService workflowService;
    private final org.flowable.engine.RepositoryService repositoryService;

    public WorkflowController(WorkflowService workflowService, org.flowable.engine.RepositoryService repositoryService) {
        this.workflowService = workflowService;
        this.repositoryService = repositoryService;
    }

    // =========================================================================
    // ÉTAPE A : Ingestion et Déploiement Dynamique du fichier XML par Flowable Engine
    // 1. Le service natif repositoryService prend le flux binaire en entrée.
    // 2. Flowable valide la norme BPMN 2.0, persiste le fichier dans 'flowable.act_ge_bytearray'
    //    et crée une nouvelle version incrémentée dans 'flowable.act_re_procdef'.
    // 3. Déclenche immédiatement la synchronisation réactive avec les tables applicatives.
    // =========================================================================
    @PostMapping("/deploy-flowable")
    public ResponseEntity<?> deployFlowableProcess(@RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        try {
            String resourceName = file.getOriginalFilename();
            // Sécurité : normalisation du nom pour que Flowable l'identifie toujours comme un schéma BPMN
            if (resourceName == null || (!resourceName.endsWith(".bpmn20.xml") && !resourceName.endsWith(".bpmn"))) {
                resourceName = "incident_workflow_v2.bpmn20.xml";
            }
            // 1. Déploiement physique dans le moteur Flowable (persistance BDD schéma flowable)
            org.flowable.engine.repository.Deployment deployment = repositoryService.createDeployment()
                    .addInputStream(resourceName, file.getInputStream())
                    .name("Dynamic Deployment from UI")
                    .deploy();

            // 2. Synchronisation immédiate avec le modèle applicatif (schéma incidentflow)
            workflowService.syncWithFlowable(repositoryService);
            return ResponseEntity.ok(java.util.Collections.singletonMap("message", "Déploiement réussi et synchronisé (ID: " + deployment.getId() + ")"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Collections.singletonMap("message", "Erreur de déploiement: " + e.getMessage()));
        }
    }

    @GetMapping
    public List<Workflow> getAllWorkflows() {
        workflowService.syncWithFlowable(repositoryService);
        return workflowService.getAllWorkflows();
    }

    @GetMapping("/{id}")
    public Workflow getWorkflowById(@PathVariable Long id) {
        return workflowService.getWorkflowById(id);
    }

    @GetMapping("/category/{category}")
    public Workflow getWorkflowByCategory(@PathVariable String category) {
        return workflowService.getWorkflowByCategory(category);
    }

    @PostMapping
    public Workflow createWorkflow(@RequestBody Workflow workflow) {
        return workflowService.saveWorkflow(workflow);
    }

    @PutMapping("/{id}")
    public Workflow updateWorkflow(@PathVariable Long id, @RequestBody Workflow workflowDetails) {
        workflowDetails.setId(id);
        return workflowService.saveWorkflow(workflowDetails);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorkflow(@PathVariable Long id) {
        workflowService.deleteWorkflow(id);
        return ResponseEntity.noContent().build();
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<java.util.Map<String, String>> handleIllegalArgument(IllegalArgumentException ex) {
        java.util.Map<String, String> response = new java.util.HashMap<>();
        response.put("message", ex.getMessage());
        return ResponseEntity.badRequest().body(response);
    }
}
