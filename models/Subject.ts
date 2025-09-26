// models/Subject.ts
import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, // only one subject for now
  },
});

export const Subject = mongoose.model('Subject', subjectSchema);
