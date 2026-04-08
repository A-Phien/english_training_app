import { useState, useRef, useEffect } from "react";
import { getToken } from "../auth/authUtils";

export default function Recorder({ sentenceId, onResult }) {
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);

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
      alert("Lỗi truy cập Micro. Hãy cấp quyền cho trình duyệt!");
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


      const token = getToken();

      // CẢNH BÁO: Nếu ngươi đi qua Java Server (8080), Java phải cấu trúc lại DTO để hứng được 'word_analysis'
      const res = await fetch("http://localhost:8080/api/evaluate", {
        // const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      if (!res.ok) throw new Error("Server AI đang tẩu hỏa nhập ma!");

      const data = await res.json();
      setResult(data);
      onResult?.(data);
    } catch (err) {
      alert("Lỗi nộp bài: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full mt-4 flex flex-col items-center animate-fade-in">

      {/* NÚT THU ÂM HẮC ÁM */}
      <button
        onClick={recording ? stopRecording : startRecording}
        className={`relative flex items-center justify-center px-6 py-3 font-bold text-white rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95
          ${recording
            ? "bg-red-500 hover:bg-red-600 animate-pulse ring-4 ring-red-200"
            : "bg-blue-600 hover:bg-blue-700 ring-4 ring-blue-100"}`}
      >
        {recording ? (
          <>
            <span className="w-3 h-3 bg-white rounded-full mr-2 animate-bounce"></span>
            Đang ghi âm... Nhấn để Dừng
          </>
        ) : (
          "🎙 Bắt đầu đọc câu này"
        )}
      </button>

      {/* HIỆU ỨNG TẢI TRẬN PHÁP */}
      {loading && (
        <div className="mt-4 text-blue-500 font-medium flex items-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          AI đang nghiền ngẫm giọng nói của ngươi...
        </div>
      )}

      {/* BẢNG PHONG THẦN (KẾT QUẢ) */}
      {result && (
        <div className="mt-6 w-full max-w-2xl bg-white border border-gray-200 rounded-xl p-6 shadow-md">

          {/* Điểm số */}
          <div className="flex flex-col items-center mb-6">
            <div className={`text-4xl font-black ${result.score >= 80 ? 'text-green-500' : 'text-red-500'}`}>
              {result.score}/100
            </div>
            <p className="text-gray-500 text-sm mt-1 uppercase tracking-wider font-semibold">
              {result.score >= 80 ? 'Khí thế ngút trời!' : 'Phải rèn luyện thêm!'}
            </p>
          </div>

          <hr className="border-gray-100 mb-6" />

          {/* HIỂN THỊ CÂU ĐƯỢC TÔ MÀU (HUYỄN SẮC KHÁM PHÁ) */}
          <div className="mb-4 text-center">
            <p className="text-sm text-gray-400 font-semibold mb-2 uppercase">Chi tiết soi lỗi:</p>
            <div className="text-2xl font-bold leading-relaxed flex flex-wrap gap-2 justify-center">
              {result.mistakes?.word_analysis?.map((item, index) => {
                let colorClass = "";
                if (item.status === "correct") colorClass = "text-green-600";
                else if (item.status === "wrong") colorClass = "text-red-500 underline decoration-red-300 decoration-2";

                return (
                  <span key={index} className={`${colorClass} transition-colors duration-300`}>
                    {item.word}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Dịch lại những gì User thực sự nói ra */}
          <div className="mt-6 bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-xs text-gray-500 font-semibold mb-1 uppercase">Ngươi đã phát ra âm thanh này:</p>
            <p className="text-gray-800 italic">"{result.transcript || "Không nghe thấy gì..."}"</p>
          </div>

        </div>
      )}
    </div>
  );
}