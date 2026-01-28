"use client";

import React, { useState, useEffect } from "react";
import { FileText, Search, Plus, Trash2, Download, Upload, X, Filter, Loader2 } from "lucide-react";
import { documentService, CommunityDocument, DocumentCategory } from "@/services/documentService";
import { useToast } from "@/context/ToastContext";
import { useConfirmation } from "@/context/ConfirmationContext";

export default function DocumentsPage() {
  const { showToast } = useToast();
  const { confirm } = useConfirmation();
  const [documents, setDocuments] = useState<CommunityDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<DocumentCategory | 'all'>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [newDocument, setNewDocument] = useState({
    title: "",
    description: "",
    category: DocumentCategory.OTHER,
    file: null as File | null
  });

  useEffect(() => {
    loadDocuments();
  }, [activeCategory]);

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const category = activeCategory === 'all' ? undefined : activeCategory;
      const response = await documentService.getDocuments(category);
      setDocuments(response.data);
    } catch (error) {
      console.error("Failed to load documents", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewDocument({ ...newDocument, file: e.target.files[0] });
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocument.file) {
      showToast("Please select a file", "error");
      return;
    }

    setIsUploading(true);
    try {
      // 1. Upload file
      const uploadResponse = await documentService.uploadFile(newDocument.file);
      const fileUrl = uploadResponse.data.url;

      // 2. Create document record
      await documentService.createDocument({
        title: newDocument.title,
        description: newDocument.description,
        category: newDocument.category,
        file_url: fileUrl
      });

      setShowUploadModal(false);
      setNewDocument({ title: "", description: "", category: DocumentCategory.OTHER, file: null });
      loadDocuments();
      showToast("Document uploaded successfully", "success");
    } catch (error) {
      console.error("Failed to upload document", error);
      showToast("Failed to upload document", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!(await confirm({
      title: "Delete Document",
      message: "Are you sure you want to delete this document?",
      confirmLabel: "Delete",
      variant: "danger"
    }))) return;
    try {
      await documentService.deleteDocument(id);
      loadDocuments();
      showToast("Document deleted successfully", "success");
    } catch (error) {
      console.error("Failed to delete document", error);
      showToast("Failed to delete document", "error");
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

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Document Repository</h1>
          <p className="text-slate-400 mt-1">Manage community documents, forms, and minutes</p>
        </div>
        <button 
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-medium flex items-center gap-2 transition-colors"
        >
          <Upload className="w-5 h-5" />
          Upload Document
        </button>
      </div>

      {/* Filters */}
      <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            activeCategory === 'all' 
              ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50" 
              : "bg-slate-800 text-slate-400 hover:bg-slate-700 border border-transparent"
          }`}
        >
          All Documents
        </button>
        {Object.values(DocumentCategory).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeCategory === cat 
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50" 
                : "bg-slate-800 text-slate-400 hover:bg-slate-700 border border-transparent"
            }`}
          >
            {getCategoryLabel(cat)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading documents...</p>
        </div>
      ) : documents.length === 0 ? (
        <div className="bg-slate-800/50 rounded-2xl p-12 text-center border border-slate-700/50">
          <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-medium text-slate-200 mb-2">No documents found</h3>
          <p className="text-slate-400 max-w-md mx-auto mb-6">Upload documents to share them with residents.</p>
          <button 
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-medium inline-flex items-center gap-2 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Upload First Document
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {documents.map((doc) => (
            <div key={doc.id} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-colors flex items-start gap-4 group">
              <div className="p-3 bg-slate-700/50 rounded-lg text-cyan-400 group-hover:bg-cyan-500/10 group-hover:text-cyan-300 transition-colors">
                <FileText className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-slate-200 truncate pr-2">{doc.title}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-400 whitespace-nowrap">
                      {getCategoryLabel(doc.category)}
                    </span>
                    <button 
                      onClick={() => handleDelete(doc.id)}
                      className="text-slate-500 hover:text-red-400 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {doc.description && <p className="text-sm text-slate-400 mt-1 line-clamp-2">{doc.description}</p>}
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Uploaded {new Date(doc.created_at).toLocaleDateString()}</span>
                  <a 
                    href={doc.file_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium bg-cyan-400/10 px-3 py-1.5 rounded-lg hover:bg-cyan-400/20 transition-colors"
                  >
                    <Download className="w-3 h-3" />
                    Download
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl w-full max-w-md border border-slate-700 shadow-xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-100">Upload Document</h2>
                <button 
                  onClick={() => setShowUploadModal(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={newDocument.title}
                    onChange={(e) => setNewDocument({...newDocument, title: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
                    placeholder="e.g., Annual Meeting Minutes"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Category</label>
                  <select
                    value={newDocument.category}
                    onChange={(e) => setNewDocument({...newDocument, category: e.target.value as DocumentCategory})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
                  >
                    {Object.values(DocumentCategory).map((cat) => (
                      <option key={cat} value={cat}>{getCategoryLabel(cat)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Description (Optional)</label>
                  <textarea
                    value={newDocument.description}
                    onChange={(e) => setNewDocument({...newDocument, description: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-cyan-500 min-h-[80px]"
                    placeholder="Provide more context..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">File</label>
                  <div className="relative">
                    <input
                      type="file"
                      required
                      onChange={handleFileChange}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-cyan-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-cyan-500/10 file:text-cyan-400 hover:file:bg-cyan-500/20"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isUploading}
                  className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-3 rounded-xl transition-colors mt-6 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      Upload Document
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
