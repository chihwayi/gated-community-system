"use client";

import React, { useState, useEffect } from "react";
import { 
  FileText, 
  Download, 
  Filter, 
  Calendar, 
  Loader2,
  FileSpreadsheet,
  Users,
  Briefcase,
  AlertTriangle,
  CreditCard,
  Building
} from "lucide-react";
import { visitorService } from "@/services/visitorService";
import { staffService } from "@/services/staffService";
import { incidentService } from "@/services/incidentService";
import { financialService } from "@/services/financialService";
import { bookingService } from "@/services/bookingService";

type ReportType = 'visitors' | 'staff' | 'incidents' | 'payments' | 'amenities';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportType>('visitors');
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Filter states
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchReportData = async () => {
    setIsLoading(true);
    try {
      const params = {
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        endDate: endDate ? new Date(endDate).toISOString() : undefined
      };

      let result;
      switch (activeTab) {
        case 'visitors':
          result = await visitorService.getAllVisitors({
            ...params,
            status: undefined // Add status filter UI later if needed
          });
          break;
        case 'staff':
          result = await staffService.getAllAttendance(params);
          break;
        case 'incidents':
          result = await incidentService.getIncidents(params);
          break;
        case 'payments':
          result = await financialService.getPayments(params);
          break;
        case 'amenities':
          result = await bookingService.getBookings(params);
          break;
      }
      setData(result || []);
    } catch (error) {
      console.error("Failed to fetch report data:", error);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [activeTab]);

  const downloadCSV = () => {
    if (data.length === 0) return;

    let headers: string[] = [];
    let rows: string[][] = [];

    switch (activeTab) {
      case 'visitors':
        headers = ["ID", "Visitor Name", "Host ID", "Purpose", "Status", "Arrival Time", "Check In", "Check Out", "Vehicle"];
        rows = data.map(v => [
          v.id,
          `"${v.full_name}"`,
          v.host_id,
          `"${v.purpose || ''}"`,
          v.status,
          v.expected_arrival || '',
          v.check_in_time || '',
          v.check_out_time || '',
          v.vehicle_number || ''
        ]);
        break;
      case 'staff':
        headers = ["ID", "Staff ID", "Check In", "Check Out", "Status"];
        rows = data.map(s => [
          s.id,
          s.staff_id,
          s.check_in_time || '',
          s.check_out_time || '',
          s.status
        ]);
        break;
      case 'incidents':
        headers = ["ID", "Title", "Description", "Location", "Priority", "Status", "Reporter ID", "Created At"];
        rows = data.map(i => [
          i.id,
          `"${i.title}"`,
          `"${i.description}"`,
          `"${i.location || ''}"`,
          i.priority,
          i.status,
          i.reporter_id,
          i.created_at
        ]);
        break;
      case 'payments':
        headers = ["ID", "User ID", "Amount", "Method", "Status", "Bill ID", "Reference", "Date"];
        rows = data.map(p => [
          p.id,
          p.user_id,
          (p.amount / 100).toFixed(2),
          p.method,
          p.status,
          p.bill_id || '',
          p.reference || '',
          p.created_at
        ]);
        break;
      case 'amenities':
        headers = ["ID", "User ID", "Amenity ID", "Start Time", "End Time", "Status", "Notes"];
        rows = data.map(b => [
          b.id,
          b.user_id,
          b.amenity_id,
          b.start_time,
          b.end_time,
          b.status,
          `"${b.notes || ''}"`
        ]);
        break;
    }

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${activeTab}_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const tabs = [
    { id: 'visitors', label: 'Visitors', icon: Users },
    { id: 'staff', label: 'Staff Attendance', icon: Briefcase },
    { id: 'incidents', label: 'Incidents', icon: AlertTriangle },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'amenities', label: 'Amenities', icon: Building },
  ];

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            System <span className="text-cyan-400">Reports</span>
          </h1>
          <p className="text-slate-400">Generate and download system audits</p>
        </div>
        <button
          onClick={downloadCSV}
          disabled={data.length === 0}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-semibold shadow-lg shadow-emerald-600/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FileSpreadsheet className="w-5 h-5" />
          Download CSV
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as ReportType)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === tab.id 
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' 
                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-300'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="glass p-6 rounded-2xl mb-6">
        <div className="flex items-center gap-2 mb-4 text-slate-400 text-sm font-medium">
          <Filter className="w-4 h-4" />
          Filter Options
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs text-slate-500 ml-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-500 ml-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={fetchReportData}
              className="w-full px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply Filters"}
            </button>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="glass rounded-2xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-950/50 border-b border-slate-800">
                {activeTab === 'visitors' && (
                  <>
                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase">Date</th>
                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase">Visitor</th>
                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase">Status</th>
                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase">Host ID</th>
                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase">Check In/Out</th>
                  </>
                )}
                {activeTab === 'staff' && (
                  <>
                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase">Staff ID</th>
                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase">Check In</th>
                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase">Check Out</th>
                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase">Status</th>
                  </>
                )}
                {activeTab === 'incidents' && (
                  <>
                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase">Date</th>
                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase">Title</th>
                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase">Priority</th>
                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase">Status</th>
                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase">Location</th>
                  </>
                )}
                {activeTab === 'payments' && (
                  <>
                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase">Date</th>
                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase">User ID</th>
                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase">Amount</th>
                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase">Method</th>
                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase">Status</th>
                  </>
                )}
                {activeTab === 'amenities' && (
                  <>
                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase">Date</th>
                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase">Amenity ID</th>
                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase">User ID</th>
                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase">Time Slot</th>
                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase">Status</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                    Loading report data...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400">
                    No records found.
                  </td>
                </tr>
              ) : (
                data.map((item: any) => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                    {activeTab === 'visitors' && (
                      <>
                        <td className="p-4 text-slate-300 text-sm mono">{new Date(item.created_at).toLocaleDateString()}</td>
                        <td className="p-4">
                          <div className="font-medium text-white">{item.full_name}</div>
                          <div className="text-xs text-slate-500">{item.purpose}</div>
                        </td>
                        <td className="p-4"><span className="text-slate-300">{item.status}</span></td>
                        <td className="p-4 text-slate-400 text-sm">#{item.host_id}</td>
                        <td className="p-4 text-slate-400 text-xs mono">
                          <div>In: {item.check_in_time ? new Date(item.check_in_time).toLocaleTimeString() : '-'}</div>
                          <div>Out: {item.check_out_time ? new Date(item.check_out_time).toLocaleTimeString() : '-'}</div>
                        </td>
                      </>
                    )}
                    {activeTab === 'staff' && (
                      <>
                        <td className="p-4 text-slate-300">#{item.staff_id}</td>
                        <td className="p-4 text-slate-300 text-sm mono">{new Date(item.check_in_time).toLocaleString()}</td>
                        <td className="p-4 text-slate-300 text-sm mono">{item.check_out_time ? new Date(item.check_out_time).toLocaleString() : '-'}</td>
                        <td className="p-4"><span className="text-slate-300 capitalize">{item.status}</span></td>
                      </>
                    )}
                    {activeTab === 'incidents' && (
                      <>
                        <td className="p-4 text-slate-300 text-sm mono">{new Date(item.created_at).toLocaleDateString()}</td>
                        <td className="p-4 text-white font-medium">{item.title}</td>
                        <td className="p-4"><span className={`capitalize ${item.priority === 'critical' ? 'text-red-400 font-bold' : 'text-slate-300'}`}>{item.priority}</span></td>
                        <td className="p-4"><span className="text-slate-300 capitalize">{item.status}</span></td>
                        <td className="p-4 text-slate-400 text-sm">{item.location || 'N/A'}</td>
                      </>
                    )}
                    {activeTab === 'payments' && (
                      <>
                        <td className="p-4 text-slate-300 text-sm mono">{new Date(item.created_at).toLocaleDateString()}</td>
                        <td className="p-4 text-slate-300">#{item.user_id}</td>
                        <td className="p-4 text-emerald-400 font-mono">${(item.amount / 100).toFixed(2)}</td>
                        <td className="p-4 text-slate-300 capitalize">{item.method}</td>
                        <td className="p-4"><span className="text-slate-300 capitalize">{item.status}</span></td>
                      </>
                    )}
                    {activeTab === 'amenities' && (
                      <>
                        <td className="p-4 text-slate-300 text-sm mono">{new Date(item.created_at).toLocaleDateString()}</td>
                        <td className="p-4 text-slate-300">Amenity #{item.amenity_id}</td>
                        <td className="p-4 text-slate-300">User #{item.user_id}</td>
                        <td className="p-4 text-slate-400 text-xs mono">
                          {new Date(item.start_time).toLocaleString()} - <br/>
                          {new Date(item.end_time).toLocaleString()}
                        </td>
                        <td className="p-4"><span className="text-slate-300 capitalize">{item.status}</span></td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
