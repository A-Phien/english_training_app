package com.example.backend_core.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.backend_core.model.Sentence;
import com.example.backend_core.repository.SentenceRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SentenceService {

    private final SentenceRepository sentenceRepository;

    public List<Sentence> getByLesson(Long lessonId) {
        return sentenceRepository
                .findByLesson_IdOrderByOrderIndexAsc(lessonId);
    }
}
