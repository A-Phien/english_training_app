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
    <header className="sticky top-0 z-50 glass-panel border-b border-[var(--border-color)] px-6 py-3.5 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <span className="text-2xl drop-shadow-md" aria-hidden="true">
          📖
        </span>
        <h1 className="text-xl font-black bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text tracking-tight">
          EnglishMaster
        </h1>
      </div>

      <nav className="hidden md:flex flex-1 justify-center">
        <ul className="flex items-center gap-8">
          <li>
            <a href="/" className="text-[var(--text-secondary)] font-semibold hover:text-[var(--text-primary)] transition-colors text-sm uppercase tracking-wider">
              {t("header.lessons")}
            </a>
          </li>
          <li>
            <a href="/vocabulary" className="text-[var(--text-secondary)] font-semibold hover:text-[var(--text-primary)] transition-colors text-sm uppercase tracking-wider">
              {t("header.vocabulary")}
            </a>
          </li>
          <li>
            <a href="/account" className="text-[var(--text-secondary)] font-semibold hover:text-[var(--text-primary)] transition-colors text-sm uppercase tracking-wider">
              {t("header.account")}
            </a>
          </li>
        </ul>
      </nav>

      <div className="flex items-center gap-4">
        {/* Nút chuyển đổi sáng/tối */}
        <button
          type="button"
          onClick={toggleTheme}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[var(--surface-bg-muted)] border border-[var(--border-color)] hover:bg-[var(--surface-hover)] hover:scale-105 active:scale-95 transition-all shadow-sm"
          aria-label={isDark ? t("header.lightLabel") : t("header.darkLabel")}
          title={isDark ? t("header.light") : t("header.dark")}
        >
          <span className="text-lg leading-none">{isDark ? "☀" : "☾"}</span>
          <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide hidden sm:inline">{isDark ? t("header.light") : t("header.dark")}</span>
        </button>

        {/* Nút chuyển đổi ngôn ngữ */}
        <button
          type="button"
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[var(--surface-bg-muted)] border border-[var(--border-color)] hover:bg-[var(--surface-hover)] hover:scale-105 active:scale-95 transition-all shadow-sm"
          aria-label={isVi ? "Switch to English" : "Chuyển sang tiếng Việt"}
          title={isVi ? "English" : "Tiếng Việt"}
        >
          <span className="text-lg leading-none">{isVi ? "🇬🇧" : "🇻🇳"}</span>
          <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide hidden sm:inline">{isVi ? "EN" : "VN"}</span>
        </button>

        <div className="w-px h-6 bg-[var(--border-color)] mx-1 hidden sm:block"></div>

        {user ? (
          <div className="flex items-center gap-3">
            <Link
              to="/account"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.username}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-400 shadow-sm"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold ring-2 ring-indigo-400 shadow-sm">
                  {user.username?.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-sm font-bold hidden md:inline text-[var(--text-primary)]">{user.username}</span>
            </Link>

            <button 
              onClick={handleLogout} 
              className="px-3 py-1.5 text-sm font-bold text-rose-500 hover:text-white hover:bg-rose-500 rounded-lg transition-colors border border-transparent hover:border-rose-600 hidden sm:block"
            >
              {t("header.logout")}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/login" className="px-4 py-2 text-sm font-bold text-[var(--text-primary)] hover:bg-[var(--surface-hover)] rounded-lg transition-colors hidden sm:block">
              {t("header.login")}
            </Link>
            <Link to="/register" className="px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all">
              {t("header.register")}
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
