import React from 'react';
import '../assets/css/Header.css'
const Header = () => {
  return (
    <header className="main-header">
      <div className="logo">
        <span className="icon">📖</span>
        <h1 className="brand-name">EnglishMaster</h1>
      </div>

      <nav className="nav-menu">
        <ul>
          <li><a href="#lessons">Bài học</a></li>
          <li><a href="#vocabulary">Từ vựng</a></li>
          <li><a href="#practice">Thực chiến</a></li>
          <li><a href="#rank">Bảng vàng</a></li>
        </ul>
      </nav>

      <div className="user-actions">
        <button className="btn-login">Đăng nhập</button>
        <button className="btn-register">Gia nhập</button>
      </div>
    </header>
  );
};

export default Header;