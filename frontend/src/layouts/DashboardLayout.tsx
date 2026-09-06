import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Brain, FileSearch, AlertTriangle,
  Activity, Menu, X, Zap, Database, PanelLeftClose, PanelLeftOpen
} from 'lucide-react';
import HiggsFieldBackground from '../three/HiggsFieldBackground';

const sidebarLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/analyze', label: 'Analyze', icon: FileSearch },
  { to: '/risk-insights', label: 'Risk Insights', icon: AlertTriangle },
  { to: '/ai-model', label: 'AI Model', icon: Brain },
  { to: '/reports', label: 'Report History', icon: Database },
  { to: '/team', label: 'Team', icon: Activity },
];

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const SIDEBAR_WIDTH = collapsed ? 72 : 260;

  return (
    <div className="min-h-screen flex">
      <HiggsFieldBackground />

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className="fixed top-0 left-0 h-full z-50 flex flex-col"
        style={{
          width: SIDEBAR_WIDTH,
          background: 'rgba(4, 7, 15, 0.98)',
          borderRight: '1px solid rgba(100, 116, 139, 0.15)',
          boxShadow: '4px 0 24px rgba(0, 0, 0, 0.4)',
          transform: mobileOpen ? 'translateX(0)' : undefined,
          transition: 'width 0.3s ease, transform 0.3s ease',
        }}
      >
        {/* Mobile transform override */}
        <style>{`
          @media (max-width: 1023px) {
            aside { transform: ${mobileOpen ? 'translateX(0)' : 'translateX(-100%)'} !important; }
          }
        `}</style>

        {/* Logo */}
        <Link to="/" className={`h-[64px] flex items-center border-b border-white/[0.08] px-4 shrink-0 no-underline hover:bg-white/[0.03] transition-colors ${collapsed ? 'justify-center' : 'gap-2.5'}`}>
          <img
            src="/anveshak-logo.svg"
            alt="Anveshak"
            className="w-9 h-9 rounded-xl object-contain shadow-lg shadow-brand-500/30 shrink-0"
          />
          {!collapsed && (
            <span className="text-lg font-extrabold text-white tracking-wider whitespace-nowrap overflow-hidden">
              Anve<span className="bg-gradient-to-r from-brand-400 to-blue-400 bg-clip-text text-transparent">shak</span>
            </span>
          )}
        </Link>

        {/* Nav links */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto overflow-x-hidden">
          {sidebarLinks.map((link) => {
            const active = isActive(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`group relative flex items-center rounded-xl text-sm font-semibold transition-all duration-200 no-underline ${
                  collapsed ? 'justify-center px-2 py-3' : 'gap-3 px-3 py-2.5'
                } ${
                  active
                    ? 'bg-gradient-to-r from-brand-500/20 to-blue-500/10 text-white border border-brand-500/25'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.06] border border-transparent'
                }`}
              >
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-brand-500 rounded-r-full" />
                )}
                <link.icon className={`w-5 h-5 shrink-0 transition-colors duration-200 ${
                  active ? 'text-brand-400' : 'text-slate-500 group-hover:text-brand-400'
                }`} />
                {!collapsed && (
                  <span className="whitespace-nowrap">{link.label}</span>
                )}
                {!collapsed && active && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
                )}

                {/* Tooltip for collapsed state */}
                {collapsed && (
                  <div className="absolute left-full ml-3 px-3 py-1.5 rounded-lg bg-slate-800 border border-white/10 text-white text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50 shadow-xl">
                    {link.label}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-[5px] border-t-transparent border-r-[5px] border-r-slate-800 border-b-[5px] border-b-transparent" />
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* System status */}
        {!collapsed && (
          <div className="px-3 pb-3 shrink-0">
            <div className="glass-subtle p-3 space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Zap className="w-3 h-3 text-success-500" />
                <span>System Online</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Brain className="w-3 h-3 text-brand-400" />
                <span>Model v2.1 Active</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Activity className="w-3 h-3 text-warn-500" />
                <span>99.8% Uptime</span>
              </div>
            </div>
          </div>
        )}

        {/* Collapse toggle */}
        <div className="hidden lg:flex border-t border-white/[0.08] p-2 shrink-0">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-slate-500 hover:text-white hover:bg-white/[0.06] transition-all duration-200"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <PanelLeftOpen className="w-5 h-5" />
            ) : (
              <>
                <PanelLeftClose className="w-5 h-5" />
                <span className="text-xs font-semibold">Collapse</span>
              </>
            )}
          </button>
        </div>

        {/* Mobile close */}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden absolute top-4 right-3 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors z-50"
        >
          <X className="w-5 h-5" />
        </button>
      </aside>

      {/* Main content - uses padding-left instead of margin-left for reliable shifting */}
      <div
        className="flex-1 flex flex-col min-h-screen"
        style={{ paddingLeft: SIDEBAR_WIDTH, transition: 'padding-left 0.3s ease' }}
      >
        {/* Top bar */}
        <header
          className="sticky top-0 z-30 h-[64px] flex items-center justify-between px-4 md:px-6 border-b border-white/[0.08]"
          style={{ background: 'rgba(4, 7, 15, 0.85)', backdropFilter: 'blur(20px)' }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Desktop expand button when collapsed */}
            <button
              onClick={() => setCollapsed(false)}
              className={`hidden lg:flex p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-200 ${
                collapsed ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
              title="Expand sidebar"
            >
              <PanelLeftOpen className="w-5 h-5" />
            </button>

            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] w-64 lg:w-80">
              <svg className="w-4 h-4 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search reports, precursors..."
                className="bg-transparent border-none outline-none text-sm text-white placeholder:text-slate-600 w-full"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-success-500/10 border border-success-500/20">
              <div className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
              <span className="text-xs font-semibold text-success-500">Live</span>
            </div>

            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-brand-500/20 cursor-pointer hover:scale-105 transition-transform">
              A
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
