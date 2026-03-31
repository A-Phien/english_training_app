import React, { useState } from 'react';
import { saveToken, saveUser } from "./authUtils";
import { api } from "./apiClient";

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // const handleLogin = async (e) => {
  //   e.preventDefault();
  //   setError('');
  //   setIsLoading(true);

  //   try {
  //     const res = await fetch("http://localhost:8080/api/auth/login", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         username,
  //         password
  //       })
  //     });

  //     if (!res.ok) {
  //       throw new Error('Tài khoản hoặc mật khẩu không chính xác');
  //     }

  //     const data = await res.json();
  //     localStorage.setItem("user", JSON.stringify(data));

  //     // Có thể thêm code chuyển hướng (redirect) sau khi login thành công ở đây
  //     // ví dụ: window.location.href = '/dashboard';
  //     window.location.href = "/";

  //   } catch (err) {
  //     setError(err.message);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };


  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // requiresAuth = false vì đây là endpoint công khai
      const res = await api.post(
        "/api/auth/login",
        { username, password },
        false
      );

      if (!res.ok) {
        throw new Error("Tài khoản hoặc mật khẩu không chính xác");
      }

      const data = await res.json();

      // ✅ Lưu token riêng (dùng cho Authorization header)
      // Backend trả về: { token: "...", user: { id, username, ... } }
      // Điều chỉnh key tuỳ theo response thực tế của backend bạn
      if (data.token) {
        saveToken(data.token);
      }

      // ✅ Lưu thông tin user (tuỳ chọn, để hiển thị tên, avatar, v.v.)
      if (data.user) {
        saveUser(data.user);
      } else {
        // Nếu backend trả thẳng object user (không có wrapper)
        saveUser(data);
      }

      // ✅ Redirect sang trang danh sách bài học
      window.location.href = "/lessons";
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-10 shadow-xl border border-gray-100">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Đăng nhập hệ thống
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Vui lòng nhập tài khoản và mật khẩu của bạn
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
                Tài khoản
              </label>
              <div className="mt-2">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-all"
                  placeholder="Nhập tên tài khoản"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                  Mật khẩu
                </label>
                <div className="text-sm">
                  <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500">
                    Quên mật khẩu?
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
              {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;