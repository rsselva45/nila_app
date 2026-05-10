package com.nila.learningpath.controller;

import com.nila.learningpath.dto.AvailableContentResponse;
import com.nila.learningpath.service.ComponentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * GET /api/components — returns all draggable content for the left-side panel.
 * Response shape matches available-content.schema.json.
 */
@RestController
@RequestMapping("/api/components")
public class ComponentController {

    private final ComponentService componentService;

    public ComponentController(ComponentService componentService) {
        this.componentService = componentService;
    }

    @GetMapping
    ResponseEntity<AvailableContentResponse> getAll() {
        return ResponseEntity.ok(componentService.getAllComponents());
    }
}
