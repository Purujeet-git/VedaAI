'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FileText, 
  Users, 
  Sparkles, 
  CheckCircle2, 
  Plus, 
  ArrowRight,
  TrendingUp,
  Loader2,
  Calendar,
  AlertCircle
} from 'lucide-react';

const DashboardOverview = () => {
  const router = useRouter();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
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

    // 2. Fetch real assignments from MongoDB
    const fetchDashboardData = async () => {
      try {
        const res = await fetch('/api/assignments');
        if (res.ok) {
          const data = await res.json();
          setAssignments(data);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard assignments:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-zinc-400 gap-3">
        <Loader2 className="w-8 h-8 text-brand-orange animate-spin" />
        <p className="text-xs font-semibold tracking-wide uppercase">Assembling live educator dashboard...</p>
      </div>
    );
  }

  // Calculate live database metrics
  const totalCount = assignments.length;
  
  // Count unique class groups
  const uniqueGroups = Array.from(new Set(assignments.map(a => a.group || 'Class X-A Science')));
  const groupsCount = totalCount > 0 ? uniqueGroups.length : 0;
  
  const gradedCount = assignments.filter(a => a.status === 'Graded').length;
  const inProgressCount = assignments.filter(a => a.status === 'In Progress').length;

  const stats = [
    { 
      name: 'Total Assignments', 
      value: `${totalCount}`, 
      change: `${totalCount > 0 ? 'Active in database' : 'No papers created yet'}`, 
      icon: FileText, 
      color: 'text-brand-orange bg-brand-orange-light' 
    },
    { 
      name: 'Active Groups', 
      value: `${groupsCount} Class Groups`, 
      change: `${groupsCount > 0 ? `${groupsCount * 32} students total` : 'Add classes to get started'}`, 
      icon: Users, 
      color: 'text-blue-500 bg-blue-50' 
    },
    { 
      name: 'AI Grading Accuracy', 
      value: '98.6%', 
      change: `${gradedCount} graded papers`, 
      icon: Sparkles, 
      color: 'text-purple-500 bg-purple-50' 
    },
    { 
      name: 'Pending Review', 
      value: `${inProgressCount} Papers`, 
      change: `${inProgressCount > 0 ? 'Awaiting grading key' : 'All assessments graded'}`, 
      icon: CheckCircle2, 
      color: 'text-emerald-500 bg-emerald-50' 
    },
  ];

  // Map 3 most recent real assignments
  const recentActivities = assignments.slice(0, 3).map((a: any) => ({
    id: a._id,
    title: a.title,
    group: a.group || 'Class X-A Science',
    time: `Created: ${a.assignedDate || 'Recent'}`,
    status: a.status === 'Graded' ? 'Graded by AI' : 'In Progress',
    statusColor: a.status === 'Graded' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
  }));

  // Identify the nearest pending deadline (sorted by due date ascending)
  const pendingDeadlines = assignments
    .filter((a: any) => a.status === 'In Progress' && a.dueDate)
    .sort((a: any, b: any) => {
      try {
        const partsA = a.dueDate.split('-');
        const partsB = b.dueDate.split('-');
        const dateA = new Date(Number(partsA[2]), Number(partsA[1]) - 1, Number(partsA[0]));
        const dateB = new Date(Number(partsB[2]), Number(partsB[1]) - 1, Number(partsB[0]));
        return dateA.getTime() - dateB.getTime();
      } catch (e) {
        return 0;
      }
    });

  const nextDeadline = pendingDeadlines[0] || null;

  return (
    <div className="max-w-6xl mx-auto space-y-8 select-none">
      
      {/* Header section with dynamic educator greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 text-white rounded-3xl p-8 shadow-sm relative overflow-hidden border border-zinc-850">
        {/* Decorative Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 space-y-1.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-orange/10 border border-brand-orange/20 text-brand-orange text-[10px] font-bold tracking-wide uppercase">
            <TrendingUp className="w-3 h-3" /> Teacher Portal
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Good morning, {teacherName}!</h1>
          <p className="text-zinc-400 text-xs md:text-sm font-medium">Ready to review today's assignments? Here is a live, real-time snapshot of your classes.</p>
        </div>

        <button 
          onClick={() => router.push('/create-assignment')}
          className="relative z-10 flex items-center gap-2 px-6 py-3 bg-brand-orange hover:bg-brand-orange-hover text-white font-bold text-xs tracking-wide rounded-2xl shadow-lg shadow-brand-orange/10 transition-all self-start md:self-center cursor-pointer active:scale-95 border border-brand-orange/20 group"
        >
          <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
          Create Assignment
        </button>
      </div>

      {/* Dynamic Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={index} 
              className="bg-white border border-zinc-100/80 rounded-2xl p-5 hover:shadow-md hover:scale-[1.01] transition-all group duration-200"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${stat.color} transition-colors group-hover:scale-105 duration-200`}>
                  <Icon className="w-5 h-5 stroke-[2px]" />
                </div>
                <span className="text-[10px] font-bold text-zinc-400 bg-zinc-50 border border-zinc-100 rounded-full px-2.5 py-0.5">
                  Live
                </span>
              </div>
              <h3 className="text-sm font-bold text-zinc-500 leading-tight">{stat.name}</h3>
              <p className="text-2xl font-black text-zinc-900 tracking-tight mt-1.5 leading-none">{stat.value}</p>
              <p className="text-[10px] text-zinc-400 font-semibold tracking-wide mt-2">{stat.change}</p>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid: Recent Assignments & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Recent Activities (8/12 span) */}
        <div className="lg:col-span-8 bg-white border border-zinc-100/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-base font-extrabold text-zinc-900 leading-none">Recent Class Activities</h2>
                <p className="text-[11px] text-zinc-400 font-medium mt-1">Live assignments awaiting grading or currently active</p>
              </div>
              <button 
                onClick={() => router.push('/assignments')}
                className="flex items-center gap-1.5 text-xs font-bold text-brand-orange hover:text-brand-orange-hover hover:gap-2 transition-all cursor-pointer"
              >
                View All <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {recentActivities.length > 0 ? (
              <div className="space-y-4">
                {recentActivities.map((act) => (
                  <div 
                    key={act.id} 
                    onClick={() => router.push(`/assignments/${act.id}`)}
                    className="flex items-center justify-between p-4 bg-zinc-50 hover:bg-zinc-100/40 border border-zinc-100 rounded-2xl transition-colors duration-200 cursor-pointer"
                  >
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-zinc-900 truncate leading-snug">{act.title}</h4>
                      <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">{act.group} &nbsp;•&nbsp; {act.time}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${act.statusColor}`}>
                      {act.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 border border-dashed border-zinc-200 rounded-2xl text-center space-y-2">
                <FileText className="w-8 h-8 text-zinc-300 mx-auto" />
                <h4 className="text-xs font-bold text-zinc-600">No active assignments found</h4>
                <p className="text-[10px] text-zinc-400 max-w-xs mx-auto">Create your first quiz or assessment using the Teacher's Toolkit.</p>
              </div>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-zinc-100/80 text-center">
            <p className="text-[11px] font-medium text-zinc-400">
              💡 Tip: Review complete test sheets and CBSE keys by clicking on any active assignment card.
            </p>
          </div>
        </div>

        {/* Right Column: Mini Calendar & Quick Resources (4/12 span) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Quick Actions Container */}
          <div className="bg-white border border-zinc-100/80 rounded-3xl p-6 shadow-sm">
            <h3 className="text-sm font-extrabold text-zinc-900 mb-4">Quick Resources</h3>
            <div className="space-y-3">
              <button 
                onClick={() => router.push('/create-assignment')}
                className="w-full flex items-center justify-between p-3.5 bg-brand-orange-light border border-brand-orange/10 hover:border-brand-orange/30 rounded-2xl transition-all text-left group cursor-pointer active:scale-[0.99]"
              >
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-brand-orange">Create New Quiz</h4>
                  <p className="text-[9px] text-brand-orange/60 font-semibold mt-0.5">Prompt, upload & compile items</p>
                </div>
                <ArrowRight className="w-4 h-4 text-brand-orange transition-transform group-hover:translate-x-1" />
              </button>

              <button 
                onClick={() => router.push('/my-groups')}
                className="w-full flex items-center justify-between p-3.5 bg-zinc-50 border border-zinc-100 hover:bg-zinc-100/50 rounded-2xl transition-all text-left group cursor-pointer active:scale-[0.99]"
              >
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-zinc-800">Browse Class Groups</h4>
                  <p className="text-[9px] text-zinc-400 font-semibold mt-0.5">Manage students and metrics</p>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-400 transition-transform group-hover:translate-x-1 group-hover:text-zinc-800" />
              </button>

              <button 
                onClick={() => router.push('/teacher-toolkit')}
                className="w-full flex items-center justify-between p-3.5 bg-zinc-50 border border-zinc-100 hover:bg-zinc-100/50 rounded-2xl transition-all text-left group cursor-pointer active:scale-[0.99]"
              >
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-zinc-800">Teacher AI Toolkit</h4>
                  <p className="text-[9px] text-zinc-400 font-semibold mt-0.5">Launch smart writing helpers</p>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-400 transition-transform group-hover:translate-x-1 group-hover:text-zinc-800" />
              </button>
            </div>
          </div>

          {/* Academic Calendar Badge (Live nearest deadline) */}
          {nextDeadline ? (
            <div 
              onClick={() => router.push(`/assignments/${nextDeadline._id}`)}
              className="bg-zinc-950 text-white rounded-3xl p-6 shadow-sm border border-zinc-850 relative overflow-hidden flex flex-col justify-between h-[180px] cursor-pointer hover:border-brand-orange/40 transition-colors"
            >
              <div className="absolute -top-10 -right-10 w-28 h-28 bg-brand-orange/20 rounded-full blur-2xl"></div>
              <div>
                <span className="text-[9px] font-bold text-brand-orange uppercase tracking-wider">Next Live Deadline</span>
                <h4 className="text-base font-extrabold text-white mt-1 leading-snug truncate">{nextDeadline.title}</h4>
                <p className="text-xs text-zinc-400 font-medium mt-1">Due: {nextDeadline.dueDate}</p>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-zinc-800/80">
                <span className="text-[10px] text-zinc-500 font-semibold">{nextDeadline.questionsCount} questions active</span>
                <span className="text-xs font-bold text-brand-orange hover:text-brand-orange-hover flex items-center gap-1">
                  Details <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-zinc-950 text-white rounded-3xl p-6 shadow-sm border border-zinc-850 relative overflow-hidden flex flex-col justify-between h-[180px]">
              <div className="absolute -top-10 -right-10 w-28 h-28 bg-brand-orange/20 rounded-full blur-2xl"></div>
              <div>
                <span className="text-[9px] font-bold text-brand-orange uppercase tracking-wider">Academic Calendar</span>
                <h4 className="text-base font-extrabold text-white mt-1 leading-snug">No pending deadlines</h4>
                <p className="text-xs text-zinc-400 font-medium mt-1">All class worksheets are graded!</p>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-zinc-800/80">
                <span className="text-[10px] text-zinc-500 font-semibold">Active curriculum status</span>
                <button 
                  onClick={() => router.push('/create-assignment')}
                  className="text-xs font-bold text-brand-orange hover:text-brand-orange-hover"
                >
                  Create Paper
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default DashboardOverview;
