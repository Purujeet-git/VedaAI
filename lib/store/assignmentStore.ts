import { create } from 'zustand';

export interface QuestionRow {
  id: string;
  type: string;
  count: number;
  marks: number;
}

export interface GenerationProgress {
  status: string;
  progress: number;
  error: string | null;
  completedData: any | null;
}

interface AssignmentState {
  // Form States
  title: string;
  dueDate: string;
  additionalInfo: string;
  questions: QuestionRow[];
  errors: Record<string, string>;

  // WebSocket / Progress States
  isGenerating: boolean;
  progress: number;
  progressStatus: string;
  wsStatus: 'connected' | 'disconnected' | 'connecting';
  
  // Setters & Operations
  setField: (name: string, value: any) => void;
  updateQuestionRow: (id: string, field: keyof QuestionRow, value: any) => void;
  addQuestionRow: () => void;
  removeQuestionRow: (id: string) => void;
  validateForm: () => boolean;
  resetForm: () => void;
  generateViaWebSocket: (onSuccess: (data: any) => void) => void;
}

export const useAssignmentStore = create<AssignmentState>((set, get) => ({
  // Default states
  title: '',
  dueDate: '',
  additionalInfo: '',
  questions: [
    { id: '1', type: 'Multiple Choice Questions', count: 1, marks: 1 },
  ],
  errors: {},

  isGenerating: false,
  progress: 0,
  progressStatus: '',
  wsStatus: 'disconnected',

  setField: (name, value) => {
    set((state) => ({ 
      [name]: value,
      errors: { ...state.errors, [name]: '' } // clear field error
    }));
  },

  updateQuestionRow: (id, field, value) => {
    set((state) => {
      const updated = state.questions.map((row) => {
        if (row.id === id) {
          // If updating count or marks, ensure clean numeric conversion
          if (field === 'count' || field === 'marks') {
            const num = value === '' ? '' : Number(value);
            return { ...row, [field]: num };
          }
          return { ...row, [field]: value };
        }
        return row;
      });

      // Clear row specific errors
      const newErrors = { ...state.errors };
      delete newErrors[`q_count_${id}`];
      delete newErrors[`q_marks_${id}`];

      return { questions: updated, errors: newErrors };
    });
  },

  addQuestionRow: () => {
    set((state) => ({
      questions: [
        ...state.questions,
        {
          id: Date.now().toString(),
          type: 'Multiple Choice Questions',
          count: 1,
          marks: 1,
        },
      ],
    }));
  },

  removeQuestionRow: (id) => {
    set((state) => {
      if (state.questions.length <= 1) return {};
      const newErrors = { ...state.errors };
      delete newErrors[`q_count_${id}`];
      delete newErrors[`q_marks_${id}`];

      return {
        questions: state.questions.filter((row) => row.id !== id),
        errors: newErrors
      };
    });
  },

  validateForm: () => {
    const errors: Record<string, string> = {};
    const { title, dueDate, questions } = get();

    if (!title || !title.trim()) {
      errors.title = 'Title is required';
    }

    if (!dueDate) {
      errors.dueDate = 'Due date is required';
    } else {
      const selectedDate = new Date(dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        errors.dueDate = 'Due date must be today or in the future';
      }
    }

    questions.forEach((row) => {
      // Validate Count: empty, NaN, or <= 0
      if ((row.count as any) === '' || isNaN(row.count)) {
        errors[`q_count_${row.id}`] = 'Required';
      } else if (row.count <= 0) {
        errors[`q_count_${row.id}`] = 'Must be > 0';
      } else if (!Number.isInteger(row.count)) {
        errors[`q_count_${row.id}`] = 'Integer';
      }

      // Validate Marks: empty, NaN, or <= 0
      if ((row.marks as any) === '' || isNaN(row.marks)) {
        errors[`q_marks_${row.id}`] = 'Required';
      } else if (row.marks <= 0) {
        errors[`q_marks_${row.id}`] = 'Must be > 0';
      } else if (!Number.isInteger(row.marks)) {
        errors[`q_marks_${row.id}`] = 'Integer';
      }
    });

    set({ errors });
    return Object.keys(errors).length === 0;
  },

  resetForm: () => {
    set({
      title: '',
      dueDate: '',
      additionalInfo: '',
      questions: [
        { id: '1', type: 'Multiple Choice Questions', count: 1, marks: 1 },
      ],
      errors: {},
      isGenerating: false,
      progress: 0,
      progressStatus: '',
    });
  },

  generateViaWebSocket: (onSuccess) => {
    // 1. Trigger form validations first
    if (!get().validateForm()) return;

    set({ isGenerating: true, progress: 5, progressStatus: 'Connecting to generation server...', wsStatus: 'connecting' });

    // 2. Open local WebSocket connection
    const socket = new WebSocket('ws://localhost:3001');

    socket.onopen = () => {
      set({ wsStatus: 'connected', progress: 10, progressStatus: 'Analyzing parameters...' });
      
      const payload = {
        action: 'generate_assignment',
        data: {
          title: get().title,
          dueDate: get().dueDate,
          additionalInfo: get().additionalInfo,
          questions: get().questions.map(q => ({
            type: q.type,
            count: Number(q.count),
            marks: Number(q.marks)
          }))
        }
      };
      
      socket.send(JSON.stringify(payload));
    };

    socket.onmessage = (event) => {
      try {
        const frame = JSON.parse(event.data);
        
        if (frame.type === 'progress') {
          set({
            progress: frame.progress,
            progressStatus: frame.status
          });
        } 
        
        else if (frame.type === 'completed') {
          set({
            progress: 100,
            progressStatus: 'Success! Assignment generated.',
            isGenerating: false,
            wsStatus: 'disconnected'
          });
          socket.close();
          onSuccess(frame.data);
        } 
        
        else if (frame.type === 'error') {
          set({
            isGenerating: false,
            progressStatus: '',
            wsStatus: 'disconnected',
            errors: { general: frame.message || 'Generation failed. Please try again.' }
          });
          socket.close();
        }
      } catch (err) {
        console.error('Failed to parse WS event:', err);
      }
    };

    socket.onerror = () => {
      set({
        isGenerating: false,
        wsStatus: 'disconnected',
        errors: { general: 'Could not connect to WebSocket generation server. Make sure the server is running on port 3001.' }
      });
    };

    socket.onclose = () => {
      set({ wsStatus: 'disconnected' });
    };
  }
}));
