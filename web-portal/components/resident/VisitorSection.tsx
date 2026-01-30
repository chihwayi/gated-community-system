import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  Users, 
  ChevronRight,
  Loader2,
  LogOut,
  X
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { visitorService, Visitor } from "@/services/visitorService";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

export default function VisitorSection() {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    phone_number: "",
    purpose: "",
    expected_arrival_date: "",
    expected_arrival_time: "",
    visitor_type: "visitor",
    valid_until_date: "",
    valid_until_time: ""
  });
  
  // Exit Pass State
  const [exitPassVisitor, setExitPassVisitor] = useState<Visitor | null>(null);
  const [exitPassItems, setExitPassItems] = useState("");

  useEffect(() => {
    fetchVisitors();
  }, []);

  const fetchVisitors = async () => {
    try {
      const data = await visitorService.getMyVisitors();
      setVisitors(data.reverse()); // Show newest first
    } catch (error) {
      console.error("Failed to fetch visitors", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      let expected_arrival = undefined;
      if (formData.expected_arrival_date && formData.expected_arrival_time) {
        expected_arrival = `${formData.expected_arrival_date}T${formData.expected_arrival_time}:00`;
      }

      let valid_until = undefined;
      if (formData.valid_until_date && formData.valid_until_time) {
        valid_until = `${formData.valid_until_date}T${formData.valid_until_time}:00`;
      }

      const newVisitor = await visitorService.createVisitor({
        full_name: formData.full_name,
        phone_number: formData.phone_number,
        purpose: formData.purpose,
        expected_arrival: expected_arrival,
        visitor_type: formData.visitor_type,
        valid_until: valid_until,
        host_id: user?.id || 1
      });

      setGeneratedCode(newVisitor.access_code);
      setFormData({
        full_name: "",
        phone_number: "",
        purpose: "",
        expected_arrival_date: "",
        expected_arrival_time: "",
        visitor_type: "visitor",
        valid_until_date: "",
        valid_until_time: ""
      });
      fetchVisitors();
      showToast("Visitor registered successfully", "success");
    } catch (error) {
      console.error("Failed to register visitor", error);
      showToast("Failed to register visitor", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateExitPass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exitPassVisitor) return;
    
    setIsLoading(true);
    try {
      await visitorService.updateVisitor(exitPassVisitor.id, {
        allowed_items_out: exitPassItems
      });
      showToast("Exit pass updated successfully", "success");
      setExitPassVisitor(null);
      setExitPassItems("");
      fetchVisitors();
    } catch (error) {
      console.error("Failed to update exit pass", error);
      showToast("Failed to update exit pass", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Visitor Registration Form */}
      <div className="rounded-2xl bg-slate-900/50 border border-white/5 overflow-hidden backdrop-blur-sm">
        <div className="p-6 border-b border-white/5">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Plus className="w-5 h-5 text-cyan-400" />
            Register New Visitor
          </h3>
        </div>
        
        <div className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400 ml-1">Visitor Name</label>
                <input 
                  type="text" 
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. John Doe" 
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-950/50 border border-white/10 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400 ml-1">Phone Number</label>
                <input 
                  type="tel" 
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. +263 77 123 4567" 
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-950/50 border border-white/10 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all font-mono" 
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400 ml-1">Visitor Type</label>
                <select 
                  name="visitor_type"
                  value={formData.visitor_type}
                  onChange={handleInputChange} 
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-950/50 border border-white/10 text-slate-100 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all appearance-none"
                >
                  <option value="visitor">Visitor</option>
                  <option value="maid">Maid</option>
                  <option value="contractor">Contractor</option>
                  <option value="delivery">Delivery</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400 ml-1">Purpose</label>
                <input 
                  type="text" 
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleInputChange}
                  placeholder="e.g. Social visit" 
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-950/50 border border-white/10 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400 ml-1">Expected Arrival Date</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-3.5 w-5 h-5 text-slate-600" />
                  <input 
                    type="date" 
                    name="expected_arrival_date"
                    value={formData.expected_arrival_date}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-950/50 border border-white/10 text-slate-100 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all [color-scheme:dark]" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400 ml-1">Expected Arrival Time</label>
                <div className="relative">
                  <Clock className="absolute left-4 top-3.5 w-5 h-5 text-slate-600" />
                  <input 
                    type="time" 
                    name="expected_arrival_time"
                    value={formData.expected_arrival_time}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-950/50 border border-white/10 text-slate-100 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all font-mono [color-scheme:dark]" 
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400 ml-1">Valid Until Date</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-3.5 w-5 h-5 text-slate-600" />
                  <input 
                    type="date" 
                    name="valid_until_date"
                    value={formData.valid_until_date}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-950/50 border border-white/10 text-slate-100 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all [color-scheme:dark]" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400 ml-1">Valid Until Time</label>
                <div className="relative">
                  <Clock className="absolute left-4 top-3.5 w-5 h-5 text-slate-600" />
                  <input 
                    type="time" 
                    name="valid_until_time"
                    value={formData.valid_until_time}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-950/50 border border-white/10 text-slate-100 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all font-mono [color-scheme:dark]" 
                  />
                </div>
              </div>
            </div>
            
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold py-4 rounded-xl shadow-lg shadow-cyan-900/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                  Generate Access Code
                </>
              )}
            </button>
          </form>

          {/* Generated Code Display */}
          {generatedCode && (
            <div className="mt-8 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex flex-col items-center animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-4">
                <ShieldCheck className="w-5 h-5" />
                <span>Access Code Generated Successfully</span>
              </div>
              
              <div className="p-4 bg-white rounded-xl shadow-lg mb-4">
                <QRCodeSVG value={generatedCode} size={160} level="H" />
              </div>
              
              <div className="text-center space-y-2">
                <p className="text-4xl font-bold font-mono text-emerald-400 tracking-wider tabular-nums">
                  {generatedCode}
                </p>
                <p className="text-sm text-emerald-500/80">Share this code or QR with your visitor</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Visitors List */}
      <div className="rounded-2xl bg-slate-900/50 border border-white/5 overflow-hidden backdrop-blur-sm">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-100">Recent Visitors</h3>
          <button className="text-sm text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 transition-colors">
            View All <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        
        <div className="p-2">
          {visitors.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No visitors found</p>
            </div>
          ) : (
            visitors.map((visitor) => (
              <div 
                key={visitor.id} 
                className="group flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg ${
                    visitor.status === 'checked_in' 
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-600' 
                      : 'bg-gradient-to-br from-slate-700 to-slate-800 border border-white/10'
                  }`}>
                    {visitor.full_name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-200 group-hover:text-white transition-colors">{visitor.full_name}</p>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">{visitor.phone_number}</p>
                  </div>
                </div>
                
                <div className="text-right flex flex-col items-end gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${
                    visitor.status === 'checked_in' 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : visitor.status === 'checked_out'
                      ? 'bg-slate-800 text-slate-400 border-slate-700'
                      : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      visitor.status === 'checked_in' ? 'bg-emerald-400 animate-pulse' : 
                      visitor.status === 'checked_out' ? 'bg-slate-500' : 'bg-blue-400'
                    }`} />
                    {visitor.status === 'checked_in' ? 'Inside' : 
                     visitor.status === 'checked_out' ? 'Left' : 
                     'Pending'}
                  </span>
                  
                  {visitor.status === 'checked_in' && (
                    <button
                      onClick={() => {
                        setExitPassVisitor(visitor);
                        setExitPassItems(visitor.allowed_items_out || "");
                      }}
                      className="text-xs flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      <LogOut className="w-3 h-3" />
                      {visitor.allowed_items_out ? 'Edit Exit Pass' : 'Add Exit Pass'}
                    </button>
                  )}
                  
                  <p className="text-xs text-slate-600 font-mono">
                    {new Date(visitor.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Exit Pass Modal */}
      {exitPassVisitor && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 w-full max-w-md rounded-2xl border border-white/10 p-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <LogOut className="w-5 h-5 text-cyan-400" />
                Exit Pass
              </h3>
              <button 
                onClick={() => setExitPassVisitor(null)}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateExitPass} className="space-y-4">
              <div>
                 <p className="text-sm text-slate-400 mb-2">
                   Authorize items for <strong>{exitPassVisitor.full_name}</strong> to take out of the community.
                 </p>
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Allowed Items</label>
                 <textarea
                   value={exitPassItems}
                   onChange={(e) => setExitPassItems(e.target.value)}
                   placeholder="e.g. Laptop, Tools, Furniture..."
                   className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all min-h-[100px]"
                 />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setExitPassVisitor(null)}
                  className="flex-1 py-3 rounded-xl font-medium hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-medium shadow-lg shadow-cyan-900/20 transition-all"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Save Pass'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
