import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
// import "../assets/css/lessondetail.css";
import Recorder from "./Recorder";
import { api } from "../auth/apiClient";

export default function LessonDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sentences, setSentences] = useState([]);
  const [videoId, setVideoId] = useState("");
  const [lessonTitle, setLessonTitle] = useState("");
  const [currentTime, setCurrentTime] = useState(0);
  const [activeSentenceId, setActiveSentenceId] = useState(null);
  const [duration, setDuration] = useState(0);
  const [youtubePlayer, setYoutubePlayer] = useState(null);
  // State Giao diện
  const [activeTab, setActiveTab] = useState("shadowing");
  const [autoStop, setAutoStop] = useState(false);
  const [autoLoopSentence, setAutoLoopSentence] = useState(false);
  const [showTranslation, setShowTranslation] = useState(true);
  const [isLooping, setIsLooping] = useState(false);
  const [showSettings, setShowSettings] = useState(true);
  const playerRef = useRef(null);
  const intervalRef = useRef(null);
  const activeSentenceRef = useRef(null);
  const lastStoppedId = useRef(null);
  // --- 3. LOAD YOUTUBE API ---
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
    }
  }, []);

  // --- 4. FETCH DỮ LIỆU BÀI HỌC & CÂU ---
  useEffect(() => {
    // Fetch lesson info
    api.get(`/api/lessons/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Không thể tải bài học");
        return res.json();
      })
      .then((data) => {
        setLessonTitle(data.title);
        setYoutubePlayer(data.youtubeUrl);
        const vid =
          data.youtubeUrl?.split("v=")[1]?.split("&")[0] || data.videoId;
        setVideoId(vid);
      })
      .catch((err) => setError(err.message));


    // Fetch sentences
    api.get(`/api/sentences/lesson/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Không thể tải câu");
        return res.json();
      })
      .then((data) => {
        const sorted = data.sort((a, b) => a.startTime - b.startTime);
        setSentences(sorted);
      })
      .catch((err) => setError(err.message));
  }, [id]);

  // --- 5. KHỞI TẠO YOUTUBE PLAYER ---
  useEffect(() => {
    if (!videoId) return;

    const initPlayer = () => {
      playerRef.current = new window.YT.Player("yt-player", {
        videoId,
        playerVars: { rel: 0, modestbranding: 1, controls: 1 },
        events: {
          onReady: (event) => {
            setDuration(event.target.getDuration());

            intervalRef.current = setInterval(() => {
              if (playerRef.current?.getCurrentTime) {
                const now = playerRef.current.getCurrentTime();
                setCurrentTime(now);
              }
            }, 200);
          },
          onStateChange: (event) => {
            // window.YT.PlayerState.ENDED tương đương với giá trị 0
            if (event.data === window.YT.PlayerState.ENDED) {
              // Nếu đang bật autoReplay (Lão phu dùng Ref để lấy giá trị mới nhất)
              // Hoặc ngươi có thể dùng biến state bình thường nếu code nằm trong scope đúng
              if (autoReplay) {
                event.target.seekTo(0); // Quay về vạch xuất phát
                event.target.playVideo(); // Tiếp tục vòng lặp luân hồi
              }
            }
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (playerRef.current?.destroy) playerRef.current.destroy();
    };
  }, [videoId]);

  // --- 6. TỰ ĐỘNG HIGHLIGHT CÂU ĐANG PHÁT ---
  useEffect(() => {
    // Nếu chưa có dữ liệu hoặc không có Player thì án binh bất động
    if (!sentences.length || isLooping || !playerRef.current) return;

    // 1. TÌM LẠI BẢN NGÃ: Lấy chính xác cái câu ĐANG SÁNG MÀU ra để xử lý
    const currentSentence = sentences.find((s) => s.id === activeSentenceId);

    // 2. THỰC THI HÌNH PHẠT (Trước khi tìm câu mới)
    if (currentSentence && currentTime >= currentSentence.endTime - 0.15) {
      if (autoLoopSentence) {
        // Ưu tiên 1: Vô Tận Luân Hồi
        playerRef.current.seekTo(currentSentence.startTime, true);
        playerRef.current.playVideo();
        return; // Cắt đứt kinh mạch tại đây! Trở về đầu câu, không bao giờ xuống dưới đổi câu được!
      } else if (autoStop) {
        // Ưu tiên 2: Định Thân Thuật
        // CHỈ DỪNG khi cuốn sổ thù vặt chưa ghi tên câu này
        if (lastStoppedId.current !== currentSentence.id) {
          playerRef.current.pauseVideo();
          lastStoppedId.current = currentSentence.id; // Ghi sổ: "Đã bóp cổ câu này rồi, cấm bóp lại!"
        }
      }
    }

    // 3. CHUYỂN SINH (Tìm và đổi sang câu tiếp theo nếu đã vượt qua hình phạt)
    const active = sentences.find(
      (s) => currentTime >= s.startTime && currentTime <= s.endTime
    );

    if (active && active.id !== activeSentenceId) {
      setActiveSentenceId(active.id); // Đổi màu sang câu mới

      // Khi đã chính thức bước sang câu mới, phải XÉ BỎ SỔ THÙ VẶT của câu cũ
      if (lastStoppedId.current !== null) {
        lastStoppedId.current = null;
      }
    }

  }, [currentTime, sentences, isLooping, activeSentenceId, autoLoopSentence, autoStop]);

  // --- 7. LOGIC LẶP ĐOẠN (A-B REPEAT) ---
  useEffect(() => {
    if (isLooping && activeSentenceId) {
      const active = sentences.find((s) => s.id === activeSentenceId);
      if (active && currentTime >= active.endTime) {
        playerRef.current.seekTo(active.startTime, true);
      }
    }
  }, [currentTime, isLooping, activeSentenceId, sentences]);

  // --- 8. TỰ ĐỘNG CUỘN MÀN HÌNH ---
  useEffect(() => {
    if (activeSentenceRef.current) {
      activeSentenceRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [activeSentenceId]);

  // --- 9. XỬ LÝ SỰ KIỆN CLICK CÂU ---
  // const handleSentenceClick = useCallback((sentence) => {
  //   if (playerRef.current?.seekTo) {
  //     playerRef.current.seekTo(sentence.startTime, true);
  //     playerRef.current.playVideo();
  //   }
  //   setActiveSentenceId(sentence.id);
  //   setSelectedSentenceId(sentence.id);
  // }, []);

  const toggleLoop = () => setIsLooping(!isLooping);

  const activeSentenceData =
    sentences.find((s) => s.id === activeSentenceId) || sentences[0];

  const handleSentenceClick = useCallback((sentence) => {
    if (playerRef.current?.seekTo) {
      playerRef.current.seekTo(sentence.startTime, true);
      playerRef.current.playVideo();
    }
    setActiveSentenceId(sentence.id);
  }, []);

  const formatTime = (timeInSeconds) => {
    if (!timeInSeconds || isNaN(timeInSeconds)) return "0:00";
    const m = Math.floor(timeInSeconds / 60);
    const s = Math.floor(timeInSeconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`; // Chèn thêm số 0 nếu giây bé hơn 10 (ví dụ 1:05)
  };



  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-screen-2xl mx-auto">

        {/* NÚT QUAY LẠI */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/")}
            className="bg-sky-400 hover:bg-sky-500 text-white font-medium py-2 px-4 rounded-lg shadow-sm transition-colors"
          >
            ← Quay Lại
          </button>
        </div>

        {/* BỐ CỤC CHÍNH: CHIA 12 CỘT TỶ LỆ 7-5 CHO MÀN TO */}
        <div className="grid grid-cols-1 lg:grid-cols-13 gap-8">

          {/* ================= CỘT TRÁI: VIDEO (Chiếm 7 phần) ================= */}
          <div className="lg:col-span-8 flex flex-col">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{lessonTitle || "Loading..."}</h1>
            <div className="flex items-center text-sm text-gray-600 mb-4 space-x-4">
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Thời gian: {formatTime(currentTime)}/{formatTime(duration)}
              </span>
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
                </svg>
                Nguồn:
                <a
                  href={youtubePlayer}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline ml-1"
                >
                  Nhấn vào đây!
                </a>

              </span>
            </div>

            {/* Vùng chứa Video chuẩn 16:9 */}
            <div className="relative w-full rounded-xl overflow-hidden shadow-lg bg-black aspect-video">
              <div id="yt-player" className="absolute top-0 left-0 w-full h-full" />
            </div>
            {/* ================= KHU VỰC TẾ ĐÀN: VIETSUB DƯỚI VIDEO ================= */}
            <div className="mt-6 min-h-[100px] bg-white border-2 border-dashed border-blue-200 rounded-xl p-4 shadow-sm flex flex-col items-center justify-center text-center transition-all duration-300">
              {activeSentenceData ? (
                <>
                  {/* Tiếng Anh (Ngươi có thể ẩn đi nếu chỉ muốn tiếng Việt) */}
                  <p className="text-xl font-bold text-gray-00 mb-2">
                    {activeSentenceData.content}
                  </p>
                  {showTranslation && (
                    <p className="text-lg text-gray-600 font-light">
                      {activeSentenceData.ipa}
                    </p>
                  )}

                  {/* Tiếng Việt (Bị chi phối bởi công tắc showTranslation) */}
                  {showTranslation && (
                    <p className="text-lg text-blue-600 font-medium">
                      {activeSentenceData.translation}
                    </p>
                  )}

                  {/* --- PHẦN 2: PHÁP TRƯỜNG SHADOWING (Chỉ hiện khi ở tab Shadowing) --- */}
                  {activeTab === 'shadowing' && (
                    <div className="w-full pt-6 border-t border-gray-100 animate-fade-in mt-4">
                      {/* Triệu hồi Máy Ghi Âm và Hệ thống Chấm điểm tại đây */}
                      <Recorder
                        sentenceId={activeSentenceData.id}
                      // expectedText={activeSentenceData.content}
                      />
                    </div>
                  )}

                </>
              ) : (
                <p className="text-gray-400 italic">
                  Đang chờ phụ đề... (Hãy phát video)
                </p>
              )}
            </div>

          </div>

          {/* ================= CỘT PHẢI: TABS & SCRIPT (Chiếm 5 phần) ================= */}
          <div className="lg:col-span-5 flex flex-col h-[calc(100vh-150px)]">

            {/* TABS HEADER */}
            <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-200 mb-4">
              {['shadowing', 'dictation', 'teleprompter'].map((tab) => (
                <button
                  key={tab}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all capitalize
                    ${activeTab === tab ? 'bg-blue-600 text-white shadow' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="bg-white border border-blue-100 rounded-xl p-4 shadow-sm mb-4 transition-all duration-300">

              {/* HUYỆT ĐẠO ĐIỀU KHIỂN: Bấm vào đây để đảo ngược trạng thái */}
              <div
                className="text-blue-500 font-semibold mb-3 flex items-center text-sm cursor-pointer select-none hover:text-blue-700"
                onClick={() => setShowSettings(!showSettings)}
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                {/* Đổi chữ tự động: Đang hiện thì ghi (ẩn), đang ẩn thì ghi (hiện) */}
                Cài đặt ({showSettings ? "ẩn" : "hiện"})
              </div>

              {/* TRẬN PHÁP ẨN THÂN: Chỉ hiển thị nội dung nếu showSettings = true */}
              {showSettings && (
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 animate-fade-in">
                  <label className="flex justify-between items-center cursor-pointer">
                    <span>Tự dừng khi hết câu</span>
                    <input type="checkbox" className="form-checkbox h-4 w-4 text-blue-600 rounded" checked={autoStop} onChange={() => setAutoStop(!autoStop)} />
                  </label>
                  <label className="flex justify-between items-center cursor-pointer hover:text-blue-600 transition-colors">
                    <span>Tự động lặp lại câu</span>
                    <input
                      type="checkbox"
                      className="form-checkbox h-4 w-4 text-blue-600 rounded cursor-pointer"
                      checked={autoLoopSentence}
                      onChange={() => setAutoLoopSentence(!autoLoopSentence)}
                    />
                  </label>
                  <label className="col-span-2 flex justify-between items-center cursor-pointer mt-2 pt-2 border-t border-gray-100">
                    <span>Hiển thị bản dịch</span>
                    <div className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors duration-300 ${showTranslation ? 'bg-blue-600' : 'bg-gray-300'}`} onClick={() => setShowTranslation(!showTranslation)}>
                      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${showTranslation ? 'translate-x-4' : 'translate-x-0'}`}></div>
                    </div>
                  </label>
                </div>
              )}
            </div>

            {/* SCRIPT LIST (Khu vực cuộn) */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
              {sentences.length === 0 ? (
                <div className="text-center text-gray-400 py-10">Đang tải dữ liệu...</div>
              ) : (
                sentences.map((sentence) => {
                  const isActive = sentence.id === activeSentenceId;

                  return (
                    <div
                      key={sentence.id}
                      ref={isActive ? activeSentenceRef : null}
                      className={`p-4 rounded-xl border transition-all cursor-pointer
                        ${isActive
                          ? "bg-blue-50 border-blue-400 shadow-sm"
                          : "bg-white border-gray-200 hover:border-blue-200 hover:shadow-sm"}`}
                      onClick={() => handleSentenceClick(sentence)}
                    >
                      <p className={`font-medium mb-1 ${isActive ? "text-gray-900" : "text-gray-800"}`}>
                        {sentence.content}
                      </p>
                      {showTranslation && (
                        <p className="text-gray-500 text-sm mb-3">
                          {sentence.ipa}
                          <br />
                          {sentence.translation}
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-2">
                        <button
                          className="bg-sky-400 hover:bg-sky-500 text-white text-xs font-semibold py-1.5 px-3 rounded-lg transition-colors"
                          onClick={(e) => {
                            e.stopPropagation(); // Ngăn click nhầm vào box cha
                            handleSentenceClick(sentence);
                          }}
                        >
                          Nghe lại
                        </button>


                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}