import { Outlet, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, ExternalLink, Heart, ArrowUp, ChevronRight, Mail, MapPin, Phone } from 'lucide-react';
import Navbar from '../components/layout/Navbar';

function PremiumFooter() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const footerLinks = {
    product: [
      { label: 'Analyze Report', to: '/analyze' },
      { label: 'Dashboard', to: '/dashboard' },
      { label: 'Report History', to: '/reports' },
    ],
    project: [
      { label: 'Team Anveshak', to: '/team' },
      { label: 'Home', to: '/' },
    ],
    connect: [
      { label: 'GitHub', href: '#', icon: ExternalLink },
      { label: 'SIH 2026', href: '#', icon: ExternalLink },
      { label: 'Problem #26165', href: '#', icon: ExternalLink },
    ],
  };

  return (
    <footer className="relative border-t border-white/[0.04] overflow-hidden">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-8">
        {/* Top section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-5">
              <img
                src="/anveshak-logo.svg"
                alt="Anveshak"
                className="w-10 h-10 rounded-xl object-contain shadow-lg shadow-brand-500/20"
              />
              <span className="text-xl font-extrabold text-white tracking-wider">
                Anve<span className="bg-gradient-to-r from-brand-400 to-blue-400 bg-clip-text text-transparent">shak</span>
              </span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed max-w-sm mb-6">
              AI-Based SIF Precursor Detection System for Oil India Limited. Built for Smart India Hackathon 2026.
            </p>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-slate-500 text-xs">
                <MapPin className="w-3.5 h-3.5 text-brand-400" />
                Smart India Hackathon 2026
              </div>
              <div className="flex items-center gap-2 text-slate-500 text-xs">
                <Mail className="w-3.5 h-3.5 text-brand-400" />
                Problem Statement #26165
              </div>
              <div className="flex items-center gap-2 text-slate-500 text-xs">
                <Phone className="w-3.5 h-3.5 text-brand-400" />
                Oil India Limited
              </div>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-5">{title}</h4>
              <div className="space-y-3">
                {links.map((link, i) => (
                  'to' in link ? (
                    <Link
                      key={i}
                      to={link.to}
                      className="block text-slate-500 text-sm hover:text-brand-400 transition-colors no-underline"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      key={i}
                      href={link.href}
                      className="flex items-center gap-2 text-slate-500 text-sm hover:text-brand-400 transition-colors no-underline"
                    >
                      {link.icon && <link.icon className="w-3.5 h-3.5" />}
                      {link.label}
                    </a>
                  )
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="glass p-6 mb-12 gradient-border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-white font-bold text-sm mb-1">Stay Updated</h4>
              <p className="text-slate-500 text-xs">Get the latest safety intelligence insights</p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 md:w-64 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-white text-sm focus:outline-none focus:border-brand-500/30 transition-all placeholder:text-slate-600"
              />
              <button className="btn-3d btn-3d-primary py-2.5 px-5 text-xs shrink-0">
                Subscribe
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/[0.04] pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-600 text-xs flex items-center gap-1">
              &copy; 2026 Team Anveshak. Built with <Heart className="w-3 h-3 text-danger-500 fill-danger-500" /> for SIH 2026
            </p>
            <button
              onClick={scrollToTop}
              className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-slate-500 hover:text-white hover:bg-white/[0.06] hover:border-white/10 transition-all text-xs"
            >
              Back to top
              <ArrowUp className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function LandingLayout() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="relative z-10">
        <Outlet />
      </main>
      <PremiumFooter />
    </div>
  );
}
