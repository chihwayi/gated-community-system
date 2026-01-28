"use client";

import React, { useState } from "react";
import { Lock, Mail, Loader2, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { authService } from "@/services/authService";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function PlatformLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // MFA State
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaToken, setMfaToken] = useState("");
  const [tempToken, setTempToken] = useState("");
  
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (mfaRequired) {
          // MFA Login
          const response = await authService.mfaLogin(tempToken, mfaToken);
          if (response.access_token) {
              await login(response.access_token, undefined, false); // Don't auto redirect
              router.replace('/platform');
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
             await login(response.access_token, undefined, false); // Don't auto redirect
             router.replace('/platform');
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

  // Platform branding colors
  const primaryColor = "#8b5cf6"; // violet-500
  const accentColor = "#6366f1"; // indigo-500

  return (
    <div className="min-h-screen w-full flex bg-slate-950">
      {/* Left Panel - Branding & Visuals */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-slate-900 items-center justify-center p-12">
        {/* Dynamic Background */}
        <div 
            className="absolute inset-0 opacity-20"
            style={{
                background: `radial-gradient(circle at 30% 30%, ${primaryColor}, transparent 50%), radial-gradient(circle at 70% 70%, ${accentColor}, transparent 50%)`
            }}
        />
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
        
        <div className="relative z-10 flex flex-col items-center text-center space-y-8 max-w-lg">
           <div className="w-32 h-32 rounded-3xl bg-white/5 backdrop-blur-2xl border border-white/10 flex items-center justify-center shadow-2xl p-4">
               <ShieldCheck className="w-16 h-16 text-violet-400" />
           </div>
           
           <div className="space-y-4">
             <h1 className="text-4xl font-bold text-white font-sora">
               Platform Administration
             </h1>
             <p className="text-lg text-slate-400 leading-relaxed">
               Manage tenants, packages, and system settings from a centralized dashboard.
             </p>
           </div>

           <div className="grid grid-cols-2 gap-4 w-full mt-8">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <ShieldCheck className="w-8 h-8 mb-3 text-violet-400" />
                  <h3 className="text-slate-200 font-semibold">System Control</h3>
                  <p className="text-sm text-slate-400 mt-1">Full administrative access</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <CheckCircle2 className="w-8 h-8 mb-3 text-violet-400" />
                  <h3 className="text-slate-200 font-semibold">Tenant Management</h3>
                  <p className="text-sm text-slate-400 mt-1">Onboard and manage communities</p>
              </div>
           </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-950">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-white font-sora">
              {mfaRequired ? "Two-Factor Authentication" : "Welcome back"}
            </h2>
            <p className="mt-2 text-slate-400">
              {mfaRequired ? "Enter the code from your authenticator app" : "Please sign in to your account"}
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!mfaRequired ? (
                <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Email Address</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-slate-500" />
                        </div>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl leading-5 bg-white/5 text-slate-300 placeholder-slate-500 focus:outline-none focus:bg-white/10 focus:ring-1 focus:ring-violet-500 focus:border-violet-500 sm:text-sm transition-all"
                          placeholder="admin@platform.com"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Password</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-slate-500" />
                        </div>
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl leading-5 bg-white/5 text-slate-300 placeholder-slate-500 focus:outline-none focus:bg-white/10 focus:ring-1 focus:ring-violet-500 focus:border-violet-500 sm:text-sm transition-all"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                </>
            ) : (
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Authentication Code</label>
                    <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <ShieldCheck className="h-5 w-5 text-slate-500" />
                    </div>
                    <input
                        type="text"
                        required
                        value={mfaToken}
                        onChange={(e) => setMfaToken(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl leading-5 bg-white/5 text-slate-300 placeholder-slate-500 focus:outline-none focus:bg-white/10 focus:ring-1 focus:ring-violet-500 focus:border-violet-500 sm:text-sm transition-all tracking-widest text-center text-lg font-mono"
                        placeholder="000000"
                        maxLength={6}
                        autoFocus
                    />
                    </div>
                </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {mfaRequired ? "Verify Code" : "Sign In"}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
