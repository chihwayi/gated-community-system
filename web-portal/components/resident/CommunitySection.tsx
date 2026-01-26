import React, { useState, useEffect } from "react";
import { 
  FileText, 
  BarChart2, 
  Download, 
  Loader2,
  Calendar,
  Check
} from "lucide-react";
import { pollService, Poll, PollOption } from "@/services/pollService";
import { documentService, CommunityDocument, DocumentCategory } from "@/services/documentService";

export default function CommunitySection() {
  const [activeTab, setActiveTab] = useState<'polls' | 'documents'>('polls');
  
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center gap-4 border-b border-white/10">
        <button
          onClick={() => setActiveTab('polls')}
          className={`px-4 py-3 text-sm font-medium transition-colors relative ${
            activeTab === 'polls' ? "text-cyan-400" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4" />
            Community Polls
          </div>
          {activeTab === 'polls' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400" />}
        </button>
        <button
          onClick={() => setActiveTab('documents')}
          className={`px-4 py-3 text-sm font-medium transition-colors relative ${
            activeTab === 'documents' ? "text-cyan-400" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Documents
          </div>
          {activeTab === 'documents' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400" />}
        </button>
      </div>

      {activeTab === 'polls' ? <PollsList /> : <DocumentsList />}
    </div>
  );
}

function PollsList() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [votingMap, setVotingMap] = useState<{[key: number]: boolean}>({}); // pollId -> isVoting

  useEffect(() => {
    loadPolls();
  }, []);

  const loadPolls = async () => {
    setIsLoading(true);
    try {
      const data = await pollService.getPolls();
      setPolls(data);
    } catch (error) {
      console.error("Failed to load polls", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVote = async (pollId: number, optionId: number) => {
    setVotingMap(prev => ({...prev, [pollId]: true}));
    try {
      await pollService.vote(pollId, optionId);
      await loadPolls(); // Reload to get new counts
    } catch (error) {
      console.error("Failed to vote", error);
      alert("Failed to record vote");
    } finally {
      setVotingMap(prev => ({...prev, [pollId]: false}));
    }
  };

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-cyan-400" /></div>;

  return (
    <div className="grid gap-6">
      {polls.map((poll) => (
        <PollCard 
          key={poll.id} 
          poll={poll} 
          onVote={handleVote} 
          isVoting={votingMap[poll.id] || false}
        />
      ))}
      {polls.length === 0 && (
        <div className="text-center py-12 text-slate-500">No active polls at the moment.</div>
      )}
    </div>
  );
}

function PollCard({ poll, onVote, isVoting }: { poll: Poll, onVote: (pid: number, oid: number) => void, isVoting: boolean }) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  
  const totalVotes = poll.options.reduce((acc, opt) => acc + opt.vote_count, 0);

  return (
    <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-100 mb-1">{poll.question}</h3>
          {poll.description && <p className="text-slate-400 text-sm">{poll.description}</p>}
        </div>
        {poll.end_date && (
          <div className="flex items-center gap-1 text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">
            <Calendar className="w-3 h-3" />
            Ends {new Date(poll.end_date).toLocaleDateString()}
          </div>
        )}
      </div>

      <div className="space-y-3">
        {poll.options.map((option) => {
          const percentage = totalVotes > 0 ? Math.round((option.vote_count / totalVotes) * 100) : 0;
          
          if (poll.user_has_voted) {
            // Results View
            return (
              <div key={option.id} className="relative pt-1">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium text-slate-300">{option.text}</span>
                  <span className="text-slate-400">{percentage}% ({option.vote_count})</span>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-slate-800">
                  <div style={{ width: `${percentage}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-cyan-500 transition-all duration-500"></div>
                </div>
              </div>
            );
          } else {
            // Voting View
            return (
              <label 
                key={option.id} 
                className={`flex items-center p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedOption === option.id 
                    ? "bg-cyan-500/10 border-cyan-500/50" 
                    : "bg-slate-800/30 border-white/5 hover:bg-slate-800/50"
                }`}
              >
                <input 
                  type="radio" 
                  name={`poll-${poll.id}`}
                  className="hidden"
                  onChange={() => setSelectedOption(option.id)}
                />
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${
                  selectedOption === option.id ? "border-cyan-400" : "border-slate-500"
                }`}>
                  {selectedOption === option.id && <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />}
                </div>
                <span className={selectedOption === option.id ? "text-cyan-300" : "text-slate-300"}>
                  {option.text}
                </span>
              </label>
            );
          }
        })}
      </div>

      {!poll.user_has_voted && (
        <div className="mt-6 flex justify-end">
          <button
            disabled={!selectedOption || isVoting}
            onClick={() => selectedOption && onVote(poll.id, selectedOption)}
            className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isVoting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Submit Vote
          </button>
        </div>
      )}
      
      {poll.user_has_voted && (
        <div className="mt-4 text-center text-sm text-emerald-400 flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          You have voted in this poll
        </div>
      )}
    </div>
  );
}

function DocumentsList() {
  const [documents, setDocuments] = useState<CommunityDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const data = await documentService.getDocuments();
      setDocuments(data);
    } catch (error) {
      console.error("Failed to load documents", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryLabel = (cat: DocumentCategory) => {
    switch(cat) {
      case DocumentCategory.BYLAWS: return "By-Laws & Rules";
      case DocumentCategory.MINUTES: return "Meeting Minutes";
      case DocumentCategory.FORM: return "Forms & Applications";
      default: return "General";
    }
  };

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-cyan-400" /></div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {documents.map((doc) => (
        <div key={doc.id} className="p-4 rounded-xl bg-slate-900/50 border border-white/5 hover:border-white/10 transition-all flex items-start gap-4">
          <div className="p-3 bg-slate-800 rounded-lg text-slate-300">
            <FileText className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <h4 className="font-medium text-slate-200 truncate pr-2">{doc.title}</h4>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 whitespace-nowrap">
                {getCategoryLabel(doc.category)}
              </span>
            </div>
            {doc.description && <p className="text-sm text-slate-500 mt-1 line-clamp-2">{doc.description}</p>}
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-slate-600">{new Date(doc.created_at).toLocaleDateString()}</span>
              <a 
                href={doc.file_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium"
              >
                <Download className="w-3 h-3" />
                Download
              </a>
            </div>
          </div>
        </div>
      ))}
      {documents.length === 0 && (
        <div className="col-span-full text-center py-12 text-slate-500">No documents available.</div>
      )}
    </div>
  );
}
