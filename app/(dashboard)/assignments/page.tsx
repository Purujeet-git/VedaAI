'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  MoreVertical, 
  Plus, 
  Filter, 
  Eye, 
  Trash2, 
  Calendar,
  Sparkles,
  Bookmark,
  FileText,
  X,
  Download,
  BookOpen,
  Award,
  Loader2
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
  id: string;
  title: string;
  group: string;
  assignedDate: string;
  dueDate: string;
  questionsCount: number;
  totalMarks: number;
  status: 'In Progress' | 'Graded';
  questions: Question[];
}

const AssignmentsPage = () => {
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'All' | 'In Progress' | 'Graded'>('All');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Details Drawer States
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  // Fetch real assignments from MongoDB
  const fetchAssignments = async () => {
    try {
      const res = await fetch('/api/assignments');
      if (res.ok) {
        const data = await res.json();
        const formatted = data.map((item: any) => ({
          id: item._id,
          title: item.title,
          group: item.group || 'Class X-A Science',
          assignedDate: item.assignedDate,
          dueDate: item.dueDate,
          questionsCount: item.questionsCount,
          totalMarks: item.totalMarks,
          status: item.status || 'In Progress',
          questions: item.questions || [],
        }));
        setAssignments(formatted);
      } else {
        console.error('Failed to load assignments');
      }
    } catch (err) {
      console.error('API connection failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const toggleMenu = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const handleDelete = (id: string) => {
    setAssignments(prev => prev.filter(item => item.id !== id));
    setOpenMenuId(null);
  };

  const handlePageClick = () => {
    if (openMenuId) setOpenMenuId(null);
  };

  // Open structured details drawer
  const handleOpenDrawer = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setIsDrawerOpen(true);
    setOpenMenuId(null);
  };

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

  // Generate A4 Downloadable PDF matching teacher's spec exactly
  const handleDownloadPDF = async () => {
    if (!selectedAssignment) return;
    setIsDownloading(true);

    try {
      const html2pdf = (await loadHtml2Pdf()) as any;
      const element = document.getElementById('printable-exam-paper');

      if (!element) {
        throw new Error('Printable element not found');
      }

      const opt = {
        margin: 15,
        filename: `${selectedAssignment.title.replace(/\s+/g, '_')}_A4_Paper.pdf`,
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

  // Filter and search
  const filteredAssignments = assignments.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.group.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeFilter === 'All') return matchesSearch;
    return matchesSearch && item.status === activeFilter;
  });

  return (
    <div 
      onClick={handlePageClick}
      className="max-w-6xl mx-auto space-y-8 select-none relative pb-32"
    >
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
            <h1 className="text-xl md:text-2xl font-black text-zinc-900 tracking-tight">Assignments Hub</h1>
          </div>
          <p className="text-xs text-zinc-400 font-semibold mt-1">Manage, review grades, and generate customized academic materials.</p>
        </div>
      </div>

      {/* Toolbar: Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white border border-zinc-100 rounded-2xl p-4 shadow-sm">
        
        {/* Left: Filter Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button 
            onClick={() => setActiveFilter('All')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeFilter === 'All'
                ? 'bg-zinc-950 text-white shadow-sm'
                : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 border border-zinc-100'
            }`}
          >
            <Filter className="w-3 h-3" />
            All Tasks ({assignments.length})
          </button>

          <button 
            onClick={() => setActiveFilter('In Progress')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeFilter === 'In Progress'
                ? 'bg-zinc-950 text-white shadow-sm'
                : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 border border-zinc-100'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            In Progress ({assignments.filter(a => a.status === 'In Progress').length})
          </button>

          <button 
            onClick={() => setActiveFilter('Graded')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeFilter === 'Graded'
                ? 'bg-zinc-950 text-white shadow-sm'
                : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 border border-zinc-100'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Graded ({assignments.filter(a => a.status === 'Graded').length})
          </button>
        </div>

        {/* Right: Search Input */}
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search title, class group..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 hover:bg-zinc-100/50 focus:bg-white border border-zinc-100 focus:border-zinc-300 rounded-xl text-xs font-medium focus:outline-none transition-all shadow-inner"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        </div>

      </div>

      {/* Dynamic Main view logic */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((skeleton) => (
            <div 
              key={skeleton} 
              className="bg-white border border-zinc-100/80 rounded-3xl p-6 h-[220px] flex flex-col justify-between animate-pulse"
            >
              <div className="space-y-3">
                <div className="w-24 h-4 bg-zinc-100 rounded-md"></div>
                <div className="w-[85%] h-5 bg-zinc-100 rounded-md"></div>
                <div className="w-[45%] h-4 bg-zinc-100 rounded-md mt-2"></div>
              </div>
              <div className="pt-4 border-t border-zinc-50 flex items-center justify-between">
                <div className="w-20 h-4 bg-zinc-100 rounded-md"></div>
                <div className="w-24 h-6 bg-zinc-100 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredAssignments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssignments.map((assignment) => (
            <div 
              key={assignment.id} 
              onClick={() => router.push(`/assignments/${assignment.id}`)}
              className="bg-white border border-zinc-100/80 hover:border-zinc-200 rounded-3xl p-6 hover:shadow-lg transition-all duration-200 relative group flex flex-col justify-between min-h-[220px] hover:scale-[1.01] cursor-pointer"
            >
              
              {/* Upper Section */}
              <div>
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-zinc-400 bg-zinc-50 border border-zinc-100 px-2 py-0.5 rounded-md leading-none">
                      <Bookmark className="w-2.5 h-2.5 text-zinc-400" /> {assignment.group}
                    </span>
                    <h3 className="text-base font-extrabold text-zinc-900 tracking-tight leading-snug group-hover:text-brand-orange transition-colors">
                      {assignment.title}
                    </h3>
                  </div>

                  {/* Actions meatball menu */}
                  <div className="relative flex-shrink-0">
                    <button 
                      onClick={(e) => toggleMenu(e, assignment.id)}
                      className="p-1.5 hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer text-zinc-400 hover:text-zinc-700"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {/* Action dropdown panel */}
                    {openMenuId === assignment.id && (
                      <div className="absolute right-0 mt-1.5 w-44 bg-white border border-zinc-100/80 rounded-2xl shadow-xl z-20 py-1.5 overflow-hidden">
                        <button 
                          onClick={() => router.push(`/assignments/${assignment.id}`)}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-zinc-700 hover:bg-zinc-50 font-bold transition-colors cursor-pointer text-left"
                        >
                          <Eye className="w-4 h-4 text-zinc-400" />
                          View Details
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(assignment.id);
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-red-500 hover:bg-red-50 font-bold transition-colors cursor-pointer text-left border-t border-zinc-50"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                          Delete Task
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Substats */}
                <div className="flex items-center gap-3.5 mt-4 text-[10px] font-bold text-zinc-400">
                  <span>{assignment.questions.length} Questions</span>
                  <span className="w-1 h-1 bg-zinc-200 rounded-full"></span>
                  <span>{assignment.totalMarks} Marks Total</span>
                </div>
              </div>

              {/* Lower Section (Dates & Status) */}
              <div className="pt-5 mt-5 border-t border-zinc-50 flex items-center justify-between">
                
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wide">Due Date</span>
                  <span className="text-[11px] font-extrabold text-zinc-700 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-zinc-400" /> {assignment.dueDate}
                  </span>
                </div>

                {/* Status indicator */}
                {assignment.status === 'Graded' ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-bold">
                    <Sparkles className="w-3 h-3" /> Graded by AI
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 border border-amber-100 text-amber-600 text-[10px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> In Progress
                  </span>
                )}

              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-dashed border-zinc-200/80 rounded-[2.5rem] py-16 px-6 text-center shadow-sm max-w-2xl mx-auto flex flex-col items-center">
          
          {/* 🎨 Figma Vector Illustration */}
          <div className="relative w-40 h-40 mb-6 flex items-center justify-center select-none">
            {/* Ambient shadow glow */}
            <div className="absolute inset-0 bg-zinc-50 rounded-full scale-90 border border-zinc-100/60"></div>
            
            {/* Back sheet paper */}
            <div className="absolute w-20 h-24 bg-white border border-zinc-200 rounded-xl shadow-sm -rotate-6 flex flex-col p-3 space-y-2 opacity-60 translate-x-[-12px] translate-y-[-4px]">
              <div className="w-8 h-2 bg-zinc-100 rounded-full"></div>
              <div className="w-12 h-1.5 bg-zinc-50 rounded-full"></div>
              <div className="w-10 h-1.5 bg-zinc-50 rounded-full"></div>
              <div className="w-14 h-1.5 bg-zinc-50 rounded-full"></div>
            </div>

            {/* Front sheet paper */}
            <div className="absolute w-20 h-24 bg-white border border-zinc-200 rounded-xl shadow-md flex flex-col p-3.5 space-y-2 z-10 translate-y-[-2px]">
              <div className="w-10 h-2 bg-zinc-250 rounded-full"></div>
              <div className="space-y-1.5 pt-1.5">
                <div className="w-14 h-1.5 bg-zinc-100 rounded-full"></div>
                <div className="w-12 h-1.5 bg-zinc-100 rounded-full"></div>
                <div className="w-10 h-1.5 bg-zinc-100 rounded-full"></div>
                <div className="w-13 h-1.5 bg-zinc-100 rounded-full"></div>
              </div>
            </div>

            {/* Magnifying Glass with Red X badge */}
            <div className="absolute right-4 bottom-4 w-16 h-16 z-20 flex items-center justify-center pointer-events-none">
              {/* Glass handle */}
              <div className="absolute bottom-1 right-1 w-6 h-1.5 bg-zinc-300 rounded-full rotate-45 origin-bottom-right"></div>
              {/* Glass rim */}
              <div className="absolute w-12 h-12 rounded-full border-4 border-zinc-300 bg-white/50 backdrop-blur-[0.5px] flex items-center justify-center shadow-inner">
                {/* Red cross circle */}
                <div className="w-6 h-6 rounded-full bg-rose-50 border border-rose-100 text-rose-500 flex items-center justify-center font-bold text-[10px] shadow-sm">
                  <X className="w-3.5 h-3.5 stroke-[3px]" />
                </div>
              </div>
            </div>
          </div>

          <h3 className="text-base font-black text-zinc-900 tracking-tight">No assignments yet</h3>
          
          <p className="text-xs text-zinc-400 font-semibold leading-relaxed mt-2 max-w-sm mx-auto">
            Create your first assignment to start collecting and grading student submissions. You can set up rubrics, define marking criteria, and let AI assist with grading.
          </p>

          <button
            onClick={() => router.push('/create-assignment')}
            className="mt-6 flex items-center gap-2 px-6 py-3.5 bg-zinc-950 hover:bg-zinc-900 text-white font-bold text-xs tracking-wider rounded-full shadow-md transition-all active:scale-95 cursor-pointer border border-zinc-800"
          >
            <span className="font-extrabold text-sm">+</span>
            <span>Create Your First Assignment</span>
          </button>

        </div>
      )}

      {/* Center Fixed Floating Action Button (FAB) */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20">
        <button 
          onClick={() => router.push('/create-assignment')}
          className="flex items-center gap-2.5 px-8 py-4 bg-zinc-950 text-white rounded-full font-bold text-xs tracking-wider shadow-2xl hover:bg-zinc-900 border border-zinc-800 hover:scale-105 active:scale-95 transition-all cursor-pointer group"
        >
          <Plus className="w-4 h-4 stroke-[3px] text-brand-orange transition-transform group-hover:rotate-90" />
          CREATE ASSIGNMENT
        </button>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="fixed bottom-0 right-0 w-full lg:w-[calc(100vw-288px)] h-20 bg-gradient-to-t from-[#fafafc] to-transparent pointer-events-none z-10"></div>

      {/* 🚀 GLASSMORPHIC SLIDING DETAILS DRAWER */}
      {isDrawerOpen && selectedAssignment && (
        <div 
          className="fixed inset-0 bg-zinc-950/20 backdrop-blur-sm z-40 flex justify-end animate-fade-in select-text"
          onClick={() => setIsDrawerOpen(false)}
        >
          <div 
            className="w-full max-w-2xl bg-white h-screen flex flex-col justify-between shadow-2xl animate-slide-in relative overflow-hidden border-l border-zinc-100"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Header Area */}
            <div className="px-8 py-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-brand-orange" />
                <div>
                  <h3 className="text-base font-extrabold text-zinc-900 leading-tight">{selectedAssignment.title}</h3>
                  <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider mt-0.5">
                    {selectedAssignment.group} &nbsp;•&nbsp; {selectedAssignment.questions.length} Questions
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadPDF}
                  disabled={isDownloading}
                  className="px-4 py-2 border border-zinc-200 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-50 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isDownloading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5 text-brand-orange" />
                  )}
                  <span>{isDownloading ? 'Downloading...' : 'Download PDF'}</span>
                </button>
                
                <button 
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 hover:bg-zinc-100 rounded-xl text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Structured Questions Scroll Container */}
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
              
              {/* Stats overview */}
              <div className="grid grid-cols-3 gap-4 bg-zinc-50 border border-zinc-100 p-4 rounded-2xl">
                <div className="text-center">
                  <span className="text-[9px] font-black text-zinc-400 uppercase tracking-wide">Total Questions</span>
                  <p className="text-lg font-black text-zinc-800 mt-0.5">{selectedAssignment.questions.length}</p>
                </div>
                <div className="text-center border-x border-zinc-150">
                  <span className="text-[9px] font-black text-zinc-400 uppercase tracking-wide">Maximum Marks</span>
                  <p className="text-lg font-black text-zinc-800 mt-0.5">{selectedAssignment.totalMarks}</p>
                </div>
                <div className="text-center">
                  <span className="text-[9px] font-black text-zinc-400 uppercase tracking-wide">Due Date</span>
                  <p className="text-xs font-extrabold text-zinc-800 mt-1 flex items-center justify-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-zinc-400" /> {selectedAssignment.dueDate}
                  </p>
                </div>
              </div>

              {/* Loop Sections */}
              {Array.from(new Set(selectedAssignment.questions.map(q => q.section))).sort().map((sectionName) => {
                const sectionQuestions = selectedAssignment.questions.filter(q => q.section === sectionName);
                const firstQ = sectionQuestions[0];
                
                return (
                  <div key={sectionName} className="space-y-4">
                    
                    {/* Section Header */}
                    <div className="border-b border-zinc-150 pb-2">
                      <h4 className="text-xs font-black text-brand-orange uppercase tracking-widest">{sectionName}</h4>
                      <p className="text-[10px] text-zinc-400 font-bold tracking-wide mt-0.5">
                        {firstQ?.type} &nbsp;•&nbsp; {sectionQuestions.length} Questions
                      </p>
                    </div>

                    {/* Questions lists */}
                    <div className="space-y-4">
                      {sectionQuestions.map((q, idx) => (
                        <div key={idx} className="p-4 border border-zinc-100 bg-zinc-50/20 rounded-2xl space-y-3 hover:border-zinc-200 transition-colors">
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex gap-2">
                              <span className="text-xs font-bold text-zinc-400 mt-0.5">{idx + 1}.</span>
                              <p className="text-xs font-semibold text-zinc-800 leading-relaxed">{q.questionText}</p>
                            </div>

                            {/* Marks badge */}
                            <span className="flex-shrink-0 text-[10px] font-bold text-zinc-500 bg-zinc-50 border border-zinc-150 px-2 py-0.5 rounded-md leading-none">
                              {q.marks} Marks
                            </span>
                          </div>

                          {/* Options if MCQ */}
                          {q.options && q.options.length > 0 && (
                            <div className="grid grid-cols-2 gap-2 pl-6">
                              {q.options.map((opt, oIdx) => (
                                <div key={oIdx} className="text-[11px] text-zinc-500 font-medium flex gap-1.5">
                                  <span className="text-brand-orange font-bold">{String.fromCharCode(65 + oIdx)}.</span>
                                  <span>{opt}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Action difficulty pill */}
                          <div className="flex items-center justify-between pt-2 pl-6 border-t border-dashed border-zinc-100">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wide border ${
                              q.difficulty === 'Easy' 
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                : q.difficulty === 'Medium'
                                  ? 'bg-amber-50 text-amber-600 border-amber-100'
                                  : 'bg-rose-50 text-rose-600 border-rose-100'
                            }`}>
                              {q.difficulty}
                            </span>
                            
                            <span className="text-[10px] text-zinc-400 font-semibold">
                              Answer Key integrated
                            </span>
                          </div>

                        </div>
                      ))}
                    </div>

                  </div>
                );
              })}

            </div>

            {/* Footer / Branding */}
            <div className="px-8 py-4 border-t border-zinc-100 bg-zinc-50/50 text-center">
              <p className="text-[10px] text-zinc-400 font-semibold tracking-wider flex items-center justify-center gap-1">
                <Award className="w-3.5 h-3.5 text-brand-orange" /> POWERED BY VEDAAI ACADEMIC INFRASTRUCTURE
              </p>
            </div>

          </div>
        </div>
      )}

      {/* 🌟 VECTOR PRINT-READY A4 EXAM PAPER TEMPLATE (HIDDEN FROM UI, COMPILED BY HTML2PDF) */}
      {selectedAssignment && (
        <div className="hidden">
          <div 
            id="printable-exam-paper" 
            className="p-12 text-[#18181b] font-serif bg-white space-y-8 text-sm leading-relaxed"
            style={{ width: '210mm', minHeight: '297mm' }} // Standard A4 specs
          >
            {/* Header block */}
            <div className="text-center space-y-1">
              <h1 className="text-xl font-black tracking-tight font-serif uppercase">Delhi Public School, Sector-4, Bokaro</h1>
              <h2 className="text-base font-bold">Subject: {selectedAssignment.title}</h2>
              <h3 className="text-sm font-semibold">Class: 5th &nbsp;•&nbsp; Term Assessment</h3>
            </div>

            {/* Time / Marks sub-row */}
            <div className="flex justify-between border-b border-black pb-2 text-xs font-bold font-serif pt-4">
              <span>Time Allowed: 45 minutes</span>
              <span>Maximum Marks: {selectedAssignment.totalMarks}</span>
            </div>

            <p className="text-[11px] font-bold italic font-serif">All questions are compulsory unless stated otherwise.</p>

            {/* Student blanks block */}
            <div className="grid grid-cols-2 gap-y-3 gap-x-8 text-xs font-bold font-serif py-4 border border-zinc-200 p-4 rounded-lg bg-zinc-50/40">
              <div className="flex items-end">
                <span>Name:</span>
                <div className="flex-1 border-b border-black ml-2 h-4"></div>
              </div>
              <div className="flex items-end">
                <span>Roll Number:</span>
                <div className="flex-1 border-b border-black ml-2 h-4"></div>
              </div>
              <div className="flex items-end col-span-2">
                <span>Class: 5th Section:</span>
                <div className="flex-1 border-b border-black ml-2 h-4"></div>
              </div>
            </div>

            {/* Questions lists grouped by Section */}
            {Array.from(new Set(selectedAssignment.questions.map(q => q.section))).sort().map((sectionName, sIdx) => {
              const sectionQuestions = selectedAssignment.questions.filter(q => q.section === sectionName);
              const firstQ = sectionQuestions[0];
              
              return (
                <div key={sectionName} className="space-y-4 pt-4">
                  <div className="text-center font-bold font-serif text-sm border-b border-dashed border-zinc-300 pb-1">
                    {sectionName}
                  </div>
                  <div className="text-xs italic font-semibold">
                    {firstQ?.type}
                    <p className="text-[10px] font-medium not-italic mt-0.5">Attempt all questions. Each question carries {firstQ?.marks} marks.</p>
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

            {/* PAGE BREAK (tells html2pdf to split) */}
            <div style={{ pageBreakBefore: 'always' }} className="pt-12"></div>

            {/* 🌟 ANSWER KEY SECTION (PAGE 2) */}
            <div className="space-y-6">
              <div className="text-center space-y-1">
                <h2 className="text-base font-black uppercase font-serif tracking-tight">Answer Key</h2>
                <h3 className="text-xs font-bold">Subject: {selectedAssignment.title}</h3>
              </div>

              <div className="space-y-4 pt-4">
                {selectedAssignment.questions.map((q, idx) => (
                  <div key={idx} className="text-xs space-y-1 bg-zinc-50 p-3 rounded-lg border border-zinc-150">
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
      )}

    </div>
  );
};

export default AssignmentsPage;
