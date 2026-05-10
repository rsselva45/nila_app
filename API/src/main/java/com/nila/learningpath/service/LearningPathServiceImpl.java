package com.nila.learningpath.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nila.learningpath.dto.EdgeDto;
import com.nila.learningpath.dto.LearningPathDto;
import com.nila.learningpath.dto.NodeDto;
import com.nila.learningpath.entity.LearningPathEntity;
import com.nila.learningpath.entity.LpEdgeEntity;
import com.nila.learningpath.entity.LpNodeEntity;
import com.nila.learningpath.exception.ResourceNotFoundException;
import com.nila.learningpath.repository.LearningPathRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class LearningPathServiceImpl implements LearningPathService {

    private static final Logger log = LoggerFactory.getLogger(LearningPathServiceImpl.class);

    private final LearningPathRepository learningPathRepository;
    private final ObjectMapper objectMapper;

    public LearningPathServiceImpl(LearningPathRepository learningPathRepository, ObjectMapper objectMapper) {
        this.learningPathRepository = learningPathRepository;
        this.objectMapper = objectMapper;
    }

    // ── Save (POST) ──────────────────────────────────────────────────────────

    @Override
    @Transactional
    public LearningPathDto save(LearningPathDto dto) {
        String id = (dto.id() != null && !dto.id().isBlank())
                ? dto.id()
                : "lp-" + UUID.randomUUID();

        LearningPathEntity entity = learningPathRepository.findById(id)
                .orElseGet(LearningPathEntity::new);

        entity.setId(id);
        entity.setName(dto.name());
        entity.setDescription(dto.description());
        entity.setStatus(dto.status() != null ? dto.status() : "draft");
        entity.setVersion(dto.version() != null ? dto.version() : 1);

        if (dto.canvas() != null) {
            entity.setCanvasZoom(dto.canvas().zoom());
            entity.setCanvasOffsetX(dto.canvas().offsetX());
            entity.setCanvasOffsetY(dto.canvas().offsetY());
        }

        entity.getNodes().clear();
        entity.getEdges().clear();

        if (dto.nodes() != null) {
            Map<String, NodeDto> uniqueNodes = new LinkedHashMap<>();
            for (NodeDto nd : dto.nodes()) {
                uniqueNodes.put(nd.id(), nd);
            }
            for (NodeDto nd : uniqueNodes.values()) {
                entity.getNodes().add(toNodeEntity(nd, entity));
            }
        }

        if (dto.edges() != null) {
            Map<String, EdgeDto> uniqueEdges = new LinkedHashMap<>();
            for (EdgeDto ed : dto.edges()) {
                uniqueEdges.put(ed.id(), ed);
            }
            for (EdgeDto ed : uniqueEdges.values()) {
                entity.getEdges().add(toEdgeEntity(ed, entity));
            }
        }

        LearningPathEntity saved = learningPathRepository.save(entity);
        log.info("Saved learning path: {}", saved.getId());
        return toDto(saved);
    }

    // ── Load (GET) ───────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public LearningPathDto getById(String id) {
        LearningPathEntity entity = learningPathRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("LearningPath", id));
        return toDto(entity);
    }

    // ── Entity → DTO ─────────────────────────────────────────────────────────

    private LearningPathDto toDto(LearningPathEntity e) {
        LearningPathDto.CanvasDto canvas = null;
        if (e.getCanvasZoom() != null) {
            canvas = new LearningPathDto.CanvasDto(
                    e.getCanvasZoom(), e.getCanvasOffsetX(), e.getCanvasOffsetY());
        }

        List<NodeDto> nodes = e.getNodes().stream().map(this::toNodeDto).toList();
        List<EdgeDto> edges = e.getEdges().stream().map(this::toEdgeDto).toList();

        return new LearningPathDto(
                e.getId(), e.getName(), e.getDescription(),
                e.getStatus(), e.getVersion(), canvas, nodes, edges);
    }

    private NodeDto toNodeDto(LpNodeEntity n) {
        NodeDto.PositionDto pos = new NodeDto.PositionDto(n.getPositionX(), n.getPositionY());
        NodeDto.ConfigDto config = parseNodeConfig(n.getConfigJson());
        NodeDto.StyleDto style = parseStyle(n.getStyleJson());
        return new NodeDto(n.getId(), n.getComponentId(), n.getType(),
                n.getLabel(), n.getDescription(), pos, config, n.getParentId(), style);
    }

    private EdgeDto toEdgeDto(LpEdgeEntity e) {
        EdgeDto.ConditionsDto conditions = parseConditions(e.getConditionsJson());
        return new EdgeDto(e.getId(), e.getSourceNodeId(), e.getTargetNodeId(),
                e.getLabel(), e.getPriority(), e.getIsDefault(), conditions);
    }

    // ── DTO → Entity ─────────────────────────────────────────────────────────

    private LpNodeEntity toNodeEntity(NodeDto dto, LearningPathEntity parent) {
        LpNodeEntity e = new LpNodeEntity();
        e.setId(dto.id());
        e.setLearningPath(parent);
        e.setComponentId(dto.componentId());
        e.setType(dto.type());
        e.setLabel(dto.label());
        e.setDescription(dto.description());
        e.setPositionX(dto.position().x());
        e.setPositionY(dto.position().y());
        e.setConfigJson(serializeConfig(dto.config()));
        e.setParentId(dto.parentId());
        e.setStyleJson(serializeStyle(dto.style()));
        return e;
    }

    private LpEdgeEntity toEdgeEntity(EdgeDto dto, LearningPathEntity parent) {
        LpEdgeEntity e = new LpEdgeEntity();
        e.setId(dto.id());
        e.setLearningPath(parent);
        e.setSourceNodeId(dto.sourceNodeId());
        e.setTargetNodeId(dto.targetNodeId());
        e.setLabel(dto.label());
        e.setPriority(dto.priority());
        e.setIsDefault(dto.isDefault());
        e.setConditionsJson(serializeConditions(dto.conditions()));
        return e;
    }

    // ── JSON helpers ─────────────────────────────────────────────────────────

    private String serializeConfig(NodeDto.ConfigDto config) {
        if (config == null) return null;
        try {
            return objectMapper.writeValueAsString(config);
        } catch (JsonProcessingException ex) {
            log.warn("Could not serialize node config: {}", ex.getMessage());
            return null;
        }
    }

    private String serializeConditions(EdgeDto.ConditionsDto conditions) {
        if (conditions == null) return "{\"operator\":\"AND\",\"rules\":[]}";
        try {
            return objectMapper.writeValueAsString(conditions);
        } catch (JsonProcessingException ex) {
            log.warn("Could not serialize conditions: {}", ex.getMessage());
            return "{\"operator\":\"AND\",\"rules\":[]}";
        }
    }

    private String serializeStyle(NodeDto.StyleDto style) {
        if (style == null) return null;
        try {
            return objectMapper.writeValueAsString(style);
        } catch (JsonProcessingException ex) {
            log.warn("Could not serialize node style: {}", ex.getMessage());
            return null;
        }
    }

    private NodeDto.StyleDto parseStyle(String json) {
        if (json == null || json.isBlank()) return null;
        try {
            return objectMapper.readValue(json, NodeDto.StyleDto.class);
        } catch (Exception ex) {
            log.warn("Could not parse node style JSON: {}", ex.getMessage());
            return null;
        }
    }

    private NodeDto.ConfigDto parseNodeConfig(String json) {
        if (json == null || json.isBlank()) return null;
        try {
            return objectMapper.readValue(json, NodeDto.ConfigDto.class);
        } catch (Exception ex) {
            log.warn("Could not parse node config JSON: {}", ex.getMessage());
            return null;
        }
    }

    private EdgeDto.ConditionsDto parseConditions(String json) {
        if (json == null || json.isBlank()) {
            return new EdgeDto.ConditionsDto("AND", List.of());
        }
        try {
            return objectMapper.readValue(json, EdgeDto.ConditionsDto.class);
        } catch (Exception ex) {
            log.warn("Could not parse conditions JSON: {}", ex.getMessage());
            return new EdgeDto.ConditionsDto("AND", List.of());
        }
    }
}
