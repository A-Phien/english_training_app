import { useState, useRef, useEffect } from "react";
import { getToken } from "../auth/authUtils";

export default function Recorder({ sentenceId, onResult }) {
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);

  // Dọn dẹp micro khi component bị hủy
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      setResult(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
        await uploadAudio(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch (err) {
      alert("Lỗi truy cập Micro: " + err.message);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      setLoading(true);
    }
  };

  const uploadAudio = async (blob) => {
    try {
      const formData = new FormData();
      formData.append("audio", blob, "recording.webm");
      formData.append("sentenceId", sentenceId);
      // userId sẽ được lấy từ JWT ở backend — không cần gửi nữa

      const token = getToken();

      const res = await fetch("http://localhost:8080/api/evaluate", {
        method: "POST",
        headers: {
          // Không set Content-Type — để browser tự set boundary cho FormData
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      if (!res.ok) throw new Error("Server AI đang bận hoặc gặp lỗi!");

      const data = await res.json();
      setResult(data);
      onResult?.(data);
    } catch (err) {
      alert("Lỗi gửi dữ liệu: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recorder-container">
      <button
        onClick={recording ? stopRecording : startRecording}
        className={`btn-record-main ${recording ? "recording" : ""}`}
      >
        {recording ? "⏹ Dừng & Chấm điểm" : "🎙 Bắt đầu nói"}
      </button>

      {loading && (
        <div className="loading-spinner">✨ Đang phân tích giọng nói...</div>
      )}

      {result && (
        <div className="result-panel">
          <div className="score-circle">
            <span
              className={`score-value ${result.score > 80 ? "good" : "try"}`}
            >
              {result.score}%
            </span>
          </div>

          <div className="transcript-box">
            <strong>Bạn đã nói:</strong>
            <p>"{result.transcript}"</p>
          </div>

          {(result.mistakes?.missing_words?.length > 0 ||
            result.mistakes?.wrong_words?.length > 0) && (
              <div className="feedback-box">
                <p className="error-title">Cần chú ý các từ:</p>
                <div className="word-tags">
                  {result.mistakes.missing_words?.map((w) => (
                    <span key={w} className="tag-missing">
                      {w} (Thiếu)
                    </span>
                  ))}
                  {result.mistakes.wrong_words?.map((w) => (
                    <span key={w} className="tag-wrong">
                      {w} (Sai)
                    </span>
                  ))}
                </div>
              </div>
            )}
        </div>
      )}
    </div>
  );
}