package com.nila.learningpath.dto;

import java.util.List;

/**
 * Wrapper returned by GET /api/components – matches available-content.schema.json.
 */
public record AvailableContentResponse(List<ComponentDto> items, int totalCount) {}
