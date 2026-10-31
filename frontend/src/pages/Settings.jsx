import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { Database } from "lucide-react";

export default function Settings() {
  const { user, logout } = useAuth();

  return (
    <Layout
      title="System Settings"
      subtitle="Workspace configuration, user credentials, and API environment."
    >
      <div className="max-w-3xl space-y-6">
        {/* Profile Card */}
        <div className="bg-white p-6 rounded-2xl border border-[#E9ECF1] shadow-xs">
          <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white text-xl font-bold flex items-center justify-center">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">{user?.name}</h3>
              <p className="text-xs text-slate-500">{user?.email}</p>
              <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                Role: {user?.role || "Agent"}
              </span>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <div className="p-3 bg-slate-50 rounded-xl text-sm font-medium text-slate-800 border border-slate-200">
                  {user?.name}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Account Email
                </label>
                <div className="p-3 bg-slate-50 rounded-xl text-sm font-medium text-slate-800 border border-slate-200">
                  {user?.email}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* System Environment */}
        <div className="bg-white p-6 rounded-2xl border border-[#E9ECF1] shadow-xs">
          <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Database className="w-4 h-4 text-sky-600" /> Environment & Architecture
          </h4>
          <div className="space-y-3 text-xs text-slate-600">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Database Engine</span>
              <span className="font-semibold text-slate-800">MongoDB Atlas / Local</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Backend Server</span>
              <span className="font-semibold text-slate-800">Node.js + Express (Port 5001)</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Security Architecture</span>
              <span className="font-semibold text-slate-800">JWT, Bcrypt, Helmet, RateLimiter</span>
            </div>
          </div>
        </div>

        {/* Danger zone / Logout */}
        <div className="bg-white p-6 rounded-2xl border border-rose-200 shadow-xs flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-rose-900">Sign Out of Session</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Securely invalidate local tokens and return to the login screen.
            </p>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors"
          >
            Log Out
          </button>
        </div>
      </div>
    </Layout>
  );
}

