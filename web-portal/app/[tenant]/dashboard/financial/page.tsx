"use client";

import React, { useState, useEffect } from "react";
import { 
  CreditCard, 
  Plus, 
  Search, 
  Calendar, 
  DollarSign, 
  User as UserIcon,
  X, 
  Loader2, 
  CheckCircle,
  AlertCircle,
  FileText,
  Settings,
  Banknote,
  Check,
  XCircle
} from "lucide-react";
import { financialService, Bill, Payment, FeeDefinition } from "@/services/financialService";
import { userService, User } from "@/services/userService";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useConfirmation } from "@/context/ConfirmationContext";

export default function FinancialPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { confirm } = useConfirmation();
  const [activeTab, setActiveTab] = useState<'bills' | 'payments' | 'fees'>('bills');
  
  // Data States
  const [bills, setBills] = useState<Bill[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [fees, setFees] = useState<FeeDefinition[]>([]);
  const [residents, setResidents] = useState<User[]>([]);
  
  // UI States
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [showCreateBillModal, setShowCreateBillModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCreateFeeModal, setShowCreateFeeModal] = useState(false);
  
  // Selected Items
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

  // Forms
  const [billForm, setBillForm] = useState({
    resident_id: "",
    amount: "",
    description: "",
    due_date: ""
  });

  const handleGenerateMonthlyBills = async () => {
    if (!(await confirm({
      title: "Generate Bills",
      message: "Are you sure you want to generate monthly bills for all active residents?",
      confirmLabel: "Generate",
      variant: "warning"
    }))) return;
    setIsSubmitting(true);
    try {
        await financialService.generateMonthlyBills();
        await loadData();
        showToast("Monthly bills generated successfully", "success");
    } catch (err: any) {
        showToast(err.message || "Failed to generate bills", "error");
    } finally {
        setIsSubmitting(false);
    }
  };

  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    method: "transfer",
    reference_id: "",
    notes: ""
  });

  const [feeForm, setFeeForm] = useState({
    name: "",
    description: "",
    amount: "",
    is_active: true
  });

  useEffect(() => {
    loadData();
  }, [user, activeTab]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'bills') {
        const data = await financialService.getBills();
        setBills(data);
        if (user?.role === 'admin') {
           try {
             const feesData = await financialService.getFeeDefinitions();
             setFees(feesData);
           } catch (e) { console.error("Failed to load fees", e); }
        }
      } else if (activeTab === 'payments') {
        const data = await financialService.getPayments();
        setPayments(data);
      } else if (activeTab === 'fees' && user?.role === 'admin') {
        const data = await financialService.getFeeDefinitions();
        setFees(data);
      }
      
      if (user?.role === 'admin' && residents.length === 0) {
        const residentsData = await userService.getResidents();
        setResidents(residentsData);
      }
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBill = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await financialService.createBill({
        resident_id: parseInt(billForm.resident_id),
        amount: parseFloat(billForm.amount),
        description: billForm.description,
        due_date: new Date(billForm.due_date).toISOString()
      });
      await loadData();
      setShowCreateBillModal(false);
      setBillForm({ resident_id: "", amount: "", description: "", due_date: "" });
    } catch (err: any) {
      setError(err.message || "Failed to create bill");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await financialService.createPayment({
        bill_id: selectedBill?.id,
        amount: parseFloat(paymentForm.amount),
        method: paymentForm.method,
        reference: paymentForm.reference_id,
        notes: paymentForm.notes
      });
      await loadData(); // Reload current tab data
      // If we are in bills tab, we might want to reload bills. If in payments, reload payments.
      if (activeTab === 'bills') {
         const data = await financialService.getBills();
         setBills(data);
      }
      setShowPaymentModal(false);
      setSelectedBill(null);
      setPaymentForm({ amount: "", method: "transfer", reference_id: "", notes: "" });
    } catch (err: any) {
      setError(err.message || "Failed to record payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateFee = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await financialService.createFeeDefinition({
        name: feeForm.name,
        description: feeForm.description,
        amount: parseFloat(feeForm.amount),
        is_active: feeForm.is_active
      });
      await loadData();
      setShowCreateFeeModal(false);
      setFeeForm({ name: "", description: "", amount: "", is_active: true });
    } catch (err: any) {
      setError(err.message || "Failed to create fee definition");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentStatus = async (id: number, status: 'verified' | 'rejected') => {
      try {
          await financialService.updatePaymentStatus(id, status);
          await loadData();
      } catch (err) {
          console.error("Failed to update payment status", err);
      }
  };

  // Helper to open payment modal for a bill
  const openPaymentForBill = (bill: Bill) => {
      setSelectedBill(bill);
      setPaymentForm({
          ...paymentForm,
          amount: (bill.amount - (bill.payments?.reduce((acc, p) => acc + p.amount, 0) || 0)).toString(),
          notes: `Payment for: ${bill.description}`
      });
      setShowPaymentModal(true);
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': 
      case 'verified': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'overdue': 
      case 'rejected': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'pending': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Financial <span className="text-cyan-400">Management</span>
          </h1>
          <p className="text-slate-400">Manage billing, payments, and fees</p>
        </div>
        <div className="flex gap-2">
            {user?.role === 'admin' && activeTab === 'bills' && (
            <>
            <button
                onClick={handleGenerateMonthlyBills}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-semibold shadow-lg shadow-purple-600/20 active:scale-95 transition-all"
            >
                <Calendar className="w-5 h-5" />
                Generate Monthly
            </button>
            <button
                onClick={() => setShowCreateBillModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-semibold shadow-lg shadow-cyan-600/20 active:scale-95 transition-all"
            >
                <Plus className="w-5 h-5" />
                Create Bill
            </button>
            </>
            )}
            {user?.role === 'admin' && activeTab === 'fees' && (
            <button
                onClick={() => setShowCreateFeeModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-semibold shadow-lg shadow-cyan-600/20 active:scale-95 transition-all"
            >
                <Plus className="w-5 h-5" />
                Add Fee
            </button>
            )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-slate-800 pb-2">
        <button 
            onClick={() => setActiveTab('bills')}
            className={`px-4 py-2 font-medium transition-colors ${activeTab === 'bills' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400 hover:text-white'}`}
        >
            Bills
        </button>
        <button 
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-2 font-medium transition-colors ${activeTab === 'payments' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400 hover:text-white'}`}
        >
            Payments
        </button>
        {user?.role === 'admin' && (
            <button 
                onClick={() => setActiveTab('fees')}
                className={`px-4 py-2 font-medium transition-colors ${activeTab === 'fees' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400 hover:text-white'}`}
            >
                Fee Settings
            </button>
        )}
      </div>

      {/* Content */}
      <div className="glass rounded-2xl overflow-hidden border border-slate-800 min-h-[400px]">
          {isLoading ? (
              <div className="flex items-center justify-center h-full p-12">
                  <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
              </div>
          ) : (
              <>
                {/* BILLS TABLE */}
                {activeTab === 'bills' && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-950/50 border-b border-slate-800">
                                    <th className="p-6 text-sm font-semibold text-slate-400">Description</th>
                                    <th className="p-6 text-sm font-semibold text-slate-400">Amount</th>
                                    <th className="p-6 text-sm font-semibold text-slate-400">Status</th>
                                    <th className="p-6 text-sm font-semibold text-slate-400">Due Date</th>
                                    {user?.role === 'admin' && <th className="p-6 text-sm font-semibold text-slate-400">Resident ID</th>}
                                    {user?.role === 'admin' && <th className="p-6 text-sm font-semibold text-slate-400">Actions</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {bills.length === 0 ? (
                                    <tr><td colSpan={6} className="p-8 text-center text-slate-500">No bills found</td></tr>
                                ) : (
                                    bills.map(bill => (
                                        <tr key={bill.id} className="hover:bg-slate-800/30">
                                            <td className="p-6 font-medium text-white">{bill.description}</td>
                                            <td className="p-6 text-emerald-400 font-mono">${bill.amount.toFixed(2)}</td>
                                            <td className="p-6">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(bill.status)}`}>
                                                    {bill.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="p-6 text-slate-400 text-sm">{new Date(bill.due_date).toLocaleDateString()}</td>
                                            {user?.role === 'admin' && <td className="p-6 text-slate-400 text-sm">{bill.resident_id}</td>}
                                            {user?.role === 'admin' && (
                                                <td className="p-6">
                                                    {bill.status !== 'paid' && (
                                                        <button 
                                                            onClick={() => openPaymentForBill(bill)}
                                                            className="p-2 hover:bg-slate-700/50 rounded-lg text-emerald-400 hover:text-emerald-300"
                                                            title="Record Payment"
                                                        >
                                                            <DollarSign className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* PAYMENTS TABLE */}
                {activeTab === 'payments' && (
                     <div className="overflow-x-auto">
                     <table className="w-full text-left">
                         <thead>
                             <tr className="bg-slate-950/50 border-b border-slate-800">
                                 <th className="p-6 text-sm font-semibold text-slate-400">Date</th>
                                 <th className="p-6 text-sm font-semibold text-slate-400">Amount</th>
                                 <th className="p-6 text-sm font-semibold text-slate-400">Method</th>
                                 <th className="p-6 text-sm font-semibold text-slate-400">Reference</th>
                                 <th className="p-6 text-sm font-semibold text-slate-400">Status</th>
                                 <th className="p-6 text-sm font-semibold text-slate-400">User ID</th>
                                 {user?.role === 'admin' && <th className="p-6 text-sm font-semibold text-slate-400">Actions</th>}
                             </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-800">
                             {payments.length === 0 ? (
                                 <tr><td colSpan={7} className="p-8 text-center text-slate-500">No payments found</td></tr>
                             ) : (
                                 payments.map(payment => (
                                     <tr key={payment.id} className="hover:bg-slate-800/30">
                                         <td className="p-6 text-slate-400 text-sm">{new Date(payment.created_at).toLocaleDateString()}</td>
                                         <td className="p-6 text-emerald-400 font-mono">${payment.amount.toFixed(2)}</td>
                                         <td className="p-6 text-white capitalize">{payment.method}</td>
                                         <td className="p-6 text-slate-400 text-sm">{payment.reference || '-'}</td>
                                         <td className="p-6">
                                             <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(payment.status)}`}>
                                                 {payment.status.toUpperCase()}
                                             </span>
                                         </td>
                                         <td className="p-6 text-slate-400 text-sm">{payment.user_id}</td>
                                         {user?.role === 'admin' && (
                                             <td className="p-6 flex gap-2">
                                                 {payment.status === 'pending' && (
                                                     <>
                                                        <button 
                                                            onClick={() => handlePaymentStatus(payment.id, 'verified')}
                                                            className="p-2 hover:bg-emerald-500/20 rounded-lg text-emerald-400"
                                                            title="Verify"
                                                        >
                                                            <Check className="w-5 h-5" />
                                                        </button>
                                                        <button 
                                                            onClick={() => handlePaymentStatus(payment.id, 'rejected')}
                                                            className="p-2 hover:bg-rose-500/20 rounded-lg text-rose-400"
                                                            title="Reject"
                                                        >
                                                            <XCircle className="w-5 h-5" />
                                                        </button>
                                                     </>
                                                 )}
                                             </td>
                                         )}
                                     </tr>
                                 ))
                             )}
                         </tbody>
                     </table>
                 </div>
                )}

                {/* FEES TABLE */}
                {activeTab === 'fees' && (
                     <div className="overflow-x-auto">
                     <table className="w-full text-left">
                         <thead>
                             <tr className="bg-slate-950/50 border-b border-slate-800">
                                 <th className="p-6 text-sm font-semibold text-slate-400">Name</th>
                                 <th className="p-6 text-sm font-semibold text-slate-400">Description</th>
                                 <th className="p-6 text-sm font-semibold text-slate-400">Default Amount</th>
                                 <th className="p-6 text-sm font-semibold text-slate-400">Status</th>
                             </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-800">
                             {fees.length === 0 ? (
                                 <tr><td colSpan={4} className="p-8 text-center text-slate-500">No fee definitions found</td></tr>
                             ) : (
                                 fees.map(fee => (
                                     <tr key={fee.id} className="hover:bg-slate-800/30">
                                         <td className="p-6 font-medium text-white">{fee.name}</td>
                                         <td className="p-6 text-slate-400">{fee.description || '-'}</td>
                                         <td className="p-6 text-emerald-400 font-mono">${fee.amount.toFixed(2)}</td>
                                         <td className="p-6">
                                             <span className={`px-3 py-1 rounded-full text-xs font-medium border ${fee.is_active ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-slate-400 bg-slate-500/10 border-slate-500/20'}`}>
                                                 {fee.is_active ? 'ACTIVE' : 'INACTIVE'}
                                             </span>
                                         </td>
                                     </tr>
                                 ))
                             )}
                         </tbody>
                     </table>
                 </div>
                )}
              </>
          )}
      </div>

      {/* MODALS */}
      
      {/* Create Bill Modal */}
      {showCreateBillModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative">
            <button onClick={() => setShowCreateBillModal(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
            <h2 className="text-2xl font-bold text-white mb-6">Create New Bill</h2>
            
            {error && <div className="mb-4 text-rose-400 text-sm">{error}</div>}

            <form onSubmit={handleCreateBill} className="space-y-4">
              <div>
                  <label className="text-slate-400 text-sm">Resident</label>
                  <select 
                    required 
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-white"
                    value={billForm.resident_id}
                    onChange={e => setBillForm({...billForm, resident_id: e.target.value})}
                  >
                      <option value="">Select Resident</option>
                      {residents.map(r => <option key={r.id} value={r.id}>{r.full_name}</option>)}
                  </select>
              </div>
              <div>
                  <label className="text-slate-400 text-sm">Fee Type (Optional)</label>
                  <select 
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-white"
                    onChange={e => {
                        const fee = fees.find(f => f.id === parseInt(e.target.value));
                        if (fee) {
                            setBillForm(prev => ({
                                ...prev,
                                description: fee.name,
                                amount: fee.amount.toString()
                            }));
                        }
                    }}
                  >
                      <option value="">Custom Bill</option>
                      {fees.filter(f => f.is_active).map(f => <option key={f.id} value={f.id}>{f.name} (${f.amount})</option>)}
                  </select>
              </div>
              <div>
                  <label className="text-slate-400 text-sm">Description</label>
                  <input 
                    required 
                    type="text" 
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-white"
                    value={billForm.description}
                    onChange={e => setBillForm({...billForm, description: e.target.value})}
                  />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-400 text-sm">Amount</label>
                    <input 
                        required 
                        type="number" 
                        step="0.01" 
                        className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-white"
                        value={billForm.amount}
                        onChange={e => setBillForm({...billForm, amount: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-sm">Due Date</label>
                    <input 
                        required 
                        type="date" 
                        className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-white"
                        value={billForm.due_date}
                        onChange={e => setBillForm({...billForm, due_date: e.target.value})}
                    />
                  </div>
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full py-3 mt-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold">
                  {isSubmitting ? 'Creating...' : 'Create Bill'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Create Fee Modal */}
      {showCreateFeeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative">
            <button onClick={() => setShowCreateFeeModal(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
            <h2 className="text-2xl font-bold text-white mb-6">Add Fee Definition</h2>
            
            {error && <div className="mb-4 text-rose-400 text-sm">{error}</div>}

            <form onSubmit={handleCreateFee} className="space-y-4">
              <div>
                  <label className="text-slate-400 text-sm">Fee Name</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="e.g. Monthly Levy"
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-white"
                    value={feeForm.name}
                    onChange={e => setFeeForm({...feeForm, name: e.target.value})}
                  />
              </div>
              <div>
                  <label className="text-slate-400 text-sm">Description</label>
                  <input 
                    type="text" 
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-white"
                    value={feeForm.description}
                    onChange={e => setFeeForm({...feeForm, description: e.target.value})}
                  />
              </div>
              <div>
                  <label className="text-slate-400 text-sm">Default Amount</label>
                  <input 
                    required 
                    type="number" 
                    step="0.01"
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-white"
                    value={feeForm.amount}
                    onChange={e => setFeeForm({...feeForm, amount: e.target.value})}
                  />
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full py-3 mt-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold">
                  {isSubmitting ? 'Saving...' : 'Save Fee Definition'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative">
            <button onClick={() => setShowPaymentModal(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
            <h2 className="text-2xl font-bold text-white mb-6">Record Payment</h2>
            
            {error && <div className="mb-4 text-rose-400 text-sm">{error}</div>}

            <form onSubmit={handleCreatePayment} className="space-y-4">
              <div>
                  <label className="text-slate-400 text-sm">Amount</label>
                  <input 
                    required 
                    type="number" 
                    step="0.01"
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-white"
                    value={paymentForm.amount}
                    onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})}
                  />
              </div>
              <div>
                  <label className="text-slate-400 text-sm">Payment Method</label>
                  <select 
                    required 
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-white"
                    value={paymentForm.method}
                    onChange={e => setPaymentForm({...paymentForm, method: e.target.value})}
                  >
                      <option value="cash">Cash</option>
                      <option value="ecocash">EcoCash</option>
                      <option value="onemoney">OneMoney</option>
                      <option value="zipit">Zipit</option>
                      <option value="other">Other</option>
                  </select>
              </div>
              <div>
                  <label className="text-slate-400 text-sm">Reference ID</label>
                  <input 
                    type="text" 
                    placeholder="Transaction ID / Receipt No."
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-white"
                    value={paymentForm.reference_id}
                    onChange={e => setPaymentForm({...paymentForm, reference_id: e.target.value})}
                  />
              </div>
              <div>
                  <label className="text-slate-400 text-sm">Notes</label>
                  <textarea 
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-white"
                    value={paymentForm.notes}
                    onChange={e => setPaymentForm({...paymentForm, notes: e.target.value})}
                  />
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full py-3 mt-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold">
                  {isSubmitting ? 'Recording...' : 'Record Payment'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
