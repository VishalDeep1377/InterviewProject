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
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-50/50 text-slate-500 font-semibold text-xs uppercase tracking-wider border-b border-slate-100">
                        <th className="px-6 py-4">PO Number</th>
                        <th className="px-6 py-4 text-center">Actions</th>
                        <th className="px-6 py-4">Article No</th>
                        <th className="px-6 py-4">Incoterms</th>
                        <th className="px-6 py-4">Supplier</th>
                        <th className="px-6 py-4">Brand</th>
                        <th className="px-6 py-4">Quantity</th>
                        <th className="px-6 py-4 text-right">Value ({currency})</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {orders.map((order, idx) => (
                        <tr key={order.id || idx} className="hover:bg-slate-50 transition-colors duration-200">
                            <td className="px-6 py-4 font-bold text-indigo-600 text-sm whitespace-nowrap">{order.purchase_order_number}</td>
                            <td className="px-6 py-4">
                                <div className="flex items-center justify-center gap-2">
                                    <button 
                                        onClick={() => handleSync(order.id)}
                                        disabled={syncing[order.id]}
                                        className={`p-1.5 rounded-lg transition-all ${
                                            synced[order.id] 
                                            ? "bg-emerald-50 text-emerald-600" 
                                            : "bg-white text-slate-400 border border-slate-200 hover:text-indigo-600 hover:border-indigo-600 transition-all"
                                        }`}
                                        title="Sync to ERP"
                                    >
                                        {syncing[order.id] ? <Loader2 className="w-4 h-4 animate-spin" /> : synced[order.id] ? <CheckCircle2 className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(order.id)}
                                        disabled={deleting === order.id}
                                        className="p-1.5 rounded-lg bg-white text-slate-400 border border-slate-200 hover:text-red-600 hover:border-red-600 transition-all"
                                        title="Delete PO"
                                    >
                                        {deleting === order.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash className="w-4 h-4" />}
                                    </button>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-slate-500 text-xs font-bold uppercase">{order.style_number || "N/A"}</td>
                            <td className="px-6 py-4 text-slate-500 text-xs font-bold uppercase">{order.incoterms || "N/A"}</td>
                            <td className="px-6 py-4 font-medium text-slate-700 text-sm">{order.supplier?.name || "N/A"}</td>
                            <td className="px-6 py-4 text-slate-600 text-sm">{order.brand?.name || "N/A"}</td>
                            <td className="px-6 py-4 text-slate-600 text-sm font-medium">{order.total_units?.toLocaleString()}</td>
                            <td className="px-6 py-4 text-right font-bold text-slate-900 text-sm">
                                {currency}{order.total_net?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
