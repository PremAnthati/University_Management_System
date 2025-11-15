const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3003'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Security middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3003'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Login rate limiting
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login attempts per windowMs
  message: 'Too many login attempts, please try again later.'
});
app.use('/api/auth/student/login', loginLimiter);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/university_system')
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

// Routes
app.use('/api/students', require('./routes/students'));
app.use('/api/resources', require('./routes/resources'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/departments', require('./routes/departments'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/faculty', require('./routes/faculty'));
app.use('/api/faculty-operations', require('./routes/facultyOperations'));
app.use('/api/course-materials', require('./routes/courseMaterials'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/grades', require('./routes/grades'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/fees', require('./routes/fees'));
app.use('/api/results', require('./routes/results'));
app.use('/api/timetables', require('./routes/timetables'));
app.use('/api/attendances', require('./routes/attendances'));

// Static file serving for uploads
app.use('/uploads', express.static('uploads'));

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join student room for announcements
  socket.on('join-student-room', (studentId) => {
    socket.join(`student-${studentId}`);
    console.log(`Student ${studentId} joined their room`);
  });

  // Join admin room
  socket.on('join-admin-room', () => {
    socket.join('admin-room');
    console.log('Admin joined admin room');
  });

  // Handle announcement from admin
  socket.on('send-announcement', (announcementData) => {
    console.log('New announcement:', announcementData);

    // Broadcast to all students
    io.to('student-room').emit('new-announcement', announcementData);

    // Also emit to admin room for confirmation
    io.to('admin-room').emit('announcement-sent', announcementData);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io available to routes
app.set('io', io);

app.get('/', (req, res) => {
  res.send('Server is running and ready to handle API requests!');
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Simple check for demonstration
  if (email === 'admin@example.com' && password === 'password123') {
    res.json({ message: 'Login successful!' });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

const PORT = process.env.PORT || 5050;
server.listen(PORT, () => console.log(`Server running on port ${PORT} with Socket.IO support`));