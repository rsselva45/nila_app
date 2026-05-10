package com.nila.learningpath.controller;

import com.nila.learningpath.dto.AvailableContentResponse;
import com.nila.learningpath.dto.ComponentDto;
import com.nila.learningpath.service.ComponentService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ComponentController.class)
class ComponentControllerTest {

    @Autowired
    MockMvc mockMvc;

    @MockBean
    ComponentService componentService;

    @Test
    void getAll_returns200WithItems() throws Exception {
        ComponentDto.MetadataDto meta = new ComponentDto.MetadataDto(
                new ComponentDto.AssessmentMetaDto(100, 50), null);
        ComponentDto item = new ComponentDto(
                "cmp-1", "Math Module 1", "Baseline math", "assessment", 35, meta);
        when(componentService.getAllComponents())
                .thenReturn(new AvailableContentResponse(List.of(item), 1));

        mockMvc.perform(get("/api/components").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.totalCount").value(1))
                .andExpect(jsonPath("$.items[0].id").value("cmp-1"))
                .andExpect(jsonPath("$.items[0].type").value("assessment"))
                .andExpect(jsonPath("$.items[0].metadata.assessment.maxScore").value(100))
                .andExpect(jsonPath("$.items[0].metadata.assessment.passingScore").value(50));
    }

    @Test
    void getAll_returnsEmptyListWhenNoComponents() throws Exception {
        when(componentService.getAllComponents())
                .thenReturn(new AvailableContentResponse(List.of(), 0));

        mockMvc.perform(get("/api/components").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalCount").value(0))
                .andExpect(jsonPath("$.items").isArray())
                .andExpect(jsonPath("$.items").isEmpty());
    }
}
