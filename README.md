# University Management System - Student Module

A comprehensive university management system with a complete student-facing module.

## 🚀 Features

### Student Module
- **Student Registration**: Multi-step registration with document upload
- **Student Login**: Secure authentication with JWT tokens
- **Student Dashboard**: Overview of academic information
- **Profile Management**: Editable student profile
- **Results View**: Academic results and GPA calculation
- **Fee Payment**: Online fee payment with Razorpay integration
- **Timetable**: Weekly class schedule
- **Attendance Tracking**: Detailed attendance records
- **Notifications**: Real-time notifications
- **Course Information**: Enrolled courses and details

## 🔐 Demo Credentials

### Student Login
- **Email**: `demo@student.com`
- **Password**: `demo123`
- **Registration ID**: `DEMO2024001`
- **Status**: Approved (ready to login)

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose
- **JWT** for authentication
- **bcrypt** for password hashing
- **multer** for file uploads
- **nodemailer** for email services

### Frontend
- **React.js** with TypeScript
- **CSS3** for styling
- **Axios** for API calls
- **React Router** for navigation

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd university_management_system
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   # Create .env file with required environment variables
   npm start
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm start
   ```

4. **Create Demo Student** (Optional)
   ```bash
   cd backend
   node scripts/createDemoStudent.js
   ```

### Environment Variables

Create a `.env` file in the backend directory:

```env
MONGO_URI=mongodb://localhost:27017/university_system
JWT_SECRET=your_jwt_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
PORT=5050
```

## 📱 Usage

### Student Portal Access
1. Open browser and go to `http://localhost:3000/student/login`
2. Use demo credentials or register a new account
3. Access all student features through the dashboard

### API Endpoints

#### Authentication
- `POST /api/auth/student/login` - Student login
- `POST /api/students/register` - Student registration

#### Student APIs
- `GET /api/students/profile/:id` - Get student profile
- `GET /api/students/:id/results` - Get student results
- `GET /api/students/:id/fees` - Get fee information
- `GET /api/students/:id/timetable` - Get timetable
- `GET /api/students/:id/attendance` - Get attendance records

## 🧪 Testing

Run tests for the frontend:
```bash
cd frontend
npm test
```

## 📁 Project Structure

```
university_management_system/
├── backend/
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── middleware/      # Authentication & validation
│   ├── services/        # Email, payment services
│   └── scripts/         # Utility scripts
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   └── services/    # API services
│   └── public/          # Static assets
└── README.md
```

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation and sanitization
- File upload security
- Rate limiting
- CORS protection

## 📧 Email Features

- Registration confirmation emails
- Payment receipt emails
- Result notification emails

## 💳 Payment Integration

- Razorpay integration for fee payments
- Secure payment processing
- Automatic receipt generation

## 📊 Reporting

- PDF generation for grade sheets
- Fee receipt PDFs
- Attendance reports

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support, please contact the development team or create an issue in the repository.# udms
