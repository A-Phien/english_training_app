// Tệp: Sidebar.jsx
import React from "react";

export default function Sidebar({ user, lessonCount, onNavigateHome, onLogout, onAddLesson }) {
    return (
        <aside className="w-full lg:w-72 flex-shrink-0 flex flex-col gap-6">

            {/* Lệnh Bài Quản Sự & Thông Tin */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-stone-100 flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 text-3xl mb-4 shadow-inner">
                    🌿
                </div>
                <h2 className="text-xl font-bold">{user?.username || "Ẩn danh"}</h2>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-4 py-1.5 rounded-full mt-3 tracking-wide uppercase">
                    {user?.role || "CHƯỞNG MÔN"}
                </span>

                <div className="w-full h-px bg-stone-100 my-6" />

                {/* Các chức năng cá nhân bổ sung */}
                <div className="w-full flex flex-col gap-2 mb-6">
                    <button className="w-full py-2.5 bg-stone-50 text-stone-600 hover:bg-stone-100 hover:text-stone-900 text-sm font-medium rounded-xl transition-colors">
                        ⚙️ Tu sửa thông tin
                    </button>
                    <button className="w-full py-2.5 bg-stone-50 text-stone-600 hover:bg-stone-100 hover:text-stone-900 text-sm font-medium rounded-xl transition-colors">
                        📜 Lịch sử tu luyện
                    </button>
                </div>

                <div className="w-full h-px bg-stone-100 mb-6" />

                {/* Điều hướng cơ bản */}
                <button
                    onClick={onNavigateHome}
                    className="w-full py-2.5 text-stone-500 hover:text-stone-800 text-sm font-medium transition-colors mb-2"
                >
                    ← Về sơn môn
                </button>
                <button
                    onClick={onLogout}
                    className="w-full py-2.5 text-rose-400 hover:text-rose-600 text-sm font-medium transition-colors"
                >
                    Rời khỏi Tàng Kinh Các
                </button>
            </div>

            {/* Bàn Làm Việc - Thao Tác Ký Lục */}
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-stone-100 flex-1 flex flex-col">
                <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">
                    Thao Tác Ký Lục
                </h3>
                <button
                    onClick={onAddLesson}
                    className="w-full py-4 bg-stone-800 text-white rounded-2xl hover:bg-stone-700 transition-all font-medium flex justify-center items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-1"
                >
                    <span className="text-lg">+</span> Khai bút bài mới
                </button>

                <div className="mt-auto pt-6 text-center text-xs text-stone-400">
                    Tổng cộng: {lessonCount} bí kíp
                </div>
            </div>
        </aside>
    );
}