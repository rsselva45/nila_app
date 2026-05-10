package com.nila.learningpath.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

// Same-package siblings – no import needed, but explicit for IDE clarity
// (LpNodeEntity and LpEdgeEntity are in this package)

@Entity
@Table(name = "learning_paths")
public class LearningPathEntity {

    @Id
    @Column(name = "id", nullable = false, length = 100)
    private String id;

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "status", nullable = false, length = 20)
    private String status = "draft";

    @Column(name = "version", nullable = false)
    private int version = 1;

    @Column(name = "canvas_zoom")
    private Double canvasZoom;

    @Column(name = "canvas_offset_x")
    private Double canvasOffsetX;

    @Column(name = "canvas_offset_y")
    private Double canvasOffsetY;

    @Column(name = "created_at")
    private String createdAt;

    @Column(name = "updated_at")
    private String updatedAt;

    @OneToMany(mappedBy = "learningPath", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("id ASC")
    private List<LpNodeEntity> nodes = new ArrayList<>();

    @OneToMany(mappedBy = "learningPath", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("priority ASC")
    private List<LpEdgeEntity> edges = new ArrayList<>();

    @PrePersist
    void onPersist() {
        String now = Instant.now().toString();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = Instant.now().toString();
    }

    // ── Getters & setters ────────────────────────────────────────────────────

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public int getVersion() { return version; }
    public void setVersion(int version) { this.version = version; }

    public Double getCanvasZoom() { return canvasZoom; }
    public void setCanvasZoom(Double canvasZoom) { this.canvasZoom = canvasZoom; }

    public Double getCanvasOffsetX() { return canvasOffsetX; }
    public void setCanvasOffsetX(Double canvasOffsetX) { this.canvasOffsetX = canvasOffsetX; }

    public Double getCanvasOffsetY() { return canvasOffsetY; }
    public void setCanvasOffsetY(Double canvasOffsetY) { this.canvasOffsetY = canvasOffsetY; }

    public String getCreatedAt() { return createdAt; }
    public String getUpdatedAt() { return updatedAt; }

    public List<LpNodeEntity> getNodes() { return nodes; }
    public void setNodes(List<LpNodeEntity> nodes) { this.nodes = nodes; }

    public List<LpEdgeEntity> getEdges() { return edges; }
    public void setEdges(List<LpEdgeEntity> edges) { this.edges = edges; }
}
