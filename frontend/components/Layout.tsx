"use client";

import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
    FileUp, BarChart3, LogOut, PackageSearch, 
    Bell, Search, Settings, User, Sparkles, ChevronLeft, ChevronRight 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userName, setUserName] = useState("Pro User");

  useEffect(() => {
    const user = localStorage.getItem("user");
    if(user) {
        try {
            setUserName(JSON.parse(user).name);
        } catch(e) {}
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: BarChart3, color: "text-indigo-600" },
    { label: "Upload PO", href: "/upload", icon: FileUp, color: "text-blue-600" },
    { label: "Settings", href: "/settings", icon: Settings, color: "text-slate-600" },
  ];

  return (
    <div className="flex h-screen w-full bg-[#fdfdfd] overflow-hidden font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <div className="mesh-gradient pointer-events-none opacity-40"></div>
          
      {/* Sidebar - Pro Glassmorphic */}
      <motion.aside 
        initial={false}
        animate={{ width: isCollapsed ? 80 : 280 }}
        className="relative flex flex-col justify-between bg-white/20 backdrop-blur-3xl border-r border-white/20 shadow-[0_4px_30px_rgba(0,0,0,0.02)] z-20"
      >
        <div>
          <div className="h-20 flex items-center px-6 border-b border-white/10">
            <div className="flex items-center group cursor-pointer">
              <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20 group-hover:rotate-12 transition-all">
                <PackageSearch className="w-6 h-6 text-white" />
              </div>
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.h1 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="ml-3 text-xl font-black bg-gradient-to-r from-slate-900 to-indigo-700 bg-clip-text text-transparent"
                  >
                    PO Insight<span className="text-indigo-600">.</span>
                  </motion.h1>
                )}
              </AnimatePresence>
            </div>
          </div>

          <nav className="p-4 mt-6 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-4 py-3.5 rounded-2xl transition-all duration-300 group overflow-hidden relative ${
                    isActive
                      ? "bg-slate-900 text-white shadow-xl shadow-slate-200"
                      : "text-slate-500 hover:bg-white/20 hover:text-indigo-600"
                  }`}
                >
                  <Icon className={`w-5 h-5 min-w-[20px] ${isActive ? "text-white" : "text-slate-400 group-hover:text-indigo-600"}`} />
                  {!isCollapsed && (
                    <motion.span 
                        initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }}
                        className="ml-4 font-bold text-sm tracking-tight"
                    >
                        {item.label}
                    </motion.span>
                  )}
                  {isActive && !isCollapsed && (
                    <motion.div layoutId="activeNav" className="absolute left-0 w-1 h-6 bg-indigo-400 rounded-r-full" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3.5 text-slate-400 hover:text-red-500 hover:bg-red-50/50 rounded-2xl transition-all font-bold text-sm"
          >
            <LogOut className="w-5 h-5 min-w-[20px]" />
            {!isCollapsed && <span className="ml-4">Sign Out</span>}
          </button>
        </div>

        {/* Collapse Toggle */}
        <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-24 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm hover:bg-slate-50 transition-colors z-30"
        >
            {isCollapsed ? <ChevronRight className="w-3 h-3 text-slate-400" /> : <ChevronLeft className="w-3 h-3 text-slate-400" />}
        </button>
      </motion.aside>

      {/* Main Perspective */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header - Advanced++ Header */}
        <header className="h-20 bg-white/10 backdrop-blur-3xl border-b border-white/10 px-8 flex items-center justify-between z-10 shadow-sm shadow-black/5">
          <div className="flex-1 max-w-xl relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
            <input 
                type="text" 
                placeholder="Talk to AI Support... (try 'show my revenue trend')"
                className="w-full bg-white/20 border border-white/40 rounded-2xl pl-12 pr-4 py-2.5 text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-white/60 rounded-lg border border-white/40 text-[10px] font-black text-slate-400">⌘K</div>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2 text-slate-400 hover:text-indigo-600 hover:bg-white/40 rounded-xl transition-all">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            
            <div className="flex items-center gap-3 pl-6 border-l border-white/20">
                <div className="text-right hidden md:block">
                    <p className="text-sm font-black text-slate-900">{userName}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest tracking-tighter">Premium Account</p>
                </div>
                <div className="w-10 h-10 bg-white/40 backdrop-blur rounded-xl flex items-center justify-center border border-white/40 overflow-hidden shadow-sm">
                    <User className="w-6 h-6 text-slate-400" />
                </div>
            </div>
            
            <button className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-95 group">
                <Sparkles className="w-5 h-5 text-white group-hover:rotate-12" />
            </button>
          </div>
        </header>

        {/* Content Flow */}
        <main className="flex-1 overflow-y-auto p-8 relative">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-7xl mx-auto relative z-10"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
