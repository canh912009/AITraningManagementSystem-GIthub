# 🚀 AI Training Management System - Setup Guide

## 📋 Checklist Setup

### 1. Yêu cầu hệ thống
- [ ] Node.js 20+ đã cài đặt
- [ ] PNPM đã cài đặt (`npm install -g pnpm`)
- [ ] Docker và Docker Compose đã cài đặt
- [ ] Git đã cài đặt

### 2. Tạo project
```bash
# Tạo thư mục project
mkdir ai-training-management-system
cd ai-training-management-system

# Khởi tạo git (tùy chọn)
git init
```

### 3. Tạo các file cấu hình
Copy tất cả các file từ artifacts vào đúng vị trí:

**Root files:**
- [ ] `package.json`
- [ ] `docker-compose.yml`
- [ ] `Dockerfile`
- [ ] `next.config.js`
- [ ] `tailwind.config.js`
- [ ] `postcss.config.js`
- [ ] `tsconfig.json`
- [ ] `.eslintrc.json`
- [ ] `.gitignore`
- [ ] `.env` (từ .env.example)
- [ ] `init.sql`

**Source files:**
- [ ] `src/app/layout.tsx`
- [ ] `src/app/page.tsx`
- [ ] `src/app/globals.css`
- [ ] `src/app/admin/layout.tsx`
- [ ] `src/app/admin/page.tsx`
- [ ] `src/app/admin/dashboard/page.tsx`
- [ ] `src/app/admin/users/page.tsx`
- [ ] `src/app/admin/training/page.tsx`

**API Routes:**
- [ ] `src/app/api/auth/register/route.ts`
- [ ] `src/app/api/auth/login/route.ts`
- [ ] `src/app/api/user/profile/route.ts`
- [ ] `src/app/api/training/upload/route.ts`
- [ ] `src/app/api/training/my-files/route.ts`
- [ ] `src/app/api/training/[id]/route.ts`
- [ ] `src/app/api/admin/dashboard/route.ts`
- [ ] `src/app/api/admin/users/route.ts`
- [ ] `src/app/api/admin/training-files/route.ts`

**Components:**
- [ ] `src/components/ui/button.tsx`
- [ ] `src/components/ui/card.tsx`
- [ ] `src/components/ui/input.tsx`
- [ ] `src/components/ui/label.tsx`
- [ ] `src/components/ui/select.tsx`
- [ ] `src/components/ui/table.tsx`
- [ ] `src/components/ui/badge.tsx`
- [ ] `src/components/ui/dialog.tsx`
- [ ] `src/components/admin/header.tsx`
- [ ] `src/components/admin/sidebar.tsx`

**Lib files:**
- [ ] `src/lib/db.ts`
- [ ] `src/lib/auth.ts`
- [ ] `src/lib/utils.ts`
- [ ] `src/types/index.ts`

**Prisma:**
- [ ] `prisma/schema.prisma`

### 4. Tạo thư mục
```bash
mkdir -p uploads
mkdir -p prisma
```

### 5. Cài đặt dependencies
```bash
pnpm install
```

### 6. Khởi động database
```bash
# Khởi động MariaDB
docker compose up -d mariadb

# Đợi database khởi động (khoảng 30s)
sleep 30

# Kiểm tra database
docker compose ps
```

### 7. Setup Prisma
```bash
# Generate Prisma client
pnpm db:generate

# Push schema to database
pnpm db:push
```

### 8. Kiểm tra database
Truy cập PhpMyAdmin: http://localhost:8080
- Server: mariadb
- Username: ai_user
- Password: ai_password

### 9. Chạy development server
```bash
pnpm dev
```

### 10. Kiểm tra ứng dụng
- [ ] Homepage: http://localhost:3000
- [ ] Admin Panel: http://localhost:3000/admin
- [ ] API Test: http://localhost:3000/api/auth/register

## 🔧 Chạy với Docker (Production)

```bash
# Build và chạy toàn bộ stack
docker compose up --build

# Chạy ở background
docker compose up -d --build
```

## 📱 Test API

### Đăng ký user
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "0123456789",
    "password": "123456",
    "age": 25,
    "gender": "MALE",
    "region": "BAC"
  }'
```

### Đăng nhập
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "0123456789",
    "password": "123456"
  }'
```

### Upload file (cần token từ login)
```bash
curl -X POST http://localhost:3000/api/training/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test.mp3" \
  -F "contentVietnamese=Xin chào" \
  -F "contentKorean=안녕하세요"
```

## 🐛 Troubleshooting

### Database connection failed
```bash
# Kiểm tra container
docker compose ps

# Xem logs
docker compose logs mariadb

# Restart database
docker compose restart mariadb
```

### Port đã được sử dụng
```bash
# Kiểm tra port
lsof -i :3000
lsof -i :3306

# Đổi port trong docker-compose.yml
```

### Prisma client error
```bash
# Regenerate client
pnpm db:generate

# Reset database
docker compose down -v
docker compose up -d mariadb
pnpm db:push
```

### Upload folder permission
```bash
# Fix permissions
sudo chown -R $USER:$USER uploads/
chmod -R 755 uploads/
```

## 🔑 Default Admin Account
- Phone: 0123456789
- Password: admin123

## 📊 Database Schema

```sql
-- Users table
users (
  id, phone, password, is_admin, age, gender, region, created_at, updated_at
)

-- Training files table
audio_training_files (
  id, user_id, file_path, content_vietnamese, content_korean, 
  training_status, created_at, updated_at
)
```

## 🎯 Next Steps

1. [ ] Tạo thêm form components cho mobile app
2. [ ] Implement authentication middleware
3. [ ] Add file validation và security
4. [ ] Thêm tính năng export data
5. [ ] Implement real-time notifications
6. [ ] Add unit tests
7. [ ] Setup CI/CD pipeline
8. [ ] Add monitoring và logging

## 📞 Support

Nếu gặp vấn đề, hãy kiểm tra:
1. Logs của Docker containers
2. Network connectivity
3. File permissions
4. Environment variables
5. Database connection

Happy coding! 🚀