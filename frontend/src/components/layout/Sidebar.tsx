import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Dashboard', icon: (
    <svg className="sidebar-link-icon" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" /></svg>
  )},
  { to: '/analyze', label: 'Analyze', icon: (
    <svg className="sidebar-link-icon" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
  )},
  { to: '/watchlist', label: 'Watchlist', icon: (
    <svg className="sidebar-link-icon" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4.99c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z" /></svg>
  )},
  { to: '/analytics', label: 'Analytics', icon: (
    <svg className="sidebar-link-icon" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
  )},
  { to: '/heatmap', label: 'Heatmap', icon: (
    <svg className="sidebar-link-icon" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
  )},
];

export default function Sidebar() {
  return (
    <nav className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-title">SIF Detection</div>
        <div className="sidebar-brand-sub">Oil India Limited</div>
      </div>

      <div className="sidebar-nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          >
            {link.icon}
            <span>{link.label}</span>
          </NavLink>
        ))}
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-footer-text">
          <div><span>SIH 2026 — Problem #26165</span></div>
          <div style={{ marginTop: 2 }}>AI/NLP Engine v1.0</div>
        </div>
      </div>

      <div className="sidebar-edge" />
    </nav>
  );
}
