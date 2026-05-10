package com.nila.learningpath.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nila.learningpath.dto.AvailableContentResponse;
import com.nila.learningpath.dto.ComponentDto;
import com.nila.learningpath.entity.ComponentEntity;
import com.nila.learningpath.repository.ComponentRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ComponentServiceTest {

    @Mock
    private ComponentRepository componentRepository;

    private ComponentServiceImpl componentService;

    @BeforeEach
    void setUp() {
        componentService = new ComponentServiceImpl(componentRepository, new ObjectMapper());
    }

    @Test
    void getAllComponents_returnsAllItems() {
        ComponentEntity assessment = buildEntity(
                "cmp-1", "Math Module 1", "Baseline math", "assessment", 35,
                "{\"assessment\":{\"maxScore\":100,\"passingScore\":50}}");
        ComponentEntity unit = buildEntity(
                "cmp-2", "Math Module 2 - Easy", "Remediation", "unit", 35,
                "{\"unit\":{\"recommendedMinutes\":30}}");

        when(componentRepository.findAll()).thenReturn(List.of(assessment, unit));

        AvailableContentResponse response = componentService.getAllComponents();

        assertThat(response.totalCount()).isEqualTo(2);
        assertThat(response.items()).hasSize(2);
    }

    @Test
    void getAllComponents_parsesAssessmentMetadata() {
        ComponentEntity entity = buildEntity(
                "cmp-1", "Math Module 1", "Desc", "assessment", 35,
                "{\"assessment\":{\"maxScore\":100,\"passingScore\":50}}");
        when(componentRepository.findAll()).thenReturn(List.of(entity));

        ComponentDto dto = componentService.getAllComponents().items().get(0);

        assertThat(dto.type()).isEqualTo("assessment");
        assertThat(dto.metadata()).isNotNull();
        assertThat(dto.metadata().assessment()).isNotNull();
        assertThat(dto.metadata().assessment().maxScore()).isEqualTo(100);
        assertThat(dto.metadata().assessment().passingScore()).isEqualTo(50);
    }

    @Test
    void getAllComponents_parsesUnitMetadata() {
        ComponentEntity entity = buildEntity(
                "cmp-2", "Easy Unit", "Desc", "unit", 35,
                "{\"unit\":{\"recommendedMinutes\":30}}");
        when(componentRepository.findAll()).thenReturn(List.of(entity));

        ComponentDto dto = componentService.getAllComponents().items().get(0);

        assertThat(dto.type()).isEqualTo("unit");
        assertThat(dto.metadata().unit()).isNotNull();
        assertThat(dto.metadata().unit().recommendedMinutes()).isEqualTo(30);
    }

    @Test
    void getAllComponents_handlesNullMetadataGracefully() {
        ComponentEntity entity = buildEntity("cmp-3", "No Meta", "Desc", "unit", 20, null);
        when(componentRepository.findAll()).thenReturn(List.of(entity));

        ComponentDto dto = componentService.getAllComponents().items().get(0);

        assertThat(dto.metadata()).isNull();
    }

    @Test
    void getAllComponents_emptyRepositoryReturnsZeroCount() {
        when(componentRepository.findAll()).thenReturn(List.of());

        AvailableContentResponse response = componentService.getAllComponents();

        assertThat(response.totalCount()).isZero();
        assertThat(response.items()).isEmpty();
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private ComponentEntity buildEntity(String id, String title, String desc,
                                        String type, int duration, String metaJson) {
        ComponentEntity e = new ComponentEntity();
        e.setId(id);
        e.setTitle(title);
        e.setShortDescription(desc);
        e.setType(type);
        e.setApproximateDurationMinutes(duration);
        e.setMetadataJson(metaJson);
        return e;
    }
}
