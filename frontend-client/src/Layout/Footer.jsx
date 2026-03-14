import React from 'react';
import '../assets/css/footer.css';

const Footer = () => {
  return (
    <footer className="main-footer">
      <div className="footer-container">
        <div className="footer-info">
          <h2 className="footer-logo">ENG-LAB</h2>
          <p>Nơi rèn luyện kỹ năng, đột phá giới hạn ngoại ngữ cho nam nhân Việt.</p>
        </div>

        <div className="footer-links">
          <h4>Khám phá</h4>
          <ul>
            <li><a href="/courses">Khóa học</a></li>
            <li><a href="/grammar">Ngữ pháp</a></li>
            <li><a href="/vocabulary">Từ vựng</a></li>
          </ul>
        </div>

        <div className="footer-links">
          <h4>Hỗ trợ</h4>
          <ul>
            <li><a href="/faq">Câu hỏi thường gặp</a></li>
            <li><a href="/contact">Liên hệ</a></li>
            <li><a href="/privacy">Điều khoản</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Eng-Lab. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;