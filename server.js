// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const app = express();

// Allow frontend requests
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:8080' }));
app.use(express.json());

// ✅ Connect to MongoDB
if (!process.env.MONGO_URI) {
  console.error('❌ MONGO_URI is not defined in .env');
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// ✅ Attendance Schema (only Mathematics)
const attendanceSchema = new mongoose.Schema({
  studentName: { type: String, required: true },
  studentId: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  subject: { type: String, default: 'Mathematics' }, // hardcoded
  status: { type: String, default: 'present' },
});

const Attendance = mongoose.model('Attendance', attendanceSchema);

// 🔹 Test route
app.get('/', (req, res) => {
  res.send('Server is running 🚀');
});

// 🔹 Get today's schedule (hardcoded)
app.get('/api/schedule', (req, res) => {
  const schedule = [
    { time: '09:00 AM', subject: 'Mathematics', room: 'Room 101' },
    { time: '10:30 AM', subject: 'Physics', room: 'Lab 201' },
    { time: '12:00 PM', subject: 'Free Period', room: '-' },
    { time: '01:00 PM', subject: 'Computer Science', room: 'Room 305' },
    { time: '02:30 PM', subject: 'English', room: 'Room 102' },
  ];
  res.json(schedule);
});

// 🔹 Mark attendance for Mathematics (check only by studentName)
app.post('/api/attendance', async (req, res) => {
  try {
    const { studentId, studentName } = req.body;

    if (!studentName) {
      return res.status(400).json({ success: false, message: 'studentName is required' });
    }

    const today = new Date().toISOString().split('T')[0];

    // ✅ Check if this studentName already marked attendance today
    const existingRecord = await Attendance.findOne({ studentName, date: today, subject: 'Mathematics' });

    if (existingRecord) {
      return res.status(409).json({
        success: false,
        message: `Attendance already marked for ${studentName} today`,
        record: existingRecord,
      });
    }

    const record = new Attendance({
      studentId: studentId || '', // optional
      studentName,
      date: today,
      time: new Date().toLocaleTimeString(),
    });

    await record.save();
    res.json({ success: true, message: 'Attendance saved!', record });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 🔹 Get all attendance for Mathematics
app.get('/api/attendance', async (req, res) => {
  try {
    const records = await Attendance.find({ subject: 'Mathematics' }).sort({ _id: -1 });
    res.json(records);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 🔹 Start server
const PORT = process.env.PORT || 9000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
