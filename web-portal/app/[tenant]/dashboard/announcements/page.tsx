"use client";

import React, { useState, useEffect } from "react";
import { 
  Megaphone, 
  Plus, 
  AlertTriangle, 
  Info, 
  CheckCircle,
  Trash2
} from "lucide-react";
import { noticeService, Notice } from "@/services/noticeService";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";

export default function AnnouncementsPage() {
  const { user } = useAuth();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newNotice, setNewNotice] = useState({
    title: "",
    content: "",
    priority: "medium" as "low" | "medium" | "high"
  });

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const data = await noticeService.getAllNotices();
      setNotices(data);
    } catch (error) {
      console.error("Failed to fetch notices:", error);
      toast.error("Failed to load announcements");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await noticeService.createNotice(newNotice);
      toast.success("Announcement posted successfully");
      setShowModal(false);
      setNewNotice({ title: "", content: "", priority: "medium" });
      fetchNotices();
    } catch (error) {
      console.error("Failed to create notice:", error);
      toast.error("Failed to post announcement");
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'medium': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      default: return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="w-5 h-5" />;
      case 'medium': return <Info className="w-5 h-5" />;
      default: return <CheckCircle className="w-5 h-5" />;
    }
  };

  return (
    <div className="dashboard-body min-h-screen p-6">
      {/* Header */}
      <div className="glass rounded-2xl p-6 mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Megaphone className="w-8 h-8 text-cyan-400" />
            Announcements
          </h1>
          <p className="text-slate-400">Manage community-wide notifications</p>
        </div>
        
        {user?.role === 'admin' && (
          <button 
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl text-white font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Announcement
          </button>
        )}
      </div>

      {/* Notices List */}
      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <div className="text-center py-20 text-slate-400">Loading...</div>
        ) : notices.length === 0 ? (
          <div className="text-center py-20 glass rounded-2xl">
            <Megaphone className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No announcements yet.</p>
          </div>
        ) : (
          notices.map((notice) => (
            <div key={notice.id} className="glass rounded-xl p-6 hover:bg-white/5 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-2 ${getPriorityColor(notice.priority)}`}>
                      {getPriorityIcon(notice.priority)}
                      {notice.priority.toUpperCase()}
                    </span>
                    <span className="text-slate-500 text-sm">
                      {new Date(notice.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{notice.title}</h3>
                  <p className="text-slate-300 whitespace-pre-wrap">{notice.content}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="glass rounded-2xl w-full max-w-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-6">New Announcement</h2>
            
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={newNotice.title}
                  onChange={e => setNewNotice({...newNotice, title: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                  placeholder="e.g., Water Maintenance"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Priority</label>
                <select
                  value={newNotice.priority}
                  onChange={e => setNewNotice({...newNotice, priority: e.target.value as any})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Content</label>
                <textarea
                  required
                  rows={4}
                  value={newNotice.content}
                  onChange={e => setNewNotice({...newNotice, content: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                  placeholder="Enter details..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl text-white font-semibold hover:opacity-90 transition-opacity"
                >
                  Post Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
