'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAssignmentStore } from '@/lib/store/assignmentStore';
import { 
  CloudUpload, 
  Plus, 
  X, 
  Calendar, 
  Sparkles,
  ArrowRight,
  Calculator,
  ChevronDown,
  Loader2,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

const CreateAssignment = () => {
  const router = useRouter();
  
  // Hook up Zustand Store
  const {
    title,
    dueDate,
    additionalInfo,
    questions,
    errors,
    isGenerating,
    progress,
    progressStatus,
    wsStatus,
    setField,
    updateQuestionRow,
    addQuestionRow,
    removeQuestionRow,
    generateViaWebSocket,
    resetForm,
  } = useAssignmentStore();

  const [dragActive, setDragActive] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Clean form state on mount
  useEffect(() => {
    resetForm();
  }, [resetForm]);

  const questionTypeOptions = [
    'Multiple Choice Questions',
    'Short Questions',
    'Diagram/Graph-Based Questions',
    'Numerical Problems',
    'Long Questions',
    'Fill in the Blanks'
  ];

  // Drag & Drop event handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Derived calculations
  const totalQuestions = questions.reduce((sum, row) => sum + (Number(row.count) || 0), 0);
  const totalMarks = questions.reduce((sum, row) => sum + ((Number(row.count) || 0) * (Number(row.marks) || 0)), 0);

  const handleGenerate = () => {
    generateViaWebSocket((data) => {
      // Success Callback: Redirect directly to the generated assignment's premium view page!
      router.push(`/assignments/${data._id || data.id}`);
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 select-none pb-12 relative">
      
      {/* Header and Step Indicators */}
      <div className="space-y-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-zinc-900 tracking-tight">Create Assignment</h1>
          <p className="text-xs text-zinc-400 font-semibold mt-1">Configure your structure and materials. VedaAI will compile the final assessment paper.</p>
        </div>

        {/* Step progress indicators */}
        <div className="flex items-center gap-4 bg-white border border-zinc-100 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2.5 flex-1">
            <span className="w-6 h-6 flex items-center justify-center rounded-full bg-brand-orange text-white text-[10px] font-black shadow-sm shadow-brand-orange/20 animate-pulse">1</span>
            <span className="text-xs font-bold text-zinc-800">Configure Paper Matrix</span>
          </div>
          <div className="w-12 h-px bg-zinc-200 hidden sm:block"></div>
          <div className="flex items-center gap-2.5 flex-1 opacity-40">
            <span className="w-6 h-6 flex items-center justify-center rounded-full bg-zinc-200 text-zinc-600 text-[10px] font-black">2</span>
            <span className="text-xs font-bold text-zinc-500">AI Prompt Generation</span>
          </div>
        </div>
      </div>

      {/* Main card containing the form */}
      <div className="bg-white border border-zinc-100 rounded-3xl p-8 shadow-sm space-y-8">
        
        {/* Section title banner */}
        <div>
          <h3 className="text-sm font-extrabold text-zinc-900">Assignment Details</h3>
          <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">Configure your custom prompt parameters, metadata, and references.</p>
        </div>

        {/* General server / connection error banner */}
        {errors.general && (
          <div className="bg-red-50 border border-red-100 text-red-600 rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
              <h4 className="text-xs font-bold leading-none">Connection / Server Error</h4>
              <p className="text-[10px] font-semibold leading-relaxed mt-1">{errors.general}</p>
            </div>
          </div>
        )}

        {/* Assignment Title */}
        <div className="space-y-2">
          <label className="block text-[10px] font-black uppercase text-zinc-500 tracking-wider">Assignment Title</label>
          <input 
            type="text"
            value={title}
            onChange={(e) => setField('title', e.target.value)}
            className={`w-full rounded-2xl p-4 bg-zinc-50 hover:bg-zinc-100/30 focus:bg-white border text-xs font-semibold text-zinc-800 focus:outline-none focus:ring-0 transition-all ${
              errors.title ? 'border-red-300 focus:border-red-400' : 'border-zinc-100 focus:border-zinc-300'
            }`}
            placeholder="e.g. Quiz on Electricity"
          />
          {errors.title && (
            <p className="text-[10px] font-semibold text-red-500 flex items-center gap-1 mt-1 pl-1">
              <AlertCircle className="w-3.5 h-3.5" /> {errors.title}
            </p>
          )}
        </div>

        {/* Drag & Drop uploader area */}
        <div className="space-y-2">
          <label className="block text-[10px] font-black uppercase text-zinc-500 tracking-wider">Upload Reference Material (Optional)</label>
          <div 
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all relative group flex flex-col items-center justify-center cursor-pointer ${
              dragActive 
                ? 'border-brand-orange bg-brand-orange-light/40' 
                : selectedFile 
                  ? 'border-emerald-200 bg-emerald-50/20'
                  : 'border-zinc-200 hover:border-brand-orange/60 bg-zinc-50 hover:bg-zinc-100/30'
            }`}
          >
            <input 
              type="file" 
              id="file-upload" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              onChange={handleFileInput}
              accept="image/*,.pdf"
            />

            <div className={`p-3 rounded-full mb-3 shadow-inner ${
              selectedFile ? 'bg-emerald-50 text-emerald-600' : 'bg-white text-zinc-500'
            }`}>
              <CloudUpload className="w-6 h-6" />
            </div>

            {selectedFile ? (
              <div className="space-y-1">
                <p className="font-bold text-xs text-emerald-600">File Uploaded Successfully!</p>
                <p className="text-[10px] text-zinc-500 font-semibold">{selectedFile.name} &nbsp;•&nbsp; {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="font-extrabold text-xs text-zinc-800">Choose a PDF or text file, or drag & drop it here</p>
                <p className="text-[10px] text-zinc-400 font-semibold">Supports PDF or Plain Text up to 10MB</p>
              </div>
            )}

            {!selectedFile && (
              <button className="mt-4 rounded-full bg-white hover:bg-zinc-50 text-zinc-700 font-bold text-[10px] px-5 py-2 border border-zinc-200 shadow-sm transition-all pointer-events-none">
                Browse Files
              </button>
            )}
          </div>
          <p className="text-[10px] text-zinc-400 font-semibold text-center">
            Upload images or pages of your preferred documents (optional)
          </p>
        </div>

        {/* Due Date field */}
        <div className="space-y-2">
          <label className="block text-[10px] font-black uppercase text-zinc-500 tracking-wider">Due Date</label>
          <div className="relative">
            <input 
              type="date" 
              value={dueDate}
              onChange={(e) => setField('dueDate', e.target.value)}
              className={`w-full rounded-2xl p-4 bg-zinc-50 hover:bg-zinc-100/30 focus:bg-white border text-xs font-semibold text-zinc-700 focus:outline-none focus:ring-0 transition-all appearance-none cursor-pointer ${
                errors.dueDate ? 'border-red-300 focus:border-red-400' : 'border-zinc-100 focus:border-zinc-300'
              }`}
            />
            <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-400 pointer-events-none" />
          </div>
          {errors.dueDate && (
            <p className="text-[10px] font-semibold text-red-500 flex items-center gap-1 mt-1 pl-1">
              <AlertCircle className="w-3.5 h-3.5" /> {errors.dueDate}
            </p>
          )}
        </div>

        {/* Dynamic Question Type Matrix Section */}
        <div className="space-y-3">
          <label className="block text-[10px] font-black uppercase text-zinc-500 tracking-wider">Question Structure Matrix</label>
          
          {/* Table Headers */}
          <div className="grid grid-cols-12 gap-4 items-center px-4 py-2 bg-zinc-50 border border-zinc-100 rounded-xl text-[9px] font-black text-zinc-400 uppercase tracking-wider">
            <div className="col-span-6">Question Format Type</div>
            <div className="col-span-3 text-center">No. of Items</div>
            <div className="col-span-3 text-center">Marks / Item</div>
          </div>

          {/* Rows List */}
          <div className="space-y-3">
            {questions.map((row) => (
              <div 
                key={row.id} 
                className="grid grid-cols-12 gap-4 items-center p-2 hover:bg-zinc-50/50 rounded-2xl border border-transparent hover:border-zinc-100 transition-colors"
              >
                
                {/* Format Dropdown & Delete Icon */}
                <div className="col-span-6 flex items-center gap-3">
                  <div className="relative flex-1">
                    <select
                      value={row.type}
                      onChange={(e) => updateQuestionRow(row.id, 'type', e.target.value)}
                      className="w-full bg-white border border-zinc-100 hover:border-zinc-200 rounded-xl px-4 py-3 text-xs font-semibold text-zinc-700 focus:outline-none focus:border-zinc-300 appearance-none cursor-pointer pr-10"
                    >
                      {questionTypeOptions.map((opt, idx) => (
                        <option key={idx} value={opt}>{opt}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-400 pointer-events-none" />
                  </div>
                  
                  {/* Row Delete Icon */}
                  <button 
                    onClick={() => removeQuestionRow(row.id)}
                    disabled={questions.length === 1}
                    className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-red-500 disabled:opacity-20 transition-all hover:bg-red-50 hover:border-red-100 rounded-lg cursor-pointer border border-transparent"
                    title="Remove Row"
                  >
                    <X className="w-4.5 h-4.5" />
                  </button>
                </div>

                {/* Question Count Incrementer */}
                <div className="col-span-3 flex flex-col items-center">
                  <div className={`flex items-center bg-white border rounded-xl px-2.5 py-1.5 w-full max-w-[100px] justify-between shadow-sm ${
                    errors[`q_count_${row.id}`] ? 'border-red-300 bg-red-50/10' : 'border-zinc-100'
                  }`}>
                    <button 
                      type="button"
                      onClick={() => updateQuestionRow(row.id, 'count', Math.max(1, row.count - 1))}
                      className="w-6 h-6 flex items-center justify-center text-zinc-400 hover:text-zinc-900 font-extrabold text-sm hover:bg-zinc-50 rounded-lg cursor-pointer active:scale-90 transition-all"
                    >-</button>
                    <input 
                      type="number"
                      value={row.count}
                      onChange={(e) => updateQuestionRow(row.id, 'count', e.target.value)}
                      className="w-8 text-center text-xs font-bold text-zinc-800 bg-transparent border-none outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button 
                      type="button"
                      onClick={() => updateQuestionRow(row.id, 'count', row.count + 1)}
                      className="w-6 h-6 flex items-center justify-center text-zinc-400 hover:text-zinc-900 font-extrabold text-sm hover:bg-zinc-50 rounded-lg cursor-pointer active:scale-90 transition-all"
                    >+</button>
                  </div>
                  {errors[`q_count_${row.id}`] && (
                    <span className="text-[9px] font-bold text-red-500 mt-1">{errors[`q_count_${row.id}`]}</span>
                  )}
                </div>

                {/* Marks / Item Incrementer */}
                <div className="col-span-3 flex flex-col items-center">
                  <div className={`flex items-center bg-white border rounded-xl px-2.5 py-1.5 w-full max-w-[100px] justify-between shadow-sm ${
                    errors[`q_marks_${row.id}`] ? 'border-red-300 bg-red-50/10' : 'border-zinc-100'
                  }`}>
                    <button 
                      type="button"
                      onClick={() => updateQuestionRow(row.id, 'marks', Math.max(1, row.marks - 1))}
                      className="w-6 h-6 flex items-center justify-center text-zinc-400 hover:text-zinc-900 font-extrabold text-sm hover:bg-zinc-50 rounded-lg cursor-pointer active:scale-90 transition-all"
                    >-</button>
                    <input 
                      type="number"
                      value={row.marks}
                      onChange={(e) => updateQuestionRow(row.id, 'marks', e.target.value)}
                      className="w-8 text-center text-xs font-bold text-zinc-800 bg-transparent border-none outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button 
                      type="button"
                      onClick={() => updateQuestionRow(row.id, 'marks', row.marks + 1)}
                      className="w-6 h-6 flex items-center justify-center text-zinc-400 hover:text-zinc-900 font-extrabold text-sm hover:bg-zinc-50 rounded-lg cursor-pointer active:scale-90 transition-all"
                    >+</button>
                  </div>
                  {errors[`q_marks_${row.id}`] && (
                    <span className="text-[9px] font-bold text-red-500 mt-1">{errors[`q_marks_${row.id}`]}</span>
                  )}
                </div>

              </div>
            ))}
          </div>

          {/* Add Question Row Trigger */}
          <button 
            type="button"
            onClick={addQuestionRow}
            className="inline-flex items-center gap-2 mt-2 px-4 py-2 border border-zinc-150 rounded-xl text-xs font-bold text-zinc-700 hover:text-zinc-950 hover:bg-zinc-50 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-brand-orange stroke-[2.5px]" />
            Add Question Type
          </button>
        </div>

        {/* Matrix grand summary block */}
        <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-5 flex items-center justify-between text-xs font-bold text-zinc-500">
          <div className="flex items-center gap-2">
            <Calculator className="w-4.5 h-4.5 text-brand-orange" />
            <span>Automatic Matrix Summary</span>
          </div>
          <div className="flex gap-6">
            <div>Total Questions : <span className="text-zinc-900 font-black text-sm ml-1">{totalQuestions}</span></div>
            <div className="h-4 w-px bg-zinc-200"></div>
            <div>Total Marks : <span className="text-zinc-900 font-black text-sm ml-1">{totalMarks}</span></div>
          </div>
        </div>

        {/* Additional instructions block */}
        <div className="space-y-2">
          <label className="block text-[10px] font-black uppercase text-zinc-500 tracking-wider">
            Additional Information
          </label>
          <textarea
            value={additionalInfo}
            onChange={(e) => setField('additionalInfo', e.target.value)}
            placeholder="e.g. Generate a question paper for 3 hour exam duration..."
            rows={4}
            className="w-full rounded-2xl p-4 bg-zinc-50 hover:bg-zinc-100/30 focus:bg-white border border-zinc-100 focus:border-zinc-300 placeholder-zinc-300 text-xs font-semibold text-zinc-700 focus:outline-none transition-all resize-none shadow-inner leading-relaxed"
          />
        </div>

        {/* Submit action buttons */}
        <div className="pt-4 border-t border-zinc-100 flex flex-col sm:flex-row gap-3">
          <button 
            type="button"
            onClick={() => router.push('/assignments')}
            className="flex-1 py-4 border border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 font-bold text-xs tracking-wider rounded-2xl cursor-pointer active:scale-95 transition-all"
          >
            Cancel
          </button>
          
          <button 
            type="button"
            onClick={handleGenerate}
            className="flex-1 py-4 bg-zinc-950 hover:bg-zinc-900 text-white font-bold text-xs tracking-wider rounded-2xl flex items-center justify-center gap-2 group cursor-pointer active:scale-95 transition-all border border-zinc-800"
          >
            <Sparkles className="w-4 h-4 text-brand-orange animate-pulse" />
            <span>Generate Assignment</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

      </div>

      {/* 🚀 BREATHTAKING GLASSMORPHIC STREAMING PROGRESS MODAL */}
      {isGenerating && (
        <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-md z-50 flex items-center justify-center select-none">
          <div className="bg-white border border-zinc-100 rounded-[2.5rem] p-8 max-w-md w-full mx-4 shadow-2xl flex flex-col items-center space-y-6 text-center animate-fade-in relative overflow-hidden">
            
            {/* Ambient Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/5 rounded-full blur-2xl pointer-events-none"></div>
            
            {/* Processing Circular Loader */}
            <div className="w-20 h-20 rounded-3xl bg-brand-orange-light border border-brand-orange/10 flex items-center justify-center shadow-inner relative">
              <Loader2 className="w-10 h-10 text-brand-orange animate-spin stroke-[2.5px]" />
              <span className="absolute bottom-1 right-1 text-[9px] font-black text-brand-orange bg-white px-1.5 py-0.5 rounded-full border border-brand-orange/15 shadow-sm">
                {wsStatus === 'connecting' ? 'WS' : `${progress}%`}
              </span>
            </div>

            {/* Title & Status logs */}
            <div className="space-y-2 w-full">
              <h3 className="text-lg font-black text-zinc-900 tracking-tight">Compiling Assessment</h3>
              <p className="text-xs text-zinc-400 font-bold tracking-wide uppercase">VedaAI Pipeline</p>
              
              {/* Dynamic current activity message */}
              <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-4 flex items-center justify-center gap-3.5 mt-3 min-h-[60px]">
                <div className="w-2 h-2 rounded-full bg-brand-orange animate-ping flex-shrink-0"></div>
                <p className="text-xs text-zinc-600 font-semibold leading-relaxed text-left truncate flex-1">
                  {progressStatus || 'Starting pipeline execution...'}
                </p>
              </div>
            </div>

            {/* Glowing progress slider bar */}
            <div className="w-full bg-zinc-100 h-2.5 rounded-full overflow-hidden border border-zinc-50 relative shadow-inner">
              <div 
                className="bg-brand-orange h-full rounded-full transition-all duration-350 shadow-md shadow-brand-orange/20 animate-pulse"
                style={{ width: `${progress}%` }}
              ></div>
            </div>

            {/* Check milestones steps indicators */}
            <div className="w-[90%] text-[10px] font-bold text-zinc-400 flex justify-between tracking-wide border-t border-zinc-100 pt-4 px-1">
              <span className={progress >= 25 ? 'text-brand-orange' : ''}>1. Read</span>
              <span className={progress >= 50 ? 'text-brand-orange' : ''}>2. Compose</span>
              <span className={progress >= 75 ? 'text-brand-orange' : ''}>3. Grade</span>
              <span className={progress >= 95 ? 'text-brand-orange' : ''}>4. Persist</span>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default CreateAssignment;
