/**
 * ============================================================================
 * Super Admin Management Dashboard
 * ============================================================================
 * Exclusively for Super Admin (hrithikyadav05@gmail.com / Hrithik King):
 * - Live Business & Platform Metrics (Users, Quotes, Revenue, Gifted Credits)
 * - User Directory: search, view credit balances, quote counts
 * - Instant Credit Allocation: +1 Free PDF, +10 Free PDFs, custom credit gifting
 * - Payment & Pricing Engine: manage price per PDF (default ₹2), UPI ID, Merchant name
 * - Real-time Payment & Gift Transaction Audit Log
 */

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  CreditCard, 
  FileText, 
  TrendingUp, 
  Gift, 
  Plus, 
  Search, 
  RefreshCw, 
  Save, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Smartphone, 
  Settings as SettingsIcon, 
  ArrowUpRight,
  UserCheck,
  AlertCircle,
  AlertTriangle,
  Calendar,
  CalendarPlus,
  Hourglass,
  X,
  Zap,
  Trash2,
  Ban,
  MessageCircle,
  Phone,
  Mail
} from 'lucide-react';
import { adminAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Badge from '../components/common/Badge';

export default function AdminDashboard() {
  const { user, refreshUser } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'settings' | 'transactions'
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Data States
  const [stats, setStats] = useState({
    totalUsers: 0,
    activePlansCount: 0,
    duePlansCount: 0,
    totalQuotations: 0,
    totalTransactions: 0,
    totalRevenue: 0,
    totalCreditsGifted: 0,
    currentPricePerPdf: 2
  });

  const [usersList, setUsersList] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [userFilter, setUserFilter] = useState('all'); // 'all' | 'active' | 'due' | 'suspended'
  const [transactions, setTransactions] = useState([]);
  const [txSearch, setTxSearch] = useState('');

  // Payment Settings Form State
  const [paymentSettings, setPaymentSettings] = useState({
    pricePerPdf: 2,
    upiId: 'hrithikyadav05@okaxis',
    merchantName: 'Hrithik King',
    isPaymentRequired: true,
    packs: [
      { credits: 1, price: 2, label: 'Single PDF Download (₹2)' },
      { credits: 10, price: 18, label: '10 PDFs Pack (₹18 - Save 10%)' },
      { credits: 50, price: 80, label: '50 PDFs Pro Pack (₹80 - Save 20%)' }
    ]
  });
  const [savingSettings, setSavingSettings] = useState(false);

  // Custom Credit Modal State
  const [creditModalUser, setCreditModalUser] = useState(null);
  const [customCreditsInput, setCustomCreditsInput] = useState(5);
  const [creditReasonInput, setCreditReasonInput] = useState('Admin Special Promotional Bonus');
  const [submittingCredit, setSubmittingCredit] = useState(false);

  // Add / Extend Days Modal State
  const [dayModalUser, setDayModalUser] = useState(null);
  const [customDaysInput, setCustomDaysInput] = useState(30);
  const [dayReasonInput, setDayReasonInput] = useState('Payment received via UPI');
  const [submittingDays, setSubmittingDays] = useState(false);

  // Suspend User Modal State
  const [suspendModalUser, setSuspendModalUser] = useState(null);
  const [suspendReasonInput, setSuspendReasonInput] = useState('Account suspended by administrator');
  const [submittingSuspend, setSubmittingSuspend] = useState(false);

  // Delete User Modal State
  const [deleteModalUser, setDeleteModalUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(false);

  // Verify access
  const isSuperAdmin = user?.role === 'superadmin' || user?.email === 'hrithikyadav05@gmail.com';

  // Load All Admin Data
  const loadAllData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [statsRes, usersRes, settingsRes, txRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getAllUsers(),
        adminAPI.getSettings(),
        adminAPI.getTransactions()
      ]);

      if (statsRes.data?.stats) setStats(statsRes.data.stats);
      if (usersRes.data?.users) setUsersList(usersRes.data.users);
      if (settingsRes.data?.settings) setPaymentSettings(settingsRes.data.settings);
      if (txRes.data?.transactions) setTransactions(txRes.data.transactions);

      if (isRefresh) addToast('Admin dashboard refreshed with live data!');
    } catch (err) {
      console.error('Admin data load error:', err);
      addToast('Failed to load some admin data', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Gift Credits Handler (+1, +10, or custom)
  const handleAddCredits = async (targetUser, count, reason) => {
    try {
      const res = await adminAPI.addCredits({
        userId: targetUser.id,
        creditsToAdd: count,
        reason: reason || `Super Admin gifted ${count} PDF credits`
      });

      if (res.data?.success) {
        addToast(`Granted +${count} PDF Credits to ${targetUser.name}!`);

        // Update local user list
        setUsersList((prev) =>
          prev.map((u) =>
            u.id === targetUser.id ? { ...u, pdfCredits: res.data.newCredits } : u
          )
        );

        // Update stats
        setStats((prev) => ({
          ...prev,
          totalCreditsGifted: (prev.totalCreditsGifted || 0) + count
        }));

        // Refresh current user if editing self
        if (targetUser.id === user?.id || targetUser.email === user?.email) {
          refreshUser && refreshUser();
        }

        // Close modal if open
        setCreditModalUser(null);
      }
    } catch (err) {
      console.error('Credit allocation error:', err);
      addToast(err.response?.data?.message || 'Failed to allocate credits', 'error');
    } finally {
      setSubmittingCredit(false);
    }
  };

  // Add / Extend Subscription & Trial Days Handler
  const handleAddDays = async (targetUser, days, reason) => {
    setSubmittingDays(true);
    try {
      const res = await adminAPI.addDays({
        userId: targetUser.id,
        daysToAdd: days,
        reason: reason || `Super Admin added ${days} subscription days`
      });

      if (res.data?.success) {
        addToast(res.data.message || `Granted +${days} days to ${targetUser.name}!`);

        // Update local user in state
        setUsersList((prev) =>
          prev.map((u) =>
            u.id === targetUser.id
              ? {
                  ...u,
                  planExpiresAt: res.data.planExpiresAt,
                  daysRemaining: res.data.daysRemaining,
                  planStatus: res.data.planStatus,
                  isPlanDue: false
                }
              : u
          )
        );

        // Update stats active & due plans
        setStats((prev) => ({
          ...prev,
          activePlansCount: (prev.activePlansCount || 0) + (targetUser.isPlanDue ? 1 : 0),
          duePlansCount: Math.max(0, (prev.duePlansCount || 0) - (targetUser.isPlanDue ? 1 : 0))
        }));

        // Refresh current user session if editing self
        if (targetUser.id === user?.id || targetUser.email === user?.email) {
          refreshUser && refreshUser();
        }

        // Close modal if open
        setDayModalUser(null);
      }
    } catch (err) {
      console.error('Subscription days addition error:', err);
      addToast(err.response?.data?.message || 'Failed to add subscription days', 'error');
    } finally {
      setSubmittingDays(false);
    }
  };

  // Save Payment Settings Handler
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await adminAPI.updateSettings(paymentSettings);
      if (res.data?.success) {
        addToast('Payment and pricing settings updated successfully!');
        setStats((prev) => ({
          ...prev,
          currentPricePerPdf: paymentSettings.pricePerPdf
        }));
      }
    } catch (err) {
      console.error('Settings save error:', err);
      addToast(err.response?.data?.message || 'Failed to update payment settings', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  // Suspend / Unsuspend User Handler
  const handleToggleSuspend = async (targetUser, reason = '') => {
    setSubmittingSuspend(true);
    try {
      const res = await adminAPI.toggleSuspend(targetUser.id, { reason });
      if (res.data?.success) {
        addToast(
          res.data.message || `User account status updated!`,
          res.data.isSuspended ? 'warning' : 'success'
        );

        // Update local user list
        setUsersList((prev) =>
          prev.map((u) =>
            u.id === targetUser.id
              ? {
                  ...u,
                  isSuspended: res.data.isSuspended,
                  suspendReason: res.data.isSuspended ? reason : ''
                }
              : u
          )
        );

        setSuspendModalUser(null);
      }
    } catch (err) {
      console.error('Suspend error:', err);
      addToast(err.response?.data?.message || 'Failed to update user status', 'error');
    } finally {
      setSubmittingSuspend(false);
    }
  };

  // Permanently Delete User Handler
  const handleDeleteUser = async (targetUser) => {
    setDeletingUser(true);
    try {
      const res = await adminAPI.deleteUser(targetUser.id);
      if (res.data?.success) {
        addToast(res.data.message || `User ${targetUser.name} deleted successfully!`, 'success');

        // Remove from list
        setUsersList((prev) => prev.filter((u) => u.id !== targetUser.id));

        // Update stats
        setStats((prev) => ({
          ...prev,
          totalUsers: Math.max(0, (prev.totalUsers || 1) - 1),
          totalQuotations: Math.max(0, (prev.totalQuotations || 0) - (targetUser.quotationsCount || 0))
        }));

        setDeleteModalUser(null);
      }
    } catch (err) {
      console.error('Delete user error:', err);
      addToast(err.response?.data?.message || 'Failed to delete user', 'error');
    } finally {
      setDeletingUser(false);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-rose-200 text-center space-y-4 shadow-xl">
        <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Restricted Access</h2>
        <p className="text-xs text-slate-600">
          This portal is reserved strictly for Super Admin (hrithikyadav05@gmail.com). Please log in with the administrator account.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-slate-500">Loading Super Admin Control Center...</p>
      </div>
    );
  }

  // Filtered lists
  const filteredUsers = usersList.filter((u) => {
    const q = userSearch.toLowerCase();
    const matchesSearch =
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.username?.toLowerCase().includes(q) ||
      u.companyName?.toLowerCase().includes(q) ||
      u.savedUpiId?.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (userFilter === 'active') {
      return !u.isSuspended && !u.isPlanDue && u.daysRemaining > 0;
    }
    if (userFilter === 'due') {
      return (
        !u.isSuspended &&
        (u.isPlanDue ||
          (u.role !== 'superadmin' && u.email !== 'hrithikyadav05@gmail.com' && u.daysRemaining <= 0))
      );
    }
    if (userFilter === 'suspended') {
      return Boolean(u.isSuspended);
    }
    return true;
  });

  const suspendedUsersCount = usersList.filter((u) => Boolean(u.isSuspended)).length;

  const dueUsersCount = usersList.filter(
    (u) =>
      !u.isSuspended &&
      (u.isPlanDue || (u.role !== 'superadmin' && u.email !== 'hrithikyadav05@gmail.com' && u.daysRemaining <= 0))
  ).length;

  const activeUsersCount = usersList.filter(
    (u) => !u.isSuspended && !u.isPlanDue && u.daysRemaining > 0
  ).length;

  const filteredTransactions = transactions.filter((t) => {
    const q = txSearch.toLowerCase();
    return (
      t.userName?.toLowerCase().includes(q) ||
      t.userEmail?.toLowerCase().includes(q) ||
      t.transactionRef?.toLowerCase().includes(q) ||
      t.paymentMethod?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-blue-900 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-full text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>SUPER ADMIN COMMAND CENTER</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Platform & Payments Master Panel
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Logged in as <strong className="text-white font-bold">{user?.name || 'Hrithik King'}</strong> ({user?.email}). Manage users, add subscription days, gift PDF credits, and monitor dues.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => loadAllData(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/10 shadow-sm backdrop-blur-md transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh Data'}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
        {/* Metric 1: Total Users */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-blue-600">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
              Total Users
            </span>
            <div className="w-7 h-7 rounded-xl bg-blue-50 flex items-center justify-center">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{stats.totalUsers || 0}</p>
          <span className="text-[10px] text-slate-400 font-medium block truncate">
            Registered accounts
          </span>
        </div>

        {/* Metric 2: Active Plans */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
              Active Plans
            </span>
            <div className="w-7 h-7 rounded-xl bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600">
            {stats.activePlansCount || activeUsersCount}
          </p>
          <span className="text-[10px] text-emerald-700 font-bold block truncate">
            In trial or active
          </span>
        </div>

        {/* Metric 3: Plans Due / Expired */}
        <div className={`bg-white rounded-2xl p-4 border shadow-sm space-y-1.5 transition-all ${
          (stats.duePlansCount || dueUsersCount) > 0 ? 'border-rose-300 ring-2 ring-rose-100 bg-rose-50/20' : 'border-slate-200'
        }`}>
          <div className="flex items-center justify-between text-rose-600">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
              Plans Due
            </span>
            <div className="w-7 h-7 rounded-xl bg-rose-50 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-600">
            {stats.duePlansCount || dueUsersCount}
          </p>
          <span className="text-[10px] text-rose-700 font-bold block truncate">
            Trial / plan expired
          </span>
        </div>

        {/* Metric 4: Quotations */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-indigo-600">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
              Quotations
            </span>
            <div className="w-7 h-7 rounded-xl bg-indigo-50 flex items-center justify-center">
              <FileText className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{stats.totalQuotations || 0}</p>
          <span className="text-[10px] text-slate-400 font-medium block truncate">
            Created across users
          </span>
        </div>

        {/* Metric 5: Revenue */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-teal-600">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
              Total Revenue
            </span>
            <div className="w-7 h-7 rounded-xl bg-teal-50 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">
            ₹{Number(stats.totalRevenue || 0).toLocaleString('en-IN')}
          </p>
          <span className="text-[10px] text-teal-700 font-bold block truncate">
            PDFs & Packs
          </span>
        </div>

        {/* Metric 6: Current PDF Rate */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-amber-600">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
              Rate / PDF
            </span>
            <div className="w-7 h-7 rounded-xl bg-amber-50 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 fill-amber-500" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600">
            ₹{stats.currentPricePerPdf || 2}
          </p>
          <span className="text-[10px] text-slate-400 font-medium block truncate">
            Configured price
          </span>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex border-b border-slate-200 space-x-3 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'users'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Directory & Credit Allocation</span>
          <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-full font-bold">
            {usersList.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'settings'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <SettingsIcon className="w-4 h-4" />
          <span>Payment & Pricing Settings</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('transactions')}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'transactions'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Audit & Transaction Logs</span>
          <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-full font-bold">
            {transactions.length}
          </span>
        </button>
      </div>

      {/* 4. TAB 1: User Management, Subscription Days & Credit Gifting */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Sub-Filter Tabs & Search bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl shrink-0 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setUserFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  userFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Users ({usersList.length})
              </button>
              <button
                type="button"
                onClick={() => setUserFilter('active')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  userFilter === 'active'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Active Plans ({activeUsersCount})
              </button>
              <button
                type="button"
                onClick={() => setUserFilter('due')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  userFilter === 'due'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : dueUsersCount > 0
                    ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Plans Due / Expired ({dueUsersCount})
              </button>
              <button
                type="button"
                onClick={() => setUserFilter('suspended')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  userFilter === 'suspended'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : suspendedUsersCount > 0
                    ? 'bg-amber-50 text-amber-800 border border-amber-300'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Ban className="w-3.5 h-3.5" />
                Suspended ({suspendedUsersCount})
              </button>
            </div>

            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by name, @username, email, company..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* User Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    <th className="py-3 px-4">User / Account</th>
                    <th className="py-3 px-4">Contact & WhatsApp</th>
                    <th className="py-3 px-4">Subscription Plan</th>
                    <th className="py-3 px-4">Add / Extend Days</th>
                    <th className="py-3 px-4">PDF Credits</th>
                    <th className="py-3 px-4 text-center">Quotes</th>
                    <th className="py-3 px-4">Saved UPI</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        No registered users found matching the filter "{userFilter}" and query "{userSearch}"
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const isSuper = u.role === 'superadmin' || u.email === 'hrithikyadav05@gmail.com';
                      return (
                        <tr key={u.id} className={`hover:bg-slate-50/60 transition-colors ${u.isSuspended ? 'bg-rose-50/20' : ''}`}>
                          {/* User Info */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-8 h-8 rounded-full font-bold flex items-center justify-center shrink-0 text-xs ${
                                u.isSuspended ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
                              }`}>
                                {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <p className="font-bold text-slate-900">{u.name}</p>
                                  {u.username && (
                                    <span className="font-mono text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded font-semibold">
                                      @{u.username}
                                    </span>
                                  )}
                                  {isSuper && (
                                    <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[9px] font-black px-1.5 py-0.2 rounded-full">
                                      👑 Super Admin
                                    </span>
                                  )}
                                  {u.isSuspended && (
                                    <span className="bg-rose-100 text-rose-800 border border-rose-300 text-[9px] font-black px-1.5 py-0.5 rounded-full inline-flex items-center gap-1">
                                      <Ban className="w-2.5 h-2.5" /> Suspended
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-500 font-normal">{u.email}</p>
                                {u.isSuspended && u.suspendReason && (
                                  <p className="text-[10px] text-rose-600 font-medium mt-0.5">
                                    Reason: {u.suspendReason}
                                  </p>
                                )}
                                {u.companyName && (
                                  <span className="text-[10px] text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded font-semibold mt-0.5 inline-block">
                                    {u.companyName}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Contact & WhatsApp */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-1">
                              {u.companyPhone ? (
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <a
                                    href={`tel:${u.companyPhone}`}
                                    className="font-mono text-[11px] font-bold text-slate-800 hover:text-blue-600 transition-colors inline-flex items-center gap-1"
                                    title="Call user"
                                  >
                                    <Phone className="w-3 h-3 text-slate-400" />
                                    <span>{u.companyPhone}</span>
                                  </a>
                                  {(() => {
                                    const digits = String(u.companyPhone).replace(/[^0-9]/g, '');
                                    const waNum = digits.length === 10 ? '91' + digits : digits;
                                    const waMsg = encodeURIComponent(
                                      `Hello ${u.name || ''}, this is Hrithik from QuoteMarket.\n\n` +
                                      (u.isPlanDue
                                        ? `Your subscription plan is currently due. Please scan your QR code or reach out to us to reactivate.`
                                        : `Thank you for being a valued QuoteMarket customer! You have ${u.daysRemaining} days left in your plan. Let us know if you need any assistance.`)
                                    );
                                    return (
                                      <a
                                        href={`https://wa.me/${waNum}?text=${waMsg}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-md shadow-xs active:scale-95 transition-all"
                                        title="Chat on WhatsApp"
                                      >
                                        <MessageCircle className="w-3 h-3 fill-current" />
                                        <span>WhatsApp</span>
                                      </a>
                                    );
                                  })()}
                                </div>
                              ) : (
                                <span className="text-[10px] text-slate-400 italic block">No phone provided</span>
                              )}
                              <a
                                href={`mailto:${u.email}?subject=QuoteMarket%20Support`}
                                className="inline-flex items-center gap-1 text-[10px] text-blue-600 hover:underline"
                                title="Send email"
                              >
                                <Mail className="w-2.5 h-2.5" />
                                <span>{u.email}</span>
                              </a>
                            </div>
                          </td>

                          {/* Subscription Plan Status */}
                          <td className="py-3.5 px-4">
                            {isSuper ? (
                              <span className="inline-flex items-center gap-1 font-bold text-amber-900 bg-amber-50 border border-amber-300 px-2 py-0.5 rounded-md text-[11px]">
                                👑 Permanent Plan
                              </span>
                            ) : u.isPlanDue || u.daysRemaining <= 0 ? (
                              <div className="space-y-0.5">
                                <span className="inline-flex items-center gap-1 font-black text-rose-700 bg-rose-50 border border-rose-300 px-2 py-0.5 rounded-md text-[11px]">
                                  <AlertTriangle className="w-3 h-3 text-rose-600" />
                                  Plan Due / Expired
                                </span>
                                <span className="block text-[10px] text-slate-400">
                                  {u.planExpiresAt
                                    ? `Expired: ${new Date(u.planExpiresAt).toLocaleDateString('en-IN')}`
                                    : '0 Days Left'}
                                </span>
                              </div>
                            ) : u.planStatus === 'trial' ? (
                              <div className="space-y-0.5">
                                <span className="inline-flex items-center gap-1 font-bold text-amber-800 bg-amber-50 border border-amber-300 px-2 py-0.5 rounded-md text-[11px]">
                                  <Clock className="w-3 h-3 text-amber-600" />
                                  3-Day Trial ({u.daysRemaining}d Left)
                                </span>
                                <span className="block text-[10px] text-slate-400">
                                  {u.planExpiresAt && `Ends: ${new Date(u.planExpiresAt).toLocaleDateString('en-IN')}`}
                                </span>
                              </div>
                            ) : (
                              <div className="space-y-0.5">
                                <span className="inline-flex items-center gap-1 font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-md text-[11px]">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  Active Plan ({u.daysRemaining}d Left)
                                </span>
                                <span className="block text-[10px] text-slate-400">
                                  {u.planExpiresAt && `Ends: ${new Date(u.planExpiresAt).toLocaleDateString('en-IN')}`}
                                </span>
                              </div>
                            )}
                          </td>

                          {/* Add / Extend Subscription Days */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                disabled={submittingDays}
                                onClick={() => handleAddDays(u, 30, 'Admin added 1 Month subscription (₹100)')}
                                className="px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-md text-[10px] font-bold transition-colors active:scale-95 disabled:opacity-50"
                                title="Add 1 Month (30 Days - ₹100)"
                              >
                                +1M (₹100)
                              </button>
                              <button
                                type="button"
                                disabled={submittingDays}
                                onClick={() => handleAddDays(u, 90, 'Admin added 3 Months subscription (₹200)')}
                                className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-md text-[10px] font-bold transition-colors active:scale-95 disabled:opacity-50"
                                title="Add 3 Months (90 Days - ₹200)"
                              >
                                +3M (₹200)
                              </button>
                              <button
                                type="button"
                                disabled={submittingDays}
                                onClick={() => handleAddDays(u, 180, 'Admin added 6 Months subscription (₹450)')}
                                className="px-2 py-0.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-md text-[10px] font-bold transition-colors active:scale-95 disabled:opacity-50"
                                title="Add 6 Months (180 Days - ₹450)"
                              >
                                +6M (₹450)
                              </button>
                              <button
                                type="button"
                                disabled={submittingDays}
                                onClick={() => handleAddDays(u, 365, 'Admin added 1 Year subscription (₹899)')}
                                className="px-2 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-md text-[10px] font-bold transition-colors active:scale-95 disabled:opacity-50"
                                title="Add 1 Year (365 Days - ₹899)"
                              >
                                +1Y (₹899)
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setDayModalUser(u);
                                  setCustomDaysInput(90);
                                  setDayReasonInput('Payment received via UPI ₹200 (3 Months)');
                                }}
                                className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[10px] font-bold transition-colors"
                                title="Choose Custom Days..."
                              >
                                + More...
                              </button>
                            </div>
                          </td>

                          {/* Credit Balance & Quick Gift */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`inline-flex items-center gap-1 font-bold text-[11px] px-2 py-0.5 rounded-full shrink-0 ${
                                  (u.pdfCredits || 0) > 0
                                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                    : 'bg-rose-50 text-rose-600 border border-rose-200'
                                }`}
                              >
                                <Zap className="w-3 h-3 fill-current" />
                                {isSuper ? '∞' : u.pdfCredits || 0}
                              </span>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleAddCredits(u, 1, 'Gifted 1 Free PDF download')}
                                  className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-bold"
                                  title="Add 1 Free PDF Credit"
                                >
                                  +1
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleAddCredits(u, 10, 'Gifted 10 Free PDF downloads pack')}
                                  className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-bold"
                                  title="Add 10 Free PDF Credits"
                                >
                                  +10
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCreditModalUser(u);
                                    setCustomCreditsInput(5);
                                  }}
                                  className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-bold"
                                  title="Custom Credit Amount"
                                >
                                  ...
                                </button>
                              </div>
                            </div>
                          </td>

                          {/* Quotes Count */}
                          <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                            {u.quotationsCount || 0}
                          </td>

                          {/* Saved UPI */}
                          <td className="py-3.5 px-4">
                            {u.savedUpiId ? (
                              <span className="font-mono text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                                {u.savedUpiId}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[11px] italic">None</span>
                            )}
                          </td>

                          {/* Actions: Suspend / Unsuspend, Delete */}
                          <td className="py-3.5 px-4 text-right">
                            {isSuper ? (
                              <span className="text-slate-400 text-[10px] font-semibold italic">
                                Protected
                              </span>
                            ) : (
                              <div className="flex items-center justify-end gap-1.5">
                                {u.isSuspended ? (
                                  <button
                                    type="button"
                                    onClick={() => handleToggleSuspend(u)}
                                    disabled={submittingSuspend}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-lg text-[10px] font-bold transition-all active:scale-95 disabled:opacity-50"
                                    title="Unsuspend account"
                                  >
                                    <UserCheck className="w-3 h-3 text-emerald-600" />
                                    <span>Unsuspend</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSuspendModalUser(u);
                                      setSuspendReasonInput('Violation of platform policy / account under review');
                                    }}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-[10px] font-bold transition-all active:scale-95"
                                    title="Suspend account"
                                  >
                                    <Ban className="w-3 h-3 text-amber-600" />
                                    <span>Suspend</span>
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => setDeleteModalUser(u)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-lg text-[10px] font-bold transition-all active:scale-95"
                                  title="Permanently delete user and their quotations"
                                >
                                  <Trash2 className="w-3 h-3 text-rose-600" />
                                  <span>Delete</span>
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. TAB 2: Payment & Pricing Configuration */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm max-w-3xl space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">
                Payment Gateway & Pricing Controls
              </h2>
              <p className="text-xs text-slate-500">
                Change download fee, update your receiving UPI ID, and configure package deals.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-5">
            {/* Price Per PDF */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Download Price Per PDF (₹) *
              </label>
              <div className="relative max-w-xs">
                <span className="absolute left-3.5 top-2.5 font-bold text-slate-500 text-sm">₹</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={paymentSettings.pricePerPdf}
                  onChange={(e) =>
                    setPaymentSettings({ ...paymentSettings, pricePerPdf: Number(e.target.value) })
                  }
                  className="w-full pl-8 pr-3 py-2.5 text-sm font-black text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Currently set to ₹2 as requested. Set to 0 to make downloads free for all users.
              </p>
            </div>

            {/* Merchant UPI ID & Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Receiver Merchant UPI ID *
                </label>
                <div className="relative">
                  <Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={paymentSettings.upiId}
                    onChange={(e) =>
                      setPaymentSettings({ ...paymentSettings, upiId: e.target.value })
                    }
                    placeholder="hrithikyadav05@okaxis"
                    className="w-full pl-9 pr-3 py-2 text-xs font-mono font-bold text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  All QR codes and UPI intent links will direct payments to this address.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Merchant / Payee Name *
                </label>
                <input
                  type="text"
                  required
                  value={paymentSettings.merchantName}
                  onChange={(e) =>
                    setPaymentSettings({ ...paymentSettings, merchantName: e.target.value })
                  }
                  placeholder="Hrithik King"
                  className="w-full px-3 py-2 text-xs font-bold text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Shown inside Google Pay / PhonePe when client or user scans.
                </p>
              </div>
            </div>

            {/* Payment Enforcement Toggle */}
            <div className="pt-2">
              <label className="flex items-center gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-100/70 transition-colors">
                <input
                  type="checkbox"
                  checked={paymentSettings.isPaymentRequired}
                  onChange={(e) =>
                    setPaymentSettings({ ...paymentSettings, isPaymentRequired: e.target.checked })
                  }
                  className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    Require Payment or Credits Before PDF Download / Sharing
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    When enabled, users must pay ₹2 per PDF (or consume 1 credit) before getting high-res vector output.
                  </span>
                </div>
              </label>
            </div>

            {/* Subscription Plans Rates Preview */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Active Subscription Plans (User QR Paywall)
                </label>
                <span className="text-[11px] font-bold text-indigo-600">
                  Encoded in QR Scanner Modal
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-center">
                  <span className="text-lg font-black text-blue-900 block">₹100</span>
                  <span className="text-xs font-bold text-blue-700 block">1 Month</span>
                  <span className="text-[10px] text-slate-500">₹100/mo • 30 Days</span>
                </div>
                <div className="p-3 bg-emerald-50 border-2 border-emerald-400 rounded-xl text-center relative shadow-sm">
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase">
                    Most Popular
                  </span>
                  <span className="text-lg font-black text-emerald-900 block">₹200</span>
                  <span className="text-xs font-bold text-emerald-700 block">3 Months</span>
                  <span className="text-[10px] text-emerald-600 font-semibold">₹67/mo • Save 33%</span>
                </div>
                <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl text-center">
                  <span className="text-lg font-black text-indigo-900 block">₹450</span>
                  <span className="text-xs font-bold text-indigo-700 block">6 Months</span>
                  <span className="text-[10px] text-slate-500">₹75/mo • Save 25%</span>
                </div>
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-center">
                  <span className="text-lg font-black text-amber-900 block">₹899</span>
                  <span className="text-xs font-bold text-amber-700 block">1 Year</span>
                  <span className="text-[10px] text-slate-500">₹75/mo • 365 Days</span>
                </div>
              </div>
            </div>

            {/* Credit Bundles Preview */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Configured Credit Packages
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-center">
                  <span className="text-lg font-black text-blue-900 block">₹2</span>
                  <span className="text-xs font-bold text-blue-700">1 PDF Download</span>
                </div>
                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-center">
                  <span className="text-lg font-black text-indigo-900 block">₹18</span>
                  <span className="text-xs font-bold text-indigo-700">10 PDFs (Save 10%)</span>
                </div>
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-center">
                  <span className="text-lg font-black text-purple-900 block">₹80</span>
                  <span className="text-xs font-bold text-purple-700">50 PDFs (Save 20%)</span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-slate-200">
              <button
                type="submit"
                disabled={savingSettings}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 active:scale-95 disabled:opacity-50 transition-all"
              >
                <Save className="w-4 h-4" />
                {savingSettings ? 'Saving Settings...' : 'Save Payment Configuration'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 6. TAB 3: Audit & Transaction Logs */}
      {activeTab === 'transactions' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search transaction by user, reference..."
                value={txSearch}
                onChange={(e) => setTxSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <p className="text-xs text-slate-500">
              Complete history of all UPI payments and admin credit allocations.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Payment Method</th>
                    <th className="py-3 px-4">Reference ID</th>
                    <th className="py-3 px-4 text-right">Amount Paid</th>
                    <th className="py-3 px-4 text-center">Credits Added</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No transactions recorded yet.
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((tx) => (
                      <tr key={tx._id || tx.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                          {new Date(tx.createdAt).toLocaleString('en-IN', {
                            dateStyle: 'short',
                            timeStyle: 'short'
                          })}
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-900">{tx.userName || 'User'}</p>
                          <p className="text-[10px] text-slate-400 font-normal">{tx.userEmail}</p>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              tx.paymentMethod === 'Admin Gift'
                                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}
                          >
                            {tx.paymentMethod || 'UPI'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                          {tx.transactionRef || 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-right font-black text-slate-900">
                          {tx.amount > 0 ? `₹${tx.amount}` : <span className="text-slate-400">₹0 (Gift)</span>}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                            +{tx.creditsAdded || 1}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" />
                            {tx.status || 'Success'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 7. Custom Credit Gifting Modal */}
      {creditModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-scale-up p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <Gift className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Gift Custom PDF Credits</h3>
                  <p className="text-[11px] text-slate-500">To: {creditModalUser.name} ({creditModalUser.email})</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCreditModalUser(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  Number of Free Credits to Gift
                </label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={customCreditsInput}
                  onChange={(e) => setCustomCreditsInput(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm font-black text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  Gift Reason / Audit Note
                </label>
                <input
                  type="text"
                  value={creditReasonInput}
                  onChange={(e) => setCreditReasonInput(e.target.value)}
                  placeholder="e.g. Loyalty Reward, Promotional Campaign"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div className="bg-purple-50 p-3 rounded-xl text-[11px] text-purple-900 leading-relaxed">
                The recipient will immediately receive these credits and can download or share {customCreditsInput} quotation PDF(s) for free without paying.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCreditModalUser(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submittingCredit || customCreditsInput <= 0}
                onClick={() => {
                  setSubmittingCredit(true);
                  handleAddCredits(creditModalUser, customCreditsInput, creditReasonInput);
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-500/20 active:scale-95 disabled:opacity-50 transition-all"
              >
                <Gift className="w-4 h-4" />
                {submittingCredit ? 'Allocating...' : `Confirm & Gift ${customCreditsInput} Credits`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Add / Extend Subscription Days Modal */}
      {dayModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-scale-up p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <CalendarPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Add Subscription Days</h3>
                  <p className="text-[11px] text-slate-500">To: {dayModalUser.name} ({dayModalUser.email})</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDayModalUser(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Current Status Box */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-slate-700">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Current Plan Status</span>
                  <span className={`font-bold ${dayModalUser.isPlanDue ? 'text-rose-600' : 'text-emerald-700'}`}>
                    {dayModalUser.isPlanDue ? 'Plan Due / Expired' : `${dayModalUser.daysRemaining} Days Left`}
                  </span>
                </div>
                {dayModalUser.planExpiresAt && (
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Current Expiry</span>
                    <span className="font-mono text-xs text-slate-800">
                      {new Date(dayModalUser.planExpiresAt).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                )}
              </div>

              {/* Quick Preset Buttons */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider text-[10px]">
                  Quick Presets
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[
                    { label: '+30d (₹100)', days: 30, reason: 'Payment received ₹100 (1 Month Plan)' },
                    { label: '+90d (₹200)', days: 90, reason: 'Payment received ₹200 (3 Months Plan)' },
                    { label: '+180d (₹450)', days: 180, reason: 'Payment received ₹450 (6 Months Plan)' },
                    { label: '+365d (₹899)', days: 365, reason: 'Payment received ₹899 (1 Year Plan)' },
                    { label: '+3d (Grace)', days: 3, reason: 'Free trial grace extension' }
                  ].map((p) => (
                    <button
                      key={p.days}
                      type="button"
                      onClick={() => {
                        setCustomDaysInput(p.days);
                        setDayReasonInput(p.reason);
                      }}
                      className={`py-1.5 px-1 rounded-lg text-center font-bold text-[10px] border transition-all ${
                        customDaysInput === p.days
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Days Input */}
              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider text-[10px]">
                  Number of Days to Add
                </label>
                <input
                  type="number"
                  min="1"
                  max="3650"
                  value={customDaysInput}
                  onChange={(e) => setCustomDaysInput(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm font-black text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              {/* Reason / Reference */}
              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider text-[10px]">
                  Payment / Audit Reference
                </label>
                <input
                  type="text"
                  value={dayReasonInput}
                  onChange={(e) => setDayReasonInput(e.target.value)}
                  placeholder="e.g. Paid ₹199 via PhonePe - Ref 98765"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              {/* Preview Info */}
              <div className="bg-emerald-50 p-3 rounded-xl text-[11px] text-emerald-900 leading-relaxed border border-emerald-200">
                Adding <strong>{customDaysInput} days</strong> will immediately unlock the user's account and dismiss the scanner prompt.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDayModalUser(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submittingDays || customDaysInput <= 0}
                onClick={() => handleAddDays(dayModalUser, customDaysInput, dayReasonInput)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 active:scale-95 disabled:opacity-50 transition-all"
              >
                <CalendarPlus className="w-4 h-4" />
                {submittingDays ? 'Adding Days...' : `Confirm & Add +${customDaysInput} Days`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. Suspend User Modal */}
      {suspendModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-scale-up p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <Ban className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Suspend User Account</h3>
                  <p className="text-[11px] text-slate-500">{suspendModalUser.name} ({suspendModalUser.email})</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSuspendModalUser(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  Account Will Be Blocked
                </p>
                <p className="text-[11px] text-amber-800">
                  Suspending this user will immediately invalidate their sessions. They will be prevented from logging in or accessing any quotation features until you unsuspend them.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider text-[10px]">
                  Reason for Suspension (Optional)
                </label>
                <input
                  type="text"
                  value={suspendReasonInput}
                  onChange={(e) => setSuspendReasonInput(e.target.value)}
                  placeholder="e.g. Terms violation, payment issue, account under review"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSuspendModalUser(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submittingSuspend}
                onClick={() => handleToggleSuspend(suspendModalUser, suspendReasonInput)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-500/20 active:scale-95 disabled:opacity-50 transition-all"
              >
                <Ban className="w-4 h-4" />
                {submittingSuspend ? 'Suspending...' : 'Confirm Suspension'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10. Delete User Permanently Modal */}
      {deleteModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-rose-200 overflow-hidden animate-scale-up p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-rose-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                  <Trash2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-rose-900">Delete User Account</h3>
                  <p className="text-[11px] text-slate-500">{deleteModalUser.name} ({deleteModalUser.email})</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDeleteModalUser(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-rose-50 p-3.5 rounded-xl border border-rose-200 text-rose-900 space-y-2">
                <p className="font-bold flex items-center gap-1.5 text-rose-800">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  Irreversible Action Warning
                </p>
                <p className="text-[11px] text-rose-700 leading-relaxed">
                  Are you sure you want to permanently delete <strong>{deleteModalUser.name}</strong> (<span className="font-mono">{deleteModalUser.email}</span>)?
                </p>
                <p className="text-[11px] text-rose-700 leading-relaxed font-semibold">
                  This will purge their user record and ALL <strong>{deleteModalUser.quotationsCount || 0} associated quotation(s)</strong> from the database. This action CANNOT be undone.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalUser(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingUser}
                onClick={() => handleDeleteUser(deleteModalUser)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-500/20 active:scale-95 disabled:opacity-50 transition-all"
              >
                <Trash2 className="w-4 h-4" />
                {deletingUser ? 'Deleting Account...' : 'Yes, Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
