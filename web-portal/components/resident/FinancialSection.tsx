import React, { useState, useEffect } from "react";
import { 
  CreditCard, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  DollarSign, 
  Plus,
  X,
  Loader2,
  FileText
} from "lucide-react";
import { financialService, Bill, Payment } from "@/services/financialService";

export default function FinancialSection() {
  const [activeTab, setActiveTab] = useState<'bills' | 'payments'>('bills');
  const [bills, setBills] = useState<Bill[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    method: "transfer", // default
    reference_id: "",
    notes: ""
  });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'bills') {
        const data = await financialService.getBills();
        setBills(data);
      } else {
        const data = await financialService.getPayments();
        setPayments(data);
      }
    } catch (err) {
      console.error("Failed to load financial data", err);
    } finally {
      setIsLoading(false);
    }
  };

  const openPaymentForBill = (bill: Bill) => {
    setSelectedBill(bill);
    // Calculate remaining amount
    const paidAmount = bill.payments?.reduce((acc, p) => acc + (p.status === 'verified' ? p.amount : 0), 0) || 0;
    const remaining = Math.max(0, bill.amount - paidAmount);
    
    setPaymentForm({
      amount: remaining.toString(),
      method: "ecocash",
      reference_id: "",
      notes: `Payment for: ${bill.description}`
    });
    setShowPaymentModal(true);
  };

  const openGeneralPayment = () => {
    setSelectedBill(null);
    setPaymentForm({
      amount: "",
      method: "ecocash",
      reference_id: "",
      notes: ""
    });
    setShowPaymentModal(true);
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await financialService.createPayment({
        bill_id: selectedBill?.id,
        amount: parseFloat(paymentForm.amount),
        method: paymentForm.method as any,
        reference: paymentForm.reference_id,
        notes: paymentForm.notes
      });
      
      await loadData();
      setIsSuccess(true);
      setPaymentForm({ amount: "", method: "ecocash", reference_id: "", notes: "" });
      setSelectedBill(null);
    } catch (err: any) {
      setError(err.message || "Failed to record payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': 
      case 'verified': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'overdue': 
      case 'rejected': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'pending': 
      case 'partial': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex p-1 bg-slate-900/50 rounded-xl border border-white/5 w-fit">
          <button
            onClick={() => setActiveTab('bills')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'bills' 
                ? 'bg-cyan-500/10 text-cyan-400 shadow-sm' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            My Bills
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'payments' 
                ? 'bg-cyan-500/10 text-cyan-400 shadow-sm' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Payment History
          </button>
        </div>

        <button
          onClick={openGeneralPayment}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-semibold shadow-lg shadow-cyan-900/20 active:scale-95 transition-all text-sm"
        >
          <Plus className="w-4 h-4" />
          Make Payment
        </button>
      </div>

      {/* Content */}
      <div className="rounded-2xl bg-slate-900/50 border border-white/5 overflow-hidden backdrop-blur-sm min-h-[300px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            {activeTab === 'bills' ? (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-950/50 border-b border-white/5">
                    <th className="p-5 text-sm font-semibold text-slate-400">Description</th>
                    <th className="p-5 text-sm font-semibold text-slate-400">Due Date</th>
                    <th className="p-5 text-sm font-semibold text-slate-400">Amount</th>
                    <th className="p-5 text-sm font-semibold text-slate-400">Status</th>
                    <th className="p-5 text-sm font-semibold text-slate-400">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {bills.length === 0 ? (
                    <tr><td colSpan={5} className="p-8 text-center text-slate-500">No bills found</td></tr>
                  ) : (
                    bills.map(bill => (
                      <tr key={bill.id} className="hover:bg-white/5 transition-colors group">
                        <td className="p-5 font-medium text-slate-200">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-slate-800 text-slate-400 group-hover:bg-cyan-500/10 group-hover:text-cyan-400 transition-colors">
                              <FileText className="w-4 h-4" />
                            </div>
                            {bill.description}
                          </div>
                        </td>
                        <td className="p-5 text-slate-400 text-sm">
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(bill.due_date).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="p-5 text-emerald-400 font-mono font-medium">${bill.amount.toFixed(2)}</td>
                        <td className="p-5">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 w-fit ${getStatusColor(bill.status)}`}>
                            {bill.status === 'paid' && <CheckCircle className="w-3 h-3" />}
                            {bill.status === 'overdue' && <AlertCircle className="w-3 h-3" />}
                            {bill.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-5">
                          {bill.status !== 'paid' && (
                            <button 
                              onClick={() => openPaymentForBill(bill)}
                              className="px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 text-xs font-medium transition-colors"
                            >
                              Pay Now
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-950/50 border-b border-white/5">
                    <th className="p-5 text-sm font-semibold text-slate-400">Date</th>
                    <th className="p-5 text-sm font-semibold text-slate-400">Method</th>
                    <th className="p-5 text-sm font-semibold text-slate-400">Reference</th>
                    <th className="p-5 text-sm font-semibold text-slate-400">Amount</th>
                    <th className="p-5 text-sm font-semibold text-slate-400">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {payments.length === 0 ? (
                    <tr><td colSpan={5} className="p-8 text-center text-slate-500">No payments history</td></tr>
                  ) : (
                    payments.map(payment => (
                      <tr key={payment.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-5 text-slate-400 text-sm">{new Date(payment.created_at).toLocaleDateString()}</td>
                        <td className="p-5 text-slate-200 capitalize">{payment.method}</td>
                        <td className="p-5 text-slate-400 text-sm font-mono">{payment.reference || '-'}</td>
                        <td className="p-5 text-emerald-400 font-mono font-medium">${payment.amount.toFixed(2)}</td>
                        <td className="p-5">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(payment.status)}`}>
                            {payment.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative">
            <button 
              onClick={() => { setShowPaymentModal(false); setIsSuccess(false); setError(null); }} 
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/5 text-slate-500 hover:text-white transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            
            {isSuccess ? (
              <div className="text-center py-8 animate-in zoom-in-50 duration-300">
                <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Payment Recorded!</h2>
                <p className="text-slate-400 mb-8 max-w-xs mx-auto">
                  Your payment has been successfully submitted and is pending verification by the admin.
                </p>
                <button 
                  onClick={() => { setShowPaymentModal(false); setIsSuccess(false); setError(null); }}
                  className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-cyan-500/10 rounded-xl">
                <DollarSign className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Record Payment</h2>
                <p className="text-sm text-slate-400">Enter payment details for verification</p>
              </div>
            </div>
            
            {error && (
              <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-400 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmitPayment} className="space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400 ml-1">Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-slate-500">$</span>
                    <input 
                      required 
                      type="number" 
                      step="0.01"
                      className="w-full pl-8 pr-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all font-mono"
                      value={paymentForm.amount}
                      onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400 ml-1">Method</label>
                  <select 
                    required 
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all appearance-none"
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
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400 ml-1">Reference ID / Proof</label>
                <input 
                  type="text" 
                  placeholder="e.g. Transaction ID, Receipt No."
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                  value={paymentForm.reference_id}
                  onChange={e => setPaymentForm({...paymentForm, reference_id: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400 ml-1">Notes</label>
                <textarea 
                  rows={3}
                  placeholder="Additional details..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all resize-none"
                  value={paymentForm.notes}
                  onChange={e => setPaymentForm({...paymentForm, notes: e.target.value})}
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
                    <span>Processing...</span>
                  </div>
                ) : 'Submit Payment'}
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
