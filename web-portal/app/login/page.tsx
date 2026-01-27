"use client";

import React, { useState } from "react";
import { Lock, Mail, Loader2, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { authService } from "@/services/authService";
import { useAuth } from "@/context/AuthContext";
import { useTenant } from "@/context/TenantContext";

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
  const { tenant, isLoading: isTenantLoading } = useTenant();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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

  // Default branding colors if not set
  const primaryColor = tenant?.primary_color || "#06b6d4"; // cyan-500
  const accentColor = tenant?.accent_color || "#3b82f6"; // blue-500

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
             {tenant?.logo_url ? (
               <img src={tenant.logo_url} alt={tenant.name} className="w-full h-full object-contain" />
             ) : (
               <ShieldCheck className="w-16 h-16 text-slate-200" />
             )}
           </div>
           
           <div className="space-y-4">
             <h1 className="text-4xl font-bold text-white font-sora">
               {tenant?.name || "Gated Community System"}
             </h1>
             <p className="text-lg text-slate-400 leading-relaxed">
               Secure access management, simplified. Experience a modern approach to community living.
             </p>
           </div>

           <div className="grid grid-cols-2 gap-4 w-full mt-8">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <ShieldCheck className="w-8 h-8 mb-3 text-cyan-400" />
                  <h3 className="text-slate-200 font-semibold">Secure Access</h3>
                  <p className="text-sm text-slate-400 mt-1">Advanced visitor verification</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <CheckCircle2 className="w-8 h-8 mb-3 text-emerald-400" />
                  <h3 className="text-slate-200 font-semibold">Easy Management</h3>
                  <p className="text-sm text-slate-400 mt-1">Efficient tenant controls</p>
              </div>
           </div>
        </div>

        <div className="absolute bottom-8 text-slate-500 text-sm">
            Powered by Gated Community Platform
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 relative">
        <div className="w-full max-w-md space-y-8">
            <div className="lg:hidden text-center mb-8">
                 <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-accent to-brand-primary mb-4 shadow-lg shadow-brand-accent/20 overflow-hidden">
                    {tenant?.logo_url ? (
                        <img src={tenant.logo_url} alt={tenant.name} className="w-full h-full object-cover" />
                    ) : (
                        <ShieldCheck className="w-8 h-8 text-white" />
                    )}
                 </div>
                 <h2 className="text-2xl font-bold text-white">{tenant?.name}</h2>
            </div>

            <div className="space-y-2">
                <h2 className="text-3xl font-bold text-slate-100 font-sora">
                    {mfaRequired ? "Two-Factor Authentication" : "Welcome Back"}
                </h2>
                <p className="text-slate-400">
                    {mfaRequired 
                        ? "Please enter the verification code sent to your device." 
                        : "Enter your credentials to access your account."}
                </p>
            </div>

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
                              <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-[var(--primary-brand)] transition-colors" style={{ color: 'var(--primary-brand)' }} />
                            </div>
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="block w-full pl-11 pr-4 py-3.5 bg-slate-900 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[var(--primary-brand)]/50 focus:border-[var(--primary-brand)] transition-all"
                              placeholder="admin@example.com"
                              required
                              style={{ borderColor: 'var(--primary-brand)' }}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-300 ml-1">Password</label>
                          <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-[var(--primary-brand)] transition-colors" style={{ color: 'var(--primary-brand)' }} />
                            </div>
                            <input
                              type="password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="block w-full pl-11 pr-4 py-3.5 bg-slate-900 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[var(--primary-brand)]/50 focus:border-[var(--primary-brand)] transition-all"
                              placeholder="••••••••"
                              required
                              style={{ borderColor: 'var(--primary-brand)' }}
                            />
                          </div>
                        </div>
                    </>
                ) : (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300 ml-1">Authentication Code</label>
                      <div className="relative group">
                        <input
                          type="text"
                          value={mfaToken}
                          onChange={(e) => setMfaToken(e.target.value)}
                          className="block w-full text-center tracking-[1em] text-2xl font-mono py-4 bg-slate-900 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[var(--primary-brand)]/50 focus:border-[var(--primary-brand)] transition-all"
                          placeholder="000000"
                          maxLength={6}
                          required
                          style={{ borderColor: 'var(--primary-brand)' }}
                        />
                      </div>
                    </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 rounded-2xl text-white font-semibold shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  style={{ backgroundColor: tenant?.primary_color || '#06b6d4' }}
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      {mfaRequired ? "Verify & Sign In" : "Sign In"}
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
            </form>
        </div>
      </div>
    </div>
  );
}
