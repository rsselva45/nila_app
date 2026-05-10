package com.nila.learningpath.service;

import com.nila.learningpath.dto.LearningPathDto;

public interface LearningPathService {

    LearningPathDto save(LearningPathDto dto);

    LearningPathDto getById(String id);
}
