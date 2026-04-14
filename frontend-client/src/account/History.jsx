import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../auth/apiClient";
import { getUser } from "../auth/authUtils";

function ScoreCircle({ score }) {
    const cls =
        score >= 85
            ? "bg-green-50 text-green-800"
            : score >= 60
                ? "bg-amber-50 text-amber-800"
                : "bg-red-50 text-red-700";
    return (
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${cls}`}>
            {Math.round(score)}
        </div>
    );
}

function ScoreBar({ score }) {
    const cls = score >= 85 ? "bg-green-600" : score >= 60 ? "bg-amber-500" : "bg-red-500";
    const fillH = Math.round((score / 100) * 36);
    return (
        <div className="w-1 h-9 bg-gray-100 rounded-full overflow-hidden flex flex-col justify-end mt-1">
            <div className={`w-full rounded-full ${cls}`} style={{ height: fillH }} />
        </div>
    );
}

function parseMistakes(raw) {
    if (!raw) return { missing_words: [], wrong_words: [] };

    try {
        const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
        const wordAnalysis = parsed.word_analysis || [];
        const extraWords = parsed.extra_words || [];
        return {
            missing_words: wordAnalysis.filter(w => w.status === "wrong").map(w => w.word),
            wrong_words: extraWords,
        };
    } catch {
        // DB cũ bị Java toString() — ví dụ: {word=Hello,, status=correct}
        const wrongWords = [];
        const extraWords = [];

        // Lấy đúng phần word của các từ status=wrong
        const wordRegex = /\{word=([^,}]+(?:,(?!\s*status))*)\s*,\s*status=wrong\}/g;
        let m;
        while ((m = wordRegex.exec(raw)) !== null) {
            wrongWords.push(m[1].trim());
        }

        // Lấy extra_words
        const extraMatch = raw.match(/extra_words=\[([^\]]*)\]/);
        if (extraMatch?.[1]) {
            extraMatch[1].split(",")
                .map(w => w.trim())
                .filter(Boolean)
                .forEach(w => extraWords.push(w));
        }

        return { missing_words: wrongWords, wrong_words: extraWords };
    }
}

function formatDate(str) {
    if (!str) return "";
    const d = new Date(str);
    return d.toLocaleString("vi-VN", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    });
}

export default function History() {
    const navigate = useNavigate();
    const user = getUser();

    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [openId, setOpenId] = useState(null);

    useEffect(() => {
        if (!user) { navigate("/login"); return; }
        api.get("/api/evaluate/history")
            .then((res) => {
                if (!res.ok) throw new Error("Không thể tải lịch sử");
                return res.json();
            })
            .then(setHistory)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    const avgScore = history.length
        ? Math.round(history.reduce((s, h) => s + h.score, 0) / history.length)
        : 0;
    const bestScore = history.length
        ? Math.round(Math.max(...history.map((h) => h.score)))
        : 0;

    const statCls = (score) =>
        score >= 85 ? "text-green-800" : score >= 60 ? "text-amber-700" : "text-red-600";

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate("/")}
                        className="text-sm text-gray-500 hover:text-gray-700"
                    >
                        ← Về trang chủ
                    </button>
                    <div className="w-px h-4 bg-gray-200" />
                    <span className="text-sm font-medium text-gray-900">Lịch sử luyện tập</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">{user?.username}</span>
                    <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">
                        {user?.role || "USER"}
                    </span>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-7">
                {/* Stats */}
                {!loading && history.length > 0 && (
                    <div className="grid grid-cols-3 gap-3 mb-7">
                        {[
                            { label: "Tổng lần luyện", val: history.length, cls: "text-gray-900" },
                            { label: "Điểm trung bình", val: avgScore, cls: statCls(avgScore) },
                            { label: "Điểm cao nhất", val: bestScore, cls: statCls(bestScore) },
                        ].map((s) => (
                            <div key={s.label} className="bg-gray-100 rounded-lg p-4 text-center">
                                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{s.label}</p>
                                <p className={`text-2xl font-medium ${s.cls}`}>{s.val}</p>
                            </div>
                        ))}
                    </div>
                )}

                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
                    Gần đây nhất
                </p>

                {loading && <p className="text-center text-sm text-gray-400 py-20">Đang tải...</p>}
                {error && <p className="text-center text-sm text-red-500 py-20">{error}</p>}
                {!loading && !error && history.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-gray-400 text-sm mb-4">Chưa có lần luyện tập nào.</p>
                        <button
                            onClick={() => navigate("/")}
                            className="px-5 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-500"
                        >
                            Bắt đầu luyện tập
                        </button>
                    </div>
                )}

                <div className="flex flex-col gap-2.5">
                    {history.map((item) => {
                        const mistakes = parseMistakes(item.mistakes);
                        const missing = mistakes.missing_words || [];
                        const wrong = mistakes.wrong_words || [];
                        const isOpen = openId === item.id;
                        const lessonId = item.sentence?.lesson?.id;
                        const lessonTitle = item.sentence?.lesson?.title || "Bài học";

                        const show2m = missing.slice(0, 2);
                        const show2w = wrong.slice(0, 2);
                        const extra = missing.length + wrong.length - show2m.length - show2w.length;

                        return (
                            <div key={item.id} className="bg-white border border-gray-100 rounded-xl overflow-hidden">
                                <div className="flex items-stretch">

                                    {/* Score col */}
                                    <div className="flex flex-col items-center justify-center px-3.5 py-4 gap-1.5 border-r border-gray-100">
                                        <ScoreCircle score={item.score} />
                                        <ScoreBar score={item.score} />
                                    </div>

                                    {/* Body */}
                                    <div
                                        className="flex-1 min-w-0 px-4 py-3.5 cursor-pointer hover:bg-gray-50 transition-colors"
                                        onClick={() => setOpenId(isOpen ? null : item.id)}
                                    >
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full font-medium whitespace-nowrap">
                                                {lessonTitle}
                                            </span>
                                            <span className="text-xs text-gray-400">{formatDate(item.createdAt)}</span>
                                        </div>
                                        <p className="text-sm font-medium text-gray-900 truncate mb-1">
                                            {item.expectedTextSnapshot}
                                        </p>
                                        <p className="text-xs text-gray-400 italic truncate mb-2">
                                            "{item.transcript}"
                                        </p>
                                        <div className="flex flex-wrap items-center gap-1.5">
                                            {!missing.length && !wrong.length ? (
                                                <span className="text-xs text-green-700 flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-600 inline-block" />
                                                    Không có lỗi
                                                </span>
                                            ) : (
                                                <>
                                                    {show2m.map((w) => (
                                                        <span key={w} className="text-xs px-2 py-0.5 bg-red-50 text-red-700 border border-red-100 rounded-full">
                                                            {w} — thiếu
                                                        </span>
                                                    ))}
                                                    {show2w.map((w) => (
                                                        <span key={w} className="text-xs px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded-full">
                                                            {w} — sai
                                                        </span>
                                                    ))}
                                                    {extra > 0 && (
                                                        <span className="text-xs text-gray-400">+{extra} từ khác</span>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions col */}
                                    <div className="flex flex-col border-l border-gray-100 min-w-[120px]">
                                        <button
                                            onClick={() => lessonId && navigate(`/lesson/${lessonId}`)}
                                            className="flex-1 flex flex-col items-center justify-center gap-1 px-4 py-3 border-b border-gray-100 hover:bg-blue-50 transition-colors group"
                                        >
                                            <span className="text-base text-gray-300 group-hover:text-blue-500">▶</span>
                                            <span className="text-xs text-gray-400 group-hover:text-blue-600 text-center leading-tight">
                                                Luyện tập<br />lại bài này
                                            </span>
                                        </button>
                                        <button
                                            onClick={() => setOpenId(isOpen ? null : item.id)}
                                            className="flex-1 flex flex-col items-center justify-center gap-1 px-4 py-3 hover:bg-gray-50 transition-colors"
                                        >
                                            <span className="text-xs text-gray-300">{isOpen ? "▲" : "▼"}</span>
                                            <span className="text-xs text-gray-400">Chi tiết</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Detail panel */}
                                {isOpen && (
                                    <div className="border-t border-gray-100 bg-gray-50 px-4 py-4 grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-3">
                                            <div>
                                                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Câu gốc</p>
                                                <p className="text-sm text-gray-800">{item.expectedTextSnapshot}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Bạn đã nói</p>
                                                <p className="text-sm text-gray-500 italic">"{item.transcript}"</p>
                                            </div>
                                        </div>
                                        <div className="border-l border-gray-200 pl-4">
                                            <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Nhận xét chi tiết</p>
                                            {!missing.length && !wrong.length ? (
                                                <span className="text-sm text-green-700 flex items-center gap-1.5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-600 inline-block" />
                                                    Phát âm xuất sắc, không có lỗi!
                                                </span>
                                            ) : (
                                                <div className="flex flex-wrap gap-1.5">
                                                    {missing.map((w) => (
                                                        <span key={w} className="text-xs px-2 py-1 bg-red-50 text-red-700 border border-red-100 rounded-full">
                                                            {w} — thiếu
                                                        </span>
                                                    ))}
                                                    {wrong.map((w) => (
                                                        <span key={w} className="text-xs px-2 py-1 bg-amber-50 text-amber-700 border border-amber-100 rounded-full">
                                                            {w} — sai
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}