"use client";

import React, { useState, useEffect } from "react";
import { User, Lock, Shield, Loader2, CheckCircle, AlertCircle, Smartphone } from "lucide-react";
import { authService } from "@/services/authService";
import { mfaService, MFASetupResponse } from "@/services/mfaService";
import { useAuth } from "@/context/AuthContext";

export default function ProfilePage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // Password Change State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // MFA State
  const [mfaData, setMfaData] = useState<MFASetupResponse | null>(null);
  const [mfaCode, setMfaCode] = useState("");
  const [isMfaEnabled, setIsMfaEnabled] = useState(false); // In a real app, this should come from user object

  useEffect(() => {
    if (user?.mfa_enabled) {
        setIsMfaEnabled(true);
    }
  }, [user]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: "New passwords do not match" });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      await authService.changePassword(currentPassword, newPassword);
      setMessage({ type: 'success', text: "Password changed successfully" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || "Failed to change password" });
    } finally {
      setIsLoading(false);
    }
  };

  const startMfaSetup = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
        const data = await mfaService.setupMFA();
        setMfaData(data);
    } catch (err: any) {
        setMessage({ type: 'error', text: err.message || "Failed to start MFA setup" });
    } finally {
        setIsLoading(false);
    }
  };

  const verifyMfaSetup = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
        await mfaService.verifySetup(mfaCode);
        setIsMfaEnabled(true);
        setMfaData(null);
        setMfaCode("");
        setMessage({ type: 'success', text: "MFA enabled successfully" });
    } catch (err: any) {
        setMessage({ type: 'error', text: err.message || "Invalid code" });
    } finally {
        setIsLoading(false);
    }
  };

  const disableMfa = async () => {
      // For security, we should ask for a code or password again, but for now we just ask for a code
      if (!mfaCode) {
          setMessage({ type: 'error', text: "Please enter a code to disable MFA" });
          return;
      }
      setIsLoading(true);
      setMessage(null);
      try {
          await mfaService.disableMFA(mfaCode);
          setIsMfaEnabled(false);
          setMfaCode("");
          setMessage({ type: 'success', text: "MFA disabled successfully" });
      } catch (err: any) {
          setMessage({ type: 'error', text: err.message || "Failed to disable MFA" });
      } finally {
          setIsLoading(false);
      }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-100 font-sora">My Profile</h1>

      <div className="grid gap-6 md:grid-cols-2">
        {/* User Info */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-100">Personal Information</h2>
              <p className="text-sm text-slate-400">Your account details</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-500">Full Name</label>
              <p className="text-slate-200 font-medium">{user?.full_name}</p>
            </div>
            <div>
              <label className="text-sm text-slate-500">Email Address</label>
              <p className="text-slate-200 font-medium">{user?.email}</p>
            </div>
            <div>
              <label className="text-sm text-slate-500">Role</label>
              <p className="text-slate-200 font-medium capitalize">{user?.role}</p>
            </div>
             {user?.house_address && (
                <div>
                  <label className="text-sm text-slate-500">Address</label>
                  <p className="text-slate-200 font-medium">{user?.house_address}</p>
                </div>
             )}
          </div>
        </div>

        {/* Password Change */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-100">Change Password</h2>
              <p className="text-sm text-slate-400">Update your password</p>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <input
              type="password"
              placeholder="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
              required
            />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
              required
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
              required
            />
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-lg py-2 font-medium transition-colors disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Update Password"}
            </button>
          </form>
        </div>
        
        {/* MFA Section */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 md:col-span-2">
            <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-100">Two-Factor Authentication (MFA)</h2>
                  <p className="text-sm text-slate-400">Secure your account with TOTP</p>
                </div>
                <div className="ml-auto">
                    {isMfaEnabled ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-sm font-medium">
                            <CheckCircle className="w-4 h-4" /> Enabled
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-800 text-slate-400 text-sm font-medium">
                            Disabled
                        </span>
                    )}
                </div>
            </div>
            
            {!isMfaEnabled && !mfaData && (
                <div className="text-center py-6">
                    <Smartphone className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                    <p className="text-slate-400 mb-6 max-w-md mx-auto">
                        Two-factor authentication adds an extra layer of security to your account. 
                        You will need to enter a code from an authenticator app (like Google Authenticator) when you log in.
                    </p>
                    <button
                        onClick={startMfaSetup}
                        disabled={isLoading}
                        className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                        Enable MFA
                    </button>
                </div>
            )}
            
            {!isMfaEnabled && mfaData && (
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="bg-white p-4 rounded-xl">
                        {/* Using QR Server API to generate QR code without extra dependencies */}
                        <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(mfaData.otpauth_url)}`} 
                            alt="MFA QR Code" 
                            className="w-48 h-48"
                        />
                    </div>
                    <div className="flex-1 space-y-4">
                        <h3 className="text-lg font-medium text-slate-200">Scan QR Code</h3>
                        <p className="text-slate-400">
                            1. Open your authenticator app (Google Authenticator, Authy, etc.)<br/>
                            2. Scan the QR code or enter this secret key manually: <code className="bg-slate-800 px-2 py-1 rounded text-purple-400 select-all">{mfaData.secret}</code><br/>
                            3. Enter the 6-digit code below to verify.
                        </p>
                        <div className="flex gap-2 max-w-xs">
                            <input
                              type="text"
                              placeholder="000000"
                              value={mfaCode}
                              onChange={(e) => setMfaCode(e.target.value)}
                              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
                            />
                            <button
                                onClick={verifyMfaSetup}
                                disabled={isLoading || mfaCode.length < 6}
                                className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                            >
                                Verify
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {isMfaEnabled && (
                 <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-6">
                    <h3 className="text-lg font-medium text-red-400 mb-2 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" /> Danger Zone
                    </h3>
                    <p className="text-slate-400 mb-4">
                        Disabling MFA will make your account less secure. 
                        Please confirm by entering a code from your authenticator app.
                    </p>
                    <div className="flex gap-2 max-w-xs">
                        <input
                          type="text"
                          placeholder="000000"
                          value={mfaCode}
                          onChange={(e) => setMfaCode(e.target.value)}
                          className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-red-500"
                        />
                        <button
                            onClick={disableMfa}
                            disabled={isLoading || mfaCode.length < 6}
                            className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                            Disable MFA
                        </button>
                    </div>
                 </div>
            )}
        </div>
      </div>

      {message && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-xl shadow-lg animate-in slide-in-from-right-4 duration-300 ${
          message.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {message.text}
        </div>
      )}
    </div>
  );
}
