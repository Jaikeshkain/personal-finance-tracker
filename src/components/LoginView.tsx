'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Lock, 
  User, 
  AlertCircle, 
  Loader2, 
  CheckCircle,
  Database,
  ArrowRight
} from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (username: string) => void;
  isLocalMode: boolean;
}

// Native Web Cryptography hashing helper for Local Storage fallback
async function sha256Hash(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess, isLocalMode }) => {
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  // Reset errors when toggling modes
  useEffect(() => {
    setErrorMsg('');
    setSuccessMsg('');
    setPassword('');
    setConfirmPassword('');
  }, [isRegistering]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername || !password) {
      setErrorMsg('Please fill in all fields');
      return;
    }

    if (cleanUsername.length < 3) {
      setErrorMsg('Username must be at least 3 characters');
      return;
    }

    if (password.length < 4) {
      setErrorMsg('Password must be at least 4 characters');
      return;
    }

    if (isRegistering && password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      if (isLocalMode) {
        // --- LOCAL STORAGE AUTH FALLBACK ---
        const localUsersStr = localStorage.getItem('local_auth_users') || '{}';
        let localUsers: Record<string, string> = {};
        try {
          localUsers = JSON.parse(localUsersStr);
        } catch (e) {
          console.error(e);
        }

        const hashed = await sha256Hash(password);

        if (isRegistering) {
          // Check if exists
          if (localUsers[cleanUsername]) {
            setErrorMsg('Username is already taken locally');
            setIsLoading(false);
            return;
          }
          // Register
          localUsers[cleanUsername] = hashed;
          localStorage.setItem('local_auth_users', JSON.stringify(localUsers));
          setSuccessMsg('Account created locally! Redirecting...');
          setTimeout(() => {
            onLoginSuccess(cleanUsername);
          }, 1200);
        } else {
          // Login
          const storedHash = localUsers[cleanUsername];
          if (!storedHash || storedHash !== hashed) {
            setErrorMsg('Invalid local username or password');
            setIsLoading(false);
            return;
          }
          setSuccessMsg('Login successful! Redirecting...');
          setTimeout(() => {
            onLoginSuccess(cleanUsername);
          }, 1000);
        }
      } else {
        // --- MONGO DB ROUTE AUTH ---
        const endpoint = '/api/auth';
        const action = isRegistering ? 'register' : 'login';
        
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action,
            username: cleanUsername,
            password
          })
        });

        const data = await res.json();

        if (!res.ok) {
          setErrorMsg(data.error || 'Authentication failed');
          setIsLoading(false);
          return;
        }

        if (data.isLocalMode) {
          // API fallback triggered
          setErrorMsg('Server database offline. Please reload in Offline Local Mode.');
          setIsLoading(false);
          return;
        }

        setSuccessMsg(isRegistering ? 'Account registered successfully!' : 'Login successful!');
        setTimeout(() => {
          onLoginSuccess(cleanUsername);
        }, 1000);
      }
    } catch (err: any) {
      console.error('Authentication Error:', err);
      setErrorMsg(err.message || 'An error occurred during authentication');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-bg-app overflow-hidden font-outfit z-50 px-4">
      {/* Decorative Blur Background Glows */}
      <div className="absolute w-[450px] h-[450px] rounded-full bg-purple-600/10 blur-[130px] top-[15%] left-[10%] pointer-events-none animate-pulse duration-10000" />
      <div className="absolute w-[400px] h-[400px] rounded-full bg-indigo-600/10 blur-[120px] bottom-[15%] right-[10%] pointer-events-none animate-pulse duration-10000" />

      {/* Main Glass login card */}
      <div className="w-full max-w-[420px] bg-bg-card border border-white/5 rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-md relative overflow-hidden animate-fade-in-up">
        {/* Top brand header */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-gradient-to-br from-purple-600 to-violet-500 rounded-2xl p-3 flex items-center justify-center shadow-lg shadow-purple-500/25 mb-4">
            <TrendingUp size={28} color="#ffffff" />
          </div>
          <h1 className="text-2xl font-black text-slate-100 uppercase tracking-widest">
            My Finance
          </h1>
          <p className="text-slate-400 text-xs mt-1 font-inter">
            {isRegistering ? 'Create your credentials to get started' : 'Sign in to access your dashboard'}
          </p>
        </div>

        {/* Database Status Tag */}
        <div className={`flex items-center justify-center gap-1.5 text-[0.68rem] font-bold py-1.5 px-3 rounded-xl border mb-6 ${
          isLocalMode 
            ? 'text-amber-400 bg-amber-500/5 border-amber-500/10' 
            : 'text-emerald-400 bg-emerald-500/5 border-emerald-500/10'
        }`}>
          <Database size={12} />
          <span>DATABASE MODE: {isLocalMode ? 'LOCAL STORAGE (OFFLINE)' : 'MONGODB ATLAS SYNCED'}</span>
        </div>

        {/* Error / Success Notifications */}
        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/15 text-red-400 text-xs p-3.5 rounded-xl flex gap-2.5 items-start mb-5 font-inter leading-normal">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/15 text-emerald-400 text-xs p-3.5 rounded-xl flex gap-2.5 items-start mb-5 font-inter leading-normal animate-pulse">
            <CheckCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Auth form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5 relative">
            <label className="text-[0.72rem] text-slate-400 font-bold uppercase tracking-wider pl-1">
              Username
            </label>
            <div className="relative">
              <User size={16} className="text-slate-500 absolute left-3 top-3.5" />
              <input
                type="text"
                placeholder="e.g. jaike"
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/\s+/g, ''))}
                className="form-input pl-10 py-3.5 text-slate-100 placeholder-slate-600 bg-slate-950/80"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 relative">
            <label className="text-[0.72rem] text-slate-400 font-bold uppercase tracking-wider pl-1">
              Password
            </label>
            <div className="relative">
              <Lock size={16} className="text-slate-500 absolute left-3 top-3.5" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input pl-10 py-3.5 text-slate-100 placeholder-slate-600 bg-slate-950/80"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          {isRegistering && (
            <div className="flex flex-col gap-1.5 relative animate-fade-in-up">
              <label className="text-[0.72rem] text-slate-400 font-bold uppercase tracking-wider pl-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock size={16} className="text-slate-500 absolute left-3 top-3.5" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="form-input pl-10 py-3.5 text-slate-100 placeholder-slate-600 bg-slate-950/80"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn-primary w-full py-3.5 justify-center mt-3 relative overflow-hidden"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 size={18} className="animate-spin text-white" />
                Processing request...
              </span>
            ) : (
              <span className="flex items-center gap-2 font-bold tracking-wide">
                {isRegistering ? 'Create New Account' : 'Sign in to Account'}
                <ArrowRight size={16} />
              </span>
            )}
          </button>
        </form>

        {/* Toggle options footer */}
        <div className="border-t border-white/5 pt-5 mt-6 text-center text-xs font-inter text-slate-400">
          {isRegistering ? (
            <span>
              Already have an account?{' '}
              <button
                onClick={() => setIsRegistering(false)}
                className="bg-transparent border-none text-purple-400 font-bold cursor-pointer hover:underline pl-0.5"
                disabled={isLoading}
              >
                Log In
              </button>
            </span>
          ) : (
            <span>
              Don't have an account yet?{' '}
              <button
                onClick={() => setIsRegistering(true)}
                className="bg-transparent border-none text-purple-400 font-bold cursor-pointer hover:underline pl-0.5"
                disabled={isLoading}
              >
                Sign Up
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginView;
