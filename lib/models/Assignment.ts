import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IQuestionDetail {
  type: string;
  count: number;
  marks: number;
}

export interface IQuestion {
  section: string;
  type: string;
  questionText: string;
  options?: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  marks: number;
  answer: string;
}

export interface IAssignment extends Document {
  title: string;
  group: string;
  assignedDate: string;
  dueDate: string;
  questionsCount: number;
  totalMarks: number;
  status: 'In Progress' | 'Graded';
  userId: mongoose.Types.ObjectId;
  questionsDetails: IQuestionDetail[];
  questions: IQuestion[];
  createdAt: Date;
}

const QuestionDetailSchema = new Schema<IQuestionDetail>({
  type: { type: String, required: true },
  count: { type: Number, required: true },
  marks: { type: Number, required: true },
});

const QuestionSchema = new Schema<IQuestion>({
  section: { type: String, required: true },
  type: { type: String, required: true },
  questionText: { type: String, required: true },
  options: [{ type: String }],
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  marks: { type: Number, required: true },
  answer: { type: String, required: true },
});

const AssignmentSchema = new Schema<IAssignment>({
  title: {
    type: String,
    required: [true, 'Please provide an assignment title'],
    trim: true,
  },
  group: {
    type: String,
    required: true,
    default: 'Class X-A Science',
  },
  assignedDate: {
    type: String,
    required: true,
  },
  dueDate: {
    type: String,
    required: [true, 'Please provide a due date'],
  },
  questionsCount: {
    type: Number,
    required: true,
  },
  totalMarks: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['In Progress', 'Graded'],
    default: 'In Progress',
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  questionsDetails: [QuestionDetailSchema],
  questions: [QuestionSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Assignment: Model<IAssignment> = 
  mongoose.models.Assignment || mongoose.model<IAssignment>('Assignment', AssignmentSchema);

export default Assignment;
