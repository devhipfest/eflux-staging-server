# Nền Tảng Trạm Sạc Xe Điện

Nền tảng quản lý trạm sạc xe điện sử dụng Node.js, Express.js, và MongoDB cho thị trường Việt Nam.

## Tính Năng Chính

- **Quản lý người dùng:**

  - Khách hàng tự đăng ký tài khoản
  - Admin tạo tài khoản cho chủ trạm
  - Phân quyền: Admin, Chủ trạm (chỉ xem), Khách hàng

- **Quản lý trạm sạc:**

  - Admin tạo và quản lý tất cả trạm sạc
  - Chủ trạm chỉ xem trạm của mình
  - Khách hàng xem trạm đang hoạt động

- **Quản lý máy sạc:**

  - Admin tạo và quản lý tất cả máy sạc
  - Chủ trạm xem máy tại trạm của mình

- **Hệ thống thanh toán tích hợp**
- **API RESTful** cho mobile app và web
- **Xác thực JWT** và phân quyền
- **Bảo mật** và rate limiting

## Cài Đặt

### Yêu Cầu Hệ Thống

- Node.js >= 14.0.0
- MongoDB >= 4.0
- npm hoặc yarn

### Cài Đặt Dependencies

```bash
npm install
```

### Cấu Hình Môi Trường

1. Sao chép file `.env.example` thành `.env`:

```bash
cp .env.example .env
```

2. Cập nhật các biến môi trường trong `.env`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/charging_platform
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Khởi Động MongoDB

Đảm bảo MongoDB đang chạy trên máy local hoặc cập nhật `MONGO_URI` để kết nối tới MongoDB Atlas.

### Chạy Ứng Dụng

```bash
# Development mode
npm run dev

# Production mode
npm start
```

Server sẽ chạy trên `http://localhost:5000`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Khách hàng tự đăng ký
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/profile` - Lấy thông tin profile
- `PUT /api/auth/profile` - Cập nhật profile cá nhân

### Admin User Management

- `POST /api/users` - Admin tạo tài khoản chủ trạm
- `GET /api/users` - Admin xem tất cả người dùng
- `PUT /api/users/:id` - Admin cập nhật người dùng
- `DELETE /api/users/:id` - Admin xóa người dùng

### Stations

- `GET /api/stations` - Xem trạm sạc (lọc theo quyền)
- `GET /api/stations/:id` - Xem chi tiết trạm
- `POST /api/stations` - Admin tạo trạm mới
- `PUT /api/stations/:id` - Admin cập nhật trạm
- `DELETE /api/stations/:id` - Admin xóa trạm

### Machines

- `GET /api/machines/station/:stationId` - Xem máy sạc theo trạm
- `GET /api/machines/:id` - Xem chi tiết máy
- `POST /api/machines` - Admin tạo máy mới
- `PUT /api/machines/:id` - Admin cập nhật máy
- `DELETE /api/machines/:id` - Admin xóa máy

### Payments

- `GET /api/payments` - Xem lịch sử thanh toán cá nhân
- `GET /api/payments/:id` - Xem chi tiết thanh toán
- `POST /api/payments` - Tạo thanh toán mới
- `PUT /api/payments/:id/status` - Admin cập nhật trạng thái thanh toán

## Công Nghệ Sử Dụng

- **Backend**: Node.js + Express.js
- **Database**: MongoDB với Mongoose ODM
- **Authentication**: JWT
- **Validation**: Direct body validation
- **File Upload**: Multer + Cloudinary
- **Email**: Nodemailer
- **Security**: Helmet, CORS, Rate Limiting
- **Testing**: Jest, Supertest
- **Deployment**: Docker, PM2, AWS/Azure

## Cấu Trúc Dự Án

```
charging_platform/
├── controllers/      # Route controllers
│   ├── authController.js
│   ├── userController.js
│   ├── stationController.js
│   ├── machineController.js
│   └── paymentController.js
├── models/           # Mongoose models
│   ├── User.js
│   ├── Station.js
│   ├── ChargingMachine.js
│   └── Payment.js
├── routes/           # API routes
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── stationRoutes.js
│   ├── machineRoutes.js
│   └── paymentRoutes.js
├── services/         # Business logic services
│   ├── emailService.js
│   └── uploadService.js
├── middleware/       # Custom middleware
│   └── auth.js
├── config/           # Configuration files
├── .env              # Environment variables
├── server.js         # Main server file
├── package.json
└── README.md
```

## Scripts

- `npm start` - Chạy server production
- `npm run dev` - Chạy server development với nodemon
- `npm test` - Chạy tests

## Bảo Mật

- JWT tokens cho authentication
- Bcrypt để hash mật khẩu
- Helmet cho security headers
- Rate limiting để chống spam
- CORS configuration

## Phát Triển Tiếp Theo

- [ ] Tích hợp cổng thanh toán VNPay/Momo
- [ ] Hệ thống đặt chỗ
- [ ] Real-time monitoring với WebSocket
- [ ] Push notifications
- [ ] Analytics dashboard
- [ ] Mobile app API
- [ ] IoT integration cho máy sạc

## Đóng Góp

1. Fork dự án
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## License

ISC
