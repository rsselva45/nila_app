package com.nila.learningpath.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "lp_edges")
public class LpEdgeEntity {

    @Id
    @Column(name = "id", nullable = false, length = 100)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "learning_path_id", nullable = false)
    private LearningPathEntity learningPath;

    @Column(name = "source_node_id", nullable = false, length = 100)
    private String sourceNodeId;

    @Column(name = "target_node_id", nullable = false, length = 100)
    private String targetNodeId;

    @Column(name = "label", length = 150)
    private String label;

    @Column(name = "priority")
    private Integer priority;

    @Column(name = "is_default")
    private Boolean isDefault;

    /**
     * Stores the full conditions object as JSON text, e.g.:
     * {"operator":"AND","rules":[{"id":"r1","sourceType":"assessment",...}]}
     */
    @Column(name = "conditions_json", nullable = false, columnDefinition = "TEXT")
    private String conditionsJson;

    // ── Getters & setters ────────────────────────────────────────────────────

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public LearningPathEntity getLearningPath() { return learningPath; }
    public void setLearningPath(LearningPathEntity learningPath) { this.learningPath = learningPath; }

    public String getSourceNodeId() { return sourceNodeId; }
    public void setSourceNodeId(String sourceNodeId) { this.sourceNodeId = sourceNodeId; }

    public String getTargetNodeId() { return targetNodeId; }
    public void setTargetNodeId(String targetNodeId) { this.targetNodeId = targetNodeId; }

    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }

    public Integer getPriority() { return priority; }
    public void setPriority(Integer priority) { this.priority = priority; }

    public Boolean getIsDefault() { return isDefault; }
    public void setIsDefault(Boolean isDefault) { this.isDefault = isDefault; }

    public String getConditionsJson() { return conditionsJson; }
    public void setConditionsJson(String conditionsJson) { this.conditionsJson = conditionsJson; }
}
