'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Download, 
  Calendar, 
  Sparkles, 
  Award,
  Loader2, 
  AlertCircle,
  FileText,
  Clock,
  CheckCircle2,
  BookOpen
} from 'lucide-react';

interface Question {
  section: string;
  type: string;
  questionText: string;
  options?: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  marks: number;
  answer: string;
}

interface Assignment {
  _id: string;
  title: string;
  group: string;
  assignedDate: string;
  dueDate: string;
  questionsCount: number;
  totalMarks: number;
  status: 'In Progress' | 'Graded';
  questions: Question[];
}

const AssignmentDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [teacherName, setTeacherName] = useState<string>('Educator');

  // Dynamic cookie utility to extract logged-in user's first name
  const getCookie = (name: string) => {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return null;
  };

  useEffect(() => {
    // 1. Personalize user name
    try {
      const sessionCookie = getCookie('veda_session');
      if (sessionCookie) {
        const decoded = JSON.parse(atob(decodeURIComponent(sessionCookie)));
        if (decoded && decoded.name) {
          const firstName = decoded.name.split(' ')[0];
          setTeacherName(firstName);
        }
      }
    } catch (e) {
      console.error('Failed to parse teacher name from session cookie:', e);
    }

    // 2. Fetch specific assignment details
    const loadAssignment = async () => {
      try {
        const res = await fetch(`/api/assignments/${params.id}`);
        if (!res.ok) {
          throw new Error('Failed to load this assignment paper. It may have been deleted.');
        }
        const data = await res.json();
        setAssignment(data);
      } catch (err: any) {
        setError(err.message || 'An error occurred while loading the paper.');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      loadAssignment();
    }
  }, [params.id]);

  // Dynamic on-demand CDN loader for html2pdf.js
  const loadHtml2Pdf = () => {
    return new Promise((resolve) => {
      if ((window as any).html2pdf) {
        resolve((window as any).html2pdf);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      script.onload = () => resolve((window as any).html2pdf);
      document.head.appendChild(script);
    });
  };

  // Generate standard A4 printable PDF matching specifications
  const handleDownloadPDF = async () => {
    if (!assignment) return;
    setIsDownloading(true);

    try {
      const html2pdf = (await loadHtml2Pdf()) as any;
      const element = document.getElementById('printable-exam-paper');

      if (!element) {
        throw new Error('Printable element not found');
      }

      const opt = {
        margin: 15,
        filename: `${assignment.title.replace(/\s+/g, '_')}_Question_Paper.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      await html2pdf().from(element).set(opt).save();
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="-mx-8 -mt-6 -mb-12 bg-[#fafafc] min-h-[calc(100vh-76px)] flex flex-col items-center justify-center text-zinc-400 gap-3">
        <Loader2 className="w-8 h-8 text-brand-orange animate-spin" />
        <p className="text-xs font-semibold tracking-wide uppercase">Loading Assessment Details...</p>
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="-mx-8 -mt-6 -mb-12 bg-[#fafafc] min-h-[calc(100vh-76px)] flex items-center justify-center p-6">
        <div className="bg-white max-w-md w-full border border-zinc-100 rounded-[2rem] p-8 text-center shadow-sm space-y-6">
          <div className="p-3 bg-red-50 text-red-500 rounded-2xl w-fit mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h3 className="text-base font-black text-zinc-900">Failed to Load Question Paper</h3>
          <p className="text-xs text-zinc-500 font-semibold leading-relaxed">{error || 'The requested question paper details are unavailable.'}</p>
          <button 
            onClick={() => router.push('/assignments')}
            className="w-full py-3.5 bg-zinc-950 hover:bg-zinc-900 text-white font-bold text-xs tracking-wider rounded-xl transition-all cursor-pointer border border-zinc-800"
          >
            Return to Assignments Hub
          </button>
        </div>
      </div>
    );
  }

  // Group questions by section dynamically
  const uniqueSections = Array.from(new Set(assignment.questions.map(q => q.section))).sort();

  return (
    <div className="max-w-4xl mx-auto space-y-8 select-text pb-12">
      
      {/* Top navigation bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button 
          onClick={() => router.push('/assignments')}
          className="flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-zinc-900 transition-colors group cursor-pointer w-fit"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Assignments</span>
        </button>
        
        <div className="flex gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-orange-light border border-brand-orange/20 text-brand-orange text-[10px] font-black uppercase tracking-wide">
            <Sparkles className="w-3 h-3 animate-pulse" /> AI Generated
          </span>
        </div>
      </div>

      {/* 1. TOP GREETING BANNER CARD */}
      <div className="bg-white border border-zinc-100 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm relative overflow-hidden">
        {/* Subtle Background pattern */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="space-y-2 max-w-xl relative z-10">
          <h3 className="text-lg md:text-xl font-extrabold text-zinc-900 tracking-tight leading-snug">
            Here is your generated Question Paper, {teacherName}!
          </h3>
          <p className="text-xs text-zinc-500 font-semibold flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-brand-orange" />
            <span>{assignment.title}</span>
            <span className="w-1 h-1 rounded-full bg-zinc-300"></span>
            <span>{assignment.group}</span>
          </p>
        </div>

        <button
          onClick={handleDownloadPDF}
          disabled={isDownloading}
          className="relative z-10 flex-shrink-0 bg-zinc-950 hover:bg-zinc-900 text-white font-bold text-xs tracking-wider rounded-xl px-6 py-3.5 shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer border border-zinc-800"
        >
          {isDownloading ? (
            <Loader2 className="w-4 h-4 animate-spin text-brand-orange" />
          ) : (
            <Download className="w-4 h-4 text-brand-orange" />
          )}
          <span>{isDownloading ? 'Downloading...' : 'Download PDF'}</span>
        </button>
      </div>

      {/* 2. PAPER METRICS SUMMARY */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-zinc-100 p-4 rounded-2xl shadow-sm flex flex-col justify-center items-center text-center">
          <FileText className="w-5 h-5 text-brand-orange mb-2" />
          <p className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Total Questions</p>
          <p className="text-lg font-black text-zinc-900">{assignment.questions.length}</p>
        </div>
        <div className="bg-white border border-zinc-100 p-4 rounded-2xl shadow-sm flex flex-col justify-center items-center text-center">
          <Award className="w-5 h-5 text-brand-orange mb-2" />
          <p className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Total Marks</p>
          <p className="text-lg font-black text-zinc-900">{assignment.totalMarks}</p>
        </div>
        <div className="bg-white border border-zinc-100 p-4 rounded-2xl shadow-sm flex flex-col justify-center items-center text-center">
          <Clock className="w-5 h-5 text-brand-orange mb-2" />
          <p className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Duration</p>
          <p className="text-lg font-black text-zinc-900">45 Min</p>
        </div>
        <div className="bg-white border border-zinc-100 p-4 rounded-2xl shadow-sm flex flex-col justify-center items-center text-center">
          <Calendar className="w-5 h-5 text-brand-orange mb-2" />
          <p className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Due Date</p>
          <p className="text-sm font-black text-zinc-900 mt-1">{assignment.dueDate}</p>
        </div>
      </div>

      {/* 3. MODERN QUESTION PAPER UI */}
      <div className="space-y-6">
        {uniqueSections.map((sectionName) => {
          const sectionQuestions = assignment.questions.filter(q => q.section === sectionName);
          const firstQ = sectionQuestions[0];
          
          return (
            <div key={sectionName} className="bg-white border border-zinc-100 rounded-3xl p-6 md:p-8 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-zinc-100 pb-4 mb-6 gap-2">
                <div>
                  <h2 className="text-lg font-black text-zinc-900 tracking-tight">{sectionName}</h2>
                  <p className="text-xs font-semibold text-zinc-500 mt-1">{firstQ?.type}</p>
                </div>
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider bg-zinc-50 px-3 py-1.5 rounded-lg border border-zinc-100 w-fit">
                  {sectionQuestions.length} Questions • {firstQ?.marks} Marks Each
                </div>
              </div>

              <div className="space-y-6">
                {sectionQuestions.map((q, idx) => (
                  <div key={idx} className="group relative">
                    <div className="flex gap-4">
                      {/* Question Number */}
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center text-xs font-black text-zinc-500 group-hover:bg-brand-orange group-hover:text-white group-hover:border-brand-orange transition-colors">
                        {idx + 1}
                      </div>

                      {/* Question Content */}
                      <div className="flex-1 space-y-3 pt-1">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                          <p className="text-sm font-semibold text-zinc-800 leading-relaxed max-w-2xl">{q.questionText}</p>
                          
                          {/* Badges */}
                          <div className="flex items-center gap-2 flex-shrink-0 mt-2 sm:mt-0">
                            <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider border ${
                              q.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                              q.difficulty === 'Medium' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                              'bg-rose-50 text-rose-600 border-rose-100'
                            }`}>
                              {q.difficulty}
                            </span>
                            <span className="px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider bg-zinc-50 text-zinc-500 border border-zinc-150">
                              {q.marks} Marks
                            </span>
                          </div>
                        </div>

                        {/* Options if MCQ */}
                        {q.options && q.options.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                            {q.options.map((opt, oIdx) => (
                              <div key={oIdx} className="flex items-center gap-3 p-3 rounded-xl border border-zinc-100 bg-zinc-50/50 hover:bg-zinc-50 hover:border-zinc-200 transition-colors">
                                <span className="w-5 h-5 rounded flex items-center justify-center bg-white border border-zinc-200 text-[10px] font-black text-zinc-500 shadow-sm">
                                  {String.fromCharCode(65 + oIdx)}
                                </span>
                                <span className="text-xs font-semibold text-zinc-700">{opt}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Answer Key Expandable (Optional for Teacher view) */}
                        <div className="mt-4 p-4 rounded-xl bg-brand-orange-light/30 border border-brand-orange/20">
                          <div className="flex items-start gap-2 text-xs">
                            <CheckCircle2 className="w-4 h-4 text-brand-orange flex-shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold text-brand-orange">Correct Answer: </span>
                              <span className="font-medium text-zinc-700">{q.answer}</span>
                            </div>
                          </div>
                        </div>
                        
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* 🚀 STATIC HIDDEN PRINT CONTAINER FORMATTED STRICTLY IN A4 PIXELS FOR HTML2PDF ENGINE */}
      <div className="hidden">
        <div 
          id="printable-exam-paper" 
          className="p-12 text-[#18181b] font-serif bg-white space-y-8 text-sm leading-relaxed"
          style={{ width: '210mm', minHeight: '297mm' }}
        >
          {/* Header block */}
          <div className="text-center space-y-1">
            <h1 className="text-xl font-black tracking-tight font-serif uppercase">VedaAI Assessment</h1>
            <h2 className="text-base font-bold">Subject: {assignment.title}</h2>
            <h3 className="text-sm font-semibold">Group: {assignment.group}</h3>
          </div>

          {/* Time / Marks sub-row */}
          <div className="flex justify-between border-b-2 border-black pb-2 text-xs font-bold font-serif pt-4">
            <span>Time Allowed: 45 minutes</span>
            <span>Maximum Marks: {assignment.totalMarks}</span>
          </div>

          <p className="text-[11px] font-bold italic font-serif">All questions are compulsory unless stated otherwise.</p>

          {/* Student blanks block */}
          <div className="space-y-1.5 text-xs font-bold font-serif py-4">
            <div>Name: ________________________</div>
            <div>Roll Number: _________________</div>
            <div>Date: ________________________</div>
          </div>

          {/* Questions lists grouped by Section */}
          {uniqueSections.map((sectionName) => {
            const sectionQuestions = assignment.questions.filter(q => q.section === sectionName);
            const firstQ = sectionQuestions[0];
            const sectionMarks = firstQ?.marks || 2;
            
            let displayType = firstQ?.type || 'Short Answer Questions';
            if (displayType === 'Short Questions') displayType = 'Short Answer Questions';

            return (
              <div key={sectionName} className="space-y-4 pt-4">
                <div className="text-center font-bold font-serif text-sm border-b border-dashed border-zinc-400 pb-1">
                  {sectionName}
                </div>
                <div className="text-xs italic font-semibold">
                  {displayType}
                  <p className="text-[10px] font-medium not-italic mt-0.5 font-serif">
                    Attempt all questions. Each question carries {sectionMarks} marks.
                  </p>
                </div>

                <div className="space-y-4">
                  {sectionQuestions.map((q, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between items-start gap-4 text-xs font-medium">
                        <div className="flex gap-2">
                          <span>{idx + 1}.</span>
                          <span>[{q.difficulty}] {q.questionText}</span>
                        </div>
                        <span className="font-bold font-serif">[{q.marks} Marks]</span>
                      </div>

                      {/* Indented Options if MCQ */}
                      {q.options && q.options.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 pl-6 text-[11px] font-serif">
                          {q.options.map((opt, oIdx) => (
                            <div key={oIdx} className="flex gap-1">
                              <span className="font-bold">{String.fromCharCode(65 + oIdx)}.</span>
                              <span>{opt}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          <div className="text-center font-bold font-serif text-xs border-t border-black pt-6 uppercase tracking-widest">
            End of Question Paper
          </div>

          {/* PAGE BREAK FOR PDF ENGINE */}
          <div style={{ pageBreakBefore: 'always' }} className="pt-12"></div>

          {/* 🌟 ANSWER KEY SECTION (PAGE 2) */}
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-base font-black uppercase font-serif tracking-tight">Answer Key</h2>
              <h3 className="text-xs font-bold font-serif">Subject: {assignment.title}</h3>
            </div>

            <div className="space-y-4 pt-4">
              {assignment.questions.map((q, idx) => (
                <div key={idx} className="text-xs space-y-1 bg-zinc-50 p-3 rounded-lg border border-zinc-200 font-serif">
                  <div className="font-bold flex gap-1 font-serif text-[11px]">
                    <span>Question {idx + 1}.</span>
                    <span className="text-brand-orange uppercase">[{q.section} &nbsp;•&nbsp; {q.difficulty}]</span>
                  </div>
                  <p className="italic text-zinc-500">Q: {q.questionText}</p>
                  <div className="pl-4 pt-1 font-serif text-zinc-800">
                    <span className="font-bold">Answer:</span> {q.answer}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default AssignmentDetailsPage;
