package com.nila.learningpath.repository;

import com.nila.learningpath.entity.LpEdgeEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface LpEdgeRepository extends JpaRepository<LpEdgeEntity, String> {

    @Modifying
    @Query("DELETE FROM LpEdgeEntity e WHERE e.learningPath.id = :learningPathId")
    void deleteByLearningPathId(String learningPathId);
}
