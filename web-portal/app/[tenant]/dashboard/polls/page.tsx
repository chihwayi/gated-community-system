"use client";

import React, { useState, useEffect } from "react";
import { Vote, Search, Plus, Trash2, Calendar, CheckCircle2, BarChart2, X } from "lucide-react";
import { pollService, Poll, PollStatus } from "@/services/pollService";
import { useToast } from "@/context/ToastContext";
import { useConfirmation } from "@/context/ConfirmationContext";

export default function PollsPage() {
  const { showToast } = useToast();
  const { confirm } = useConfirmation();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPoll, setNewPoll] = useState({
    question: "",
    description: "",
    end_date: "",
    options: ["", ""]
  });

  useEffect(() => {
    loadPolls();
  }, []);

  const loadPolls = async () => {
    setIsLoading(true);
    try {
      const response = await pollService.getPolls();
      setPolls(response.data);
    } catch (error) {
      console.error("Failed to load polls", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePoll = async (e: React.FormEvent) => {
    e.preventDefault();
    const validOptions = newPoll.options.filter(o => o.trim() !== "");
    if (validOptions.length < 2) {
      showToast("Please provide at least 2 options", "error");
      return;
    }

    try {
      await pollService.createPoll({
        question: newPoll.question,
        description: newPoll.description,
        end_date: newPoll.end_date || undefined,
        options: validOptions
      });
      setShowCreateModal(false);
      setNewPoll({ question: "", description: "", end_date: "", options: ["", ""] });
      loadPolls();
      showToast("Poll created successfully", "success");
    } catch (error) {
      console.error("Failed to create poll", error);
      showToast("Failed to create poll", "error");
    }
  };

  const handleDelete = async (id: number) => {
    if (!(await confirm({
      title: "Delete Poll",
      message: "Are you sure you want to delete this poll? This action cannot be undone.",
      confirmLabel: "Delete",
      variant: "danger"
    }))) return;
    try {
      await pollService.deletePoll(id);
      loadPolls();
      showToast("Poll deleted successfully", "success");
    } catch (error) {
      console.error("Failed to delete poll", error);
      showToast("Failed to delete poll", "error");
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const updatedOptions = [...newPoll.options];
    updatedOptions[index] = value;
    setNewPoll({ ...newPoll, options: updatedOptions });
  };

  const addOption = () => {
    setNewPoll({ ...newPoll, options: [...newPoll.options, ""] });
  };

  const removeOption = (index: number) => {
    if (newPoll.options.length <= 2) return;
    const updatedOptions = newPoll.options.filter((_, i) => i !== index);
    setNewPoll({ ...newPoll, options: updatedOptions });
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Community Polls</h1>
          <p className="text-slate-400 mt-1">Manage voting and community surveys</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Poll
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading polls...</p>
        </div>
      ) : polls.length === 0 ? (
        <div className="bg-slate-800/50 rounded-2xl p-12 text-center border border-slate-700/50">
          <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Vote className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-medium text-slate-200 mb-2">No polls yet</h3>
          <p className="text-slate-400 max-w-md mx-auto mb-6">Create a poll to gather feedback from residents.</p>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-medium inline-flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create First Poll
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {polls.map((poll) => {
            const totalVotes = poll.options.reduce((acc, curr) => acc + curr.vote_count, 0);
            
            return (
              <div key={poll.id} className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden hover:border-slate-600 transition-colors">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2 text-xs font-medium text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded-lg">
                      {poll.status === PollStatus.OPEN ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                          OPEN
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          CLOSED
                        </>
                      )}
                    </div>
                    <button 
                      onClick={() => handleDelete(poll.id)}
                      className="text-slate-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-100 mb-2">{poll.question}</h3>
                  {poll.description && (
                    <p className="text-sm text-slate-400 mb-4 line-clamp-2">{poll.description}</p>
                  )}
                  
                  <div className="space-y-3 mb-6">
                    {poll.options.map((option) => {
                      const percentage = totalVotes > 0 ? Math.round((option.vote_count / totalVotes) * 100) : 0;
                      
                      return (
                        <div key={option.id} className="relative">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-300">{option.text}</span>
                            <span className="text-slate-400 font-mono">{percentage}% ({option.vote_count})</span>
                          </div>
                          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-slate-700/50">
                    <div className="flex items-center gap-1">
                      <BarChart2 className="w-3 h-3" />
                      {totalVotes} total votes
                    </div>
                    {poll.end_date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Ends {new Date(poll.end_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl w-full max-w-md border border-slate-700 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-100">Create New Poll</h2>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleCreatePoll} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Question</label>
                  <input
                    type="text"
                    required
                    value={newPoll.question}
                    onChange={(e) => setNewPoll({...newPoll, question: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
                    placeholder="e.g., Should we install a new gym?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Description (Optional)</label>
                  <textarea
                    value={newPoll.description}
                    onChange={(e) => setNewPoll({...newPoll, description: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-cyan-500 min-h-[80px]"
                    placeholder="Provide more context..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">End Date (Optional)</label>
                  <input
                    type="date"
                    value={newPoll.end_date}
                    onChange={(e) => setNewPoll({...newPoll, end_date: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Options</label>
                  <div className="space-y-2">
                    {newPoll.options.map((option, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          required
                          value={option}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                          className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                          placeholder={`Option ${index + 1}`}
                        />
                        {newPoll.options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeOption(index)}
                            className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addOption}
                      className="w-full py-2 border border-dashed border-slate-600 rounded-xl text-slate-400 text-sm hover:border-cyan-500 hover:text-cyan-400 transition-colors"
                    >
                      + Add Option
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-3 rounded-xl transition-colors mt-6"
                >
                  Create Poll
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
