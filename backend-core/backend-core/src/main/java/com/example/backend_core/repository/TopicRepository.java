package com.example.backend_core.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.backend_core.model.Topic;

public interface TopicRepository extends JpaRepository<Topic, Long> {
}
