import Link from "next/link";
import { ArrowRight, Shield, User } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col items-center justify-center p-6 text-white">
      <div className="max-w-4xl w-full text-center space-y-12">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600">
            Gated Community System
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            A comprehensive visitor and estate management solution.
            Secure, efficient, and user-friendly.
          </p>
          <div className="pt-4">
            <Link 
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full font-semibold transition-all backdrop-blur-sm border border-white/10"
            >
              <User className="w-5 h-5" />
              Sign In to Portal
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          <Link 
            href="/dashboard"
            className="group relative overflow-hidden rounded-2xl bg-white/5 p-8 hover:bg-white/10 transition-all border border-white/10 hover:border-cyan-500/50"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-cyan-500/20 text-cyan-400">
                <Shield className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold">Estate Manager</h2>
              <p className="text-slate-400 text-sm">
                Access the admin dashboard to manage residents, visitors, and security.
              </p>
              <div className="flex items-center gap-2 text-cyan-400 font-medium mt-2">
                Launch Dashboard <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          <Link 
            href="/resident"
            className="group relative overflow-hidden rounded-2xl bg-white/5 p-8 hover:bg-white/10 transition-all border border-white/10 hover:border-purple-500/50"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-purple-500/20 text-purple-400">
                <User className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold">Resident Portal</h2>
              <p className="text-slate-400 text-sm">
                Login to manage your visitors, payments, and view community notices.
              </p>
              <div className="flex items-center gap-2 text-purple-400 font-medium mt-2">
                Enter Portal <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        </div>

        <div className="pt-12 text-slate-500 text-sm">
          <p>© 2026 Gated Community System. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
