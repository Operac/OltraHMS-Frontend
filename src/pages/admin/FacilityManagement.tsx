import React, { useState, useEffect } from 'react';
import { Plus, Trash2, BedDouble, Building2 } from 'lucide-react';
import { getWards, createWard, deleteWard, createBed, deleteBed } from '../../services/ward.service';
import type { Ward } from '../../services/ward.service';

export default function FacilityManagement() {
  const [wards, setWards] = useState<Ward[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showWardModal, setShowWardModal] = useState(false);
  const [showBedModal, setShowBedModal] = useState(false);
  const [selectedWardId, setSelectedWardId] = useState<string | null>(null);

  // Form states
  const [wardForm, setWardForm] = useState({ name: '', type: 'GENERAL', capacity: 10, basePrice: 50 });
  const [bedForm, setBedForm] = useState({ number: '', type: 'STANDARD', price: '' });

  const fetchWards = async () => {
    try {
      setIsLoading(true);
      const data = await getWards();
      setWards(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch wards');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWards();
  }, []);

  const handleCreateWard = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createWard({
        ...wardForm,
        capacity: Number(wardForm.capacity),
        basePrice: Number(wardForm.basePrice)
      });
      setShowWardModal(false);
      setWardForm({ name: '', type: 'GENERAL', capacity: 10, basePrice: 50 });
      fetchWards();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create ward');
    }
  };

  const handleCreateBed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWardId) return;
    try {
      await createBed({
        wardId: selectedWardId,
        number: bedForm.number,
        type: bedForm.type,
        price: bedForm.price ? Number(bedForm.price) : undefined
      });
      setShowBedModal(false);
      setBedForm({ number: '', type: 'STANDARD', price: '' });
      fetchWards();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create bed');
    }
  };

  const handleDeleteWard = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await deleteWard(id);
      fetchWards();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete ward');
    }
  };

  const handleDeleteBed = async (id: string, number: string) => {
    if (!window.confirm(`Are you sure you want to delete bed ${number}?`)) return;
    try {
      await deleteBed(id);
      fetchWards();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete bed');
    }
  };

  if (isLoading) return <div className="p-6">Loading facility data...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-outfit text-gray-900">Facility Management</h1>
          <p className="text-gray-500 mt-1">Manage hospital wards, beds, and base pricing</p>
        </div>
        <button
          onClick={() => setShowWardModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add New Ward
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100">
          {error}
        </div>
      )}

      <div className="grid gap-6">
        {wards.map((ward) => (
          <div key={ward.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {/* Ward Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{ward.name}</h2>
                  <div className="flex items-center text-sm text-gray-500 space-x-4 mt-1">
                    <span className="capitalize">{ward.type.toLowerCase()} Ward</span>
                    <span>•</span>
                    <span>Base Price: ${ward.basePrice}/day</span>
                    <span>•</span>
                    <span>{ward.beds.length} / {ward.capacity} Beds Configured</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    setSelectedWardId(ward.id);
                    setShowBedModal(true);
                  }}
                  className="px-4 py-2 text-sm font-medium text-brand-primary bg-brand-primary/10 rounded-lg hover:bg-brand-primary/20"
                >
                  Manage Beds
                </button>
                <button
                  onClick={() => handleDeleteWard(ward.id, ward.name)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Beds Grid */}
            <div className="p-6">
              {ward.beds.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <BedDouble className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No beds configured for this ward yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {ward.beds.map((bed) => (
                    <div 
                      key={bed.id} 
                      className={`relative group p-4 rounded-xl border flex flex-col items-center justify-center text-center
                        ${bed.status === 'VACANT_CLEAN' ? 'bg-green-50 border-green-200' : 
                          bed.status === 'OCCUPIED' ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}
                    >
                      <button 
                        onClick={() => handleDeleteBed(bed.id, bed.number)}
                        className="absolute top-2 right-2 p-1 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-md shadow-sm"
                        title="Delete Bed"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <BedDouble className={`w-6 h-6 mb-2 
                        ${bed.status === 'VACANT_CLEAN' ? 'text-green-600' : 
                          bed.status === 'OCCUPIED' ? 'text-blue-600' : 'text-gray-400'}`} 
                      />
                      <span className="font-semibold text-gray-900">{bed.number}</span>
                      <span className="text-xs text-gray-500 mt-1">
                        {bed.price ? `₦${bed.price}/day` : 'Standard'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {wards.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300 flex flex-col items-center justify-center">
            <Building2 className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-900">No Wards Found</h3>
            <p className="text-gray-500 mt-1 mb-6">Get started by creating your first hospital ward.</p>
            <button
              onClick={() => setShowWardModal(true)}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-sm"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create First Ward
            </button>
          </div>
        )}
      </div>

      {/* Ward Modal */}
      {showWardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Create New Ward</h3>
            <form onSubmit={handleCreateWard} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ward Name</label>
                <input
                  type="text"
                  required
                  value={wardForm.name}
                  onChange={(e) => setWardForm({ ...wardForm, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-brand-primary/20 outline-none"
                  placeholder="e.g. Pediatrics A"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={wardForm.type}
                    onChange={(e) => setWardForm({ ...wardForm, type: e.target.value })}
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-brand-primary/20 outline-none"
                  >
                    <option value="GENERAL">General</option>
                    <option value="ICU">ICU</option>
                    <option value="MATERNITY">Maternity</option>
                    <option value="PEDIATRICS">Pediatrics</option>
                    <option value="EMERGENCY">Emergency</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={wardForm.capacity}
                    onChange={(e) => setWardForm({ ...wardForm, capacity: Number(e.target.value) })}
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-brand-primary/20 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Base Price per Day (₦)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={wardForm.basePrice}
                  onChange={(e) => setWardForm({ ...wardForm, basePrice: Number(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-brand-primary/20 outline-none"
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowWardModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Ward
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bed Modal */}
      {showBedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Add Bed to Ward</h3>
            <form onSubmit={handleCreateBed} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bed Number / ID</label>
                <input
                  type="text"
                  required
                  value={bedForm.number}
                  onChange={(e) => setBedForm({ ...bedForm, number: e.target.value })}
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-brand-primary/20 outline-none"
                  placeholder="e.g. B-101"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bed Type</label>
                  <select
                    value={bedForm.type}
                    onChange={(e) => setBedForm({ ...bedForm, type: e.target.value })}
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-brand-primary/20 outline-none"
                  >
                    <option value="STANDARD">Standard</option>
                    <option value="VIP">VIP</option>
                    <option value="ISOLATION">Isolation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Custom Price (₦)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={bedForm.price}
                    onChange={(e) => setBedForm({ ...bedForm, price: e.target.value })}
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-brand-primary/20 outline-none"
                    placeholder="Leave empty for Ward Base Price"
                  />
                  <p className="text-xs text-gray-500 mt-1">Overrides ward's base price</p>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowBedModal(false);
                    setSelectedWardId(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Bed
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
