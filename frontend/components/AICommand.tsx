"use client";

import { useState, useEffect } from "react";
import { Sparkles, X, MessageSquare, Zap, Target, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../services/api";

export function AICommand() {
    const [isOpen, setIsOpen] = useState(false);
    const [insights, setInsights] = useState<string[]>([]);
    const [query, setQuery] = useState("");
    const [chat, setChat] = useState<{ role: 'user' | 'ai', text: string }[]>([]);

    useEffect(() => {
        if(isOpen && insights.length === 0) {
            loadInsights();
        }
    }, [isOpen]);

    async function loadInsights() {
        try {
            const data = await api.getAIInsights();
            setInsights(data.insights);
        } catch (e) {
            setInsights(["Unable to reach AI Intelligence Engine right now."]);
        }
    }

    const handleQuery = (e: React.FormEvent) => {
        e.preventDefault();
        if(!query) return;

        const newChat = [...chat, { role: 'user' as const, text: query }];
        setChat(newChat);
        setQuery("");

        // Mock AI Logic for advanced++ feel
        setTimeout(() => {
            let reply = "I'm analyzing your purchase order patterns. Based on current data, your supply chain is stable.";
            if(query.toLowerCase().includes("who") || query.toLowerCase().includes("supplier")) {
                reply = "Your primary supplier is being monitored for high-volume efficiency. They currently account for over 40% of your total net value.";
            } else if (query.toLowerCase().includes("revenue") || query.toLowerCase().includes("trend")) {
                reply = "The revenue trend shows a positive upswing in the mid-quarter. I recommend reviewing your brand distribution to sustain this growth.";
            }
            setChat([...newChat, { role: 'ai' as const, text: reply }]);
        }, 800);
    };

    return (
        <>
            {/* Floating Bubble */}
            <motion.button 
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(true)}
                className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-600/40 z-50 group border border-white/20"
            >
                <Sparkles className="w-8 h-8 text-white group-hover:animate-pulse" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-sm"></div>
            </motion.button>

            {/* AI Side Drawer */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ x: 400, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 400, opacity: 0 }}
                        className="fixed top-0 right-0 h-full w-[400px] bg-white/95 backdrop-blur-2xl shadow-[-20px_0_40px_rgba(0,0,0,0.05)] border-l border-slate-200/50 z-[60] flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-50/30 to-white">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-600 rounded-xl">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-900 tracking-tight">AI Command Center</h3>
                                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Neural Link Active</p>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>

                        {/* Content Scroll */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
                            {/* Auto Insights Sections */}
                            <section>
                                <div className="flex items-center gap-2 mb-4 text-indigo-600">
                                    <Zap className="w-4 h-4" />
                                    <span className="text-xs font-black uppercase tracking-widest">Autonomous Insights</span>
                                </div>
                                <div className="space-y-3">
                                    {insights.map((insight, i) => (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            key={i} 
                                            className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium text-slate-700 leading-relaxed shadow-sm"
                                            dangerouslySetInnerHTML={{ __html: insight.replace(/\*\*(.*?)\*\*/g, '<b class="text-indigo-600 font-black">$1</b>') }}
                                        />
                                    ))}
                                </div>
                            </section>

                            {/* Chat Interface */}
                            <section className="pt-4 border-t border-slate-100">
                                <div className="flex items-center gap-2 mb-4 text-slate-400">
                                    <MessageSquare className="w-4 h-4" />
                                    <span className="text-xs font-black uppercase tracking-widest">Data Dialogue</span>
                                </div>
                                <div className="space-y-4 mb-6">
                                    {chat.map((msg, i) => (
                                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm font-medium ${
                                                msg.role === 'user' 
                                                ? 'bg-indigo-600 text-white rounded-tr-none' 
                                                : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none shadow-sm'
                                            }`}>
                                                {msg.text}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>

                        {/* Input Area */}
                        <div className="p-8 border-t border-slate-100 bg-white">
                            <form onSubmit={handleQuery} className="relative">
                                <input 
                                    type="text" 
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Ask about your supply chain..."
                                    className="w-full pl-4 pr-12 py-4 bg-slate-100 border-none rounded-2xl text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                                />
                                <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all">
                                    <Zap className="w-4 h-4 fill-current" />
                                </button>
                            </form>
                            <p className="mt-4 text-[10px] text-center text-slate-400 font-bold uppercase tracking-tighter">AI may generate incorrect data. Verify business critical insights.</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
