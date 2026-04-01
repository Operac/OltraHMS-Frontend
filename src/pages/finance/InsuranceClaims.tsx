import { useState, useEffect } from 'react';
import { 
  Users, FileText, AlertCircle, Search, Edit, Plus, PieChart, Activity
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
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
    };
  };
}

const InsuranceClaims = () => {
  const {} = useAuth();
  const [claims, setClaims] = useState<InsuranceClaim[]>([]);
  const [selectedClaim, setSelectedClaim] = useState<InsuranceClaim | null>(null);
  const [stats, setStats] = useState({
    total: 0, draft: 0, submitted: 0, underReview: 0,
    approved: 0, partiallyApproved: 0, rejected: 0, paid: 0,
    totalSubmitted: 0, totalApproved: 0
  });
  const [filters, setFilters] = useState({
    status: '' as InsuranceClaimStatus | '',
    provider: '', startDate: '', endDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [claimForm, setClaimForm] = useState({ invoiceId: '', insuranceProvider: '', notes: '' });
  const [updateForm, setUpdateForm] = useState({
    status: '' as InsuranceClaimStatus | '',
    approvedAmount: '', denialReason: '', trackingNumber: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredClaims, setFilteredClaims] = useState<InsuranceClaim[]>([]);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

   const fetchClaimStats = async () => {
     try {
       const res = await axios.get(`${API_URL}/insurance-claim/stats/summary`, { headers: authHeader() });
       setStats(res.data);
     } catch (err) { console.error(err); }
   };

   const fetchClaims = async () => {
     setLoading(true);
     try {
       const params = new URLSearchParams();
       if (filters.status)    params.append('status',    filters.status);
       if (filters.provider)  params.append('provider',  filters.provider);
       if (filters.startDate) params.append('startDate', filters.startDate);
       if (filters.endDate)   params.append('endDate',   filters.endDate);
       const res = await axios.get(`${API_URL}/insurance-claim?${params}`, { headers: authHeader() });
       setClaims(res.data);
       setFilteredClaims(res.data);
     } catch (err) {
       console.error(err);
       toast.error('Failed to fetch insurance claims');
     } finally { setLoading(false); }
   };

   const createClaim = async () => {
     if (!claimForm.invoiceId) { toast.error('Invoice ID is required'); return; }
     setSubmitting(true);
     try {
       await axios.post(`${API_URL}/insurance-claim`, {
         invoiceId: claimForm.invoiceId,
         insuranceProvider: claimForm.insuranceProvider || undefined,
         notes: claimForm.notes
       }, { headers: authHeader() });
       toast.success('Insurance claim created successfully');
       setClaimForm({ invoiceId: '', insuranceProvider: '', notes: '' });
       await fetchClaims(); await fetchClaimStats();
     } catch (err: any) {
       toast.error(err.response?.data?.message || 'Failed to create insurance claim');
     } finally { setSubmitting(false); }
   };

   const updateClaim = async () => {
     if (!selectedClaim || !updateForm.status) { toast.error('Status is required'); return; }
     setSubmitting(true);
     try {
       const body: any = { status: updateForm.status };
       if (updateForm.approvedAmount !== '') body.approvedAmount = parseFloat(updateForm.approvedAmount);
       if (updateForm.denialReason   !== '') body.denialReason   = updateForm.denialReason;
       if (updateForm.trackingNumber !== '') body.trackingNumber = updateForm.trackingNumber;
       await axios.patch(`${API_URL}/insurance-claim/${selectedClaim.id}`, body, { headers: authHeader() });
       toast.success('Insurance claim updated successfully');
       handleClearSelection();
       await fetchClaims(); await fetchClaimStats();
     } catch (err: any) {
       toast.error(err.response?.data?.message || 'Failed to update claim');
     } finally { setSubmitting(false); }
   };

   const submitClaim = async () => {
     if (!selectedClaim || selectedClaim.status !== 'DRAFT') {
       toast.error('Only draft claims can be submitted'); return;
     }
     setSubmitting(true);
     try {
       await axios.post(`${API_URL}/insurance-claim/${selectedClaim.id}/submit`, {}, { headers: authHeader() });
       toast.success('Claim submitted successfully');
       handleClearSelection();
       await fetchClaims(); await fetchClaimStats();
     } catch (err: any) {
       toast.error(err.response?.data?.message || 'Failed to submit claim');
     } finally { setSubmitting(false); }
   };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value.toLowerCase();
    setSearchQuery(q);
     setFilteredClaims(
       q.trim() === ''
         ? claims
         : claims.filter(c =>
             String(c.claimNumber).toLowerCase().includes(String(q).toLowerCase()) ||
             String(c.invoice?.invoiceNumber).toLowerCase().includes(String(q).toLowerCase()) ||
             String(c.invoice?.patient?.firstName).toLowerCase().includes(String(q).toLowerCase()) ||
             String(c.invoice?.patient?.lastName).toLowerCase().includes(String(q).toLowerCase()) ||
             String(c.invoice?.patient?.patientNumber).toLowerCase().includes(String(q).toLowerCase()) ||
             String(c.insuranceProvider).toLowerCase().includes(String(q).toLowerCase())
          )
    );
  };

  const handleSelectClaim = (claim: InsuranceClaim) => {
    setSelectedClaim(claim);
    setUpdateForm({
      status: claim.status,
      approvedAmount: claim.approvedAmount?.toString() || '',
      denialReason:   claim.denialReason   || '',
      trackingNumber: claim.trackingNumber || ''
    });
  };

  const handleClearSelection = () => {
    setSelectedClaim(null);
    setUpdateForm({ status: '', approvedAmount: '', denialReason: '', trackingNumber: '' });
  };

  useEffect(() => { fetchClaims(); fetchClaimStats(); }, []);
  useEffect(() => {
    if (filters.status || filters.provider || filters.startDate || filters.endDate) fetchClaims();
  }, [filters]);
  useEffect(() => { setFilteredClaims(searchQuery.trim() ? filteredClaims : claims); }, [claims]);

  const statusBadge = (status: InsuranceClaimStatus) => {
    const map: Record<InsuranceClaimStatus, string> = {
      DRAFT:              'bg-gray-100 text-gray-600',
      SUBMITTED:          'bg-blue-100 text-blue-600',
      UNDER_REVIEW:       'bg-yellow-100 text-yellow-600',
      APPROVED:           'bg-green-100 text-green-600',
      PARTIALLY_APPROVED: 'bg-orange-100 text-orange-600',
      REJECTED:           'bg-red-100 text-red-600',
      PAID:               'bg-green-500 text-white',
    };
    return map[status] || 'bg-gray-100 text-gray-600';
  };

  if (loading && claims.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="h-6 w-6" /> Insurance Claims Management
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
          <button onClick={handleClearSelection} className="text-gray-600 hover:text-gray-900 flex items-center gap-2">
            <Users className="w-4 h-4" /> Clear Selection
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Column 1: Stats + Create ── */}
        <div className="lg:col-span-1 space-y-6">

          {/* Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-sky-500" /> Claims Statistics
              </h2>
            </div>
            <div className="px-6 py-4">
              <p className="text-sm font-medium text-gray-500 mb-3">Status Distribution</p>
              <div className="grid grid-cols-2 gap-2">
                {([
                  ['Draft',              stats.draft,             'bg-gray-50  text-gray-600'],
                  ['Submitted',          stats.submitted,         'bg-orange-50 text-orange-600'],
                  ['Under Review',       stats.underReview,       'bg-yellow-50 text-yellow-600'],
                  ['Approved',           stats.approved,          'bg-blue-50  text-blue-600'],
                  ['Paid',               stats.paid,              'bg-green-50 text-green-600'],
                  ['Partially Approved', stats.partiallyApproved, 'bg-orange-50 text-orange-600'],
                ] as [string, number, string][]).map(([label, val, cls]) => (
                  <div key={label} className={`${cls.split(' ')[0]} p-3 rounded-lg`}>
                    <p className={`text-xs font-medium ${cls.split(' ')[1]}`}>{label}</p>
                    <p className={`text-2xl font-bold ${cls.split(' ')[1]}`}>{val}</p>
                  </div>
                ))}
                <div className="bg-red-50 p-3 rounded-lg col-span-2">
                  <p className="text-xs font-medium text-red-600">Rejected</p>
                  <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
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
                  <span className="font-medium">₦{stats.totalSubmitted.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total Approved:</span>
                  <span className="font-medium">₦{stats.totalApproved.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Create New Claim */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-sky-500" /> Create New Claim
              </h2>
            </div>
            <div className="px-6 py-6">
              <form onSubmit={(e) => { e.preventDefault(); createClaim(); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Invoice ID *</label>
                  <input
                    type="text"
                    value={claimForm.invoiceId}
                    onChange={(e) => setClaimForm(p => ({ ...p, invoiceId: e.target.value }))}
                    placeholder="Enter invoice ID"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-sky-400 focus:ring-sky-400 py-2 px-3 border"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Insurance Provider{' '}
                    <span className="text-gray-400 font-normal">(optional if invoice has linked insurance)</span>
                  </label>
                  <input
                    type="text"
                    value={claimForm.insuranceProvider}
                    onChange={(e) => setClaimForm(p => ({ ...p, insuranceProvider: e.target.value }))}
                    placeholder="Enter insurance provider name"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-sky-400 focus:ring-sky-400 py-2 px-3 border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                  <textarea
                    value={claimForm.notes}
                    onChange={(e) => setClaimForm(p => ({ ...p, notes: e.target.value }))}
                    placeholder="Enter any additional notes"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-sky-400 focus:ring-sky-400 py-2 px-3 border"
                    rows={3}
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting || !claimForm.invoiceId}
                  className="w-full bg-sky-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Creating...' : 'Create Claim'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* ── Columns 2–3: List or Detail ── */}
        <div className="lg:col-span-2">
          {!selectedClaim ? (
            <>
              {/* Filters */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Search className="w-5 h-5 text-sky-500" /> Filter Claims
                  </h2>
                </div>
                <div className="px-6 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        value={filters.status}
                        onChange={(e) => setFilters(p => ({ ...p, status: e.target.value as InsuranceClaimStatus | '' }))}
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
                        onChange={(e) => setFilters(p => ({ ...p, provider: e.target.value }))}
                        placeholder="Enter provider name..."
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-sky-400 focus:ring-sky-400 py-2 px-3 border"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">From</label>
                          <input type="date" value={filters.startDate}
                            onChange={(e) => setFilters(p => ({ ...p, startDate: e.target.value }))}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-sky-400 focus:ring-sky-400 py-2 px-3 border"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">To</label>
                          <input type="date" value={filters.endDate}
                            onChange={(e) => setFilters(p => ({ ...p, endDate: e.target.value }))}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-sky-400 focus:ring-sky-400 py-2 px-3 border"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      onClick={() => setFilters({ status: '', provider: '', startDate: '', endDate: '' })}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      Reset Filters
                    </button>
                    <button onClick={fetchClaims} className="bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600">
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
                <div className="px-6 py-4">
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
                            <th className="px-4 py-3">Claim #</th>
                            <th className="px-4 py-3">Patient</th>
                            <th className="px-4 py-3">Provider</th>
                            <th className="px-4 py-3">Submitted</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Amount (₦)</th>
                            <th className="px-4 py-3">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {filteredClaims.map((claim) => (
                            <tr
                              key={claim.id}
                              className="hover:bg-gray-50 transition-colors cursor-pointer"
                              onClick={() => handleSelectClaim(claim)}
                            >
                              <td className="px-4 py-4 font-medium">{claim.claimNumber}</td>
                              <td className="px-4 py-4">
                                <div className="font-medium text-gray-900">
                                  {claim.invoice.patient.firstName} {claim.invoice.patient.lastName}
                                </div>
                                <div className="text-xs text-gray-500">#{claim.invoice.patient.patientNumber}</div>
                              </td>
                              <td className="px-4 py-4 text-sm text-gray-600">{claim.insuranceProvider}</td>
                              <td className="px-4 py-4 text-sm text-gray-600">
                                {new Date(claim.submittedAt).toLocaleDateString()}
                              </td>
                              <td className="px-4 py-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${statusBadge(claim.status)}`}>
                                  {claim.status.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="px-4 py-4 font-medium text-gray-900">
                                ₦{claim.submittedAmount.toLocaleString()}
                              </td>
                              <td className="px-4 py-4">
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleSelectClaim(claim); }}
                                  className="text-sky-500 hover:text-sky-700 font-medium text-sm flex items-center gap-1"
                                >
                                  <Edit className="w-4 h-4" /> View
                                </button>
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
            /* ── Claim Detail ── */
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-sky-500" />
                  <span className="font-semibold text-gray-900">Claim Details: {selectedClaim.claimNumber}</span>
                </div>
                <button onClick={handleClearSelection} className="text-gray-500 hover:text-gray-700 text-sm">
                  ← Back to List
                </button>
              </div>

              <div className="px-6 py-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Claim Info */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Claim Information</h3>
                    <div className="space-y-2">
                      {([
                        ['Claim Number',       selectedClaim.claimNumber],
                        ['Invoice',            selectedClaim.invoice?.invoiceNumber],
                        ['Patient',            `${selectedClaim.invoice?.patient?.firstName} ${selectedClaim.invoice?.patient?.lastName}`],
                        ['Insurance Provider', selectedClaim.insuranceProvider],
                        ['Submitted Date',     new Date(selectedClaim.submittedAt).toLocaleDateString()],
                      ] as [string, string][]).map(([label, value]) => (
                        <div key={label} className="flex justify-between text-sm">
                          <span className="text-gray-500">{label}:</span>
                          <span className="font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Financial Details */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Financial Details</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Submitted Amount:</span>
                        <span className="font-medium">₦{selectedClaim.submittedAmount?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Approved Amount:</span>
                        <span className="font-medium">₦{selectedClaim.approvedAmount?.toLocaleString() || '0'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Balance:</span>
                        <span className="font-medium">
                          ₦{((selectedClaim.submittedAmount || 0) - (selectedClaim.approvedAmount || 0)).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Claim Items */}
                  {(selectedClaim as any)?.claimItems?.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Claim Items</h3>
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

                  {/* Status & Quick Actions */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Status &amp; Actions</h3>
                    <div className="flex justify-between text-sm mb-3">
                      <span className="text-gray-500">Current Status:</span>
                      <span className={`font-medium px-2 py-0.5 rounded-full text-xs ${statusBadge(selectedClaim.status)}`}>
                        {selectedClaim.status.replace('_', ' ')}
                      </span>
                    </div>
                    {selectedClaim.status === 'DRAFT' && (
                      <button onClick={submitClaim} disabled={submitting}
                        className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50">
                        Submit Claim
                      </button>
                    )}
                    {(selectedClaim.status === 'APPROVED' || selectedClaim.status === 'PARTIALLY_APPROVED') && (
                      <button onClick={() => setUpdateForm(p => ({ ...p, status: 'PAID' }))}
                        className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
                        Mark as Paid
                      </button>
                    )}
                    {selectedClaim.status === 'REJECTED' && (
                      <button onClick={() => setUpdateForm(p => ({ ...p, status: 'SUBMITTED' }))}
                        className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                        Resubmit Claim
                      </button>
                    )}
                  </div>
                </div>

                {/* Update Form */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Edit className="w-5 h-5 text-sky-500" /> Update Claim
                  </h3>
                  <form onSubmit={(e) => { e.preventDefault(); updateClaim(); }} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                        <select
                          value={updateForm.status}
                          onChange={(e) => setUpdateForm(p => ({ ...p, status: e.target.value as InsuranceClaimStatus | '' }))}
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
                        <input type="number" value={updateForm.approvedAmount}
                          onChange={(e) => setUpdateForm(p => ({ ...p, approvedAmount: e.target.value }))}
                          placeholder="Enter approved amount"
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-sky-400 focus:ring-sky-400 py-2 px-3 border"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Denial Reason</label>
                        <input type="text" value={updateForm.denialReason}
                          onChange={(e) => setUpdateForm(p => ({ ...p, denialReason: e.target.value }))}
                          placeholder="Enter denial reason (if applicable)"
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-sky-400 focus:ring-sky-400 py-2 px-3 border"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tracking Number</label>
                        <input type="text" value={updateForm.trackingNumber}
                          onChange={(e) => setUpdateForm(p => ({ ...p, trackingNumber: e.target.value }))}
                          placeholder="Enter tracking number"
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-sky-400 focus:ring-sky-400 py-2 px-3 border"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={submitting || !updateForm.status}
                      className="w-full bg-sky-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Updating...' : 'Update Claim'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default InsuranceClaims;