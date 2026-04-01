"use client";

import { Send, CheckCircle2, Loader2, Trash } from "lucide-react";
import { useState } from "react";
import { api } from "../services/api";

export function OrderTable({ orders, currency = "£", onRefresh }: { orders: any[], currency?: string, onRefresh?: () => void }) {
    const [syncing, setSyncing] = useState<Record<string, boolean>>({});
    const [synced, setSynced] = useState<Record<string, boolean>>({});
    const [deleting, setDeleting] = useState<string | null>(null);

    if (!orders || orders.length === 0) {
        return <div className="text-center py-8 text-slate-500 font-medium">No orders matching your criteria.</div>;
    }

    const handleDelete = async (id: string) => {
        if(!confirm("Are you sure you want to delete this Purchase Order?")) return;
        setDeleting(id);
        try {
            await api.deleteOrder(id);
            if(onRefresh) onRefresh();
        } catch (e) {
            alert("Delete failed");
        } finally {
            setDeleting(null);
        }
    };

    const handleSync = async (orderId: string) => {
        setSyncing(prev => ({ ...prev, [orderId]: true }));
        try {
            await api.syncOrder(orderId);
            setSynced(prev => ({ ...prev, [orderId]: true }));
            setTimeout(() => {
                setSynced(prev => ({ ...prev, [orderId]: false }));
            }, 3000);
        } catch (e) {
            alert("External Sync Failed");
        } finally {
            setSyncing(prev => ({ ...prev, [orderId]: false }));
        }
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-0">
                <thead>
                    <tr className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] border-b border-white/10">
                        <th className="px-8 py-6 bg-white/5">PO Number</th>
                        <th className="px-8 py-6 bg-white/5 text-center">Actions</th>
                        <th className="px-8 py-6 bg-white/5">Article No</th>
                        <th className="px-8 py-6 bg-white/5">Incoterms</th>
                        <th className="px-8 py-6 bg-white/5">Supplier</th>
                        <th className="px-8 py-6 bg-white/5">Brand</th>
                        <th className="px-8 py-6 bg-white/5">Quantity</th>
                        <th className="px-8 py-6 bg-white/5 text-right">Value ({currency})</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {orders.map((order, idx) => (
                        <tr key={order.id || idx} className="hover:bg-white/10 transition-all duration-300 group">
                            <td className="px-8 py-5 font-black text-indigo-500 text-sm whitespace-nowrap group-hover:scale-105 transition-transform origin-left">{order.purchase_order_number}</td>
                            <td className="px-8 py-5">
                                <div className="flex items-center justify-center gap-3">
                                    <button 
                                        onClick={() => handleSync(order.id)}
                                        disabled={syncing[order.id]}
                                        className={`p-2 rounded-xl transition-all shadow-sm ${
                                            synced[order.id] 
                                            ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/20" 
                                            : "bg-white/10 text-slate-400 border border-white/20 hover:text-indigo-500 hover:border-indigo-500/50 hover:bg-white/20 active:scale-90"
                                        }`}
                                        title="Sync to ERP"
                                    >
                                        {syncing[order.id] ? <Loader2 className="w-4 h-4 animate-spin" /> : synced[order.id] ? <CheckCircle2 className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(order.id)}
                                        disabled={deleting === order.id}
                                        className="p-2 rounded-xl bg-white/10 text-slate-400 border border-white/20 hover:text-rose-500 hover:border-rose-500/50 hover:bg-rose-500/10 transition-all active:scale-90"
                                        title="Delete PO"
                                    >
                                        {deleting === order.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash className="w-4 h-4" />}
                                    </button>
                                </div>
                            </td>
                            <td className="px-8 py-5 text-slate-500 text-[10px] font-black uppercase tracking-widest">{order.style_number || "N/A"}</td>
                            <td className="px-8 py-5 text-slate-500 text-[10px] font-black uppercase tracking-widest">{order.incoterms || "N/A"}</td>
                            <td className="px-8 py-5 font-bold text-slate-900 text-sm">{order.supplier?.name || "N/A"}</td>
                            <td className="px-8 py-5 text-slate-600 text-sm font-medium">{order.brand?.name || "N/A"}</td>
                            <td className="px-8 py-5 text-slate-600 text-sm font-black">{order.total_units?.toLocaleString()}</td>
                            <td className="px-8 py-5 text-right font-black text-slate-900 text-sm tabular-nums">
                                {currency}{order.total_net?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
