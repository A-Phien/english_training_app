import React, { useState, useEffect } from "react";
import { api } from "../auth/apiClient";

export default function LessonEditor({ initialLesson, onClose, onSaved }) {
    const isEdit = !!initialLesson?.id;

    // --- TẢ THANH LONG: TÂM PHÁP BÀI HỌC ---
    const [lesson, setLesson] = useState({
        title: initialLesson?.title || "",
        description: initialLesson?.description || "",
        youtubeUrl: initialLesson?.youtubeUrl || "",
        videoId: initialLesson?.videoId || "",
    });

    // --- HỮU BẠCH HỔ: TRẬN ĐỒ CÂU CÚ ---
    const [sentences, setSentences] = useState([]);

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEdit);
    const [error, setError] = useState("");

    // Thu thập câu cú nếu là bài học cũ
    useEffect(() => {
        if (isEdit) {
            fetchSentences();
        }
    }, [initialLesson]);

    const fetchSentences = async () => {
        try {
            const res = await api.get(`/api/sentences/lesson/${initialLesson.id}`);
            if (res.ok) {
                const data = await res.json();
                setSentences(data);
            }
        } catch (err) {
            console.error("Lỗi khi tải câu cú:", err);
        } finally {
            setFetching(false);
        }
    };

    // --- CHIÊU THỨC THAO TÚNG BÀI HỌC ---
    const handleLessonChange = (e) => {
        setLesson({ ...lesson, [e.target.name]: e.target.value });
    };

    // --- CHIÊU THỨC THAO TÚNG CÂU CÚ ---
    const addSentence = () => {
        setSentences([
            ...sentences,
            { id: Date.now() * -1, content: "", translation: "", ipa: "", startTime: 0, endTime: 0, isNew: true } // ID âm để đánh dấu là hàng mới chưa lên Server
        ]);
    };

    const updateSentence = (index, field, value) => {
        const newSentences = [...sentences];
        newSentences[index][field] = value;
        setSentences(newSentences);
    };

    const removeSentence = (index) => {
        const newSentences = [...sentences];
        newSentences.splice(index, 1);
        setSentences(newSentences);
    };

    // --- ĐÒN QUYẾT ĐỊNH: XUẤT THỦ LƯU TRỮ ---
    // const handleSave = async () => {
    //     setError("");
    //     setLoading(true);
    //     try {
    //         // 1. Lưu Bài Học trước
    //         let savedLessonId = initialLesson?.id;
    //         const lessonRes = isEdit
    //             ? await api.put(`/api/lessons/${savedLessonId}`, lesson)
    //             : await api.post(`/api/lessons`, lesson);

    //         if (!lessonRes.ok) throw new Error("Chân khí rối loạn, không thể lưu Bài Học!");

    //         if (!isEdit) {
    //             const newLessonData = await lessonRes.json();
    //             savedLessonId = newLessonData.id;
    //         }

    //         // 2. Lưu Câu Cú sau (Tùy thuộc vào việc Backend của ngươi hỗ trợ Bulk Save hay phải gọi từng nhát)
    //         // Lão phu giả định ngươi gọi 1 API để cập nhật toàn bộ mảng sentences cho nhanh
    //         const sentencePayload = sentences.map((s, idx) => ({
    //             ...s,
    //             id: s.isNew ? null : s.id, // Xóa ID ảo đi
    //             lessonId: savedLessonId,
    //             orderIndex: idx // Ép thứ tự hiển thị
    //         }));

    //         const sentRes = await api.post(`/api/lessons/${savedLessonId}/sentences/bulk`, sentencePayload);
    //         if (!sentRes.ok) throw new Error("Khí huyết đảo nghịch, không thể lưu Câu Cú!");

    //         onSaved();
    //         onClose();
    //     } catch (err) {
    //         setError(err.message);
    //     } finally {
    //         setLoading(false);
    //     }
    // };
    // --- ĐÒN QUYẾT ĐỊNH: CHỈ LƯU THÔNG TIN BÀI HỌC (TẢ THANH LONG) ---
    const handleSaveLessonInfo = async () => {
        setError("");
        setLoading(true);
        try {
            let savedLessonId = initialLesson?.id;
            const lessonRes = isEdit
                ? await api.put(`/api/lessons/${savedLessonId}`, lesson)
                : await api.post(`/api/lessons`, lesson);

            if (!lessonRes.ok) throw new Error("Chân khí rối loạn, không thể lưu Bài Học!");

            alert("Đã lưu thông tin bài học thành công!");
            onSaved();
            // Không onClose nữa, để người ta còn ở lại sửa câu cú!
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };


    // --- LƯU LẺ TỪNG CÂU ---
    const saveSingleSentence = async (idx) => {
        const sen = sentences[idx];
        try {
            const payload = { ...sen, lessonId: initialLesson.id, orderIndex: idx };

            let res;
            if (sen.isNew) {
                // Câu mới thì dùng POST
                res = await api.post(`/api/sentences`, payload);
            } else {
                // Câu cũ thì dùng PUT
                res = await api.put(`/api/sentences/${sen.id}`, payload);
            }

            if (!res.ok) throw new Error("Lưu câu thất bại!");

            // Xóa mác 'isNew' và cập nhật ID thật từ Server trả về nếu là câu mới
            if (sen.isNew) {
                const savedData = await res.json();
                updateSentence(idx, 'id', savedData.id);
                updateSentence(idx, 'isNew', false);
            }
            // Ngươi có thể thêm thông báo Toast nhỏ gọn ở đây
            console.log("Lưu câu thành công!");
        } catch (err) {
            alert(err.message);
        }
    };

    // --- XÓA LẺ TỪNG CÂU ---
    const deleteSingleSentence = async (idx) => {
        const sen = sentences[idx];
        if (sen.isNew) {
            // Chưa lên Server thì chỉ cần xóa khỏi màn hình
            removeSentence(idx);
            return;
        }

        if (window.confirm("Ngươi có chắc muốn băm nát câu này?")) {
            try {
                const res = await api.delete(`/api/sentences/${sen.id}`);
                if (!res.ok) throw new Error("Không thể xóa!");
                removeSentence(idx); // Giết xong trên Server thì xóa khỏi màn hình
            } catch (err) {
                alert(err.message);
            }
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex bg-stone-900/60 backdrop-blur-sm sm:p-4 lg:p-8">
            {/* Khung chiến địa tràn viền */}
            <div className="bg-[#f4f1ea] w-full h-full rounded-[2rem] shadow-2xl flex flex-col overflow-hidden relative border border-stone-200">

                {/* Thanh điều khiển trên cùng (Top Bar) */}
                <div className="bg-white px-8 py-4 border-b border-stone-200 flex items-center justify-between shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold text-stone-800">
                            {isEdit ? "Tu Sửa Bí Kíp" : "Khai Bút Bí Kíp Mới"}
                        </h2>
                        <p className="text-sm text-stone-500">
                            {isEdit ? `ID Bí kíp: ${initialLesson.id}` : "Đang tạo mới..."}
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        {error && <span className="text-sm font-medium text-rose-500 bg-rose-50 px-3 py-1 rounded-lg">{error}</span>}
                        <button onClick={onClose} className="px-6 py-2.5 text-stone-600 font-medium hover:bg-stone-100 rounded-xl transition-colors">
                            Hủy bỏ
                        </button>
                        <button
                            onClick={handleSaveLessonInfo}
                            disabled={loading}
                            className="px-8 py-2.5 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-500 hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50"
                        >
                            {loading ? "Đang vận công..." : "Lưu Trận Đồ"}
                        </button>
                    </div>
                </div>

                {/* Phân đôi thiên hạ: Trái - Phải */}
                <div className="flex flex-1 overflow-hidden">

                    {/* TẢ THANH LONG: Thông tin bài học (Cố định) */}
                    <div className="w-1/3 bg-white border-r border-stone-200 p-8 overflow-y-auto">
                        <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-6">Thông Tin Cơ Bản</h3>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-stone-700 mb-2">Tiêu đề</label>
                                <input name="title" value={lesson.title} onChange={handleLessonChange} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-shadow" placeholder="VD: Luyện khí kỳ cơ bản" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-stone-700 mb-2">Mô tả</label>
                                <textarea name="description" value={lesson.description} onChange={handleLessonChange} rows={4} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-shadow resize-none" placeholder="Đôi lời tóm tắt về bí kíp này..." />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-stone-700 mb-2">YouTube URL</label>
                                <input name="youtubeUrl" value={lesson.youtubeUrl} onChange={handleLessonChange} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-shadow" placeholder="https://..." />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-stone-700 mb-2">Video ID</label>
                                <input name="videoId" value={lesson.videoId} onChange={handleLessonChange} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-shadow" placeholder="dQw4w9WgXcQ" />
                            </div>
                        </div>
                    </div>

                    {/* HỮU BẠCH HỔ: Danh sách câu cú (Cuộn độc lập) */}
                    <div className="w-2/3 bg-stone-50 p-8 overflow-y-auto relative">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest">Khẩu Quyết (Câu Cú)</h3>
                            <span className="text-xs font-bold bg-stone-200 text-stone-600 px-3 py-1 rounded-full">{sentences.length} câu</span>
                        </div>

                        {fetching ? (
                            <div className="py-20 text-center text-stone-400 font-medium animate-pulse">Đang rà soát tàng thư lấy câu cú...</div>
                        ) : (
                            <div className="space-y-4 mb-20">
                                {sentences.map((sen, idx) => (
                                    <div key={sen.id} className="bg-white p-5 rounded-2xl shadow-sm border border-stone-100 flex gap-4 items-start group">

                                        {/* Cột đánh số */}
                                        <div className="w-8 h-8 shrink-0 bg-amber-100 text-amber-700 font-bold rounded-full flex items-center justify-center text-sm">
                                            {idx + 1}
                                        </div>

                                        {/* Nội dung câu */}
                                        <div className="flex-1 space-y-3">
                                            <div className="flex gap-3">
                                                <input
                                                    value={sen.content}
                                                    onChange={(e) => updateSentence(idx, 'content', e.target.value)}
                                                    placeholder="Văn bản gốc (English)..."
                                                    className="flex-1 px-4 py-2.5 bg-stone-50 border border-stone-100 rounded-lg text-sm font-medium focus:ring-2 focus:ring-amber-500 outline-none"
                                                />
                                                <input
                                                    value={sen.ipa}
                                                    onChange={(e) => updateSentence(idx, 'ipa', e.target.value)}
                                                    placeholder="Phiên âm (IPA)"
                                                    className="w-1/3 px-4 py-2.5 bg-stone-50 border border-stone-100 rounded-lg text-sm text-stone-500 focus:ring-2 focus:ring-amber-500 outline-none font-mono"
                                                />
                                            </div>
                                            <div className="flex gap-3">
                                                <input
                                                    value={sen.translation}
                                                    onChange={(e) => updateSentence(idx, 'translation', e.target.value)}
                                                    placeholder="Nghĩa tiếng Việt..."
                                                    className="flex-1 px-4 py-2.5 bg-stone-50 border border-stone-100 rounded-lg text-sm text-stone-600 focus:ring-2 focus:ring-amber-500 outline-none"
                                                />
                                                <div className="w-1/3 flex items-center gap-2">
                                                    <input type="number" value={sen.startTime} onChange={(e) => updateSentence(idx, 'startTime', e.target.value)} placeholder="Start" className="w-1/2 px-3 py-2.5 bg-stone-50 border border-stone-100 rounded-lg text-xs text-center focus:ring-2 focus:ring-amber-500 outline-none" />
                                                    <span className="text-stone-300">-</span>
                                                    <input type="number" value={sen.endTime} onChange={(e) => updateSentence(idx, 'endTime', e.target.value)} placeholder="End" className="w-1/2 px-3 py-2.5 bg-stone-50 border border-stone-100 rounded-lg text-xs text-center focus:ring-2 focus:ring-amber-500 outline-none" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Nút hành động cho từng câu */}
                                        <div className="flex flex-col gap-2 shrink-0">
                                            <button
                                                onClick={() => saveSingleSentence(idx)}
                                                className="w-8 h-8 flex items-center justify-center text-emerald-500 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                                                title="Lưu câu này"
                                            >
                                                💾
                                            </button>
                                            <button
                                                onClick={() => deleteSingleSentence(idx)}
                                                className="w-8 h-8 flex items-center justify-center text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
                                                title="Xóa câu này"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {sentences.length === 0 && (
                                    <div className="text-center py-10 text-stone-400 text-sm">Chưa có khẩu quyết nào. Hãy thêm mới!</div>
                                )}
                            </div>
                        )}

                        {/* Nút Thêm Câu Cú trôi nổi ở dưới */}
                        <div className="absolute bottom-8 left-8 right-8">
                            <button
                                onClick={addSentence}
                                className="w-full py-4 bg-white border-2 border-dashed border-stone-300 text-stone-500 font-bold rounded-2xl hover:border-amber-400 hover:text-amber-600 hover:bg-amber-50 transition-all flex items-center justify-center gap-2"
                            >
                                <span className="text-xl">+</span> Bồi thêm Khẩu Quyết
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}