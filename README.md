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

## 🚀 Deployment

### Render Deployment

1. **Backend Deployment**
   - Create a new Web Service on Render
   - Connect your GitHub repository
   - Set build command: `npm install`
   - Set start command: `npm start`
   - Add environment variables in Render dashboard:
     - `MONGO_URI`: Your MongoDB connection string (use MongoDB Atlas for production)
     - `JWT_SECRET`: A secure random string
     - `EMAIL_USER`: Your email for notifications
     - `EMAIL_PASS`: Your email password or app password
     - `FRONTEND_URL`: Your frontend URL on Render (e.g., https://your-frontend.onrender.com)

2. **Frontend Deployment**
   - Create a new Static Site on Render
   - Connect your GitHub repository (select frontend folder if needed)
   - Set build command: `npm run build`
   - Set publish directory: `build`
   - Add environment variable if needed: `REACT_APP_API_URL`: Your backend URL on Render (e.g., https://your-backend.onrender.com)

3. **Database**
   - Use MongoDB Atlas for production database
   - Update MONGO_URI with the Atlas connection string

### Environment Variables for Production

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/university_system
JWT_SECRET=your_super_secret_jwt_key_here_123456789
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
FRONTEND_URL=https://your-frontend.onrender.com
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
# udms
# University_Management_System
# University_Management_System
