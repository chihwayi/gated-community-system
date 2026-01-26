import React, { useState, useEffect } from "react";
import { 
  LifeBuoy,
  Plus,
  X,
  Loader2,
  AlertCircle,
  CheckCircle,
  Wrench,
  Zap,
  Shield,
  Volume2,
  Trash2,
  Leaf,
  MoreHorizontal
} from "lucide-react";
import { ticketService, Ticket, TicketCreate, TicketCategory, TicketPriority } from "@/services/ticketService";

export default function HelpdeskSection() {
  const [activeTab, setActiveTab] = useState<'open' | 'closed'>('open');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [ticketForm, setTicketForm] = useState<TicketCreate>({
    title: "",
    description: "",
    category: "other" as TicketCategory,
    priority: "medium" as TicketPriority,
    location: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await ticketService.getTickets();
      setTickets(data);
    } catch (err) {
      console.error("Failed to load tickets", err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTickets = tickets.filter(t => 
    activeTab === 'open' 
      ? ['open', 'in_progress'].includes(t.status)
      : ['resolved', 'closed'].includes(t.status)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await ticketService.createTicket(ticketForm);
      await loadData();
      setIsSuccess(true);
      setTicketForm({
        title: "",
        description: "",
        category: "other" as TicketCategory,
        priority: "medium" as TicketPriority,
        location: ""
      });
    } catch (err: any) {
      setError(err.message || "Failed to create ticket");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'plumbing': return <Wrench className="w-4 h-4" />;
      case 'electrical': return <Zap className="w-4 h-4" />;
      case 'security': return <Shield className="w-4 h-4" />;
      case 'noise': return <Volume2 className="w-4 h-4" />;
      case 'cleaning': return <Trash2 className="w-4 h-4" />;
      case 'landscaping': return <Leaf className="w-4 h-4" />;
      default: return <MoreHorizontal className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'in_progress': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'resolved': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'closed': return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-rose-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-blue-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex p-1 bg-slate-900/50 rounded-xl border border-white/5 w-fit">
          <button
            onClick={() => setActiveTab('open')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'open' 
                ? 'bg-cyan-500/10 text-cyan-400 shadow-sm' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Open Tickets
          </button>
          <button
            onClick={() => setActiveTab('closed')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'closed' 
                ? 'bg-cyan-500/10 text-cyan-400 shadow-sm' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            History
          </button>
        </div>

        <button
          onClick={() => { setShowCreateModal(true); setIsSuccess(false); setError(null); }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-semibold shadow-lg shadow-cyan-900/20 active:scale-95 transition-all text-sm"
        >
          <Plus className="w-4 h-4" />
          Report Issue
        </button>
      </div>

      {/* Content */}
      <div className="rounded-2xl bg-slate-900/50 border border-white/5 overflow-hidden backdrop-blur-sm min-h-[300px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
          </div>
        ) : (
          <div className="grid gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTickets.length === 0 ? (
              <div className="col-span-full p-8 text-center text-slate-500">No tickets found</div>
            ) : (
              filteredTickets.map(ticket => (
                <div key={ticket.id} className="p-5 rounded-xl bg-slate-950/50 border border-white/5 hover:border-cyan-500/30 transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-slate-900 text-cyan-400 group-hover:bg-cyan-500/20 transition-colors">
                        {getCategoryIcon(ticket.category)}
                      </div>
                      <span className={`text-xs font-bold uppercase tracking-wider ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}>
                      {ticket.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-slate-200 mb-2">{ticket.title}</h3>
                  <p className="text-slate-400 text-sm line-clamp-2 mb-4">{ticket.description}</p>
                  
                  <div className="flex items-center justify-between text-xs text-slate-500 mt-auto pt-4 border-t border-white/5">
                    <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                    <span>#{ticket.id}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative">
            <button 
              onClick={() => setShowCreateModal(false)} 
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/5 text-slate-500 hover:text-white transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            
            {isSuccess ? (
              <div className="text-center py-8 animate-in zoom-in-50 duration-300">
                <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Ticket Submitted!</h2>
                <p className="text-slate-400 mb-8 max-w-xs mx-auto">
                  Your issue has been reported. We'll look into it shortly.
                </p>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-cyan-500/10 rounded-xl">
                <LifeBuoy className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Report an Issue</h2>
                <p className="text-sm text-slate-400">Describe the problem you're facing</p>
              </div>
            </div>
            
            {error && (
              <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-400 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400 ml-1">Title</label>
                <input 
                  required 
                  type="text"
                  placeholder="Brief summary of the issue"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                  value={ticketForm.title}
                  onChange={e => setTicketForm({...ticketForm, title: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400 ml-1">Category</label>
                  <select 
                    required 
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all appearance-none"
                    value={ticketForm.category}
                    onChange={e => setTicketForm({...ticketForm, category: e.target.value as TicketCategory})}
                  >
                    <option value="plumbing">Plumbing</option>
                    <option value="electrical">Electrical</option>
                    <option value="security">Security</option>
                    <option value="noise">Noise Complaint</option>
                    <option value="cleaning">Cleaning</option>
                    <option value="landscaping">Landscaping</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400 ml-1">Priority</label>
                  <select 
                    required 
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all appearance-none"
                    value={ticketForm.priority}
                    onChange={e => setTicketForm({...ticketForm, priority: e.target.value as TicketPriority})}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400 ml-1">Location</label>
                <input 
                  type="text"
                  placeholder="e.g. Block A, Corridor, Apt 101"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                  value={ticketForm.location}
                  onChange={e => setTicketForm({...ticketForm, location: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400 ml-1">Description</label>
                <textarea 
                  required
                  rows={3}
                  placeholder="Detailed description of the issue..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all resize-none"
                  value={ticketForm.description}
                  onChange={e => setTicketForm({...ticketForm, description: e.target.value})}
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full py-3.5 mt-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-bold shadow-lg shadow-cyan-900/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Submitting...</span>
                  </div>
                ) : 'Submit Ticket'}
              </button>
            </form>
            </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
