// ============================================================
// apiClient.js — Fetch wrapper tự động gắn Authorization header
// ============================================================

import { getToken, logout } from "./authUtils";

const BASE_URL = "http://localhost:8080"; // Thay bằng URL backend của bạn

/**
 * Wrapper quanh fetch, tự động:
 *  - Gắn Authorization: Bearer <token>
 *  - Set Content-Type: application/json
 *  - Tự logout nếu token hết hạn (401)
 *
 * @param {string} endpoint  - VD: "/api/lessons" hoặc "/api/auth/login"
 * @param {RequestInit} options - Giống options của fetch bình thường
 * @param {boolean} requiresAuth - false nếu là endpoint công khai (login, register)
 */
const apiClient = async (endpoint, options = {}, requiresAuth = true) => {
    const url = `${BASE_URL}${endpoint}`;

    const headers = {
        "Content-Type": "application/json",
        ...options.headers,
    };

    if (requiresAuth) {
        const token = getToken();
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }
    }

    const config = {
        ...options,
        headers,
    };

    const response = await fetch(url, config);

    // Token hết hạn hoặc không hợp lệ → tự đăng xuất
    if (response.status === 401 && requiresAuth) {
        logout();
        return;
    }

    return response;
};

// ---- Các helper method tiện dụng ----

export const api = {
    /**
     * GET /api/lessons
     * const res = await api.get("/api/lessons");
     */
    get: (endpoint) =>
        apiClient(endpoint, { method: "GET" }),

    /**
     * POST /api/auth/login  (không cần token)
     * const res = await api.post("/api/auth/login", { username, password }, false);
     */
    post: (endpoint, body, requiresAuth = true) =>
        apiClient(
            endpoint,
            { method: "POST", body: JSON.stringify(body) },
            requiresAuth
        ),

    /**
     * PUT /api/lessons/1
     * const res = await api.put("/api/lessons/1", updatedLesson);
     */
    put: (endpoint, body) =>
        apiClient(
            endpoint,
            { method: "PUT", body: JSON.stringify(body) }
        ),

    /**
     * DELETE /api/lessons/1
     * const res = await api.delete("/api/lessons/1");
     */
    delete: (endpoint) =>
        apiClient(endpoint, { method: "DELETE" }),
};

export default apiClient;