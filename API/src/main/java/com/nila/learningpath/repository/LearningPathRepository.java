package com.nila.learningpath.repository;

import com.nila.learningpath.entity.LearningPathEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LearningPathRepository extends JpaRepository<LearningPathEntity, String> {
	
}
