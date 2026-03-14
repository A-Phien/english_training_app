package com.example.backend_core.controll;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend_core.model.Lesson;
import com.example.backend_core.repository.LessonRequest;
import com.example.backend_core.service.LessonService;

@RestController
@RequestMapping("/api/lessons")
@CrossOrigin(origins = "http://localhost:5173")
public class LessonController {
    
     private final LessonService lessonService;

     public LessonController(LessonService lessonService) {
         this.lessonService = lessonService;
     }

        // GET /api/lessons
        @GetMapping
        public List<Lesson> getAll() {
            return lessonService.getAll();
        }
        

        // GET /api/lessons/{id}
        @GetMapping("/{id}")
        public ResponseEntity<Lesson> getById(@PathVariable Long id) {
            return ResponseEntity.ok(lessonService.getById(id));
        }

        // POST /api/lessons
//        @PostMapping
//        public ResponseEntity<Lesson> create(@RequestBody LessonRequest request) {
//            Lesson lesson = new Lesson();
//            lesson.setTitle(request.getTitle());
//            lesson.setDescription(request.getDescription());
//            lesson.setYoutubeUrl(request.getYoutubeUrl());
//
//            // Tự tách videoId từ URL
//            // https://youtube.com/watch?v=abc123 → abc123
//            String videoId = extractVideoId(request.getYoutubeUrl());
//            lesson.setVideoId(videoId);
//
//            return ResponseEntity.ok(lessonService.create(lesson));
//        }
        
        @PostMapping
        public ResponseEntity<Lesson> create(@RequestBody LessonRequest request) {
            Lesson lesson = new Lesson();
            lesson.setTitle(request.getTitle());
            lesson.setDescription(request.getDescription());
            lesson.setYoutubeUrl(request.getYoutubeUrl());
            lesson.setVideoId(extractVideoId(request.getYoutubeUrl()));

            return ResponseEntity.ok(lessonService.createLesson(lesson)); // ← đổi chỗ này
        }

        // PUT /api/lessons/{id}
        @PutMapping("/{id}")
        public ResponseEntity<Lesson> update(@PathVariable Long id,
                                              @RequestBody LessonRequest request) {
            Lesson updated = new Lesson();
            updated.setTitle(request.getTitle());
            updated.setDescription(request.getDescription());
            updated.setYoutubeUrl(request.getYoutubeUrl());
            updated.setVideoId(extractVideoId(request.getYoutubeUrl()));
            return ResponseEntity.ok(lessonService.update(id, updated));
        }

        // DELETE /api/lessons/{id}
        @DeleteMapping("/{id}")
        public ResponseEntity<Void> delete(@PathVariable Long id) {
            lessonService.delete(id);
            return ResponseEntity.noContent().build();
        }

        // Helper: tách videoId từ YouTube URL
        private String extractVideoId(String url) {
            if (url == null) return null;
            if (url.contains("v=")) {
                return url.split("v=")[1].split("&")[0];
            }
            if (url.contains("youtu.be/")) {
                return url.split("youtu.be/")[1].split("\\?")[0];
            }
            return url;
        }
    }