import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import api from "../api/client";
import {
  DollarSign,
  Building,
} from "lucide-react";

const PIPELINE_COLUMNS = [
  { id: "New", name: "New", color: "border-sky-400 bg-sky-50/50" },
  { id: "Contacted", name: "Contacted", color: "border-indigo-400 bg-indigo-50/50" },
  { id: "Qualified", name: "Qualified", color: "border-blue-500 bg-blue-50/50" },
  { id: "Proposal Sent", name: "Proposal Sent", color: "border-amber-400 bg-amber-50/50" },
  { id: "Won", name: "Won", color: "border-emerald-500 bg-emerald-50/50" },
  { id: "Lost", name: "Lost", color: "border-rose-400 bg-rose-50/50" },
];

export default function Pipeline() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPipelineLeads = async () => {
    try {
      setLoading(true);
      const res = await api.get("/leads");
      setLeads(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPipelineLeads();
  }, []);

  const handleStageChange = async (leadId, newStage) => {
    try {
      // Optimistic update
      setLeads((prev) =>
        prev.map((l) => (l._id === leadId ? { ...l, stage: newStage } : l))
      );
      await api.patch(`/leads/${leadId}`, { stage: newStage });
    } catch (err) {
      alert("Failed to update pipeline stage");
      fetchPipelineLeads();
    }
  };

  return (
    <Layout
      title="Sales Pipeline"
      subtitle="Visual deal workflow and stage progression."
    >
      {loading ? (
        <div className="p-16 text-center text-slate-400 text-sm">
          <div className="w-8 h-8 border-3 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          Loading pipeline columns...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-start">
          {PIPELINE_COLUMNS.map((column) => {
            const columnLeads = leads.filter((l) => l.stage === column.id);
            const totalBudget = columnLeads.reduce(
              (acc, curr) => acc + (curr.budget || 0),
              0
            );

            return (
              <div
                key={column.id}
                className="bg-[#F7F8FA] rounded-2xl p-3 border border-[#E9ECF1] flex flex-col min-h-[500px]"
              >
                {/* Column Header */}
                <div className="p-2 mb-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-800">
                      {column.name}
                    </span>
                    <span className="text-xs font-bold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-full">
                      {columnLeads.length}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 font-medium">
                    ${totalBudget.toLocaleString()}
                  </div>
                </div>

                {/* Cards Container */}
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {columnLeads.length === 0 ? (
                    <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-[11px] text-slate-400">
                      No deals here
                    </div>
                  ) : (
                    columnLeads.map((lead) => (
                      <div
                        key={lead._id}
                        className="bg-white p-4 rounded-xl border border-[#E9ECF1] shadow-xs hover:shadow-sm transition-all space-y-2.5"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 leading-snug">
                              {lead.name}
                            </h4>
                            <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <Building className="w-3 h-3 text-slate-400" />
                              {lead.company || "Independent"}
                            </p>
                          </div>
                          <span className="text-xs font-bold text-slate-900">
                            ${lead.budget ? lead.budget.toLocaleString() : "0"}
                          </span>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <label className="text-[10px] uppercase font-semibold text-slate-400">
                            Stage:
                          </label>
                          <select
                            value={lead.stage}
                            onChange={(e) =>
                              handleStageChange(lead._id, e.target.value)
                            }
                            className="text-[11px] font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 focus:outline-hidden cursor-pointer"
                          >
                            {PIPELINE_COLUMNS.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}

