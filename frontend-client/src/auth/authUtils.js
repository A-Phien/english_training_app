
const TOKEN_KEY = "token";
const USER_KEY = "user";

// ------ Lưu & lấy token ------
export const saveToken = (token) => {
    localStorage.setItem(TOKEN_KEY, token);
};

export const getToken = () => {
    return localStorage.getItem(TOKEN_KEY);
};

export const removeToken = () => {
    localStorage.removeItem(TOKEN_KEY);
};


// ------ Lưu & lấy user info ------
export const saveUser = (user) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getUser = () => {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
};

export const removeUser = () => {
    localStorage.removeItem(USER_KEY);
};

// ------ Decode JWT để lấy payload (userId, role, exp...) ------
export const decodeToken = (token) => {
    try {
        const base64Payload = token.split(".")[1];
        const payload = atob(base64Payload);
        return JSON.parse(payload);
    } catch {
        return null;
    }
};

// ------ Lấy userId từ JWT ------
export const getUserIdFromToken = () => {
    const token = getToken();
    if (!token) return null;
    const decoded = decodeToken(token);
    // Tuỳ backend: có thể là decoded.sub, decoded.userId, decoded.id
    return decoded?.userId ?? decoded?.sub ?? null;
};

// ------ Kiểm tra token còn hạn không ------
export const isTokenValid = () => {
    const token = getToken();
    if (!token) return false;
    const decoded = decodeToken(token);
    if (!decoded?.exp) return false;
    // exp là Unix timestamp (giây), Date.now() trả về milliseconds
    return decoded.exp * 1000 > Date.now();
};

// ------ Đăng xuất ------
export const logout = () => {
    removeToken();
    removeUser();
    window.location.href = "/login";
};