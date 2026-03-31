import { useState, useEffect } from 'react';
import { Shield, CheckCircle, XCircle, Clock, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { InsuranceService } from '../../services/insurance.service';

interface PendingPolicy {
  id: string;
  provider: string;
  planName?: string;
  policyNumber: string;
  coveragePercentage: number;
  groupNumber?: string;
  status: string;
  createdAt: string;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    patientNumber: string;
    phone: string;
    dateOfBirth: string;
  };
}

const InsuranceVerification = () => {
  const [policies, setPolicies] = useState<PendingPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ pending: 0, active: 0, rejected: 0, expired: 0, total: 0 });
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const [approveForm, setApproveForm] = useState({
    annualLimit: '',
    coveragePercentage: '80',
    validUntil: '',
    verificationNote: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [pending, statsData] = await Promise.all([
        InsuranceService.getPendingVerifications(),
        InsuranceService.getVerificationStats()
      ]);
      setPolicies(pending);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load verification data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    try {
      await InsuranceService.approveInsurance(id, {
        annualLimit: approveForm.annualLimit ? parseFloat(approveForm.annualLimit) : undefined,
        coveragePercentage: parseFloat(approveForm.coveragePercentage),
        validUntil: approveForm.validUntil || undefined,
        verificationNote: approveForm.verificationNote || 'Approved'
      });
      toast.success('Insurance approved');
      setExpandedId(null);
      setApproveForm({ annualLimit: '', coveragePercentage: '80', validUntil: '', verificationNote: '' });
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to approve');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setProcessingId(id);
    try {
      await InsuranceService.rejectInsurance(id, 'Verification failed');
      toast.success('Insurance rejected');
      setExpandedId(null);
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Shield className="w-8 h-8 text-purple-500" /> Insurance Verification
        </h1>
        <button onClick={loadData} className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="text-gray-500 text-sm">Pending Review</div>
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="text-gray-500 text-sm">Active</div>
          <div className="text-2xl font-bold text-green-600">{stats.active}</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="text-gray-500 text-sm">Rejected</div>
          <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="text-gray-500 text-sm">Total Policies</div>
          <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
        </div>
      </div>

      {/* Pending List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-500" /> Pending Verification ({policies.length})
          </h2>
        </div>

        {policies.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <CheckCircle className="w-12 h-12 mx-auto text-green-400 mb-2" />
            No pending insurance verifications
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {policies.map((policy) => (
              <div key={policy.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">
                      {policy.patient.firstName[0]}{policy.patient.lastName[0]}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{policy.patient.firstName} {policy.patient.lastName}</div>
                      <div className="text-sm text-gray-500">{policy.patient.patientNumber} • {policy.provider}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">Coverage: {policy.coveragePercentage}%</span>
                    <button
                      onClick={() => setExpandedId(expandedId === policy.id ? null : policy.id)}
                      className="text-sky-600 hover:text-sky-700"
                    >
                      {expandedId === policy.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {expandedId === policy.id && (
                  <div className="mt-4 ml-14 p-4 bg-gray-50 rounded-lg space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><span className="text-gray-500">Policy #:</span> <span className="font-medium">{policy.policyNumber}</span></div>
                      <div><span className="text-gray-500">Provider:</span> <span className="font-medium">{policy.provider}</span></div>
                      <div><span className="text-gray-500">Plan:</span> <span className="font-medium">{policy.planName || 'Standard'}</span></div>
                      {policy.groupNumber && <div><span className="text-gray-500">Group #:</span> <span className="font-medium">{policy.groupNumber}</span></div>}
                      <div><span className="text-gray-500">Phone:</span> <span className="font-medium">{policy.patient.phone}</span></div>
                      <div><span className="text-gray-500">Submitted:</span> <span className="font-medium">{new Date(policy.createdAt).toLocaleDateString()}</span></div>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <h4 className="font-medium text-gray-900 mb-3">Verification Decision</h4>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="text-xs text-gray-500 font-bold uppercase">Coverage %</label>
                          <input type="number" min="0" max="100" className="w-full p-2 border rounded text-sm" value={approveForm.coveragePercentage} onChange={e => setApproveForm({...approveForm, coveragePercentage: e.target.value})} />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 font-bold uppercase">Annual Limit (₦)</label>
                          <input type="number" className="w-full p-2 border rounded text-sm" placeholder="Optional" value={approveForm.annualLimit} onChange={e => setApproveForm({...approveForm, annualLimit: e.target.value})} />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 font-bold uppercase">Valid Until</label>
                          <input type="date" className="w-full p-2 border rounded text-sm" value={approveForm.validUntil} onChange={e => setApproveForm({...approveForm, validUntil: e.target.value})} />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 font-bold uppercase">Note</label>
                          <input type="text" className="w-full p-2 border rounded text-sm" placeholder="Optional note" value={approveForm.verificationNote} onChange={e => setApproveForm({...approveForm, verificationNote: e.target.value})} />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(policy.id)}
                          disabled={processingId === policy.id}
                          className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 text-sm font-medium"
                        >
                          <CheckCircle className="w-4 h-4" /> Approve
                        </button>
                        <button
                          onClick={() => handleReject(policy.id)}
                          disabled={processingId === policy.id}
                          className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 text-sm font-medium"
                        >
                          <XCircle className="w-4 h-4" /> Reject
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InsuranceVerification;
