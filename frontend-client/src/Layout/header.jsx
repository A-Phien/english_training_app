import "../assets/css/Header.css";
import { Link, useNavigate } from "react-router-dom";
import { getUser, logout } from "../auth/authUtils";
import { useTheme } from "../theme/ThemeContext";
import { useTranslation } from "react-i18next";

const Header = () => {
  const navigate = useNavigate();
  const user = getUser();
  const { isDark, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();

  const isVi = i18n.language === "vi";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleLanguage = () => {
    i18n.changeLanguage(isVi ? "en" : "vi");
  };

  return (
    <header className="main-header">
      <div className="logo">
        <span className="icon" aria-hidden="true">
          📖
        </span>
        <h1 className="brand-name">EnglishMaster</h1>
      </div>

      <nav className="nav-menu">
        <ul>
          <li>
            <a href="/">{t("header.lessons")}</a>
          </li>
          <li>
            <a href="/vocabulary">{t("header.vocabulary")}</a>
          </li>
          <li>
            <a href="/account">{t("header.account")}</a>
          </li>
        </ul>
      </nav>

      <div className="user-actions">
        {/* Nút chuyển đổi sáng/tối */}
        <button
          type="button"
          onClick={toggleTheme}
          className="theme-toggle"
          aria-label={isDark ? t("header.lightLabel") : t("header.darkLabel")}
          title={isDark ? t("header.light") : t("header.dark")}
        >
          <span className="theme-toggle-icon">{isDark ? "☀" : "☾"}</span>
          <span className="theme-toggle-label">{isDark ? t("header.light") : t("header.dark")}</span>
        </button>

        {/* Nút chuyển đổi ngôn ngữ */}
        <button
          type="button"
          onClick={toggleLanguage}
          className="theme-toggle"
          aria-label={isVi ? "Switch to English" : "Chuyển sang tiếng Việt"}
          title={isVi ? "English" : "Tiếng Việt"}
        >
          <span className="theme-toggle-icon">{isVi ? "🇬🇧" : "🇻🇳"}</span>
          <span className="theme-toggle-label">{isVi ? "EN" : "VN"}</span>
        </button>

        {user ? (
          <>
            <Link
              to="/account"
              className="account-link flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.username}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-300"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold ring-2 ring-indigo-300">
                  {user.username?.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="account-name hidden sm:inline">{user.username}</span>
            </Link>

            <button onClick={handleLogout} className="btn-login btn-ghost">
              {t("header.logout")}
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn-login">
              {t("header.login")}
            </Link>
            <Link to="/register" className="btn-register">
              {t("header.register")}
            </Link>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
