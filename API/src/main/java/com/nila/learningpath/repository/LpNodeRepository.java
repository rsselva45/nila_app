package com.nila.learningpath.repository;

import com.nila.learningpath.entity.LpNodeEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface LpNodeRepository extends JpaRepository<LpNodeEntity, String> {

    @Modifying
    @Query("DELETE FROM LpNodeEntity n WHERE n.learningPath.id = :learningPathId")
    void deleteByLearningPathId(String learningPathId);
}
