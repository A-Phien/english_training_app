package com.example.backend_core.dto;

import java.util.List;
import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TranscriptResponse {
    private String videoId;
    private Integer total;
    private List<Map<String, Object>> sentences; // Hứng đúng cấu trúc từ Python
    
	public String getVideoId() {
		return videoId;
	}
	public void setVideoId(String videoId) {
		this.videoId = videoId;
	}
	public Integer getTotal() {
		return total;
	}
	public void setTotal(Integer total) {
		this.total = total;
	}
	public List<Map<String, Object>> getSentences() {
		return sentences;
	}
	public void setSentences(List<Map<String, Object>> sentences) {
		this.sentences = sentences;
	}
    
    
}
