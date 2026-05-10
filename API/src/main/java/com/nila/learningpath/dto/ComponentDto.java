package com.nila.learningpath.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * Matches the component object shape in available-content.schema.json.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ComponentDto(
        String id,
        String title,
        String shortDescription,
        String type,
        int approximateDurationMinutes,
        MetadataDto metadata
) {

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record MetadataDto(
            AssessmentMetaDto assessment,
            UnitMetaDto unit
    ) {}

    public record AssessmentMetaDto(int maxScore, int passingScore) {}

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record UnitMetaDto(Integer recommendedMinutes) {}
}
