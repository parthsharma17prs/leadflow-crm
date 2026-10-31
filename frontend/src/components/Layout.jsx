import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Users,
  KanbanSquare,
  CalendarCheck,
  Brain,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Search,
  Bell,
  Sparkles,
} from "lucide-react";

export default function Layout({ children, title, subtitle }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "Overview", href: "/", icon: LayoutDashboard },
    { name: "Leads", href: "/leads", icon: Users },
    { name: "Pipeline", href: "/pipeline", icon: KanbanSquare },
    { name: "Follow-ups", href: "/follow-ups", icon: CalendarCheck },
    { name: "AI Analytics", href: "/analytics", icon: Brain },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const getInitials = (name) => {
    if (!name) return "LF";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#172033] flex antialiased">
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col justify-between bg-[#0F172A] text-slate-300 transition-all duration-300 ease-in-out md:static ${
          mobileMenuOpen
            ? "translate-x-0 w-64"
            : "-translate-x-full md:translate-x-0 " + (collapsed ? "w-20" : "w-64")
        }`}
      >
        <div>
          {/* Logo & Brand */}
          <div className="flex items-center justify-between h-20 px-6 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              {!collapsed && (
                <div>
                  <h1 className="font-semibold text-white tracking-tight text-lg leading-tight">
                    LeadFlow
                  </h1>
                  <span className="text-[11px] font-medium text-slate-400 tracking-wider uppercase">
                    CRM Suite
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="px-3 py-6">
            {!collapsed && (
              <p className="px-3 text-[11px] font-semibold text-slate-500 tracking-wider uppercase mb-3">
                Workspace
              </p>
            )}
            <nav className="space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-slate-800 text-white shadow-xs font-semibold"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                    } ${collapsed ? "justify-center" : ""}`}
                    title={collapsed ? item.name : undefined}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? "text-sky-400" : "text-slate-400"}`} />
                    {!collapsed && <span>{item.name}</span>}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* User Card & Collapse toggle */}
        <div className="p-3 border-t border-slate-800/80">
          <div
            className={`flex items-center gap-3 p-2 rounded-xl bg-slate-800/40 border border-slate-800 ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white font-semibold text-xs flex items-center justify-center shrink-0">
              {getInitials(user?.name)}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.name || "Agent"}
                </p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              </div>
            )}
            {!collapsed && (
              <button
                onClick={logout}
                title="Log out"
                className="p-1.5 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-800"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Desktop collapse button */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex w-full mt-2 items-center justify-center py-2 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 rounded-lg transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <span className="flex items-center gap-1">
                <ChevronLeft className="w-4 h-4" /> Collapse Sidebar
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Navbar */}
        <header className="h-20 bg-white border-b border-[#E9ECF1] px-6 lg:px-10 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-[#172033] tracking-tight">
                {title || "Dashboard"}
              </h1>
              {subtitle && (
                <p className="text-xs text-[#778195] hidden sm:block mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Quick search..."
                className="pl-9 pr-4 py-2 text-xs bg-[#F7F8FA] border border-[#E9ECF1] rounded-lg focus:outline-hidden focus:border-sky-500 w-52 lg:w-64"
                readOnly
              />
            </div>
            <div className="w-9 h-9 rounded-full bg-[#F7F8FA] border border-[#E9ECF1] flex items-center justify-center text-slate-600">
              <Bell className="w-4 h-4" />
            </div>
            <div className="w-9 h-9 rounded-full bg-slate-900 text-white text-xs font-semibold flex items-center justify-center">
              {getInitials(user?.name)}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}

