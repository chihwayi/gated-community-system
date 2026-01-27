"use client";

import React, { useState } from "react";
import { Lock, Mail, Loader2, ArrowRight, ShieldCheck } from "lucide-react";
import { authService } from "@/services/authService";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // MFA State
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaToken, setMfaToken] = useState("");
  const [tempToken, setTempToken] = useState("");
  
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (mfaRequired) {
          // MFA Login
          const response = await authService.mfaLogin(tempToken, mfaToken);
          if (response.access_token) {
              await login(response.access_token);
          } else {
              throw new Error("MFA verification failed");
          }
      } else {
          // Standard Login
          const response = await authService.login(email, password);
          if (response.mfa_required && response.temp_token) {
              setMfaRequired(true);
              setTempToken(response.temp_token);
              setIsLoading(false); // Stop loading to show OTP input
              return;
          }
          if (response.access_token) {
             await login(response.access_token);
          }
      }
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      if (!mfaRequired || (mfaRequired && error)) {
          setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/10 blur-[120px] rounded-full animate-pulse delay-700" />
      </div>

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 mb-4 shadow-lg shadow-cyan-500/20">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-100 font-sora mb-2">Welcome Back</h1>
          <p className="text-slate-400">Sign in to manage your gated community</p>
        </div>

          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm animate-in zoom-in-95 duration-300">
                {error}
              </div>
            )}

            {!mfaRequired ? (
                <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                        </div>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="block w-full pl-11 pr-4 py-3.5 bg-slate-950/50 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/40 transition-all"
                          placeholder="name@example.com"
                          required
                        />
                      </div>
                    </div>
        
                    <div className="space-y-2">
                      <div className="flex justify-between items-center ml-1">
                        <label className="text-sm font-medium text-slate-300">Password</label>
                        <a href="#" className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">Forgot password?</a>
                      </div>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                        </div>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="block w-full pl-11 pr-4 py-3.5 bg-slate-950/50 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/40 transition-all"
                          placeholder="••••••••"
                          required
                        />
                      </div>
                    </div>
                </>
            ) : (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300 ml-1">Two-Factor Authentication Code</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <ShieldCheck className="h-5 w-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                    </div>
                    <input
                      type="text"
                      value={mfaToken}
                      onChange={(e) => setMfaToken(e.target.value)}
                      className="block w-full pl-11 pr-4 py-3.5 bg-slate-950/50 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/40 transition-all"
                      placeholder="123456"
                      required
                      autoFocus
                    />
                  </div>
                  <p className="text-xs text-slate-500 ml-1">Enter the 6-digit code from your authenticator app.</p>
                </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center py-4 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-2xl font-semibold shadow-lg shadow-cyan-600/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100 group"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-800 text-center">
            <p className="text-slate-500 text-sm">
              Need access? <a href="#" className="text-cyan-400 font-medium hover:text-cyan-300 transition-colors">Contact Estate Office</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
