package com.nila.learningpath.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Matches the node object in learning-path.schema.json.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record NodeDto(

        @NotBlank @Size(max = 100)
        String id,

        @Size(max = 100)
        String componentId,

        @NotNull @Pattern(regexp = "start|unit|assessment|end|group")
        String type,

        @NotBlank @Size(max = 150)
        String label,

        @Size(max = 1000)
        String description,

        @NotNull @Valid
        PositionDto position,

        @Valid
        ConfigDto config
) {

    public record PositionDto(@NotNull Double x, @NotNull Double y) {}

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record ConfigDto(
            Integer approximateDurationMinutes,
            AssessmentConfigDto assessment
    ) {
        public record AssessmentConfigDto(int maxScore, int passingScore) {}
    }
}
