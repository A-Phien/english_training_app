package com.example.backend_core.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.backend_core.model.Vocabulary;

public interface VocabularyRepository extends JpaRepository<Vocabulary, Long> {
    // Lấy tất cả từ vựng thuộc một chủ đề
    List<Vocabulary> findByTopicId(Long topicId);
}
