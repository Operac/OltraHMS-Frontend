import { useState, useEffect } from 'react';
import { 
  Users, FileText, Calendar, AlertCircle, CheckCircle, 
  Search, UserPlus, Phone, Clock, RefreshCw, DollarSign, 
  ChevronDown, ChevronUp, Trash2, Edit, Plus, Menu, 
  PieChart, BarChart3, Activity
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../constants/roles';
import axios from 'axios';
import toast from 'react-hot-toast';

type InsuranceClaimStatus = 
  | 'DRAFT'
  | 'SUBMITTED' 
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'PARTIALLY_APPROVED'
  | 'REJECTED'
  | 'PAID';

interface InsuranceClaim {
  id: string;
  claimNumber: string;
  invoiceId: string;
  insuranceProvider: string;
  submittedAmount: number;
  submittedAt: string;
  status: InsuranceClaimStatus;
  trackingNumber?: string;
  denialReason?: string;
  approvedAmount?: number;
  invoice: {
    id: string;
    invoiceNumber: string;
    total: number;
    status: string;
    patient: {
      id: string;
      firstName: string;
      lastName: string;
      patientNumber: string;
    }
  };
}

const InsuranceClaims = () => {
  const { user } = useAuth();
  const [claims, setClaims] = useState<InsuranceClaim[]>([]);
  const [selectedClaim, setSelectedClaim] = useState<InsuranceClaim | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    draft: 0,
    submitted: 0,
    underReview: 0,
    approved: 0,
    partiallyApproved: 0,
    rejected: 0,
    paid: 0,
    totalSubmitted: 0,
    totalApproved: 0
  });
  const [filters, setFilters] = useState({
    status: '' as InsuranceClaimStatus | '',
    provider: '',
    startDate: '',
    endDate: ''
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [claimForm, setClaimForm] = useState({
    invoiceId: '',
    insuranceProvider: '',
    notes: ''
  });
  const [updateForm, setUpdateForm] = useState({
    status: '' as InsuranceClaimStatus | '',
    approvedAmount: '',
    denialReason: '',
    trackingNumber: ''
  });
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredClaims, setFilteredClaims] = useState<InsuranceClaim[]>([]);

  // Fetch claims statistics
  const fetchClaimStats = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const response = await axios.get(`${API_URL}/insurance-claims/stats/summary`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching claim stats:', error);
    }
  };

  // Fetch all claims with filters
  const fetchClaims = async () => {
    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.provider) params.append('provider', filters.provider);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      
      const response = await axios.get(`${API_URL}/insurance-claims?${params.toString()}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setClaims(response.data);
      setFilteredClaims(response.data);
    } catch (error) {
      console.error('Error fetching claims:', error);
      toast.error('Failed to fetch insurance claims');
    } finally {
      setLoading(false);
    }
  };

  // Create a new claim
  const createClaim = async () => {
    if (!claimForm.invoiceId) {
      toast.error('Invoice ID is required');
      return;
    }

    setSubmitting(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const response = await axios.post(`${API_URL}/insurance-claims`, {
        invoiceId: claimForm.invoiceId,
        insuranceProvider: claimForm.insuranceProvider || undefined,
        notes: claimForm.notes
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      toast.success('Insurance claim created successfully');
      setClaimForm({
        invoiceId: '',
        insuranceProvider: '',
        notes: ''
      });
      await fetchClaims();
      await fetchClaimStats();
    } catch (error: any) {
      console.error('Error creating claim:', error);
      toast.error(error.response?.data?.message || 'Failed to create insurance claim');
    } finally {
      setSubmitting(false);
    }
  };

  // Update claim
  const updateClaim = async () => {
    if (!selectedClaim) return;
    if (!updateForm.status) {
      toast.error('Status is required');
      return;
    }

    setSubmitting(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const updateData: any = {};
      if (updateForm.status) updateData.status = updateForm.status;
      if (updateForm.approvedAmount !== '') updateData.approvedAmount = parseFloat(updateForm.approvedAmount);
      if (updateForm.denialReason !== '') updateData.denialReason = updateForm.denialReason;
      if (updateForm.trackingNumber !== '') updateData.trackingNumber = updateForm.trackingNumber;

      const response = await axios.patch(`${API_URL}/insurance-claims/${selectedClaim.id}`, updateData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      toast.success('Insurance claim updated successfully');
      setSelectedClaim(null);
      setUpdateForm({
        status: '',
        approvedAmount: '',
        denialReason: '',
        trackingNumber: ''
      });
      await fetchClaims();
      await fetchClaimStats();
    } catch (error: any) {
      console.error('Error updating claim:', error);
      toast.error(error.response?.data?.message || 'Failed to update claim');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit claim
  const submitClaim = async () => {
    if (!selectedClaim) return;
    if (selectedClaim.status !== 'DRAFT') {
      toast.error('Only draft claims can be submitted');
      return;
    }

    setSubmitting(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const response = await axios.post(`${API_URL}/insurance-claims/${selectedClaim.id}/submit`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      toast.success('Claim submitted successfully');
      setSelectedClaim(null);
      await fetchClaims();
      await fetchClaimStats();
    } catch (error: any) {
      console.error('Error submitting claim:', error);
      toast.error(error.response?.data?.message || 'Failed to submit claim');
    } finally {
      setSubmitting(false);
    }
  };

  // Search claims
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredClaims(claims);
    } else {
      setFilteredClaims(
        claims.filter(claim => 
          claim.claimNumber.toLowerCase().includes(query) ||
          claim.invoice.invoiceNumber.toLowerCase().includes(query) ||
          claim.invoice.patient.firstName.toLowerCase().includes(query) ||
          claim.invoice.patient.lastName.toLowerCase().includes(query) ||
          claim.invoice.patient.patientNumber.toLowerCase().includes(query) ||
          claim.insuranceProvider.toLowerCase().includes(query)
        )
      );
    }
  };

  // Select claim for viewing/editing
  const handleSelectClaim = (claim: InsuranceClaim) => {
    setSelectedClaim(claim);
    // Pre-fill update form with current values
    setUpdateForm({
      status: claim.status,
      approvedAmount: claim.approvedAmount?.toString() || '',
      denialReason: claim.denialReason || '',
      trackingNumber: claim.trackingNumber || ''
    });
  };

  // Clear selection
  const handleClearSelection = () => {
    setSelectedClaim(null);
    setUpdateForm({
      status: '',
      approvedAmount: '',
      denialReason: '',
      trackingNumber: ''
    });
  };

  useEffect(() => {
    fetchClaims();
    fetchClaimStats();
  }, []);

  useEffect(() => {
    if (filters.status || filters.provider || filters.startDate || filters.endDate) {
      fetchClaims();
    }
  }, [filters]);

  useEffect(() => {
    if (searchQuery.trim() !== '') {
      handleSearch({ target: { value: searchQuery } } as React.ChangeEvent<HTMLInputElement>);
    } else {
      setFilteredClaims(claims);
    }
  }, [searchQuery]);

  if (loading && claims.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            <FileText className="mr-2 h-5 w-5" /> Insurance Claims Management
          </h1>
          <p className="text-gray-500">Manage and track insurance claims</p>
        </div>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Search claims..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-48 rounded-md border-gray-300 shadow-sm focus:border-sky-400 focus:ring-sky-400 py-2 px-3 border"
          />
          <button
            onClick={handleClearSelection}
            className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
          >
            <Users className="w-4 h-4" /> Clear Selection
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Claims Statistics Column */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-sky-500" /> Claims Statistics
              </h2>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="text-sm font-medium text-gray-500 mb-2">Claim Status Distribution</div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-red-50 p-3 rounded-lg">
                  <p className="text-xs font-medium text-red-600">Draft</p>
                  <p className="text-2xl font-bold text-red-600">{stats.draft}</p>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg">
                  <p className="text-xs font-medium text-orange-600">Submitted</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.submitted}</p>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <p className="text-xs font-medium text-yellow-600">Under Review</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.underReview}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs font-medium text-blue-600">Approved</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.approved}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-xs font-medium text-green-600">Paid</p>
                  <p className="text-2xl font-bold text-green-600">{stats.paid}</p>
                </div>
                <div className="bg-red-50/50 p-3 rounded-lg">
                  <p className="text-xs font-medium text-red-600">Partially Approved</p>
                  <p className="text-2xl font-bold text-red-600">{stats.partiallyApproved}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs font-medium text-gray-600">Rejected</p>
                  <p className="text-2xl font-bold text-gray-600">{stats.rejected}</p>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200">
              <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Activity className="w-5 h-5 text-sky-500" /> Financial Summary
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total Submitted:</span>
                  <span className="font-medium text-gray-900">₦{stats.totalSubmitted.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total Approved:</span>
                  <span className="font-medium text-gray-900">₦{stats.totalApproved.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Claims List Column */}
        <div className="lg:col-span-2">
          {!selectedClaim ? (
            <>
              {/* Claims Filters */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Search className="w-5 h-5 text-sky-500" /> Filter Claims
                  </h2>
                </div>
                <div className="px-6 py-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        value={filters.status}
                        onChange={(e) => 
                          setFilters(prev => ({...prev, status: e.target.value as InsuranceClaimStatus | ''}))
                        }
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-sky-400 focus:ring-sky-400 py-2 px-3 border"
                      >
                        <option value="">All Statuses</option>
                        <option value="DRAFT">Draft</option>
                        <option value="SUBMITTED">Submitted</option>
                        <option value="UNDER_REVIEW">Under Review</option>
                        <option value="APPROVED">Approved</option>
                        <option value="PARTIALLY_APPROVED">Partially Approved</option>
                        <option value="REJECTED">Rejected</option>
                        <option value="PAID">Paid</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Provider</label>
                      <input
                        type="text"
                        value={filters.provider}
                        onChange={(e) => setFilters(prev => ({...prev, provider: e.target.value}))}
                        placeholder="Enter provider name..."
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-sky-400 focus:ring-sky-400 py-2 px-3 border"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">From</label>
                          <input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => setFilters(prev => ({...prev, startDate: e.target.value}))}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-sky-400 focus:ring-sky-400 py-2 px-3 border"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">To</label>
                          <input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => setFilters(prev => ({...prev, endDate: e.target.value}))}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-sky-400 focus:ring-sky-400 py-2 px-3 border"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end pt-4">
                    <button
                      onClick={() => setFilters({status: '', provider: '', startDate: '', endDate: ''})}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      Reset Filters
                    </button>
                    <button
                      onClick={fetchClaims}
                      className="ml-3 bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              </div>

              {/* Claims Table */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-sky-500" /> Claims List ({filteredClaims.length})
                  </h2>
                </div>
                <div className="px-6 py-4 space-y-4">
                  {filteredClaims.length === 0 ? (
                    <div className="text-center py-8">
                      <AlertCircle className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                      <p className="text-gray-500">No claims found matching your filters</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                          <tr>
                            <th className="px-6 py-3">Claim #</th>
                            <th className="px-6 py-3">Patient</th>
                            <th className="px-6 py-3">Provider</th>
                            <th className="px-6 py-3">Submitted</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Amount (₦)</th>
                            <th className="px-6 py-3">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {filteredClaims.map((claim: any) => (
                            <tr
                              key={claim.id}
                              className={`hover:bg-gray-50 transition-colors ${
                                selectedClaim?.id === claim.id 
                                  ? 'border-l-4 border-sky-500 bg-sky-50/50' 
                                  : ''
                              }`}
                              onClick={() => handleSelectClaim(claim)}
                            >
                              <td className="px-6 py-4 font-medium">{claim.claimNumber}</td>
                              <td className="px-6 py-4">
                                <div className="flex flex-col">
                                  <div className="font-medium text-gray-900">
                                    {claim.invoice.patient.firstName} {claim.invoice.patient.lastName}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    #{claim.invoice.patient.patientNumber}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {claim.insuranceProvider}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {new Date(claim.submittedAt).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                  claim.status === 'DRAFT' ? 'bg-gray-100 text-gray-600' :
                                  claim.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-600' :
                                  claim.status === 'UNDER_REVIEW' ? 'bg-yellow-100 text-yellow-600' :
                                  claim.status === 'APPROVED' ? 'bg-green-100 text-green-600' :
                                  claim.status === 'PARTIALLY_APPROVED' ? 'bg-orange-100 text-orange-600' :
                                  claim.status === 'REJECTED' ? 'bg-red-100 text-red-600' :
                                  claim.status === 'PAID' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {claim.status.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="px-6 py-4 font-medium text-gray-900">
                                ₦{claim.submittedAmount.toLocaleString()}
                              </td>
                              <td className="px-6 py-4 text-right space-x-2">
                                {!selectedClaim || selectedClaim.id !== claim.id ? (
                                  <button
                                    onClick={() => handleSelectClaim(claim)}
                                    className="text-sky-500 hover:text-sky-700 font-medium text-sm flex items-center gap-1"
                                  >
                                    <Edit className="w-4 h-4" /> View
                                  </button>
                                ) : (
                                  <>
                                    <button
                                      onClick={submitClaim}
                                      disabled={submitting || claim.status !== 'DRAFT'}
                                      className={`text-sm font-medium px-3 py-1.5 rounded-lg ${
                                        claim.status === 'DRAFT' 
                                          ? 'bg-green-500 text-white hover:bg-green-600'
                                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                      }`}
                                    >
                                      {claim.status === 'DRAFT' ? 'Submit' : 'Submitted'}
                                    </button>
                                    <button
                                      onClick={handleClearSelection}
                                      className="ml-2 text-sm text-gray-500 hover:text-gray-700"
                                    >
                                      Clear
                                    </button>
                                  </>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            /* Claim Detail View */
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-sky-500" />
                  <span className="font-medium text-gray-900">
                    Claim Details: {selectedClaim?.claimNumber}
                  </span>
                </div>
                <button
                  onClick={handleClearSelection}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <Edit className="w-4 h-4" /> Back to List
                </button>
              </div>
              <div className="px-6 py-6 space-y-6">
                {/* Claim Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Claim Information</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Claim Number:</span>
                        <span className="font-medium">{selectedClaim?.claimNumber}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Invoice:</span>
                        <span className="font-medium">{selectedClaim?.invoice?.invoiceNumber}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Patient:</span>
                        <span className="font-medium">
                          {selectedClaim?.invoice?.patient?.firstName} {selectedClaim?.invoice?.patient?.lastName}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Insurance Provider:</span>
                        <span className="font-medium">{selectedClaim?.insuranceProvider}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Submitted Date:</span>
                        <span className="font-medium">
                          {new Date(selectedClaim?.submittedAt || '').toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Financial Details</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Submitted Amount:</span>
                        <span className="font-medium text-gray-900">₦{selectedClaim?.submittedAmount?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Approved Amount:</span>
                        <span className="font-medium text-gray-900">
                          ₦{selectedClaim?.approvedAmount?.toLocaleString() || '0'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Balance:</span>
                        <span className="font-medium text-gray-900">
                          ₦{((selectedClaim?.submittedAmount || 0) - (selectedClaim?.approvedAmount || 0)).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {(selectedClaim as any)?.claimItems?.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Claim Items</h3>
                      <div className="space-y-1">
                        {(selectedClaim as any).claimItems.map((item: any, i: number) => (
                          <div key={i} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                            <span className="text-gray-700">{item.description}</span>
                            <div className="flex gap-3">
                              <span className="text-gray-500">₦{item.billedAmount?.toLocaleString()}</span>
                              <span className="text-green-600">Covered: ₦{item.coveredAmount?.toLocaleString()}</span>
                              <span className="text-orange-600">Co-pay: ₦{item.patientPortion?.toLocaleString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Status & Actions</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Current Status:</span>
                        <span className={`font-medium text-gray-900 ${
                          selectedClaim?.status === 'DRAFT' ? 'text-gray-600' :
                          selectedClaim?.status === 'SUBMITTED' ? 'text-blue-600' :
                          selectedClaim?.status === 'UNDER_REVIEW' ? 'text-yellow-600' :
                          selectedClaim?.status === 'APPROVED' ? 'text-green-600' :
                          selectedClaim?.status === 'PARTIALLY_APPROVED' ? 'text-orange-600' :
                          selectedClaim?.status === 'REJECTED' ? 'text-red-600' :
                          selectedClaim?.status === 'PAID' ? 'text-green-800' : 'text-gray-600'
                        }`}>
                          {selectedClaim?.status.replace('_', ' ')}
                        </span>
                      </div>
                      {(selectedClaim?.status === 'APPROVED' || selectedClaim?.status === 'PARTIALLY_APPROVED' || selectedClaim?.status === 'REJECTED') && (
                        <div className="mt-4">
                          <h4 className="font-semibold text-gray-900 mb-2">Actions</h4>
                          <div className="space-y-2">
                            {(selectedClaim?.status === 'APPROVED' || selectedClaim?.status === 'PARTIALLY_APPROVED') && (
                              <>
                                <button
                                  onClick={() => {
                                    setUpdateForm(prev => ({...prev, status: 'PAID'}));
                                  }}
                                  className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                                >
                                  Mark as Paid
                                </button>
                              </>
                            )}
                            {selectedClaim?.status === 'REJECTED' && (
                              <>
                                <button
                                  onClick={() => {
                                    setUpdateForm(prev => ({...prev, status: 'SUBMITTED'}));
                                  }}
                                  className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                                >
                                  Resubmit Claim
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Update Form */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Edit className="w-5 h-5 text-sky-500" /> Update Claim
                  </h3>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    updateClaim();
                  }} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                        <select
                          value={updateForm.status}
                          onChange={(e) => setUpdateForm(prev => ({...prev, status: e.target.value as InsuranceClaimStatus | ''}))}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-sky-400 focus:ring-sky-400 py-2 px-3 border"
                        >
                          <option value="">Select status</option>
                          <option value="DRAFT">Draft</option>
                          <option value="SUBMITTED">Submitted</option>
                          <option value="UNDER_REVIEW">Under Review</option>
                          <option value="APPROVED">Approved</option>
                          <option value="PARTIALLY_APPROVED">Partially Approved</option>
                          <option value="REJECTED">Rejected</option>
                          <option value="PAID">Paid</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Approved Amount (₦)</label>
                        <input
                          type="number"
                          value={updateForm.approvedAmount}
                          onChange={(e) => setUpdateForm(prev => ({...prev, approvedAmount: e.target.value}))}
                          placeholder="Enter approved amount"
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-sky-400 focus:ring-sky-400 py-2 px-3 border"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Denial Reason</label>
                        <input
                          type="text"
                          value={updateForm.denialReason}
                          onChange={(e) => setUpdateForm(prev => ({...prev, denialReason: e.target.value}))}
                          placeholder="Enter denial reason (if applicable)"
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-sky-400 focus:ring-sky-400 py-2 px-3 border"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tracking Number</label>
                        <input
                          type="text"
                          value={updateForm.trackingNumber}
                          onChange={(e) => setUpdateForm(prev => ({...prev, trackingNumber: e.target.value}))}
                          placeholder="Enter tracking number"
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-sky-400 focus:ring-sky-400 py-2 px-3 border"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end pt-4">
                      <button
                        type="submit"
                        disabled={submitting || !updateForm.status}
                        className={`w-full bg-sky-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {submitting ? 'Updating...' : 'Update Claim'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

        </div>

        {/* Create New Claim Column */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-sky-500" /> Create New Claim
              </h2>
            </div>
            <div className="px-6 py-6">
              <form onSubmit={(e) => {
                e.preventDefault();
                createClaim();
              }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Invoice ID *</label>
                  <input
                    type="text"
                    value={claimForm.invoiceId}
                    onChange={(e) => setClaimForm(prev => ({...prev, invoiceId: e.target.value}))}
                    placeholder="Enter invoice ID"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-sky-400 focus:ring-sky-400 py-2 px-3 border"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Provider (optional if invoice has linked insurance)</label>
                  <input
                    type="text"
                    value={claimForm.insuranceProvider}
                    onChange={(e) => setClaimForm(prev => ({...prev, insuranceProvider: e.target.value}))}
                    placeholder="Enter insurance provider name"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-sky-400 focus:ring-sky-400 py-2 px-3 border"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                  <textarea
                    value={claimForm.notes}
                    onChange={(e) => setClaimForm(prev => ({...prev, notes: e.target.value}))}
                    placeholder="Enter any additional notes"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-sky-400 focus:ring-sky-400 py-2 px-3 border"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={submitting || !claimForm.invoiceId || !claimForm.insuranceProvider}
                    className={`w-full bg-sky-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {submitting ? 'Creating...' : 'Create Claim'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsuranceClaims;