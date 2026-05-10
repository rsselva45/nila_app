package com.nila.learningpath.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "lp_nodes")
public class LpNodeEntity {

    @Id
    @Column(name = "id", nullable = false, length = 100)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "learning_path_id", nullable = false)
    private LearningPathEntity learningPath;

    @Column(name = "component_id", length = 100)
    private String componentId;

    /** "start" | "unit" | "assessment" | "end" | "group" */
    @Column(name = "type", nullable = false, length = 20)
    private String type;

    @Column(name = "label", nullable = false, length = 150)
    private String label;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "position_x", nullable = false)
    private double positionX;

    @Column(name = "position_y", nullable = false)
    private double positionY;

    /** JSON blob: {"approximateDurationMinutes": N, "assessment": {"maxScore": N, "passingScore": N}} */
    @Column(name = "config_json", columnDefinition = "TEXT")
    private String configJson;

    // ── Getters & setters ────────────────────────────────────────────────────

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public LearningPathEntity getLearningPath() { return learningPath; }
    public void setLearningPath(LearningPathEntity learningPath) { this.learningPath = learningPath; }

    public String getComponentId() { return componentId; }
    public void setComponentId(String componentId) { this.componentId = componentId; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public double getPositionX() { return positionX; }
    public void setPositionX(double positionX) { this.positionX = positionX; }

    public double getPositionY() { return positionY; }
    public void setPositionY(double positionY) { this.positionY = positionY; }

    public String getConfigJson() { return configJson; }
    public void setConfigJson(String configJson) { this.configJson = configJson; }
}
