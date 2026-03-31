import React from 'react';
import '../assets/css/Header.css'
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="main-header">
      <div className="logo">
        <span className="icon">📖</span>
        <h1 className="brand-name">EnglishMaster</h1>
      </div>

      <nav className="nav-menu">
        <ul>
          <li><a href="/">Bài học</a></li>
          <li><a href="#vocabulary">Từ vựng</a></li>
          <li><a href="#practice">Thực chiến</a></li>
          <li><a href="#rank">Bảng vàng</a></li>
        </ul>
      </nav>

      <div className="user-actions">
        <Link to="/login" className="btn-login">Đăng nhập</Link>
        <Link to="/register" className="btn-register">Gia nhập</Link>
      </div>
    </header>
  );
};

export default Header;