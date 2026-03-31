package com.example.backend_core.controll;

import java.util.Map;

import org.springframework.http.ResponseEntity;
//import org.apache.tomcat.util.net.openssl.ciphers.Authentication;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.backend_core.model.Evaluation;
import com.example.backend_core.model.Sentence;
import com.example.backend_core.model.User;
import com.example.backend_core.repository.EvaluationRepository;
import com.example.backend_core.repository.SentenceRepository;
import com.example.backend_core.repository.UserRepository;
import com.example.backend_core.service.AIService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/evaluate")
@CrossOrigin(origins = "http://localhost:5173")	
@RequiredArgsConstructor
public class EvaluationController {

    private final AIService aiService;
    private final SentenceRepository sentenceRepository;
    private final UserRepository userRepository;
    private final EvaluationRepository evaluationRepository;

    @PostMapping
    public ResponseEntity<?> evaluate(
            @RequestParam("audio") MultipartFile audio,
            @RequestParam("sentenceId") Long sentenceId,
            Authentication authentication  // ← bỏ userId param, thêm cái này
    ) {
        // Lấy user từ JWT token
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Lấy sentence từ DB
        Sentence sentence = sentenceRepository.findById(sentenceId)
                .orElseThrow(() -> new RuntimeException("Sentence not found"));

        // Gọi Python AI
        Map<String, Object> aiResult = aiService.evaluateAudio(
                audio, sentence.getContent()
        );

        // Lưu Evaluation vào DB
        Evaluation evaluation = new Evaluation();
        evaluation.setSentence(sentence);
        evaluation.setUser(user);
        evaluation.setTranscript(aiResult.get("transcript").toString());
        evaluation.setExpectedTextSnapshot(sentence.getContent());
        evaluation.setScore(Double.valueOf(aiResult.get("score").toString()));
        evaluation.setMistakes(aiResult.get("mistakes").toString());

        evaluationRepository.save(evaluation);

        return ResponseEntity.ok(aiResult);
    }
    
}