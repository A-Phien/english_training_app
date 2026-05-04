package com.example.backend_core.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.backend_core.model.UserVocabulary;

public interface UserVocabularyRepository extends JpaRepository<UserVocabulary, Long> {
    List<UserVocabulary> findByUserIdOrderByCreatedAtDesc(Long userId);
    boolean existsByUserIdAndWord(Long userId, String word);
}
