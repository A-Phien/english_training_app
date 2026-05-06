import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";

function normalize(s) {
    return s.toLowerCase().replace(/[^\w\s]/g, "").replace(/\s+/g, " ").trim();
}

function checkAnswer(expected, userInput) {
    const expWords = normalize(expected).split(" ");
    const userWords = normalize(userInput).split(" ");
    const remaining = [...userWords];

    const wordAnalysis = expWords.map((word) => {
        const idx = remaining.indexOf(word);
        if (idx !== -1) { remaining.splice(idx, 1); return { word, status: "correct" }; }
        return { word, status: "wrong" };
    });

    const correct = wordAnalysis.filter(w => w.status === "correct").length;
    const score = Math.round((correct / expWords.length) * 100);
    return { wordAnalysis, score, extraWords: remaining };
}

/**
 * DictationBox — Inline per-sentence dictation component
 * Hiển thị trong cột phải (danh sách câu) khi tab Dictation được chọn.
 *
 * Props:
 *   sentence      — { id, content, startTime, endTime, orderIndex }
 *   playerRef     — ref YouTube player
 *   showAnswer    — bool: hiện đáp án không
 *   showTranslation — bool từ settings
 */
export default function DictationBox({ sentence, playerRef, showTranslation }) {
    const [input, setInput] = useState("");
    const [result, setResult] = useState(null);       // null | { wordAnalysis, score, extraWords }
    const [showAnswerText, setShowAnswerText] = useState(false);
    const inputRef = useRef(null);
    const { t } = useTranslation();

    // Reset khi đổi câu
    useEffect(() => {
        setInput("");
        setResult(null);
        setShowAnswerText(false);
    }, [sentence?.id]);

    const playSentence = (e) => {
        e?.stopPropagation();
        if (!playerRef?.current || !sentence) return;
        playerRef.current.seekTo(sentence.startTime, true);
        playerRef.current.playVideo();
        // Dừng sau khi câu kết thúc
        const ms = (sentence.endTime - sentence.startTime + 0.4) * 1000;
        setTimeout(() => playerRef.current?.pauseVideo?.(), ms);
        // Focus input sau khi nghe
        setTimeout(() => inputRef.current?.focus(), 300);
    };

    const handleCheck = (e) => {
        e?.stopPropagation();
        if (!input.trim()) return;
        setResult(checkAnswer(sentence.content, input));
        setShowAnswerText(false);
    };

    const handleShowAnswer = (e) => {
        e?.stopPropagation();
        setShowAnswerText(true);
        setResult(null);
    };

    const handleReset = (e) => {
        e?.stopPropagation();
        setInput("");
        setResult(null);
        setShowAnswerText(false);
        setTimeout(() => inputRef.current?.focus(), 50);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleCheck();
        }
    };

    const orderLabel = sentence.orderIndex != null ? t("dictation.sentence", { index: sentence.orderIndex + 1 }) : "";

    return (
        <div onClick={(e) => e.stopPropagation()}>
            {/* Tên câu — ẩn nội dung bằng dấu chấm nếu chưa xem đáp án */}
            <p className="text-sm font-semibold text-gray-500 dark:text-slate-400 mb-2 select-none">
                {orderLabel}
                <span className="text-gray-300 dark:text-slate-600 tracking-widest">
                    {showAnswerText || result ? "" : "…………………………"}
                </span>
            </p>

            {/* Hiện đáp án nếu bấm Đáp án */}
            {showAnswerText && (
                <p className="text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 rounded-lg px-3 py-2 mb-2 font-medium">
                    💡 {sentence.content}
                </p>
            )}

            {/* Kết quả tô màu nếu đã kiểm tra */}
            {result && (
                <div className="mb-2">
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full
                            ${result.score >= 85 ? "bg-green-100 text-green-700"
                                : result.score >= 60 ? "bg-amber-100 text-amber-700"
                                    : "bg-red-100 text-red-700"}`}>
                            {result.score} {t("dictation.points")}
                        </span>
                        {result.score === 100 && <span className="text-xs text-green-600">{t("dictation.perfect")}</span>}
                    </div>
                    <div className="flex flex-wrap gap-1">
                        {result.wordAnalysis.map((item, i) => (
                            <span key={i} className={`text-xs px-1.5 py-0.5 rounded font-medium
                                ${item.status === "correct"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-700 line-through"}`}>
                                {item.word}
                            </span>
                        ))}
                    </div>
                    {result.extraWords.length > 0 && (
                        <p className="text-xs text-amber-600 mt-1">
                            {t("dictation.extra")}{result.extraWords.join(", ")}
                        </p>
                    )}
                </div>
            )}

            {/* Ô input */}
            <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onClick={(e) => e.stopPropagation()}
                placeholder={t("dictation.placeholder")}
                className="w-full bg-white dark:bg-slate-700 text-gray-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-400 text-sm rounded-lg px-3 py-2.5 mb-2.5 border border-gray-200 dark:border-slate-600 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all"
            />

            {/* Nút hành động */}
            <div className="flex gap-2 flex-wrap">
                <button
                    onClick={playSentence}
                    className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-white text-xs font-bold rounded-lg transition-colors"
                >
                    {t("dictation.listen")}
                </button>
                <button
                    onClick={handleCheck}
                    disabled={!input.trim()}
                    className="px-3 py-1.5 bg-green-500 hover:bg-green-400 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {t("dictation.check")}
                </button>
                <button
                    onClick={handleShowAnswer}
                    className="px-3 py-1.5 bg-orange-500 hover:bg-orange-400 text-white text-xs font-bold rounded-lg transition-colors"
                >
                    {t("dictation.answer")}
                </button>
                <button
                    onClick={handleReset}
                    className="px-3 py-1.5 bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold rounded-lg transition-colors"
                >
                    {t("dictation.reset")}
                </button>
            </div>

            {/* Bản dịch (nếu bật) */}
            {showTranslation && sentence.translation && (
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-2 italic">{sentence.translation}</p>
            )}
        </div>
    );
}
