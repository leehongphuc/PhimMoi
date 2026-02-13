# 🚀 Hướng Dẫn Deploy MotPhim

Hướng dẫn chi tiết để deploy ứng dụng MotPhim lên **Railway** (Backend) và **Vercel** (Frontend).

## 📋 Tổng Quan Kiến Trúc

```
User → Vercel (Frontend React) → Railway (Backend Express) → OPhim API
```

- **Frontend**: React + Vite + TailwindCSS
- **Backend**: Express.js proxy server
- **Hosting**: Vercel (Frontend) + Railway (Backend)

---

## 🔧 Bước 1: Deploy Backend lên Railway

### 1.1. Tạo Tài Khoản Railway

1. Truy cập [railway.app](https://railway.app)
2. Đăng nhập bằng GitHub

### 1.2. Tạo Project Mới

1. Click **"New Project"**
2. Chọn **"Deploy from GitHub repo"**
3. Kết nối với repository `leehongphuc/PhimMoi`
4. Chọn thư mục **`server`** để deploy

### 1.3. Cấu Hình Railway

Railway sẽ tự động phát hiện cấu hình từ `railway.json` và `package.json`.

**Kiểm tra:**
- Build Command: `npm install`
- Start Command: `npm start`
- Port: Railway tự động gán (biến `PORT`)

### 1.4. Lấy Backend URL

Sau khi deploy thành công:
1. Vào tab **"Settings"** của Railway project
2. Tìm **"Domains"**
3. Click **"Generate Domain"**
4. Sao chép URL (ví dụ: `https://motphim-server-production.up.railway.app`)

**✅ Backend đã hoạt động! Test bằng cách truy cập:**
```
https://your-backend.railway.app/api/movies
```

---

## 🎨 Bước 2: Deploy Frontend lên Vercel

### 2.1. Tạo Tài Khoản Vercel

1. Truy cập [vercel.com](https://vercel.com)
2. Đăng nhập bằng GitHub

### 2.2. Import Project

1. Click **"Add New..."** → **"Project"**
2. Import repository `leehongphuc/PhimMoi`
3. Chọn **Root Directory** là `client`

### 2.3. Cấu Hình Build Settings

Vercel sẽ tự động phát hiện Vite project từ `vercel.json`.

**Kiểm tra:**
- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

### 2.4. Thiết Lập Environment Variables

Trong phần **"Environment Variables"**, thêm:

| Key | Value | Example |
|-----|-------|---------|
| `VITE_API_BASE_URL` | URL Railway backend của bạn | `https://motphim-server-production.up.railway.app/api` |

> ⚠️ **Quan trọng**: Nhớ thêm `/api` vào cuối URL Railway!

### 2.5. Deploy

1. Click **"Deploy"**
2. Đợi vài phút để Vercel build và deploy
3. Lấy URL frontend (ví dụ: `https://motphim.vercel.app`)

**✅ Frontend đã live! Truy cập URL để xem kết quả.**

---

## 🔐 Environment Variables Reference

### Backend (Railway)
Không cần thiết lập biến môi trường. Railway tự động cung cấp `PORT`.

### Frontend (Vercel)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VITE_API_BASE_URL` | ✅ Yes | URL của Railway backend | `https://your-backend.railway.app/api` |

---

## 🧪 Kiểm Tra Sau Deploy

### ✅ Checklist

- [ ] Truy cập frontend URL và trang chủ hiển thị đúng
- [ ] Danh sách phim tải thành công
- [ ] Tìm kiếm phim hoạt động
- [ ] Lọc theo thể loại/quốc gia/năm hoạt động
- [ ] Trang chi tiết phim hiển thị đúng
- [ ] Video player phát được phim
- [ ] Top phim xem nhiều hiển thị

### 🔍 Debug

**Nếu frontend không tải được phim:**

1. Mở DevTools (F12) → Console
2. Kiểm tra lỗi network
3. Xác nhận `VITE_API_BASE_URL` đúng trong Vercel settings
4. Redeploy frontend nếu đã sửa environment variables

**Nếu backend bị lỗi:**

1. Vào Railway → Project → **"Deployments"**
2. Click vào deployment mới nhất
3. Xem **"Logs"** để debug

---

## 🔄 Cập Nhật Code

Sau khi push code mới lên GitHub:

- **Railway**: Tự động deploy lại backend
- **Vercel**: Tự động deploy lại frontend

Không cần làm gì thêm! 🎉

---

## 📚 Tài Liệu Tham Khảo

- [Railway Docs](https://docs.railway.app)
- [Vercel Docs](https://vercel.com/docs)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

---

## 💡 Tips

1. **Custom Domain**: Bạn có thể add custom domain trong Vercel và Railway settings
2. **CORS**: Backend đã config CORS cho phép mọi origin
3. **Caching**: Railway backend cache kết quả filter trong 5 phút
4. **Rate Limiting**: Nếu OPhim API bị rate limit, đợi vài phút rồi thử lại

---

**Chúc bạn deploy thành công! 🚀**
