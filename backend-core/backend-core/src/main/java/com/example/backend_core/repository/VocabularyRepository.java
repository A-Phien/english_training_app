package com.example.backend_core.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.backend_core.model.Vocabulary;

public interface VocabularyRepository extends JpaRepository<Vocabulary, Long> {
    // Dùng underscore để Spring Data JPA traverse rõ ràng: v.topic.id
    // (findByTopicId bị Hibernate 7 hiểu nhầm là field topicId không tồn tại)
    List<Vocabulary> findByTopic_Id(Long topicId);
}
