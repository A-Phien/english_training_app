import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { saveToken, saveUser } from "./authUtils";
import { api } from "./apiClient";
import { useTranslation } from "react-i18next";

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { t } = useTranslation();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await api.post(
        "/api/auth/login",
        { username, password },
        false
      );

      if (!res.ok) {
        throw new Error(t("login.errorCredentials"));
      }

      const data = await res.json();

      if (data.token) {
        saveToken(data.token);
      }

      // Lưu thông tin user riêng (không lưu token vào user object)
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
      setIsLoading(false);
    }
  };

  // credentialResponse.credential chính là idToken — gửi thẳng lên backend verify
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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-10 shadow-xl border border-gray-100">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            {t("login.title")}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t("login.subtitle")}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700 text-center font-medium">{error}</div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium leading-6 text-gray-900">
                {t("login.username")}
              </label>
              <div className="mt-2">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-all"
                  placeholder={t("login.usernamePlaceholder")}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                  {t("login.password")}
                </label>
                <div className="text-sm">
                  <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500">
                    {t("login.forgotPassword")}
                  </a>
                </div>
              </div>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
              {isLoading ? t("login.loading") : t("login.submit")}
            </button>
          </div>
        </form>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-4 text-gray-400">{t("login.or")}</span>
          </div>
        </div>

        {/* Nút Google — render bởi @react-oauth/google, tự có icon + style chuẩn Google */}
        <div className={`flex justify-center transition-opacity ${isGoogleLoading ? 'opacity-50 pointer-events-none' : ''}`}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError(t("login.errorGoogleRetry"))}
            width="400"
            text="signin_with"
            shape="rectangular"
            logo_alignment="left"
          />
        </div>

        {isGoogleLoading && (
          <p className="text-center text-sm text-gray-500">{t("login.processing")}</p>
        )}
      </div>
    </div>
  );
};

export default Login;