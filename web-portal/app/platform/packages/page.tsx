"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Package as PackageIcon, Trash2, Edit } from "lucide-react";
import { packageService, Package } from "@/services/packageService";
import CreatePackageModal from "@/components/platform/CreatePackageModal";
import EditPackageModal from "@/components/platform/EditPackageModal";

export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const data = await packageService.getAllPackages();
      setPackages(data);
    } catch (error) {
      console.error("Failed to fetch packages", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this package?")) {
      try {
        await packageService.deletePackage(id);
        fetchPackages();
      } catch (error) {
        console.error("Failed to delete package", error);
      }
    }
  };

  const handleEdit = (pkg: Package) => {
    setSelectedPackage(pkg);
    setIsEditModalOpen(true);
  };

  const filteredPackages = packages.filter(pkg => 
    pkg.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Packages</h1>
          <p className="text-slate-400 mt-2">Manage subscription packages and limits.</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Package
        </button>
      </div>

      <div className="flex items-center gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
        <Search className="w-5 h-5 text-slate-500" />
        <input
          type="text"
          placeholder="Search packages..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent border-none focus:outline-none text-slate-200 w-full placeholder:text-slate-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12 text-slate-500">Loading packages...</div>
        ) : filteredPackages.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-500">No packages found.</div>
        ) : (
          filteredPackages.map((pkg) => (
            <div key={pkg.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-purple-500/50 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <PackageIcon className="w-6 h-6 text-purple-400" />
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => handleEdit(pkg)}
                        className="p-2 text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-colors"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => handleDelete(pkg.id)}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-slate-100 mb-2">{pkg.name}</h3>
              <p className="text-slate-400 text-sm mb-4 h-10 overflow-hidden">{pkg.description || "No description"}</p>
              
              <div className="text-2xl font-bold text-white mb-6">
                ${pkg.price.toFixed(2)} <span className="text-sm font-normal text-slate-500">/ month</span>
              </div>

              <div className="space-y-3 pt-6 border-t border-slate-800">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Admins</span>
                  <span className="text-slate-200">{pkg.max_admins}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Guards</span>
                  <span className="text-slate-200">{pkg.max_guards}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Residents</span>
                  <span className="text-slate-200">{pkg.max_residents}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <CreatePackageModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchPackages}
      />
      
      <EditPackageModal
        isOpen={isEditModalOpen}
        onClose={() => {
            setIsEditModalOpen(false);
            setSelectedPackage(null);
        }}
        onSuccess={fetchPackages}
        packageData={selectedPackage}
      />
    </div>
  );
}
