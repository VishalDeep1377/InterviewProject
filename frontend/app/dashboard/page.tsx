"use client";

import { useEffect, useState, useMemo } from "react";
import { api } from "../../services/api";
import { SupplierBarChart, DistributionPieChart, DeliveryTimelineChart, RevenueAreaChart } from "../../components/Charts";
import { OrderTable } from "../../components/OrderTable";
import { 
  LayoutDashboard, TrendingUp, Users, Package, Filter, 
  Download, CircleDollarSign, Trash2, Sparkles, Zap, Target, Loader2 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AICommand } from "../../components/AICommand";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [brandData, setBrandData] = useState<any[]>([]);
  const [supplierData, setSupplierData] = useState<any[]>([]);
  const [timelineData, setTimelineData] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  // Filters State
  const [filterSupplier, setFilterSupplier] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [currency, setCurrency] = useState("GBP");
  const [liveRate, setLiveRate] = useState(1.27);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
    }
  }, [router]);

  async function loadData() {
    try {
      const [ord, sup, brand, time, cats, rate] = await Promise.all([
        api.getOrders(),
        api.getSupplierData(),
        api.getBrandData(),
        api.getTimelineData(),
        api.getCategories(),
        api.getLiveCurrencyRate()
      ]);
      setOrders(ord || []);
      setSupplierData(sup || []);
      setBrandData(brand || []);
      setTimelineData(time || []);
      setCategories(cats || []);
      setLiveRate(rate || 1.27);
      setLastRefreshed(new Date());
    } catch (e) {
      console.error("Dashboard data load failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleClearAll = async () => {
    if(!confirm("Wipe all system data? This is irreversible.")) return;
    try {
        await api.clearAll();
        loadData();
    } catch (err) {
        alert("Reset failed");
    }
  };

  const currencySymbol = currency === "GBP" ? "£" : "$";
  const convertValue = (val: number) => currency === "GBP" ? val : val / (liveRate || 0.79);

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchSup = !filterSupplier || o.supplier?.name === filterSupplier;
      const matchCat = !filterCategory || o.category?.name === filterCategory;
      return matchSup && matchCat;
    }).map(o => ({ ...o, total_net: convertValue(o.total_net) }));
  }, [orders, filterSupplier, filterCategory, currency, liveRate]);

  const totalOrders = filteredOrders.length;
  const totalRevenue = filteredOrders.reduce((acc, o) => acc + (o.total_net || 0), 0);
  const totalItems = filteredOrders.reduce((acc, o) => acc + (o.total_units || 0), 0);

  const revenueTrend = useMemo(() => {
    const daily: Record<string, number> = {};
    filteredOrders.forEach(o => {
      const d = o.delivery_date ? new Date(o.delivery_date).toLocaleDateString('en-GB', {day:'2-digit', month:'short'}) : 'N/A';
      daily[d] = (daily[d] || 0) + (o.total_net || 0);
    });
    return Object.keys(daily).map(date => ({ date, revenue: daily[date] }))
      .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(-10);
  }, [filteredOrders]);

  const handleExport = async () => {
    try { await api.exportCSV(); } catch (err) { alert("Export failed"); }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-24 relative">
      <AICommand />
      
      {/* Premium Header Flow */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div className="space-y-2">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-600/20">
                <LayoutDashboard className="w-8 h-8 text-white" />
             </div>
             <div>
                <h2 className="text-5xl font-black tracking-tight text-slate-900">Intelligence <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Dashboard</span></h2>
                <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[9px] font-black rounded uppercase tracking-widest">Protocol v4.2</span>
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Neural Sync</span>
                </div>
             </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setCurrency(prev => prev === "GBP" ? "USD" : "GBP")}
            className="group flex items-center gap-3 px-5 py-3 bg-white text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest border border-slate-200 hover:border-indigo-600 hover:text-indigo-600 transition-all active:scale-95 shadow-sm"
          >
            <CircleDollarSign className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            {currencySymbol} {currency === "GBP" ? "USD" : "GBP"}
          </button>
          
          <button 
            onClick={handleExport}
            className="flex items-center gap-3 px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all active:scale-95 shadow-2xl shadow-slate-200"
          >
            <Download className="w-4 h-4" />
            Export Data
          </button>

          <button 
            onClick={handleClearAll}
            className="p-3 bg-rose-50 text-rose-500 rounded-2xl border border-rose-100 hover:bg-rose-500 hover:text-white transition-all active:scale-95"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </motion.div>

      {/* Advanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
        {[
            { label: "Total Asset Value", val: `${currencySymbol}${totalRevenue.toLocaleString()}`, icon: CircleDollarSign, color: "indigo", trend: "+12.5%" },
            { label: "Total PO Volume", val: totalOrders, icon: Target, color: "violet", trend: "Optimized" },
            { label: "Unit Inventory", val: totalItems.toLocaleString(), icon: Zap, color: "amber", trend: "Live Sync" }
        ].map((stat, i) => (
            <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-10 border border-white shadow-[0_20px_50px_rgba(0,0,0,0.03)] group hover:shadow-indigo-600/5 transition-all overflow-hidden relative"
            >
                <div className={`absolute -right-4 -top-4 w-32 h-32 bg-${stat.color}-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700`}></div>
                <div className="relative z-10">
                    <motion.div 
                        whileHover={{ rotate: 10 }}
                        className={`w-14 h-14 bg-${stat.color}-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-${stat.color}-600/20`}
                    >
                        <stat.icon className="w-7 h-7 text-white" />
                    </motion.div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{stat.label}</p>
                    <div className="flex items-end justify-between">
                        <p className="text-4xl font-black text-slate-900 tracking-tighter">{stat.val}</p>
                        <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">{stat.trend}</span>
                    </div>
                </div>
            </motion.div>
        ))}
      </div>

      {/* Filter Bar - Advance Mode */}
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="bg-white/40 backdrop-blur-md p-6 rounded-[2rem] border border-white shadow-xl shadow-slate-100 flex flex-wrap items-center gap-6"
      >
        <div className="flex items-center gap-3 text-slate-400 border-r border-slate-200 pr-6">
           <Filter className="w-5 h-5 text-indigo-600" />
           <span className="text-xs font-black uppercase tracking-widest text-slate-900">Filters</span>
        </div>
        
        <select 
          value={filterSupplier} 
          onChange={(e) => setFilterSupplier(e.target.value)}
          className="bg-white border border-slate-100 rounded-xl px-6 py-3 text-sm font-bold text-slate-600 focus:ring-4 focus:ring-indigo-500/10 outline-none min-w-[220px] shadow-sm appearance-none cursor-pointer"
        >
          <option value="">All Global Suppliers</option>
          {supplierData.map((s: any) => <option key={s.name} value={s.name}>{s.name}</option>)}
        </select>

        <select 
          value={filterCategory} 
          onChange={(e) => setFilterCategory(e.target.value)}
          className="bg-white border border-slate-100 rounded-xl px-6 py-3 text-sm font-bold text-slate-600 focus:ring-4 focus:ring-indigo-500/10 outline-none min-w-[220px] shadow-sm appearance-none cursor-pointer"
        >
          <option value="">All Categories</option>
          {categories.map((c: any) => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>

        {(filterSupplier || filterCategory) && (
            <button 
                onClick={() => { setFilterSupplier(""); setFilterCategory(""); }}
                className="text-xs font-black text-rose-500 hover:text-rose-600 uppercase tracking-widest hover:underline decoration-2"
            >
                Reset Engine
            </button>
        )}
      </motion.div>

      {/* Primary Analytics Array */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white/70 backdrop-blur-md p-10 rounded-[3rem] shadow-2xl shadow-slate-100 border border-white">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-xl font-black text-slate-900">Partner Revenue</h3>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">High Resolution Mode</span>
          </div>
          <SupplierBarChart data={supplierData} currency={currencySymbol} />
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white/70 backdrop-blur-md p-10 rounded-[3rem] shadow-2xl shadow-slate-100 border border-white">
            <div className="flex items-center justify-between mb-10">
                <h3 className="text-xl font-black text-slate-900">Brand Distribution</h3>
                <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
            </div>
          <DistributionPieChart data={brandData} dataKey="total_revenue" />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/70 backdrop-blur-md p-10 rounded-[3rem] shadow-2xl shadow-slate-100 border border-white">
            <div className="flex items-center justify-between mb-10">
                <h3 className="text-xl font-black text-slate-900">Logistics Timeline</h3>
                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-lg uppercase tracking-widest">Efficiency Gap Analyser</span>
            </div>
          <DeliveryTimelineChart data={timelineData} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/70 backdrop-blur-md p-10 rounded-[3rem] shadow-2xl shadow-slate-100 border border-white flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-10">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                    <TrendingUp className="w-6 h-6 text-indigo-600" />
                    Growth Stream
                </h3>
                <Zap className="w-4 h-4 text-indigo-400 fill-current" />
          </div>
          <RevenueAreaChart data={revenueTrend} currency={currencySymbol} />
        </motion.div>
      </div>

      {/* Advanced Data Ledger */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white/90 backdrop-blur-2xl rounded-[4rem] shadow-[0_40px_100px_rgba(0,0,0,0.06)] border border-white overflow-hidden"
      >
        <div className="px-12 py-12 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
            <div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Quantum Ledger</h3>
                <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-[0.2em] italic font-medium">Full Transaction History & Live Audit Trail</p>
            </div>
            <div className="flex items-center gap-6">
                <div className="text-right">
                    <p className="text-2xl font-black text-indigo-600 tracking-tighter">{filteredOrders.length}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Entries Active</p>
                </div>
                <div className="w-14 h-14 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-indigo-600/20">
                    <Package className="w-8 h-8 text-white" />
                </div>
            </div>
        </div>
        <OrderTable orders={filteredOrders} currency={currencySymbol} onRefresh={loadData} />
      </motion.div>
    </div>
  );
}
