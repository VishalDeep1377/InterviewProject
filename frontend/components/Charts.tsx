"use client";

import { 
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
    PieChart, Pie, Cell, Legend, CartesianGrid, AreaChart, Area
} from 'recharts';

const COLORS = ['#6366F1', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const CustomTooltip = ({ active, payload, label, currency }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/90 backdrop-blur-xl p-4 rounded-2xl border border-slate-100 shadow-2xl shadow-slate-200/50 min-w-[160px]">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center justify-between gap-4 mt-1">
                        <span className="text-xs font-bold text-slate-600 capitalize">{entry.name}:</span>
                        <span className="text-sm font-black text-indigo-600">
                            {currency}{typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export function DistributionPieChart({ data, dataKey, nameKey }: { data: any[], dataKey: string, nameKey?: string }) {
    if(!data || data.length === 0) return <div className="flex h-64 items-center justify-center text-slate-400 font-medium">No Data Available</div>;
    
    return (
        <ResponsiveContainer width="100%" height={320}>
            <PieChart>
                <Pie 
                    data={data} 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={65} 
                    outerRadius={95} 
                    paddingAngle={8} 
                    dataKey={dataKey}
                    nameKey={nameKey || "name"}
                    animationBegin={0}
                    animationDuration={1500}
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                    ))}
                </Pie>
                <Tooltip content={<CustomTooltip currency="" />} />
                <Legend 
                    verticalAlign="bottom" 
                    iconType="rect" 
                    iconSize={10}
                    wrapperStyle={{fontSize: '11px', fontWeight: 900, letterSpacing: '0.1em', paddingTop: '20px'}} 
                />
            </PieChart>
        </ResponsiveContainer>
    );
}

export function DeliveryTimelineChart({ data }: { data: any[] }) {
    if(!data || data.length === 0) return <div className="flex h-64 items-center justify-center text-slate-400 font-medium">No Timeline Data Available</div>;
    
    const displayData = [...data]
        .sort((a, b) => new Date(a.delivery).getTime() - new Date(b.delivery).getTime())
        .slice(-8)
        .map(d => {
            const exDate = new Date(d.ex_factory);
            const delDate = new Date(d.delivery);
            const delayDays = Math.max(0, Math.floor((delDate.getTime() - exDate.getTime()) / (1000 * 3600 * 24)));
            return {
                ...d,
                delay: delayDays,
                displayPo: d.po.length > 10 ? `${d.po.substring(0, 6)}...` : d.po
            };
        });

    return (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={displayData} margin={{ top: 20, right: 30, left: 10, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis 
                    dataKey="displayPo" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 700}} 
                />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 700}} />
                <Tooltip 
                    cursor={{fill: '#F8FAFC', radius: 12}}
                    content={<CustomTooltip currency="" />}
                />
                <Bar dataKey="delay" name="Lead Time (Days)" fill="url(#barGradient)" radius={[6, 6, 0, 0]} barSize={24} animationDuration={2000}>
                    <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#6366F1" stopOpacity={1}/>
                            <stop offset="100%" stopColor="#3B82F6" stopOpacity={1}/>
                        </linearGradient>
                    </defs>
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}

export function SupplierBarChart({ data, currency }: { data: any[], currency: string }) {
    if(!data || data.length === 0) return <div className="flex h-64 items-center justify-center text-slate-400 font-medium">No Supplier Data</div>;
    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 10, fontWeight: 900}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 700}} />
                <Tooltip 
                    cursor={{fill: '#F8FAFC', radius: 12}} 
                    content={<CustomTooltip currency={currency} />}
                />
                <Bar dataKey="total_revenue" name="Revenue" fill="#0F172A" radius={[6, 6, 0, 0]} barSize={32} animationDuration={1800} />
            </BarChart>
        </ResponsiveContainer>
    );
}

export function RevenueAreaChart({ data, currency }: { data: any[], currency: string }) {
    if(!data || data.length === 0) return <div className="flex h-64 items-center justify-center text-slate-400 font-medium tracking-widest uppercase text-[10px] font-black">Waiting for Data Stream...</div>;
    
    return (
        <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#F1F5F9" />
                <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 900}} 
                />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 700}} />
                <Tooltip 
                    content={<CustomTooltip currency={currency} />}
                />
                <Area type="monotone" dataKey="revenue" name="Gross" stroke="#6366F1" strokeWidth={5} fillOpacity={1} fill="url(#colorRev)" animationDuration={2500} />
            </AreaChart>
        </ResponsiveContainer>
    );
}
