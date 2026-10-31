import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import api from "../api/client";
import {
  Brain,
  Activity,
  Flame,
  Search,
  CheckCircle2,
  TrendingUp,
  Cpu,
  Sparkles,
  BarChart3,
  FileSpreadsheet
} from "lucide-react";

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [scores, setScores] = useState([]);
  const [forecast, setForecast] = useState(null);
  const [activeTab, setActiveTab] = useState("scores"); // 'scores' | 'calculator' | 'forecast'

  // Interactive Lead Scorer state
  const [testLead, setTestLead] = useState({
    name: "Enterprise Prospect Corp",
    stage: "Proposal",
    budget: 50000,
    source: "Referral",
    company_size: "Enterprise",
  });
  const [calcResult, setCalcResult] = useState(null);
  const [calcLoading, setCalcLoading] = useState(false);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const [overviewRes, scoresRes, forecastRes] = await Promise.allSettled([
        api.get("/analytics/overview"),
        api.get("/analytics/scores"),
        api.get("/analytics/forecast"),
      ]);

      if (overviewRes.status === "fulfilled" && overviewRes.value.data.success) {
        setOverview(overviewRes.value.data.data);
      }
      if (scoresRes.status === "fulfilled" && scoresRes.value.data.success) {
        setScores(scoresRes.value.data.data.leads || []);
      }
      if (forecastRes.status === "fulfilled" && forecastRes.value.data.success) {
        setForecast(forecastRes.value.data.data);
      }
    } catch (err) {
      console.error("Error fetching analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateScore = async (e) => {
    e.preventDefault();
    try {
      setCalcLoading(true);
      const res = await api.post("/analytics/score", {
        ...testLead,
        budget: Number(testLead.budget),
      });
      if (res.data.success) {
        setCalcResult(res.data.data);
      }
    } catch (err) {
      console.error("Scoring error:", err);
    } finally {
      setCalcLoading(false);
    }
  };

  return (
    <Layout
      title="ML Intelligence & Python Pipelines"
      subtitle="Powered by FastAPI microservice (port 8001), pandas, and scikit-learn"
    >
      {/* Service Health Banner */}
      <div className="mb-6 bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-900 border border-indigo-500/30 rounded-2xl p-5 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg shadow-indigo-950/20">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
            <Brain className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold">FastAPI Intelligence Service</h2>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live on Port 8001
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Microservice executing scoring models, fuzzy duplicate detection & ML forecasting
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="http://localhost:8001/docs"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-all shadow-sm flex items-center gap-1.5"
          >
            <Cpu className="w-4 h-4" />
            Swagger REST Docs
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6 gap-2">
        <button
          onClick={() => setActiveTab("scores")}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "scores"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Flame className="w-4 h-4" />
          Lead Prioritization Matrix ({scores.length})
        </button>
        <button
          onClick={() => setActiveTab("calculator")}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "calculator"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Interactive Lead Scorer
        </button>
        <button
          onClick={() => setActiveTab("forecast")}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "forecast"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Predictive Pipeline & Trends
        </button>
      </div>

      {/* TAB 1: RANKED SCORES */}
      {activeTab === "scores" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Leads Analyzed</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{overview?.total_leads || scores.length}</p>
              <span className="text-xs text-indigo-600 font-semibold mt-1 inline-block">Direct from Atlas DB</span>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hot Prospects (70+)</span>
              <p className="text-2xl font-black text-rose-600 mt-1">
                {scores.filter((s) => s.bucket === "Hot").length}
              </p>
              <span className="text-xs text-slate-400 mt-1 inline-block">High conversion probability</span>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pipeline Volume</span>
              <p className="text-2xl font-black text-emerald-600 mt-1">
                ${(overview?.budget_stats?.total || 0).toLocaleString()}
              </p>
              <span className="text-xs text-slate-400 mt-1 inline-block">Aggregated lead budget</span>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Lead Budget</span>
              <p className="text-2xl font-black text-indigo-600 mt-1">
                ${(overview?.budget_stats?.avg || 0).toLocaleString()}
              </p>
              <span className="text-xs text-slate-400 mt-1 inline-block">Mean deal size</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Ranked Lead Scoring (Python Pipeline)</h3>
                <p className="text-xs text-slate-500">Heuristic scoring calculated on Stage, Budget, Source, and Company Size</p>
              </div>
              <button
                onClick={fetchAnalyticsData}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all"
              >
                Re-score All
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Rank & Lead</th>
                    <th className="py-3 px-4">Stage</th>
                    <th className="py-3 px-4">Source</th>
                    <th className="py-3 px-4">Budget</th>
                    <th className="py-3 px-4">Score (0-100)</th>
                    <th className="py-3 px-4">Bucket</th>
                    <th className="py-3 px-4">Breakdown</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {scores.map((lead, idx) => (
                    <tr key={lead.id || idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        <span className="text-xs text-slate-400 font-mono mr-2">#{idx + 1}</span>
                        {lead.name}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-700 rounded-md">
                          {lead.stage}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-600">{lead.source}</td>
                      <td className="py-3 px-4 font-mono text-xs font-semibold text-slate-800">
                        ${Number(lead.budget || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-bold text-indigo-600 font-mono">{lead.score} / 100</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                            lead.bucket === "Hot"
                              ? "bg-rose-100 text-rose-700"
                              : lead.bucket === "Warm"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {lead.bucket}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[11px] text-slate-500 font-mono">
                        Stage: +{lead.breakdown?.stage_points} | Budget: +{lead.breakdown?.budget_points} | Source: +
                        {lead.breakdown?.source_points}
                      </td>
                    </tr>
                  ))}
                  {scores.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 text-sm">
                        No leads to score yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INTERACTIVE SCORER */}
      {activeTab === "calculator" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">Live Lead Scoring Simulator</h3>
            <p className="text-xs text-slate-500 mb-5">
              Simulate scoring any prospect using the Python pipeline before creating in CRM
            </p>

            <form onSubmit={handleCalculateScore} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Lead Name</label>
                <input
                  type="text"
                  value={testLead.name}
                  onChange={(e) => setTestLead({ ...testLead, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-indigo-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Stage</label>
                  <select
                    value={testLead.stage}
                    onChange={(e) => setTestLead({ ...testLead, stage: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-indigo-600"
                  >
                    {["New", "Contacted", "Qualified", "Proposal", "Negotiation", "Won", "Lost"].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Source</label>
                  <select
                    value={testLead.source}
                    onChange={(e) => setTestLead({ ...testLead, source: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-indigo-600"
                  >
                    {["Referral", "Website", "LinkedIn", "Cold Call", "Email Campaign", "Trade Show", "Other"].map(
                      (src) => (
                        <option key={src} value={src}>
                          {src}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Budget ($)</label>
                  <input
                    type="number"
                    value={testLead.budget}
                    onChange={(e) => setTestLead({ ...testLead, budget: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-indigo-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Company Size</label>
                  <select
                    value={testLead.company_size}
                    onChange={(e) => setTestLead({ ...testLead, company_size: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-indigo-600"
                  >
                    <option value="Startup">Startup / SMB (0-50)</option>
                    <option value="Mid-Market">Mid-Market (50-500)</option>
                    <option value="Enterprise">Enterprise (500+)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={calcLoading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg transition-all flex items-center justify-center gap-2"
              >
                {calcLoading ? "Running Python Model..." : "Calculate ML Score"}
              </button>
            </form>
          </div>

          {/* Result Card */}
          <div className="bg-slate-900 text-white p-6 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">Pipeline Output</span>
                <span className="text-xs font-mono text-indigo-400">POST /leads/score</span>
              </div>

              {calcResult ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-slate-300">{calcResult.lead_name}</h4>
                    <div className="flex items-baseline gap-3 mt-1">
                      <span className="text-4xl font-black text-indigo-400">{calcResult.score}</span>
                      <span className="text-slate-400 font-mono text-sm">/ 100 points</span>
                      <span
                        className={`ml-auto px-3 py-1 rounded-full text-xs font-bold ${
                          calcResult.bucket === "Hot"
                            ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                            : calcResult.bucket === "Warm"
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            : "bg-slate-500/20 text-slate-400 border border-slate-500/30"
                        }`}
                      >
                        {calcResult.bucket} Lead
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-800/60 p-4 rounded-lg space-y-2 border border-slate-700/60 font-mono text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span>Stage Weight:</span>
                      <span className="text-emerald-400">+{calcResult.breakdown?.stage_points} pts</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Budget Tier:</span>
                      <span className="text-emerald-400">+{calcResult.breakdown?.budget_points} pts</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Source Conversion:</span>
                      <span className="text-emerald-400">+{calcResult.breakdown?.source_points} pts</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Company Bonus:</span>
                      <span className="text-emerald-400">+{calcResult.breakdown?.bonus_points} pts</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-500 text-sm">
                  Click <span className="text-indigo-400">"Calculate ML Score"</span> to execute the Python scoring engine.
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Weighted scoring algorithm</span>
              <span>FastAPI microservice</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FORECAST */}
      {activeTab === "forecast" && (
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Scikit-Learn Predictive Model</h3>
              <p className="text-xs text-slate-500">
                Linear regression trained on historical daily lead creation in MongoDB
              </p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-6">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Model Insight</h4>
            <p className="text-sm font-medium text-slate-700">
              {forecast?.summary || "Analyzing historical trends across current pipeline records..."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-slate-200 rounded-lg p-4">
              <span className="text-xs text-slate-500 font-medium">Model Architecture</span>
              <p className="text-sm font-bold text-slate-900 mt-1">scikit-learn LinearRegression</p>
            </div>
            <div className="border border-slate-200 rounded-lg p-4">
              <span className="text-xs text-slate-500 font-medium">Predicted Trend</span>
              <p className="text-sm font-bold text-slate-900 mt-1 capitalize">{forecast?.trend || "Static"}</p>
            </div>
            <div className="border border-slate-200 rounded-lg p-4">
              <span className="text-xs text-slate-500 font-medium">Prediction Horizon</span>
              <p className="text-sm font-bold text-slate-900 mt-1">Next 7 Calendar Days</p>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

