import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import api from "../api/client";
import {
  CalendarCheck,
  AlertTriangle,
  Plus,
  Check,
  Filter,
  X,
} from "lucide-react";

export default function FollowUps() {
  const [activities, setActivities] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  // Create follow up modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    leadId: "",
    title: "",
    type: "Call",
    dueAt: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
  });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [actRes, leadRes] = await Promise.all([
        api.get(`/activities?status=${statusFilter}`),
        api.get("/leads"),
      ]);
      setActivities(actRes.data.data);
      setLeads(leadRes.data.data);
      if (leadRes.data.data.length > 0 && !form.leadId) {
        setForm((prev) => ({ ...prev, leadId: leadRes.data.data[0]._id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const handleToggleStatus = async (activity) => {
    const newStatus = activity.status === "Completed" ? "Pending" : "Completed";
    try {
      await api.patch(`/activities/${activity._id}`, { status: newStatus });
      fetchData();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!form.leadId) {
      setFormError("Please select a lead.");
      return;
    }
    if (!form.title.trim()) {
      setFormError("Title is required.");
      return;
    }
    try {
      setSubmitting(true);
      await api.post("/activities", {
        ...form,
        dueAt: new Date(form.dueAt).toISOString(),
      });
      setIsModalOpen(false);
      setForm({
        leadId: leads[0]?._id || "",
        title: "",
        type: "Call",
        dueAt: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
      });
      fetchData();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to create follow-up");
    } finally {
      setSubmitting(false);
    }
  };

  const isOverdue = (activity) => {
    if (activity.status === "Completed") return false;
    return new Date(activity.dueAt) < new Date();
  };

  return (
    <Layout
      title="Follow-up Tasks"
      subtitle="Scheduled customer touchpoints, calls, meetings, and deadlines."
    >
      <div className="space-y-6">
        {/* Actions bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-white px-3 py-2 border border-[#E9ECF1] rounded-xl text-xs font-medium text-slate-600 shadow-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Filter Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent font-semibold text-slate-900 focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Follow-ups</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Schedule Follow-up
          </button>
        </div>

        {/* Activities List */}
        <div className="bg-white rounded-2xl border border-[#E9ECF1] shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              <div className="w-7 h-7 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              Loading tasks...
            </div>
          ) : activities.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <CalendarCheck className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-800">
                No follow-ups found
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Keep your pipeline moving by scheduling outreach, demos, or meetings.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 cursor-pointer"
              >
                Schedule Task
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {activities.map((item) => {
                const overdue = isOverdue(item);
                const isCompleted = item.status === "Completed";

                return (
                  <div
                    key={item._id}
                    className={`p-4 sm:p-5 flex items-center justify-between transition-colors ${
                      overdue ? "bg-rose-50/30" : "hover:bg-slate-50/60"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleToggleStatus(item)}
                        title={
                          isCompleted
                            ? "Mark as Pending"
                            : "Mark as Completed"
                        }
                        className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all cursor-pointer ${
                          isCompleted
                            ? "bg-emerald-500 border-emerald-500 text-white"
                            : "border-slate-300 hover:border-slate-500 bg-white"
                        }`}
                      >
                        {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4
                            className={`text-sm font-semibold ${
                              isCompleted
                                ? "line-through text-slate-400"
                                : "text-slate-900"
                            }`}
                          >
                            {item.title}
                          </h4>
                          {overdue && (
                            <span className="text-[10px] font-bold text-rose-600 bg-rose-100/70 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> Overdue
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Lead:{" "}
                          <span className="font-medium text-slate-700">
                            {item.leadId?.name || "Unassigned"}
                          </span>{" "}
                          ({item.leadId?.company || "Independent"})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <span className="text-xs font-medium text-slate-700 block">
                          Due: {new Date(item.dueAt).toLocaleDateString()}
                        </span>
                        <span className="text-[11px] text-slate-400 block">
                          {new Date(item.dueAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                        {item.type}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Schedule Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-[#E9ECF1] shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Schedule New Follow-up
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreate} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Associate With Lead *
                </label>
                <select
                  required
                  value={form.leadId}
                  onChange={(e) => setForm({ ...form, leadId: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-[#E9ECF1] rounded-xl focus:outline-hidden focus:border-sky-500"
                >
                  {leads.map((l) => (
                    <option key={l._id} value={l._id}>
                      {l.name} ({l.company || "Independent"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Demo call / Proposal follow-up"
                  className="w-full px-3 py-2 text-sm bg-white border border-[#E9ECF1] rounded-xl focus:outline-hidden focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Activity Type
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E9ECF1] rounded-xl focus:outline-hidden focus:border-sky-500"
                  >
                    <option value="Call">Call</option>
                    <option value="Email">Email</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Task">Task</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Due Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={form.dueAt}
                    onChange={(e) => setForm({ ...form, dueAt: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E9ECF1] rounded-xl focus:outline-hidden focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-xl hover:bg-slate-800"
                >
                  {submitting ? "Scheduling..." : "Save Follow-up"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}

