import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import api from "../api/client";
import {
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  CalendarPlus,
  Mail,
  Phone,
  AlertCircle,
  X,
} from "lucide-react";

const STAGES = ["New", "Contacted", "Qualified", "Proposal Sent", "Won", "Lost"];

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [modalForm, setModalForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    serviceInterest: "CRM Implementation",
    source: "Direct",
    budget: 5000,
    stage: "New",
  });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Quick Follow-up modal
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [selectedLeadForFollowUp, setSelectedLeadForFollowUp] = useState(null);
  const [followUpForm, setFollowUpForm] = useState({
    title: "Discovery Call",
    type: "Call",
    dueAt: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
  });

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/leads?search=${encodeURIComponent(search)}&stage=${stageFilter}`);
      setLeads(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [stageFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchLeads();
  };

  const openCreateModal = () => {
    setEditingLead(null);
    setModalForm({
      name: "",
      company: "",
      email: "",
      phone: "",
      serviceInterest: "CRM Implementation",
      source: "Direct",
      budget: 5000,
      stage: "New",
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = (lead) => {
    setEditingLead(lead);
    setModalForm({
      name: lead.name,
      company: lead.company || "",
      email: lead.email || "",
      phone: lead.phone || "",
      serviceInterest: lead.serviceInterest || "CRM Implementation",
      source: lead.source || "Direct",
      budget: lead.budget || 0,
      stage: lead.stage || "New",
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleSaveLead = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!modalForm.name.trim()) {
      setFormError("Lead name is mandatory.");
      return;
    }
    if (!modalForm.email.trim() && !modalForm.phone.trim()) {
      setFormError("At least one of email or phone must be provided.");
      return;
    }

    try {
      setSubmitting(true);
      if (editingLead) {
        await api.patch(`/leads/${editingLead._id}`, modalForm);
      } else {
        await api.post("/leads", modalForm);
      }
      setIsModalOpen(false);
      fetchLeads();
    } catch (err) {
      setFormError(
        err.response?.data?.message ||
          (err.response?.data?.errors && err.response.data.errors[0]?.message) ||
          "Failed to save lead."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLead = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete lead "${name}"? This will also remove any attached follow-ups.`)) {
      return;
    }
    try {
      await api.delete(`/leads/${id}`);
      fetchLeads();
    } catch (err) {
      alert("Failed to delete lead");
    }
  };

  const handleCreateFollowUp = async (e) => {
    e.preventDefault();
    try {
      await api.post("/activities", {
        leadId: selectedLeadForFollowUp._id,
        title: followUpForm.title,
        type: followUpForm.type,
        dueAt: new Date(followUpForm.dueAt).toISOString(),
      });
      setIsFollowUpModalOpen(false);
      alert("Follow-up scheduled successfully!");
    } catch (err) {
      alert("Failed to schedule follow-up: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <Layout
      title="Lead Management"
      subtitle="Complete CRM records, contact profiles, and opportunity values."
    >
      <div className="space-y-6">
        {/* Controls bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <form
            onSubmit={handleSearchSubmit}
            className="relative flex-1 max-w-md"
          >
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search leads by name or company..."
              className="w-full pl-9 pr-20 py-2.5 bg-white border border-[#E9ECF1] rounded-xl text-sm focus:outline-hidden focus:border-sky-500 shadow-xs"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
            >
              Search
            </button>
          </form>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white px-3 py-2 border border-[#E9ECF1] rounded-xl text-xs font-medium text-slate-600 shadow-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Stage:</span>
              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className="bg-transparent font-semibold text-slate-900 focus:outline-hidden cursor-pointer"
              >
                <option value="all">All Stages</option>
                {STAGES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Lead
            </button>
          </div>
        </div>

        {/* Lead Table */}
        <div className="bg-white rounded-2xl border border-[#E9ECF1] shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              <div className="w-7 h-7 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              Loading leads from database...
            </div>
          ) : leads.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-800">
                No leads found
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No records match your criteria. Add your first lead or adjust search filters.
              </p>
              <button
                onClick={openCreateModal}
                className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 cursor-pointer"
              >
                Create Lead
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-[#F7F8FA] border-b border-[#E9ECF1] text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                  <tr>
                    <th className="py-3.5 px-6">Lead & Company</th>
                    <th className="py-3.5 px-6">Contact Info</th>
                    <th className="py-3.5 px-6">Service & Source</th>
                    <th className="py-3.5 px-6">Budget</th>
                    <th className="py-3.5 px-6">Stage</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leads.map((lead) => (
                    <tr
                      key={lead._id}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="font-semibold text-slate-900">
                          {lead.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {lead.company || "Independent"}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-0.5 text-xs">
                          {lead.email && (
                            <span className="flex items-center gap-1.5 text-slate-600">
                              <Mail className="w-3.5 h-3.5 text-slate-400" />
                              {lead.email}
                            </span>
                          )}
                          {lead.phone && (
                            <span className="flex items-center gap-1.5 text-slate-600">
                              <Phone className="w-3.5 h-3.5 text-slate-400" />
                              {lead.phone}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-xs">
                        <div className="text-slate-800 font-medium">
                          {lead.serviceInterest}
                        </div>
                        <div className="text-slate-400">{lead.source}</div>
                      </td>
                      <td className="py-4 px-6 text-xs font-semibold text-slate-900">
                        ${lead.budget ? lead.budget.toLocaleString() : "0"}
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                          {lead.stage}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedLeadForFollowUp(lead);
                              setIsFollowUpModalOpen(true);
                            }}
                            title="Schedule follow-up"
                            className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <CalendarPlus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(lead)}
                            title="Edit lead"
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteLead(lead._id, lead.name)}
                            title="Delete lead"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-[#E9ECF1] shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingLead ? "Edit Lead Details" : "Create New Lead"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveLead} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Lead Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={modalForm.name}
                    onChange={(e) =>
                      setModalForm({ ...modalForm, name: e.target.value })
                    }
                    placeholder="Jane Doe"
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E9ECF1] rounded-xl focus:outline-hidden focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Company
                  </label>
                  <input
                    type="text"
                    value={modalForm.company}
                    onChange={(e) =>
                      setModalForm({ ...modalForm, company: e.target.value })
                    }
                    placeholder="Acme Corp"
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E9ECF1] rounded-xl focus:outline-hidden focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={modalForm.email}
                    onChange={(e) =>
                      setModalForm({ ...modalForm, email: e.target.value })
                    }
                    placeholder="jane@acme.com"
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E9ECF1] rounded-xl focus:outline-hidden focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={modalForm.phone}
                    onChange={(e) =>
                      setModalForm({ ...modalForm, phone: e.target.value })
                    }
                    placeholder="+1-555-0100"
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E9ECF1] rounded-xl focus:outline-hidden focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Service Interest
                  </label>
                  <input
                    type="text"
                    value={modalForm.serviceInterest}
                    onChange={(e) =>
                      setModalForm({
                        ...modalForm,
                        serviceInterest: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E9ECF1] rounded-xl focus:outline-hidden focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Source
                  </label>
                  <select
                    value={modalForm.source}
                    onChange={(e) =>
                      setModalForm({ ...modalForm, source: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E9ECF1] rounded-xl focus:outline-hidden focus:border-sky-500"
                  >
                    <option value="Direct">Direct</option>
                    <option value="Referral">Referral</option>
                    <option value="Website">Website</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Inbound">Inbound</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Budget ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={modalForm.budget}
                    onChange={(e) =>
                      setModalForm({ ...modalForm, budget: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E9ECF1] rounded-xl focus:outline-hidden focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Pipeline Stage
                  </label>
                  <select
                    value={modalForm.stage}
                    onChange={(e) =>
                      setModalForm({ ...modalForm, stage: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E9ECF1] rounded-xl focus:outline-hidden focus:border-sky-500"
                  >
                    {STAGES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
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
                  className="px-5 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-xs"
                >
                  {submitting ? "Saving..." : "Save Lead"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Follow-up modal */}
      {isFollowUpModalOpen && selectedLeadForFollowUp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-[#E9ECF1] shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Schedule Follow-up for {selectedLeadForFollowUp.name}
              </h3>
              <button
                onClick={() => setIsFollowUpModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFollowUp} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={followUpForm.title}
                  onChange={(e) =>
                    setFollowUpForm({ ...followUpForm, title: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm bg-white border border-[#E9ECF1] rounded-xl focus:outline-hidden focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Activity Type
                  </label>
                  <select
                    value={followUpForm.type}
                    onChange={(e) =>
                      setFollowUpForm({ ...followUpForm, type: e.target.value })
                    }
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
                    value={followUpForm.dueAt}
                    onChange={(e) =>
                      setFollowUpForm({
                        ...followUpForm,
                        dueAt: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E9ECF1] rounded-xl focus:outline-hidden focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFollowUpModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-xl hover:bg-slate-800"
                >
                  Confirm Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}

