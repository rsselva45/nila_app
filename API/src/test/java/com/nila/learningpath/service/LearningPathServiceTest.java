package com.nila.learningpath.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nila.learningpath.dto.EdgeDto;
import com.nila.learningpath.dto.LearningPathDto;
import com.nila.learningpath.dto.NodeDto;
import com.nila.learningpath.entity.LearningPathEntity;
import com.nila.learningpath.exception.ResourceNotFoundException;
import com.nila.learningpath.repository.LearningPathRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LearningPathServiceTest {

    @Mock
    private LearningPathRepository learningPathRepository;

    private LearningPathServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new LearningPathServiceImpl(learningPathRepository, new ObjectMapper());
    }

    @Test
    void save_generatesIdWhenNotProvided() {
        LearningPathDto dto = buildDto(null, "My Path", "draft");
        when(learningPathRepository.findById(any())).thenReturn(Optional.empty());
        when(learningPathRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        LearningPathDto result = service.save(dto);

        assertThat(result.id()).isNotBlank().startsWith("lp-");
    }

    @Test
    void save_usesProvidedId() {
        LearningPathDto dto = buildDto("lp-fixed-id", "My Path", "draft");
        when(learningPathRepository.findById("lp-fixed-id")).thenReturn(Optional.empty());
        when(learningPathRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        LearningPathDto result = service.save(dto);

        assertThat(result.id()).isEqualTo("lp-fixed-id");
    }

    @Test
    void save_persistsNameAndStatus() {
        LearningPathDto dto = buildDto("lp-1", "SAT Adaptive Path", "published");
        when(learningPathRepository.findById("lp-1")).thenReturn(Optional.empty());
        ArgumentCaptor<LearningPathEntity> captor = ArgumentCaptor.forClass(LearningPathEntity.class);
        when(learningPathRepository.save(captor.capture())).thenAnswer(inv -> inv.getArgument(0));

        service.save(dto);

        LearningPathEntity saved = captor.getValue();
        assertThat(saved.getName()).isEqualTo("SAT Adaptive Path");
        assertThat(saved.getStatus()).isEqualTo("published");
    }

    @Test
    void save_persistsNodesAndEdges() {
        NodeDto node = new NodeDto("n1", "cmp-1", "assessment", "Math 1", null,
                new NodeDto.PositionDto(100.0, 200.0), null, null, null);
        EdgeDto edge = new EdgeDto("e1", "n1", "n2", "label", 1, false,
                new EdgeDto.ConditionsDto("AND", List.of()));
        LearningPathDto dto = new LearningPathDto("lp-1", "Path", null, "draft", 1,
                null, List.of(node), List.of(edge));

        when(learningPathRepository.findById("lp-1")).thenReturn(Optional.empty());
        ArgumentCaptor<LearningPathEntity> captor = ArgumentCaptor.forClass(LearningPathEntity.class);
        when(learningPathRepository.save(captor.capture())).thenAnswer(inv -> inv.getArgument(0));

        service.save(dto);

        LearningPathEntity saved = captor.getValue();
        assertThat(saved.getNodes()).hasSize(1);
        assertThat(saved.getEdges()).hasSize(1);
        assertThat(saved.getNodes().get(0).getLabel()).isEqualTo("Math 1");
        assertThat(saved.getEdges().get(0).getSourceNodeId()).isEqualTo("n1");
    }

    @Test
    void getById_throwsWhenNotFound() {
        when(learningPathRepository.findById("missing")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getById("missing"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("missing");
    }

    @Test
    void getById_returnsMappedDto() {
        LearningPathEntity entity = new LearningPathEntity();
        entity.setId("lp-42");
        entity.setName("Test Path");
        entity.setStatus("draft");
        entity.setVersion(1);
        when(learningPathRepository.findById("lp-42")).thenReturn(Optional.of(entity));

        LearningPathDto result = service.getById("lp-42");

        assertThat(result.id()).isEqualTo("lp-42");
        assertThat(result.name()).isEqualTo("Test Path");
        assertThat(result.nodes()).isEmpty();
        assertThat(result.edges()).isEmpty();
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private LearningPathDto buildDto(String id, String name, String status) {
        return new LearningPathDto(id, name, null, status, 1, null, List.of(), List.of());
    }
}
