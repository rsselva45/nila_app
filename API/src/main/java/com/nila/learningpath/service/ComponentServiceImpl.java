package com.nila.learningpath.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nila.learningpath.dto.AvailableContentResponse;
import com.nila.learningpath.dto.ComponentDto;
import com.nila.learningpath.entity.ComponentEntity;
import com.nila.learningpath.repository.ComponentRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class ComponentServiceImpl implements ComponentService {

    private static final Logger log = LoggerFactory.getLogger(ComponentServiceImpl.class);

    private final ComponentRepository componentRepository;
    private final ObjectMapper objectMapper;

    public ComponentServiceImpl(ComponentRepository componentRepository, ObjectMapper objectMapper) {
        this.componentRepository = componentRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    public AvailableContentResponse getAllComponents() {
        List<ComponentDto> items = componentRepository.findAll()
                .stream()
                .map(this::toDto)
                .toList();
        return new AvailableContentResponse(items, items.size());
    }

    private ComponentDto toDto(ComponentEntity entity) {
        ComponentDto.MetadataDto metadata = parseMetadata(entity.getMetadataJson(), entity.getType());
        return new ComponentDto(
                entity.getId(),
                entity.getTitle(),
                entity.getShortDescription(),
                entity.getType(),
                entity.getApproximateDurationMinutes(),
                metadata
        );
    }

    private ComponentDto.MetadataDto parseMetadata(String json, String type) {
        if (json == null || json.isBlank()) return null;
        try {
            var root = objectMapper.readTree(json);
            if ("assessment".equals(type) && root.has("assessment")) {
                var a = root.get("assessment");
                return new ComponentDto.MetadataDto(
                        new ComponentDto.AssessmentMetaDto(
                                a.get("maxScore").asInt(),
                                a.get("passingScore").asInt()),
                        null);
            }
            if ("unit".equals(type) && root.has("unit")) {
                var u = root.get("unit");
                Integer rec = u.has("recommendedMinutes") ? u.get("recommendedMinutes").asInt() : null;
                return new ComponentDto.MetadataDto(null, new ComponentDto.UnitMetaDto(rec));
            }
        } catch (Exception e) {
            log.warn("Could not parse metadata JSON for component: {}", e.getMessage());
        }
        return null;
    }
}
