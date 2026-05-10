package com.nila.learningpath.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nila.learningpath.dto.EdgeDto;
import com.nila.learningpath.dto.LearningPathDto;
import com.nila.learningpath.dto.NodeDto;
import com.nila.learningpath.exception.ResourceNotFoundException;
import com.nila.learningpath.service.LearningPathService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(LearningPathController.class)
class LearningPathControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @MockBean LearningPathService learningPathService;

    @Test
    void create_returns201WithLocation() throws Exception {
        LearningPathDto request = buildRequest("SAT Adaptive Path", "draft");
        LearningPathDto saved   = buildResponse("lp-abc", "SAT Adaptive Path", "draft");
        when(learningPathService.save(any())).thenReturn(saved);

        mockMvc.perform(post("/api/learning-paths")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", org.hamcrest.Matchers.containsString("/api/learning-paths/lp-abc")))
                .andExpect(jsonPath("$.id").value("lp-abc"))
                .andExpect(jsonPath("$.name").value("SAT Adaptive Path"))
                .andExpect(jsonPath("$.status").value("draft"));
    }

    @Test
    void create_returns400WhenNameMissing() throws Exception {
        String body = "{\"status\":\"draft\",\"nodes\":[],\"edges\":[]}";

        mockMvc.perform(post("/api/learning-paths")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getById_returns200WhenFound() throws Exception {
        LearningPathDto dto = buildResponse("lp-123", "Path", "draft");
        when(learningPathService.getById("lp-123")).thenReturn(dto);

        mockMvc.perform(get("/api/learning-paths/lp-123").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("lp-123"))
                .andExpect(jsonPath("$.nodes").isArray())
                .andExpect(jsonPath("$.edges").isArray());
    }

    @Test
    void getById_returns404WhenNotFound() throws Exception {
        when(learningPathService.getById("missing"))
                .thenThrow(new ResourceNotFoundException("LearningPath", "missing"));

        mockMvc.perform(get("/api/learning-paths/missing").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private LearningPathDto buildRequest(String name, String status) {
        NodeDto node = new NodeDto("n1", "cmp-1", "assessment", "Module 1", null,
                new NodeDto.PositionDto(0.0, 0.0), null);
        EdgeDto edge = new EdgeDto("e1", "n1", "n2", null, 1, false,
                new EdgeDto.ConditionsDto("AND", List.of()));
        return new LearningPathDto(null, name, null, status, 1, null,
                List.of(node), List.of(edge));
    }

    private LearningPathDto buildResponse(String id, String name, String status) {
        return new LearningPathDto(id, name, null, status, 1, null, List.of(), List.of());
    }
}
