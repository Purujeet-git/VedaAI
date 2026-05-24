'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Mail, 
  Lock, 
  Sparkles, 
  Loader2, 
  ArrowRight,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

const SignupPage = () => {
  const router = useRouter();
  
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const { name, email, password } = formData;

    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong. Please try again.');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#fafafc] px-4 py-12 relative overflow-hidden font-sans select-none">
      
      {/* Dynamic Ambient Background Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-brand-orange/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-orange/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none"></div>
      
      {/* Decorative Grid Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808006_1px,transparent_1px),linear-gradient(to_bottom,#80808006_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>

      {/* Main Glassmorphic Signup Card */}
      <div className="w-full max-w-md bg-white border border-zinc-100 rounded-3xl p-8 shadow-xl relative z-10 space-y-6">
        
        {/* Header Logo & Branding */}
        <div className="flex flex-col items-center text-center space-y-2.5">
          <div className="relative w-12 h-12 rounded-2xl overflow-hidden shadow-sm border border-zinc-100 bg-zinc-50 flex items-center justify-center">
            <Image 
              src="/logo.avif" 
              alt="VedaAI Logo" 
              width={44} 
              height={44}
              className="object-cover"
            />
          </div>
          <div>
            <h1 className="text-xl font-black text-zinc-900 tracking-tight flex items-center justify-center gap-1.5">
              Create Account
            </h1>
            <p className="text-xs text-zinc-400 font-semibold mt-1">Join VedaAI and unlock the Educator Toolkit</p>
          </div>
        </div>

        {/* State Banners: Errors or Success */}
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 rounded-2xl p-4 flex items-start gap-3 animate-shake">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
              <h4 className="text-xs font-bold leading-none">Registration Failed</h4>
              <p className="text-[10px] font-semibold leading-relaxed mt-1">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl p-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
              <h4 className="text-xs font-bold leading-none">Account Registered!</h4>
              <p className="text-[10px] font-semibold leading-relaxed mt-1">Redirecting you to the login screen...</p>
            </div>
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase text-zinc-400 tracking-wider pl-1">Full Name</label>
            <div className="relative">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Professor Sharma"
                disabled={isLoading || success}
                className="w-full pl-11 pr-4 py-3 bg-zinc-50 hover:bg-zinc-100/30 focus:bg-white border border-zinc-100 focus:border-zinc-300 focus:outline-none rounded-xl text-xs font-semibold text-zinc-800 transition-all focus:ring-0"
              />
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-400" />
            </div>
          </div>

          {/* Email Address */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase text-zinc-400 tracking-wider pl-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="priya@dps.edu.in"
                disabled={isLoading || success}
                className="w-full pl-11 pr-4 py-3 bg-zinc-50 hover:bg-zinc-100/30 focus:bg-white border border-zinc-100 focus:border-zinc-300 focus:outline-none rounded-xl text-xs font-semibold text-zinc-800 transition-all focus:ring-0"
              />
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-400" />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase text-zinc-400 tracking-wider pl-1">Password</label>
            <div className="relative">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                disabled={isLoading || success}
                className="w-full pl-11 pr-4 py-3 bg-zinc-50 hover:bg-zinc-100/30 focus:bg-white border border-zinc-100 focus:border-zinc-300 focus:outline-none rounded-xl text-xs font-semibold text-zinc-800 transition-all focus:ring-0"
              />
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-400" />
            </div>
          </div>

          {/* Sign Up Action CTA */}
          <button
            type="submit"
            disabled={isLoading || success}
            className="w-full py-4 mt-6 bg-zinc-950 hover:bg-zinc-900 text-white font-bold text-xs tracking-wider rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 border border-zinc-800 shadow-sm active:scale-[0.99] group disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-brand-orange" />
            ) : (
              <Sparkles className="w-4 h-4 text-brand-orange" />
            )}
            <span>{isLoading ? 'CREATING ACCOUNT...' : 'REGISTER ACCOUNT'}</span>
            {!isLoading && <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />}
          </button>

        </form>

        {/* Divider & Switch Route link */}
        <div className="pt-6 border-t border-zinc-100 text-center">
          <p className="text-xs font-medium text-zinc-400">
            Already have an educator account?{' '}
            <Link 
              href="/login" 
              className="text-brand-orange font-bold hover:underline"
            >
              Sign In Here
            </Link>
          </p>
        </div>

      </div>

    </div>
  );
};

export default SignupPage;
