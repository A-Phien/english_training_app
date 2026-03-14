package com.example.backend_core.dto;


import lombok.Data;

@Data
public class SentenceResponse {
    private String content;
    private Float startTime;
    private Float endTime;
    private Integer orderIndex;
    
    
	public String getContent() {
		return content;
	}
	public void setContent(String content) {
		this.content = content;
	}
	public Float getStartTime() {
		return startTime;
	}
	public void setStartTime(Float startTime) {
		this.startTime = startTime;
	}
	public Float getEndTime() {
		return endTime;
	}
	public void setEndTime(Float endTime) {
		this.endTime = endTime;
	}
	public Integer getOrderIndex() {
		return orderIndex;
	}
	public void setOrderIndex(Integer orderIndex) {
		this.orderIndex = orderIndex;
	}
    
    
}