import React, { useState, useEffect, useRef } from "react";

export default function WordDictionaryPopup({ word, position, onClose }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const popupRef = useRef(null);
  const audioRef = useRef(null);

  // Click ngoài đóng popup
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // Fetch dữ liệu
  useEffect(() => {
    if (!word) return;

    const fetchDictionary = async () => {
      setLoading(true);
      setData(null);

      const cleanWord = word.replace(/[^a-zA-Z]/g, "").toLowerCase();
      if (!cleanWord) {
        setLoading(false);
        return;
      }

      try {
        // 1. Dịch chuẩn từ sang Tiếng Việt (chỉ gọi 1 lần cho bản thân từ, khắc phục triệt để lỗi chặn API)
        let mainTranslation = "Không tìm thấy nghĩa";
        try {
          const transRes = await fetch(
            `https://api.mymemory.translated.net/get?q=${cleanWord}&langpair=en|vi`
          );
          if (transRes.ok) {
            const transData = await transRes.json();
            mainTranslation = transData.responseData?.translatedText || mainTranslation;
          }
        } catch (e) {
          console.error("Translation Error", e);
        }

        // 2. Lấy thông tin phiên âm và từ loại từ Free Dictionary API
        let phonetics = [];
        let wordType = "";
        try {
          const dictRes = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${cleanWord}`);
          if (dictRes.ok) {
            const dictData = await dictRes.json();
            const entry = dictData[0];

            // Xử lý phonetics (API dư thừa nhiều data, ta chỉ lọc ra 1 combo tốt nhất)
            const bestAudio = (entry.phonetics || []).find(p => p.audio)?.audio || "";
            const bestText = (entry.phonetics || []).find(p => p.text)?.text || "";

            if (bestAudio || bestText) {
              phonetics = [{ text: bestText, audio: bestAudio }];
            }

            if (entry.meanings && entry.meanings.length > 0) {
              // Chỉ lấy loại từ đầu tiên của từ vựng này (VD: noun -> Danh từ)
              wordType = getPartOfSpeechVN(entry.meanings[0].partOfSpeech);
            }
          }
        } catch (e) {
          console.error("Dictionary API Error", e);
        }

        setData({
          word: cleanWord,
          phonetics,
          mainTranslation,
          wordType,
        });

      } catch (err) {
        setData({ word: cleanWord, mainTranslation: "Lỗi kết nối", wordType: "" });
      } finally {
        setLoading(false);
      }
    };

    fetchDictionary();
  }, [word]);

  if (!word || !position) return null;

  // Tính toán vị trí hiển thị thông minh hơn để không che mất màn hình
  let isBottom = false;
  if (position.top > window.innerHeight - 350) {
    isBottom = true; // Bật lên tính từ dưới nếu ở gần cuối màn
  }

  let leftPos = position.left;
  let transformX = "translateX(-50%)"; // Tự động căn giữa

  if (leftPos < 160) {
    leftPos = 16;
    transformX = "none";
  } else if (leftPos > window.innerWidth - 160) {
    leftPos = window.innerWidth - 16;
    transformX = "translateX(-100%)";
  }

  const popupStyle = {
    position: "fixed",
    top: isBottom ? "auto" : `${position.top + 25}px`,
    bottom: isBottom ? `${window.innerHeight - position.top + 10}px` : "auto",
    left: `${leftPos}px`,
    transform: transformX,
    zIndex: 9999,
  };

  const playAudio = (url) => {
    if (audioRef.current && url) {
      audioRef.current.src = url;
      audioRef.current.play().catch(() => { });
    }
  };

  const getPartOfSpeechVN = (pos) => {
    const map = {
      noun: "Danh từ",
      verb: "Động từ",
      adjective: "Tính từ",
      adverb: "Trạng từ",
      pronoun: "Đại từ",
      preposition: "Giới từ",
      conjunction: "Liên từ",
    };
    return map[pos?.toLowerCase()] || pos;
  };

  return (
    <div
      ref={popupRef}
      style={popupStyle}
      className="bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] border border-gray-100 p-5 w-80 max-h-[80vh] overflow-y-auto text-left pointer-events-auto transform transition-all duration-200"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-2xl font-bold text-gray-900 capitalize">{data?.word || word}</h3>
        <button onClick={onClose} className="text-gray-400 bg-gray-50 hover:bg-red-50 hover:text-red-500 rounded-full w-7 h-7 flex items-center justify-center transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      {loading ? (
        <div className="py-8 text-center text-gray-400">
          <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-3"></div>
          <span className="text-sm">Đang phân tích từ vựng...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Phiên âm + Audio */}
          {data?.phonetics?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {data.phonetics.map((ph, i) => (
                (ph.text || ph.audio) && (
                  <div key={i} className="flex items-center gap-2 bg-blue-50/50 px-2.5 py-1.5 rounded-lg border border-blue-100/50">
                    {ph.audio && (
                      <button
                        onClick={() => playAudio(ph.audio)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="Nghe phát âm chuẩn"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                      </button>
                    )}
                    {ph.text && <span className="font-mono text-[13px] text-blue-800 font-medium">{ph.text}</span>}
                  </div>
                )
              ))}
            </div>
          )}

          {/* Nghĩa Tiếng Việt Cốt lõi */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[11px] uppercase font-bold text-blue-200 tracking-wider">Nghĩa</span>
              {data?.wordType && (
                <span className="text-[10px] uppercase font-bold bg-white/20 px-2 py-0.5 rounded text-white shadow-sm border border-white/10">{data.wordType}</span>
              )}
            </div>
            <p className="font-semibold text-lg">{data?.mainTranslation}</p>
          </div>
        </div>
      )}

      <audio ref={audioRef} className="hidden" />
    </div>
  );
}