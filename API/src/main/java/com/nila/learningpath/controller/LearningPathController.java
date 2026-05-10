package com.nila.learningpath.controller;

import com.nila.learningpath.dto.LearningPathDto;
import com.nila.learningpath.service.LearningPathService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;

/**
 * REST endpoints for learning paths – matches learning-path.schema.json.
 *
 * POST /api/learning-paths          → save / upsert a learning path
 * GET  /api/learning-paths/{id}     → load a saved learning path
 */
@RestController
@RequestMapping("/api/learning-paths")
public class LearningPathController {

    private final LearningPathService learningPathService;

    public LearningPathController(LearningPathService learningPathService) {
        this.learningPathService = learningPathService;
    }

    @PostMapping
    ResponseEntity<LearningPathDto> create(@Valid @RequestBody LearningPathDto dto) {
        LearningPathDto saved = learningPathService.save(dto);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(saved.id())
                .toUri();
        return ResponseEntity.created(location).body(saved);
    }

    @GetMapping("/{id}")
    ResponseEntity<LearningPathDto> getById(@PathVariable String id) {
        return ResponseEntity.ok(learningPathService.getById(id));
    }
}
