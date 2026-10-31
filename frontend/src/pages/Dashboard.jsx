import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../api/client";
import {
  Users,
  Activity,
  Trophy,
  Calendar,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Clock,
  UploadCloud,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  X,
} from "lucide-react";import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const STAGE_COLORS = {
  New: "#38bdf8",
  Contacted: "#818cf8",
  Qualified: "#6366f1",
  "Proposal Sent": "#f59e0b",
  Won: "#10b981",
  Lost: "#f43f5e",
};

const PIE_COLORS = ["#38bdf8", "#f43f5e", "#10b981"];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // CSV Upload State
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState(null);
  const fileInputRef = useRef(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get("/dashboard/summary");
      setData(res.data.data);
    } catch (err) {
      setError("Failed to load dashboard metrics. Check server connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) return;

    const formData = new FormData();
    formData.append("file", uploadFile);

    try {
      setUploading(true);
      setUploadMessage(null);
      const res = await api.post("/leads/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setUploadMessage({
        type: "success",
        text: res.data.message || "Leads imported successfully!",
      });

      setUploadFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      
      // Refresh live dashboard metrics right away!
      setTimeout(() => {
        fetchDashboard();
      }, 800);
    } catch (err) {
      setUploadMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to upload CSV file.",
      });
    } finally {
      setUploading(false);
    }
  };

  if (loading && !data) {
    return (
      <Layout title="Executive Overview" subtitle="Real-time sales velocity and performance analytics">
        <div className="space-y-6 animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-28 bg-white rounded-2xl border border-[#E9ECF1] p-5"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-80 bg-white rounded-2xl border border-[#E9ECF1]"></div>
            <div className="h-80 bg-white rounded-2xl border border-[#E9ECF1]"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error && !data) {
    return (
      <Layout title="Executive Overview">
        <div className="p-6 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl">
          {error}
        </div>
      </Layout>
    );
  }

  const { metrics, charts, recentLeads, upcomingFollowUps, overdueList } = data;

  const metricCards = [
    {
      title: "Total Leads",
      value: metrics.totalLeads,
      icon: Users,
      badge: "In Pipeline",
      color: "text-slate-900",
      bg: "bg-slate-100",
    },
    {
      title: "Active Leads",
      value: metrics.activeLeads,
      icon: Activity,
      badge: "In Progress",
      color: "text-sky-600",
      bg: "bg-sky-50",
    },
    {
      title: "Won Leads",
      value: metrics.wonLeads,
      icon: Trophy,
      badge: "Closed",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Pending Tasks",
      value: metrics.pendingFollowUps,
      icon: Calendar,
      badge: "Upcoming",
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      title: "Overdue Items",
      value: metrics.overdueFollowUps,
      icon: AlertTriangle,
      badge: "Action Req.",
      color: metrics.overdueFollowUps > 0 ? "text-rose-600" : "text-slate-600",
      bg: metrics.overdueFollowUps > 0 ? "bg-rose-50" : "bg-slate-50",
    },
  ];

  return (
    <Layout
      title="Executive Overview"
      subtitle="Track pipeline velocity, lead stages, and scheduled touchpoints."
    >
      <div className="space-y-8">
        {/* Top Action Header with Import CSV Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E9ECF1] shadow-xs">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Bulk Leads & Data Management
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Instantly populate your pipeline by uploading a CSV spreadsheet of prospective leads.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <a
              href="/sample_leads.csv"
              download="sample_leads.csv"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Sample CSV
            </a>

            <button
              onClick={() => {
                setUploadMessage(null);
                setUploadModalOpen(true);
              }}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <UploadCloud className="w-4 h-4 text-sky-400" /> Upload Leads CSV
            </button>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {metricCards.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.title}
                className="bg-white p-5 rounded-2xl border border-[#E9ECF1] shadow-xs hover:shadow-sm transition-shadow flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#778195] uppercase tracking-wider">
                    {m.title}
                  </span>
                  <div className={`p-2 rounded-xl ${m.bg}`}>
                    <Icon className={`w-4 h-4 ${m.color}`} />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline justify-between">
                  <h3 className="text-3xl font-extrabold text-[#172033] tracking-tight">
                    {m.value}
                  </h3>
                  <span className="text-[11px] font-medium text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md">
                    {m.badge}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Leads by Pipeline Stage */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-[#E9ECF1] shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-[#172033]">
                  Pipeline Stage Distribution
                </h3>
                <p className="text-xs text-[#778195] mt-0.5">
                  Live distribution of active opportunities across all stages
                </p>
              </div>
              <span className="flex items-center gap-1 text-xs font-semibold text-sky-600 bg-sky-50 px-2.5 py-1 rounded-full">
                <TrendingUp className="w-3.5 h-3.5" /> Live Sync
              </span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.leadsByStage}>
                  <XAxis dataKey="stage" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0F172A",
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Follow-up Status Distribution */}
          <div className="bg-white p-6 rounded-2xl border border-[#E9ECF1] shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-[#172033]">
                Activity Health
              </h3>
              <p className="text-xs text-[#778195] mt-0.5">
                Task completion and overdue status
              </p>
            </div>
            <div className="h-52 flex items-center justify-center my-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.followUpDistribution}
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="count"
                  >
                    {charts.followUpDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0F172A",
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center pt-3 border-t border-slate-100">
              {charts.followUpDistribution.map((item, i) => (
                <div key={item.name}>
                  <p className="text-[11px] text-[#778195] flex items-center justify-center gap-1">
                    <span
                      className="w-2 h-2 rounded-full inline-block"
                      style={{ backgroundColor: PIE_COLORS[i] }}
                    />
                    {item.name}
                  </p>
                  <p className="text-sm font-bold text-[#172033] mt-0.5">
                    {item.count}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section: Recent Leads & Follow-ups */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Leads */}
          <div className="bg-white p-6 rounded-2xl border border-[#E9ECF1] shadow-xs">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-[#172033]">Recent Leads</h3>
              <Link
                to="/leads"
                className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
              >
                View all <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            {recentLeads.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">
                No leads recorded yet. Upload a CSV or add leads manually to see them here!
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentLeads.map((lead) => (
                  <div
                    key={lead._id}
                    className="py-3.5 flex items-center justify-between hover:bg-slate-50/50 rounded-xl px-2 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#172033]">
                        {lead.name}
                      </p>
                      <p className="text-xs text-[#778195]">
                        {lead.company || "Independent"} • ${lead.budget?.toLocaleString()}
                      </p>
                    </div>
                    <span
                      className="text-xs font-medium px-2.5 py-1 rounded-full border"
                      style={{
                        borderColor: `${STAGE_COLORS[lead.stage]}40`,
                        backgroundColor: `${STAGE_COLORS[lead.stage]}15`,
                        color: STAGE_COLORS[lead.stage],
                      }}
                    >
                      {lead.stage}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Center (Upcoming & Overdue) */}
          <div className="bg-white p-6 rounded-2xl border border-[#E9ECF1] shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-bold text-[#172033]">
                  Follow-up Action Center
                </h3>
                <Link
                  to="/follow-ups"
                  className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
                >
                  Manage tasks <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-3">
                {overdueList.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[11px] font-bold text-rose-600 uppercase tracking-wider flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" /> Overdue Attention Needed
                    </p>
                    {overdueList.map((item) => (
                      <div
                        key={item._id}
                        className="p-3 rounded-xl bg-rose-50/60 border border-rose-200/80 flex items-center justify-between"
                      >
                        <div>
                          <p className="text-xs font-semibold text-rose-900">
                            {item.title}
                          </p>
                          <p className="text-[11px] text-rose-700">
                            {item.leadId?.name} • Due{" "}
                            {new Date(item.dueAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="text-[11px] font-semibold text-rose-700 bg-white px-2 py-0.5 rounded-md border border-rose-200">
                          {item.type}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-2 pt-2">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> Upcoming Scheduled
                  </p>
                  {upcomingFollowUps.length === 0 ? (
                    <div className="py-6 text-center text-slate-400 text-xs">
                      No pending upcoming follow-ups.
                    </div>
                  ) : (
                    upcomingFollowUps.map((item) => (
                      <div
                        key={item._id}
                        className="p-3 rounded-xl bg-[#F7F8FA] border border-[#E9ECF1] flex items-center justify-between"
                      >
                        <div>
                          <p className="text-xs font-semibold text-[#172033]">
                            {item.title}
                          </p>
                          <p className="text-[11px] text-[#778195]">
                            {item.leadId?.name} • Due{" "}
                            {new Date(item.dueAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="text-[11px] font-medium text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                          {item.type}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSV Upload Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-[#E9ECF1] shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Import Leads from CSV
                </h3>
              </div>
              <button
                onClick={() => setUploadModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {uploadMessage && (
              <div
                className={`mt-4 p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                  uploadMessage.type === "success"
                    ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                    : "bg-rose-50 border border-rose-200 text-rose-700"
                }`}
              >
                {uploadMessage.type === "success" && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                )}
                <span>{uploadMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleFileUpload} className="mt-4 space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 hover:border-sky-500 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50"
              >
                <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">
                  {uploadFile ? uploadFile.name : "Click to select a .csv file"}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Required columns: name, and email or phone
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={(e) => setUploadFile(e.target.files[0])}
                  className="hidden"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span>Need a template?</span>
                <a
                  href="/sample_leads.csv"
                  download="sample_leads.csv"
                  className="font-semibold text-sky-600 hover:underline flex items-center gap-1"
                >
                  <Download className="w-3 h-3" /> Download Sample
                </a>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={!uploadFile || uploading}
                  className="px-4 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  {uploading ? "Importing..." : "Upload & Sync"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
