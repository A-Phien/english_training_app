# ==============================
# CHẠY BẰNG DOCKER 
# ==============================

1:  git clone https://github.com/A-Phien/english_training_app.git

2: docker compose up --build

# ==============================
# CHẠY LOCAL (để dev)
# ==============================
# Thư mục AI Engine

1: python -m venv .venv


2: Kích hoạt


Trên Window


.venv\Scripts\activate


Trên Linux/Mac


source .venv/bin/activate

3:
pip install -r requirements.txt

4:
uvicorn main:app --reload --port 8000

# Thư mục Backend:

1: Đảm bảo đã cài Java 17 và Maven.

2: Tạo DB PostgreSQL tên "english_app"


3: Cấu hình lại src/main/resources/application.properties để trỏ đúng vào DB local 

4: Run Spring Boot
.\mvnw spring-boot:run


# Thư mục Frontend-Client

Đảm bảo đã cài Node.js 18+.

1: npm install


2: npm run dev


