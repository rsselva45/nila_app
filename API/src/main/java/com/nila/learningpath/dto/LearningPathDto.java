package com.nila.learningpath.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.List;

/**
 * Request and response shape for POST /api/learning-paths and GET /api/learning-paths/{id}.
 * Matches learning-path.schema.json exactly.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record LearningPathDto(

        String id,

        @NotBlank @Size(max = 150)
        String name,

        @Size(max = 1000)
        String description,

        @NotNull @Pattern(regexp = "draft|published")
        String status,

        Integer version,

        CanvasDto canvas,

        @NotNull @Valid
        List<NodeDto> nodes,

        @NotNull @Valid
        List<EdgeDto> edges
) {

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record CanvasDto(Double zoom, Double offsetX, Double offsetY) {}
}
