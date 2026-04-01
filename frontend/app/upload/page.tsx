"use client";

import { useState, useRef } from "react";
import { api } from "../../services/api";
import { UploadCloud, CheckCircle, AlertTriangle, FileText } from "lucide-react";

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
      setResults([]);
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    setResults([]);
    try {
      const data = await api.upload(files);
      if (data.results) {
        setResults(data.results.map((r: any) => ({
          filename: r.filename,
          ok: r.status === 'success',
          poNumber: r.data?.purchase_order_number || "Unknown"
        })));
      } else {
        alert("Upload parsing returned an unexpected response.");
      }
    } catch (e: any) {
      alert("Failed to upload: " + e.message);
    } finally {
      setUploading(false);
      setFiles([]);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-800">Upload Purchase Orders</h2>
        <p className="text-slate-500 mt-1">Select or drop PDF files here and our engine will extract the structured data.</p>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 border-dashed relative group">
        <label className="flex flex-col items-center justify-center p-12 cursor-pointer h-64 border-2 border-slate-100 border-dashed rounded-2xl bg-slate-50 hover:bg-indigo-50/50 transition-colors">
            <UploadCloud className="w-16 h-16 text-indigo-400 group-hover:text-indigo-600 mb-4 transition-colors" />
            <span className="text-lg font-medium text-slate-700">Click to select PDF files</span>
            <span className="text-sm text-slate-400 mt-1">Supports multi-file select (.pdf)</span>
            <input
                type="file"
                multiple
                accept="application/pdf"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
            />
        </label>
        
        {files.length > 0 && (
          <div className="mt-6 flex flex-col items-center">
            <div className="flex flex-wrap gap-2 justify-center mb-6">
                {files.map((f, i) => (
                    <div key={i} className="flex items-center bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl text-sm font-medium border border-indigo-100 shadow-sm">
                        <FileText className="w-4 h-4 mr-2" />
                        {f.name}
                    </div>
                ))}
            </div>
            <button
                onClick={handleUpload}
                disabled={uploading}
                className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold py-3 px-12 rounded-xl shadow-md disabled:opacity-50 transition-all flex items-center"
            >
                {uploading ? (
                    <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div> Analyzing PDF...</>
                ) : (
                   "Process Files"
                )}
            </button>
          </div>
        )}
      </div>

      {results.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Processing Results</h3>
            <ul className="space-y-3">
                {results.map((r, i) => (
                   <li key={i} className={`flex items-center justify-between p-4 rounded-xl border ${r.ok ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
                      <div className="flex items-center">
                          {r.ok ? <CheckCircle className="w-5 h-5 text-emerald-600 mr-3" /> : <AlertTriangle className="w-5 h-5 text-red-600 mr-3"/>}
                          <span className="font-medium text-slate-800">{r.filename}</span>
                      </div>
                      <div className="text-sm font-semibold bg-white px-3 py-1 rounded-full shadow-sm">
                          PO #: {r.poNumber}
                      </div>
                   </li>
                ))}
            </ul>
        </div>
      )}
    </div>
  );
}
