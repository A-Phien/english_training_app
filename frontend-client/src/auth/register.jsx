import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { saveToken, saveUser } from "./authUtils";
import { api } from "./apiClient";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { t } = useTranslation();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (password !== confirmPassword) {
      setError(t("register.errorPasswordsDoNotMatch"));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(t("register.errorGeneric")); // Hoặc thông báo email không hợp lệ
      return;
    }

    setIsLoading(true);

    try {
      // 1. Gửi request đăng ký lên backend
      const res = await api.post(
        "/api/auth/register",
        { username, email, password },
        false
      );

      if (!res.ok) {
        // Trả về mã lỗi từ backend (ví dụ: đã trùng username)
        const errorData = await res.json().catch(() => ({}));
        const errorMsg = errorData.message || t("register.errorUsernameExists");
        throw new Error(errorMsg);
      }

      // 2. Đăng ký thành công -> Tự động đăng nhập
      const loginRes = await api.post(
        "/api/auth/login",
        { username, password },
        false
      );

      if (!loginRes.ok) {
        // Nếu tự động đăng nhập thất bại thì chuyển hướng sang trang đăng nhập để họ tự nhập
        window.location.href = "/login?registered=true";
        return;
      }

      const loginData = await loginRes.json();

      if (loginData.token) {
        saveToken(loginData.token);
      }

      saveUser({
        userId: loginData.userId,
        username: loginData.username,
        role: loginData.role,
        avatarUrl: loginData.avatarUrl || null,
      });

      // Về trang chủ
      window.location.href = "/";
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsGoogleLoading(true);
    setError("");
    try {
      const res = await api.post(
        "/api/auth/google",
        { token: credentialResponse.credential },
        false
      );

      if (!res.ok) {
        throw new Error(t("login.errorGoogle"));
      }

      const data = await res.json();

      if (data.token) {
        saveToken(data.token);
      }

      saveUser({
        userId: data.userId,
        username: data.username,
        role: data.role,
        avatarUrl: data.avatarUrl || null,
      });
      window.location.href = "/";
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--page-bg)] px-4 py-12 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-[var(--surface-bg)] p-10 shadow-xl border border-[var(--border-color)]">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            {t("register.title")}
          </h2>
          <p className="mt-2 text-center text-sm text-[var(--text-secondary)]">
            {t("register.subtitle")}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-950/30 p-4">
              <div className="text-sm text-red-700 dark:text-red-400 text-center font-medium">{error}</div>
            </div>
          )}

          <div className="space-y-4">
            {/* Tên tài khoản */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium leading-6 text-[var(--text-primary)]">
                {t("register.username")}
              </label>
              <div className="mt-2">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="block w-full rounded-md border border-[var(--border-color)] bg-[var(--surface-bg-muted)] py-2.5 px-3 text-[var(--text-primary)] shadow-sm placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-all"
                  placeholder={t("register.usernamePlaceholder")}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium leading-6 text-[var(--text-primary)]">
                {t("register.email")}
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="block w-full rounded-md border border-[var(--border-color)] bg-[var(--surface-bg-muted)] py-2.5 px-3 text-[var(--text-primary)] shadow-sm placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-all"
                  placeholder={t("register.emailPlaceholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Mật khẩu */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium leading-6 text-[var(--text-primary)]">
                {t("register.password")}
              </label>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="block w-full rounded-md border border-[var(--border-color)] bg-[var(--surface-bg-muted)] py-2.5 px-3 text-[var(--text-primary)] shadow-sm placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Xác nhận mật khẩu */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium leading-6 text-[var(--text-primary)]">
                {t("register.confirmPassword")}
              </label>
              <div className="mt-2">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="block w-full rounded-md border border-[var(--border-color)] bg-[var(--surface-bg-muted)] py-2.5 px-3 text-[var(--text-primary)] shadow-sm placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-all"
                  placeholder={t("register.confirmPasswordPlaceholder")}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? t("register.loading") : t("register.submit")}
            </button>
          </div>
        </form>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--border-color)]" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-[var(--surface-bg)] px-4 text-[var(--text-secondary)]">{t("login.or")}</span>
          </div>
        </div>

        {/* Nút Google */}
        <div className={`flex justify-center transition-opacity ${isGoogleLoading ? 'opacity-50 pointer-events-none' : ''}`}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError(t("login.errorGoogleRetry"))}
            width="400"
            text="signup_with"
            shape="rectangular"
            logo_alignment="left"
          />
        </div>

        {isGoogleLoading && (
          <p className="text-center text-sm text-[var(--text-secondary)]">{t("login.processing")}</p>
        )}

        <div className="text-center text-sm">
          <span className="text-[var(--text-secondary)]">{t("register.alreadyHaveAccount")} </span>
          <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
            {t("register.loginNow")}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
