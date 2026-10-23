# English Training App

## Chạy local và dùng PostgreSQL Render chung

### Yêu cầu

- Git
- Java 17 hoặc mới hơn và Maven 3.9+
- Python 3.11+
- Node.js 20+

### 1. Clone source

```powershell
git clone https://github.com/A-Phien/english_training_app.git
cd english_training_app
```

### 2. Chạy AI Engine

Mở PowerShell thứ nhất:

```powershell
cd ai-engine
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn main:app --reload --port 8000
```

Điền `GROQ_API_KEY` vào `ai-engine/.env` nếu cần chức năng tạo transcript, dịch và IPA. Chức năng ghi âm vẫn cần AI Engine đang chạy.

### 3. Chạy backend và kết nối Render

Mở PowerShell thứ hai. Người quản lý database gửi riêng ba giá trị Render cho từng thành viên; không thêm mật khẩu vào `application.properties` và không commit file chứa secret.

```powershell
cd backend-core\backend-core
$env:SPRING_DATASOURCE_URL = "jdbc:postgresql://<render-host>:5432/<database>?sslmode=require"
$env:SPRING_DATASOURCE_USERNAME = "<render-username>"
$env:SPRING_DATASOURCE_PASSWORD = "<render-password>"

# Chỉ cần khi thử upload avatar qua Cloudinary
$env:CLOUDINARY_CLOUD_NAME = "<cloud-name>"
$env:CLOUDINARY_API_KEY = "<api-key>"
$env:CLOUDINARY_API_SECRET = "<api-secret>"

mvn spring-boot:run
```

Backend chạy ở `http://localhost:8080`.

### 4. Chạy frontend

Mở PowerShell thứ ba:

```powershell
cd frontend-client
npm install
npm run dev
```

Mở địa chỉ Vite hiển thị trong terminal, thường là `http://localhost:5173`.

## Dùng PostgreSQL local thay vì Render

Tạo database `english_app` trong PostgreSQL local. Không đặt ba biến `SPRING_DATASOURCE_*`; backend sẽ dùng mặc định sau:

```text
URL: jdbc:postgresql://localhost:5432/english_app
Username: postgres
Password: 12345
```

## Lưu ý về dữ liệu và secret

- Khi các máy cùng dùng Render, mọi người cùng thấy và có thể thay đổi dữ liệu chung.
- Dùng user PostgreSQL riêng cho từng thành viên nếu cần kiểm soát quyền truy cập.
- Không commit mật khẩu Render, Cloudinary API Secret, Groq API key hoặc file `.env`.


