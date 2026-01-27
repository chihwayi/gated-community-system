"use client";

import { useEffect, useState } from "react";
import { Plus, Search, ExternalLink, Trash2, Edit } from "lucide-react";
import { tenantService, Tenant } from "@/services/tenantService";
import CreateTenantModal from "@/components/platform/CreateTenantModal";
import EditTenantModal from "@/components/platform/EditTenantModal";
import { useConfirmation } from "@/context/ConfirmationContext";

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const { confirm } = useConfirmation();

  const fetchTenants = async () => {
    setIsLoading(true);
    try {
      const data = await tenantService.getAllTenants();
      setTenants(data);
    } catch (error) {
      console.error("Failed to fetch tenants", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleDelete = async (id: number) => {
    const confirmed = await confirm({
      title: "Delete Community",
      message: "Are you sure you want to delete this community? This action cannot be undone and will delete all associated data.",
      confirmLabel: "Delete",
      variant: "danger"
    });

    if (confirmed) {
      try {
        await tenantService.deleteTenant(id);
        fetchTenants();
      } catch (error) {
        console.error("Failed to delete tenant", error);
      }
    }
  };

  const filteredTenants = tenants.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Communities</h1>
          <p className="text-slate-400">Manage your tenant communities</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Community
        </button>
      </div>

      <div className="flex items-center gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
        <Search className="w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search communities..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent border-none focus:outline-none text-slate-100 w-full placeholder:text-slate-500"
        />
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-900/50 text-slate-400 border-b border-slate-800">
            <tr>
              <th className="px-6 py-4 font-medium">Name</th>
              <th className="px-6 py-4 font-medium">URL Slug</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Created</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                  Loading communities...
                </td>
              </tr>
            ) : filteredTenants.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                  No communities found.
                </td>
              </tr>
            ) : (
              filteredTenants.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold">
                            {tenant.name.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="font-medium text-slate-200">{tenant.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-400 font-mono text-sm">
                    {tenant.slug}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      tenant.is_active 
                        ? "bg-green-500/10 text-green-400" 
                        : "bg-red-500/10 text-red-400"
                    }`}>
                      {tenant.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-sm">
                    {new Date(tenant.created_at || "").toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <a 
                        href={`/?tenant=${tenant.slug}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                        title="Visit Tenant Portal"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button 
                        className="p-2 text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-colors"
                        onClick={() => setEditingTenant(tenant)}
                        title="Edit Tenant"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        onClick={() => handleDelete(tenant.id)}
                        title="Delete Tenant"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <CreateTenantModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onSuccess={fetchTenants}
      />

      <EditTenantModal
        isOpen={!!editingTenant}
        onClose={() => setEditingTenant(null)}
        onSuccess={fetchTenants}
        tenant={editingTenant}
      />
    </div>
  );
}
