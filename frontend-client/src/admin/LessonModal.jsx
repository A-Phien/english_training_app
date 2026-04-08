import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../auth/apiClient";
import { getUser, logout } from "../auth/authUtils";
import Sidebar from "../Layout/Sidebar";
import LessonEditor from "../admin/LessonEditor";


// ── Confirm xóa ───────────────────────────────────────────
function ConfirmModal({ lesson, onClose, onConfirm, loading }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8 mx-4 text-center">
                <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🗑️</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Xóa bài học?</h3>
                <p className="text-sm text-gray-500 mb-6">
                    Bài học <span className="font-medium text-gray-700">"{lesson.title}"</span> sẽ bị xóa vĩnh viễn.
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex-1 py-2.5 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-400 transition-colors disabled:opacity-60"
                    >
                        {loading ? "Đang xóa..." : "Xóa"}
                    </button>
                </div>
            </div>
        </div>
    );
}




// ── Trang Admin chính ─────────────────────────────────────
export default function AdminLessons() {
    const navigate = useNavigate();
    const user = getUser();

    // --- NỘI CÔNG TÂM TRẬN ---
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [modalLesson, setModalLesson] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Kế hoạch phòng ngự (Mở ra nếu muốn cấm kẻ ngoại đạo)
    // useEffect(() => {
    //     if (!user || user.role !== "ADMIN") {
    //         navigate("/");
    //     }
    // }, []);

    const fetchLessons = async () => {
        setLoading(true);
        try {
            const res = await api.get("/api/lessons");
            const data = await res.json();
            setLessons(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLessons();
    }, []);

    const handleDelete = async () => {
        setDeleteLoading(true);
        try {
            await api.delete(`/api/lessons/${deleteTarget.id}`);
            setDeleteTarget(null);
            fetchLessons();
        } catch (err) {
            console.error(err);
        } finally {
            setDeleteLoading(false);
        }
    };

    const filtered = lessons.filter((l) =>
        l.title.toLowerCase().includes(search.toLowerCase())
    );

    const getYouTubeThumb = (lesson) => {
        const vid = lesson.videoId || lesson.youtubeUrl?.split("v=")[1]?.split("&")[0];
        return vid ? `https://img.youtube.com/vi/${vid}/mqdefault.jpg` : null;
    };

    // --- BÀY TRẬN ĐỒ NGOẠI QUAN ---
    return (
        <div className="min-h-screen bg-[#f4f1ea] p-4 lg:p-8 flex flex-col lg:flex-row gap-6 font-sans text-stone-800 selection:bg-amber-200">

            {/* SỬ DỤNG PHÁP BẢO SIDEBAR ĐÃ TÁCH RỜI */}
            <Sidebar
                user={user}
                lessonCount={lessons.length}
                onNavigateHome={() => navigate("/")}
                onLogout={logout}
                onAddLesson={() => setModalLesson({})}
            />

            {/* ĐÀI BÁT QUÁI BÊN PHẢI (Nơi hiển thị bài học) */}
            <main className="flex-1 bg-white rounded-[2rem] shadow-sm border border-stone-100 flex flex-col overflow-hidden">

                {/* Thanh Tìm Kiếm Đỉnh Đầu */}
                <div className="p-6 lg:p-8 border-b border-stone-100 flex items-center justify-between bg-white/50 backdrop-blur-md sticky top-0 z-10">
                    <div>
                        <h1 className="text-3xl font-extrabold text-stone-800 tracking-tight">Tàng Kinh Các</h1>
                        <p className="text-sm text-stone-500 mt-1">Nơi lưu trữ những tinh hoa võ học</p>
                    </div>

                    {/* Ô tìm kiếm cho Màn Hình Lớn */}
                    <div className="relative w-72 hidden md:block">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">🔍</span>
                        <input
                            type="text"
                            placeholder="Tìm kiếm bí kíp..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-stone-50 border-none rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                        />
                    </div>
                </div>

                {/* Ô tìm kiếm cho Màn Hình Di Động */}
                <div className="p-4 border-b border-stone-100 md:hidden">
                    <input
                        type="text"
                        placeholder="Tìm kiếm bí kíp..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full px-4 py-3 bg-stone-50 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                </div>

                {/* Khu Vực Lưới Thẻ Bài */}
                <div className="p-6 lg:p-8 overflow-y-auto flex-1 bg-stone-50/30">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {loading ? (
                            <div className="col-span-full py-20 text-center text-stone-400 text-sm font-medium animate-pulse">
                                Lão phu đang vận công lấy dữ liệu...
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="col-span-full py-20 text-center text-stone-400 text-sm">
                                {search ? "Tuyệt nhiên không thấy tung tích bài học này." : "Tàng Kinh Các hiện đang trống rỗng."}
                            </div>
                        ) : (
                            filtered.map((lesson) => (
                                <div
                                    key={lesson.id}
                                    className="group bg-white rounded-3xl p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 border border-stone-100 transition-all duration-300 flex flex-col"
                                >
                                    {/* Ảnh đại diện */}
                                    <div className="relative w-full h-48 mb-5 overflow-hidden rounded-2xl bg-stone-50">
                                        {getYouTubeThumb(lesson) ? (
                                            <img
                                                src={getYouTubeThumb(lesson)}
                                                alt={lesson.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center w-full h-full text-stone-300">
                                                <span>Hình ảnh thất truyền</span>
                                            </div>
                                        )}
                                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-semibold text-stone-600 shadow-sm">
                                            ID: {lesson.id}
                                        </div>
                                    </div>

                                    {/* Thông tin bài học */}
                                    <h3 className="text-lg font-bold text-stone-800 leading-tight mb-2 group-hover:text-amber-600 transition-colors">
                                        {lesson.title}
                                    </h3>

                                    <p className="text-sm text-stone-500 flex-grow line-clamp-2 mb-4">
                                        {lesson.description || "Bí kíp này chưa có lời tựa..."}
                                    </p>

                                    <div className="text-xs text-stone-400 font-medium mb-4 flex items-center gap-1">
                                        <span>📅</span>
                                        {lesson.createdAt ? new Date(lesson.createdAt).toLocaleDateString("vi-VN") : "Bất tri tuế nguyệt"}
                                    </div>

                                    {/* Các nút hành động */}
                                    <div className="grid grid-cols-3 gap-2 pt-4 border-t border-stone-100">
                                        <button
                                            onClick={() => navigate(`/lesson/${lesson.id}`)}
                                            className="py-2 text-sm font-medium text-stone-600 bg-stone-50 rounded-xl hover:bg-stone-100 transition-colors"
                                        >
                                            Xem
                                        </button>
                                        <button
                                            onClick={() => setModalLesson(lesson)}
                                            className="py-2 text-sm font-medium text-amber-600 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors"
                                        >
                                            Sửa
                                        </button>
                                        <button
                                            onClick={() => setDeleteTarget(lesson)}
                                            className="py-2 text-sm font-medium text-rose-500 bg-rose-50 rounded-xl hover:bg-rose-100 transition-colors"
                                        >
                                            Xóa
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>

            {/* MODALS MẬT THẤT - Các thông báo xác nhận và Thêm/Sửa */}
            {modalLesson !== null && (
                <LessonEditor
                    initialLesson={modalLesson}
                    onClose={() => setModalLesson(null)}
                    onSaved={fetchLessons}
                />
            )}

            {deleteTarget && (
                <ConfirmModal
                    lesson={deleteTarget}
                    onClose={() => setDeleteTarget(null)}
                    onConfirm={handleDelete}
                    loading={deleteLoading}
                />
            )}
        </div>
    );
}