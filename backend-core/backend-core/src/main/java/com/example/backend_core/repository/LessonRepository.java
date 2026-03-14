// LessonRepository.java
package com.example.backend_core.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.backend_core.model.Lesson;

public interface LessonRepository extends JpaRepository<Lesson, Long> {
	
}