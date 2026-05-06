// Tệp: Sidebar.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Sidebar({ user, lessonCount, onNavigateHome, onLogout, onAddLesson }) {
    const navigate = useNavigate();
    const { t } = useTranslation();
    return (
        <aside className="w-full lg:w-72 flex-shrink-0 flex flex-col gap-6">

            {/* Lệnh Bài Quản Sự & Thông Tin */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-stone-100 flex flex-col items-center text-center">
                <div className="w-20 h-20 mb-4 shadow-inner">
                    {user?.avatarUrl ? (
                        <img
                            src={user.avatarUrl}
                            alt="Avatar"
                            className="w-full h-full rounded-full object-cover border-2 border-amber-100"
                            onError={(e) => {
                                // Ngăn chặn vòng lặp vô hạn nếu ảnh fallback cũng lỗi
                                e.target.onerror = null;
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || 'U')}&background=fef3c7&color=d97706`;
                            }}
                        />
                    ) : (
                        <div className="w-full h-full bg-amber-100 rounded-full flex items-center justify-center text-amber-600 text-3xl font-bold">
                            {user?.username?.charAt(0).toUpperCase() || "A"}
                        </div>
                    )}
                </div>

                <h2 className="text-xl font-bold">{user?.username || t("sidebar.anonymous")}</h2>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-4 py-1.5 rounded-full mt-3 tracking-wide uppercase">
                    {user?.role || t("sidebar.role")}
                </span>

                <div className="w-full h-px bg-stone-100 my-6" />

                {/* Các chức năng cá nhân bổ sung */}
                <div className="w-full flex flex-col gap-2 mb-6">
                    <button className="w-full py-2.5 bg-stone-50 text-stone-600 hover:bg-stone-100 hover:text-stone-900 text-sm font-medium rounded-xl transition-colors">
                        {t("sidebar.editInfo")}
                    </button>
                    <button className="w-full py-2.5 bg-stone-50 text-stone-600 hover:bg-stone-100 hover:text-stone-900 text-sm font-medium rounded-xl transition-colors">
                        {t("sidebar.history")}
                    </button>
                </div>

                <div className="w-full h-px bg-stone-100 mb-6" />

                {/* Điều hướng cơ bản */}
                <button
                    onClick={onNavigateHome}
                    className="w-full py-2.5 text-stone-500 hover:text-stone-800 text-sm font-medium transition-colors mb-2"
                >
                    {t("sidebar.goHome")}
                </button>
                <button
                    onClick={onLogout}
                    className="w-full py-2.5 text-rose-400 hover:text-rose-600 text-sm font-medium transition-colors"
                >
                    {t("sidebar.logoutLabel")}
                </button>
            </div>

            {/* Bàn Làm Việc - Thao Tác Ký Lục */}
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-stone-100 flex-1 flex flex-col">
                <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">
                    {t("sidebar.operations")}
                </h3>
                <button
                    onClick={onAddLesson}
                    className="w-full py-4 bg-stone-800 text-white rounded-2xl hover:bg-stone-700 transition-all font-medium flex justify-center items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-1"
                >
                    <span className="text-lg">+</span> {t("sidebar.addLesson")}
                </button>

                <button
                    onClick={() => navigate("/admin/vocabulary")}
                    className="w-full mt-3 py-3 bg-indigo-50 text-indigo-700 rounded-2xl hover:bg-indigo-100 transition-all font-medium flex justify-center items-center gap-2 text-sm border border-indigo-200"
                >
                    {t("sidebar.manageVocab")}
                </button>

                <div className="mt-auto pt-6 text-center text-xs text-stone-400">
                    {t("sidebar.totalLessons", { count: lessonCount })}
                </div>
            </div>
        </aside>
    );
}
