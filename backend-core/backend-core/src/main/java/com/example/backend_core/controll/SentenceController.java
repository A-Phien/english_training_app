package com.example.backend_core.controll;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend_core.model.Sentence;
import com.example.backend_core.service.SentenceService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/sentences")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class SentenceController {

    private final SentenceService sentenceService;

    @GetMapping("/lesson/{lessonId}")
    public List<Sentence> getByLesson(@PathVariable Long lessonId) {
        return sentenceService.getByLesson(lessonId);
    }
}
