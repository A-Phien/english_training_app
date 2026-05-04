import React from 'react';
import '../assets/css/Header.css';
import { Link, useNavigate } from 'react-router-dom';
import { getUser, logout } from '../auth/authUtils';

const Header = () => {
  const navigate = useNavigate();
  const user = getUser();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="main-header">
      <div className="logo">
        <span className="icon">📖</span>
        <h1 className="brand-name">EnglishMaster</h1>
      </div>

      <nav className="nav-menu">
        <ul>
          <li><a href="/">Bài học</a></li>
          <li><a href="/vocabulary">Từ vựng</a></li>
          <li><a href="#practice">Thực chiến</a></li>
          <li><a href="#rank">Bảng vàng</a></li>
        </ul>
      </nav>

      <div className="user-actions">
        {user ? (
          <>
            {/* Avatar + tên → click vào /account */}
            <Link to="/account" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.username} className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-300" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold ring-2 ring-indigo-300">
                  {user.username?.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-sm font-medium text-gray-700 hidden sm:inline">{user.username}</span>
            </Link>

            <button onClick={handleLogout} className="btn-login" style={{ background: 'transparent', border: '1px solid #e5e7eb', color: '#6b7280' }}>
              Đăng xuất
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn-login">Đăng nhập</Link>
            <Link to="/register" className="btn-register">Gia nhập</Link>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;