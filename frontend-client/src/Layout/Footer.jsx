import React from 'react';
import '../assets/css/footer.css';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="main-footer">
      <div className="footer-container">
        <div className="footer-info">
          <h2 className="footer-logo">ENG-LAB</h2>
          <p>{t("footer.tagline")}</p>
        </div>

        <div className="footer-links">
          <h4>{t("footer.explore")}</h4>
          <ul>
            <li><a href="/courses">{t("footer.courses")}</a></li>
            <li><a href="/grammar">{t("footer.grammar")}</a></li>
            <li><a href="/vocabulary">{t("footer.vocabulary")}</a></li>
          </ul>
        </div>

        <div className="footer-links">
          <h4>{t("footer.support")}</h4>
          <ul>
            <li><a href="/faq">{t("footer.faq")}</a></li>
            <li><a href="/contact">{t("footer.contact")}</a></li>
            <li><a href="/privacy">{t("footer.terms")}</a></li>
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