import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Leaf, User, LogOut } from 'lucide-react';

const Navbar = ({ user, onLogout }) => {
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Features', path: '/features' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-earth-200/60 sticky top-0 z-50 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-600/30 group-hover:shadow-brand-600/50 group-hover:-translate-y-0.5 transition-all duration-300">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div className="leading-tight">
              <span className="font-serif text-2xl text-bark-900 tracking-tight">AgriTrace</span>
              <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-earth-500">Supply Tracker</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm font-semibold transition-colors duration-200 ${
                  location.pathname === link.path
                    ? 'text-brand-600 border-b-2 border-brand-600 pb-1'
                    : 'text-bark-600 hover:text-brand-600'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link to="/dashboard" className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-full bg-cream-50 border border-earth-200/60 hover:bg-brand-50 hover:border-brand-200 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center">
                    <User className="w-4 h-4 text-brand-700" />
                  </div>
                  <div className="text-sm leading-tight text-left">
                    <span className="font-semibold text-bark-800 block">{user.name}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 block">
                      {user.role}
                    </span>
                  </div>
                </Link>
                <button onClick={onLogout} className="btn-secondary px-4 py-2 text-sm flex items-center gap-2">
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <Link to="/login" className="btn-primary py-2.5 px-6 rounded-full text-sm">
                Staff Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
