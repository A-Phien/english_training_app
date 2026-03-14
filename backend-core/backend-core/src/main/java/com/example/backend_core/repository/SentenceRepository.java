// SentenceRepository.java
package com.example.backend_core.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.backend_core.model.Sentence;

public interface SentenceRepository extends JpaRepository<Sentence, Long> {
    List<Sentence> findByLessonIdOrderByOrderIndexAsc(Long lessonId);
    
    List<Sentence> findByLesson_IdOrderByOrderIndexAsc(Long lessonId);
}