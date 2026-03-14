package com.example.backend_core.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.backend_core.model.Evaluation;

public interface EvaluationRepository extends JpaRepository<Evaluation, Long> {
    List<Evaluation> findByUserIdOrderByCreatedAtDesc(Long userId);
}