import React, { useState } from 'react';
import { X, Mail, Lock, Loader2, AlertCircle, HelpCircle, Eye, EyeOff, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { Minda2Logo } from './Minda2Logo';
import { UserRole } from '../types';

interface LoginModalProps {
  onClose: () => void;
  onLoginSuccess: (role: UserRole, user: any) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgotInfo, setShowForgotInfo] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Send unified login request - backend auto-detects role!
      const res = await axios.post('/api/login/', { email: email.trim(), password: password.trim() });
      onLoginSuccess(res.data.role, res.data.user);
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError("Invalid email or password. Please check your credentials.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/70 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Card */}
      <div className="relative w-full max-w-[430px] bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100">
        {/* Sleek top accent gradient */}
        <div className="h-1.5 bg-gradient-to-r from-teal-500 via-emerald-500 to-indigo-500"></div>
        
        {/* Header */}
        <div className="px-8 pt-8 pb-3 flex flex-col items-center text-center">
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-slate-300 hover:text-slate-500 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="mb-4">
            <Minda2Logo size="md" showTagline={false} />
          </div>
          
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-1">Sign In</h2>
          <p className="text-xs text-slate-400 font-medium">
            Enter your credentials to access your dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-8 pt-4 pb-8 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl flex items-start gap-2.5 text-xs font-bold border border-rose-100 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider ml-1">
              Email Address
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-teal-500 transition-colors">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-semibold text-sm focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all duration-200"
                placeholder="name@company.com or email@mind2i.edu"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between ml-1">
              <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowForgotInfo(!showForgotInfo)}
                className="text-[11px] font-bold text-teal-600 hover:text-teal-700 cursor-pointer"
              >
                Forgot?
              </button>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-teal-500 transition-colors">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-11 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-semibold text-sm focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all duration-200"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Forgot info drop */}
          {showForgotInfo && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-center text-xs font-semibold text-amber-800 leading-relaxed">
              Please contact your <span className="font-black">Program Administrator</span> to reset your access credentials.
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 mt-2 bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600 hover:opacity-95 disabled:opacity-50 text-white font-black rounded-2xl shadow-lg shadow-teal-500/20 transition-all duration-200 flex items-center justify-center gap-2 text-sm cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying & Signing In...</span>
              </>
            ) : (
              <>
                <span>Sign In to Platform</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
