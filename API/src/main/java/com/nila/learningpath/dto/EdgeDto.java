package com.nila.learningpath.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.JsonNode;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.List;

/**
 * Matches the edge object in learning-path.schema.json.
 * Conditions are held as a typed structure; JsonNode handles the
 * polymorphic rule.value (boolean | number | string).
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record EdgeDto(

        @NotBlank @Size(max = 100)
        String id,

        @NotBlank @Size(max = 100)
        String sourceNodeId,

        @NotBlank @Size(max = 100)
        String targetNodeId,

        @Size(max = 150)
        String label,

        Integer priority,

        Boolean isDefault,

        @NotNull @Valid
        ConditionsDto conditions
) {

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record ConditionsDto(
            @NotNull @Pattern(regexp = "AND|OR") String operator,
            @NotNull List<@Valid RuleDto> rules
    ) {}

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record RuleDto(
            @NotBlank @Size(max = 100) String id,
            @NotNull @Pattern(regexp = "assessment|unit") String sourceType,
            @NotBlank @Size(max = 100) String sourceNodeId,
            @NotNull @Pattern(regexp = "completion|passed|score|score_range|time_spent_minutes|percentage_completion")
            String metric,
            @NotNull @Pattern(regexp = "eq|ne|gt|gte|lt|lte|between") String operator,
            JsonNode value,   // boolean | number | string
            RangeDto range
    ) {}

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record RangeDto(
            double min,
            double max,
            Boolean minInclusive,
            Boolean maxInclusive
    ) {}
}
