/**
 * ============================================================================
 * Application Navigation Bar
 * ============================================================================
 * Header with navigation links, quick creation button, company identity,
 * and user session management.
 */

import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { 
  FileText, 
  Plus, 
  LayoutDashboard, 
  Users, 
  Package, 
  Settings, 
  LogOut, 
  Building2,
  Crown,
  Menu,
  X,
  Clock,
  QrCode,
  Lock
} from 'lucide-react';

export default function Navbar({ onOpenScanner }) {
  const { user, logout, openScannerModal } = useAuth();
  const { addToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isSuperAdmin = user?.role === 'superadmin' || user?.email === 'hrithikyadav05@gmail.com';
  const isPlanDue = !isSuperAdmin && Boolean(user?.isPlanDue || (user?.daysRemaining !== undefined && user?.daysRemaining <= 0));

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Quotations', path: '/quotes', icon: FileText },
    { name: 'Parties', path: '/parties', icon: Users },
    { name: 'Catalog', path: '/catalog', icon: Package },
    { name: 'Settings', path: '/settings', icon: Settings }
  ];

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const handleScanAndBuy = () => {
    addToast('💳 Choose a subscription plan and scan QR code to activate!', 'info');
    if (openScannerModal) {
      openScannerModal('3m');
    } else if (onOpenScanner) {
      onOpenScanner('3m');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3 lg:gap-6 shrink-0">
            <Link to="/" className="flex items-center gap-2 group shrink-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg sm:text-xl font-black tracking-tight text-slate-900">
                  QuoteMarket
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                  PRO
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-0.5 lg:gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-lg text-xs lg:text-sm font-semibold transition-colors ${
                      active
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span>{link.name}</span>
                  </Link>
                );
              })}

              {/* Super Admin Nav Link */}
              {isSuperAdmin && (
                <Link
                  to="/admin"
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-black transition-all ${
                    isActive('/admin')
                      ? 'bg-amber-400 text-slate-950 shadow-sm'
                      : 'bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300'
                  }`}
                >
                  <Crown className="w-3.5 h-3.5 fill-amber-500 text-amber-900" />
                  <span>Super Admin</span>
                </Link>
              )}
            </nav>
          </div>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-2.5 lg:gap-3 shrink-0">
            {/* Unified User Subscription Plan & Buy Badge */}
            {!isSuperAdmin && (
              <button
                type="button"
                onClick={handleScanAndBuy}
                className={`inline-flex items-center gap-2 pl-3 pr-1.5 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 shadow-xs border ${
                  isPlanDue
                    ? 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100 animate-pulse'
                    : user?.planStatus === 'trial'
                    ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                    : 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                }`}
                title="Click to view subscription plans & scan QR to pay"
              >
                <div className="flex items-center gap-1.5">
                  <Clock className={`w-3.5 h-3.5 ${isPlanDue ? 'text-rose-600' : 'text-amber-700'}`} />
                  <span>
                    {isPlanDue
                      ? 'Plan Expired'
                      : user?.planStatus === 'trial'
                      ? `Trial: ${user?.daysRemaining ?? 3}d Left`
                      : `Plan: ${user?.daysRemaining ?? 30}d Left`}
                  </span>
                </div>
                <span className="flex items-center gap-1 bg-amber-400 hover:bg-amber-500 text-amber-950 px-2 py-0.5 rounded-full text-[10px] font-black tracking-wide shadow-xs transition-colors">
                  <QrCode className="w-3 h-3" />
                  <span>+ Buy</span>
                </span>
              </button>
            )}

            {/* Quick Create Quote Button (Intercept if plan is expired) */}
            {isPlanDue ? (
              <button
                type="button"
                onClick={() => {
                  addToast('⚠️ Quotation drafting is locked because your plan has expired. Please renew to create new quotes.', 'warning');
                  handleScanAndBuy();
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all active:scale-95 border border-slate-300"
                title="Creation locked. Click to renew subscription."
              >
                <Lock className="w-3.5 h-3.5 text-rose-500" />
                <span>New Quote</span>
              </button>
            ) : (
              <Link
                to="/quotes/new"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs lg:text-sm font-bold shadow-sm shadow-blue-500/20 hover:shadow-md transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>New Quote</span>
              </Link>
            )}

            {/* User Profile & Sign Out */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-700 font-bold text-xs">
                  {user?.companyName ? user.companyName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="text-left leading-tight hidden xl:block">
                  <p className="text-xs font-bold text-slate-800 truncate max-w-[110px]">
                    {user?.companyName || user?.name || 'Business'}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate max-w-[110px]">
                    {user?.email}
                  </p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                title="Sign Out"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mobile Action Controls */}
          <div className="flex items-center gap-1.5 md:hidden">
            {!isSuperAdmin && (
              <button
                type="button"
                onClick={handleScanAndBuy}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                  isPlanDue
                    ? 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse'
                    : 'bg-amber-100 text-amber-900 border border-amber-300'
                }`}
              >
                <QrCode className="w-3 h-3 text-amber-700" />
                <span>{isPlanDue ? 'Renew' : `${user?.daysRemaining ?? 3}d (+Buy)`}</span>
              </button>
            )}

            {isPlanDue ? (
              <button
                type="button"
                onClick={() => {
                  addToast('⚠️ Quotation drafting is locked because your plan has expired. Please renew.', 'warning');
                  handleScanAndBuy();
                }}
                className="p-2 rounded-lg bg-slate-200 text-slate-600"
              >
                <Lock className="w-4 h-4 text-rose-500" />
              </button>
            ) : (
              <Link
                to="/quotes/new"
                className="inline-flex items-center p-2 rounded-lg bg-blue-600 text-white"
              >
                <Plus className="w-4 h-4" />
              </Link>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                {user?.companyName ? user.companyName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{user?.companyName || user?.name}</p>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>
            </div>
          </div>

          {!isSuperAdmin && (
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                handleScanAndBuy();
              }}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold ${
                isPlanDue
                  ? 'bg-rose-50 text-rose-800 border border-rose-200'
                  : 'bg-amber-50 text-amber-900 border border-amber-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-amber-600" />
                <span>{isPlanDue ? 'Subscription Expired - Scan & Pay' : 'Subscription Plans (+Buy / Extend)'}</span>
              </div>
              <span className="text-[11px] opacity-80">
                {isPlanDue ? 'Payment Due' : `${user?.daysRemaining ?? 3} Days Left`}
              </span>
            </button>
          )}

          {isSuperAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-black bg-amber-100 text-amber-950 border border-amber-300"
            >
              <Crown className="w-4 h-4 fill-amber-500" />
              Super Admin Dashboard
            </Link>
          )}

          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
                  active ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4 text-slate-500" />
                {link.name}
              </Link>
            );
          })}

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      )}
    </header>
  );
}
