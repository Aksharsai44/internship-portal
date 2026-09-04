import React, { useState } from "react";
import { ClientUser, Batch } from "../types";
import {
  Building2,
  Plus,
  Edit3,
  Trash2,
  Mail,
  Phone,
  Shield,
  ShieldOff,
  X,
  Search,
  Globe,
  ChevronRight,
  Users,
  Calendar,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import axios from "axios";

interface ClientManagementViewProps {
  clients: ClientUser[];
  batches: Batch[];
  onUpdateClients: (clients: ClientUser[]) => void;
}

export function ClientManagementView({
  clients,
  batches,
  onUpdateClients,
}: ClientManagementViewProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editClient, setEditClient] = useState<ClientUser | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    password: "client@mind2i",
    phone: "",
    industry: "",
    assignedBatches: [] as string[],
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const resetForm = () => {
    setFormData({
      companyName: "",
      contactPerson: "",
      email: "",
      password: "client@mind2i",
      phone: "",
      industry: "",
      assignedBatches: [],
    });
    setSaveError(null);
  };

  const filteredClients = (clients || []).filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (c.companyName || "").toLowerCase().includes(q) ||
      (c.contactPerson || "").toLowerCase().includes(q) ||
      (c.email || "").toLowerCase().includes(q)
    );
  });

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.companyName.trim() || !formData.email.trim() || !formData.contactPerson.trim()) {
      setSaveError("Please fill in Company Name, Contact Person, and Email.");
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    const isEdit = !!editClient;
    const clientId = isEdit ? editClient!.id : `cli_${Date.now()}`;
    const payload: ClientUser = {
      id: clientId,
      companyName: formData.companyName.trim(),
      contactPerson: formData.contactPerson.trim(),
      email: formData.email.trim(),
      password: formData.password || "client@mind2i",
      phone: formData.phone.trim(),
      industry: formData.industry.trim(),
      assignedBatches: formData.assignedBatches.length > 0 ? formData.assignedBatches : ["all"],
      isActive: true,
      createdAt: isEdit && editClient?.createdAt ? editClient.createdAt : new Date().toISOString(),
    };

    try {
      let res;
      if (isEdit) {
        res = await axios.put(`/api/clients/${clientId}/`, payload);
      } else {
        res = await axios.post("/api/clients/", payload);
      }

      const returnedClient = res?.data ? { ...payload, ...res.data } : payload;
      if (isEdit) {
        onUpdateClients(clients.map((c) => (c.id === clientId ? returnedClient : c)));
      } else {
        onUpdateClients([returnedClient, ...clients.filter((c) => c.id !== returnedClient.id && c.email !== returnedClient.email)]);
      }
    } catch (err: any) {
      console.warn("API request issue, saving client locally:", err);
      // Fallback update to ensure UI always reflects the new client
      if (isEdit) {
        onUpdateClients(clients.map((c) => (c.id === clientId ? payload : c)));
      } else {
        onUpdateClients([payload, ...clients.filter((c) => c.id !== payload.id && c.email !== payload.email)]);
      }
    } finally {
      setIsSaving(false);
      setShowAddModal(false);
      setEditClient(null);
      resetForm();
    }
  };

  const handleDelete = async (clientId: string) => {
    try {
      await axios.delete(`/api/clients/${clientId}/`);
    } catch (err) {
      console.error("Failed to delete client:", err);
    }
    onUpdateClients(clients.filter((c) => c.id !== clientId));
    setDeleteConfirm(null);
  };

  const handleToggleActive = async (client: ClientUser) => {
    const updated = { ...client, isActive: !client.isActive };
    try {
      await axios.patch(`/api/clients/${client.id}/`, { isActive: updated.isActive });
    } catch (err) {
      console.error("Failed to toggle client status:", err);
    }
    onUpdateClients(clients.map((c) => (c.id === client.id ? updated : c)));
  };

  const openEditModal = (client: ClientUser) => {
    setEditClient(client);
    setFormData({
      companyName: client.companyName,
      contactPerson: client.contactPerson,
      email: client.email,
      password: client.password || "",
      phone: client.phone || "",
      industry: client.industry || "",
      assignedBatches: client.assignedBatches || [],
    });
    setShowAddModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-teal-500" />
            Client Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Create and manage client portal credentials
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setEditClient(null);
            setShowAddModal(true);
          }}
          className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl text-sm font-black hover:shadow-lg hover:shadow-teal-500/20 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Client
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search clients..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400"
        />
      </div>

      {/* Client Cards */}
      {filteredClients.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
          <Building2 className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h3 className="text-lg font-black text-slate-500">No clients yet</h3>
          <p className="text-sm text-slate-400 mt-1">Create client credentials for companies to access the intern leaderboard</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client, i) => {
            const assignedBatchObjects = batches.filter((b) => (client.assignedBatches || []).includes(b.id));

            return (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`bg-white rounded-2xl border p-5 transition-all hover:shadow-md ${
                  client.isActive ? "border-slate-100" : "border-red-100 bg-red-50/30"
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white font-black text-sm">
                      {client.companyName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-black text-slate-800 text-sm">{client.companyName}</h3>
                      <p className="text-[10px] text-slate-400 font-medium">{client.contactPerson}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${
                    client.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"
                  }`}>
                    {client.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-1.5 mb-3">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{client.email}</span>
                  </div>
                  {client.phone && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {client.phone}
                    </div>
                  )}
                  {client.industry && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Globe className="w-3.5 h-3.5 text-slate-400" />
                      {client.industry}
                    </div>
                  )}
                </div>

                {/* Assigned Batches */}
                <div className="mb-4">
                  <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Assigned Cohorts</div>
                  <div className="flex flex-wrap gap-1">
                    {assignedBatchObjects.length > 0 ? (
                      assignedBatchObjects.map((b) => (
                        <span key={b.id} className="px-2 py-0.5 bg-teal-50 text-teal-700 rounded-lg text-[10px] font-bold">{b.name}</span>
                      ))
                    ) : (client.assignedBatches || []).includes("all") ? (
                      <span className="px-2 py-0.5 bg-violet-50 text-violet-700 rounded-lg text-[10px] font-bold">All Cohorts</span>
                    ) : (
                      <span className="text-[10px] text-slate-400">None assigned</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => openEditModal(client)}
                    className="flex-1 px-3 py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100 transition flex items-center justify-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => handleToggleActive(client)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                      client.isActive
                        ? "bg-amber-50 text-amber-600 hover:bg-amber-100"
                        : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                    }`}
                  >
                    {client.isActive ? <ShieldOff className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                    {client.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(client.id)}
                    className="px-3 py-2 bg-red-50 text-red-500 rounded-xl text-xs font-bold hover:bg-red-100 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Delete Confirm */}
                {deleteConfirm === client.id && (
                  <div className="mt-3 p-3 bg-red-50 rounded-xl border border-red-200">
                    <p className="text-xs font-bold text-red-600 mb-2">Delete {client.companyName}?</p>
                    <div className="flex gap-2">
                      <button onClick={() => handleDelete(client.id)} className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-bold">Yes, Delete</button>
                      <button onClick={() => setDeleteConfirm(null)} className="px-3 py-1.5 bg-white text-slate-600 rounded-lg text-xs font-bold border">Cancel</button>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => { setShowAddModal(false); setEditClient(null); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black text-slate-800">
                  {editClient ? "Edit Client" : "Add New Client"}
                </h3>
                <button onClick={() => { setShowAddModal(false); setEditClient(null); }} className="p-1.5 hover:bg-slate-100 rounded-xl">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {saveError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-bold">
                  {saveError}
                </div>
              )}

              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Company Name *</label>
                    <input
                      required
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      placeholder="Acme Corp"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Contact Person *</label>
                    <input
                      required
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                      placeholder="John Doe"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Email *</label>
                    <input
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="client@company.com"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Password *</label>
                    <input
                      required
                      type="text"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="client@mind2i"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Phone</label>
                    <input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Industry</label>
                    <input
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      placeholder="Technology"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Assign Cohorts</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.assignedBatches.includes("all")}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, assignedBatches: ["all"] });
                          } else {
                            setFormData({ ...formData, assignedBatches: [] });
                          }
                        }}
                        className="rounded border-slate-300 text-teal-500 focus:ring-teal-500"
                      />
                      <span className="text-xs font-bold text-violet-600">All Cohorts</span>
                    </label>
                    {batches.map((b) => (
                      <label key={b.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.assignedBatches.includes(b.id) || formData.assignedBatches.includes("all")}
                          disabled={formData.assignedBatches.includes("all")}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({ ...formData, assignedBatches: [...formData.assignedBatches, b.id] });
                            } else {
                              setFormData({ ...formData, assignedBatches: formData.assignedBatches.filter((x) => x !== b.id) });
                            }
                          }}
                          className="rounded border-slate-300 text-teal-500 focus:ring-teal-500"
                        />
                        <span className="text-xs font-medium text-slate-600">{b.name}</span>
                        <span className="text-[10px] text-slate-400">({b.durationLabel})</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => { setShowAddModal(false); setEditClient(null); }}
                    className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving || !formData.companyName.trim() || !formData.email.trim() || !formData.contactPerson.trim()}
                    className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl text-sm font-bold hover:shadow-md transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                  >
                    {isSaving ? "Saving..." : editClient ? "Save Changes" : "Create Client"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
