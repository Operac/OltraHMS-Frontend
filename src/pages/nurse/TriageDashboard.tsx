import { useState, useEffect } from 'react';
import { 
  Users, Stethoscope, Activity, Calendar, AlertCircle, CheckCircle, 
  Search, UserPlus, Phone, Clock, RefreshCw, DollarSign, 
  ChevronDown, ChevronUp, Trash2, Edit, Plus, Menu
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../constants/roles';
import axios from 'axios';
import toast from 'react-hot-toast';

const TriageDashboard = () => {
  const { user } = useAuth();
  const [pendingPatients, setPendingPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [triageForm, setTriageForm] = useState({
    chiefComplaint: '',
    triageLevel: '' as TriageLevel | '',
    // Vitals
    bpSystolic: '',
    bpDiastolic: '',
    heartRate: '',
    respiratoryRate: '',
    temperature: '',
    oxygenSaturation: '',
    painScore: '',
    weight: '',
    height: ''
  });
  const [mewsScore, setMewsScore] = useState<number | null>(null);
  const [mewsDetails, setMewsDetails] = useState<string[]>([]);
  const [suggestedLevel, setSuggestedLevel] = useState<TriageLevel | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredPatients, setFilteredPatients] = useState<any[]>([]);

  // Triage levels from enum
  const triageLevels = [
    { value: 'RESUSCITATION', label: 'Resuscitation (1)', color: 'red' },
    { value: 'EMERGENT', label: 'Emergent (2)', color: 'orange' },
    { value: 'URGENT', label: 'Urgent (3)', color: 'yellow' },
    { value: 'LESS_URGENT', label: 'Less Urgent (4)', color: 'blue' },
    { value: 'NON_URGENT', label: 'Non-Urgent (5)', color: 'green' }
  ];

  // Fetch pending triage patients
  const fetchPendingPatients = async () => {
    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const response = await axios.get(`${API_URL}/triage/pending`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setPendingPatients(response.data);
      setFilteredPatients(response.data);
    } catch (error) {
      console.error('Error fetching pending triage:', error);
      toast.error('Failed to fetch pending triage patients');
    } finally {
      setLoading(false);
    }
  };

  // Calculate MEWS score
  const calculateMEWS = () => {
    const vitals: any = {};
    if (triageForm.bpSystolic) vitals.bpSystolic = parseInt(triageForm.bpSystolic);
    if (triageForm.bpDiastolic) vitals.bpDiastolic = parseInt(triageForm.bpDiastolic);
    if (triageForm.heartRate) vitals.heartRate = parseInt(triageForm.heartRate);
    if (triageForm.respiratoryRate) vitals.respiratoryRate = parseInt(triageForm.respiratoryRate);
    if (triageForm.temperature) vitals.temperature = parseFloat(triageForm.temperature);
    if (triageForm.oxygenSaturation) vitals.oxygenSaturation = parseInt(triageForm.oxygenSaturation);

    // Simple MEWS calculation (simplified version)
    let score = 0;
    const details: string[] = [];

    // Heart Rate
    if (vitals.heartRate != null) {
      const hr = vitals.heartRate;
      if (hr <= 40) { score += 2; details.push('Bradycardia (HR ≤40)'); }
      else if (hr <= 50) { score += 1; details.push('Low HR (41-50)'); }
      else if (hr >= 130) { score += 2; details.push('Tachycardia (HR ≥130)'); }
      else if (hr >= 110) { score += 1; details.push('Elevated HR (110-129)'); }
    }

    // Temperature
    if (vitals.temperature != null) {
      const temp = vitals.temperature;
      if (temp <= 35) { score += 2; details.push('Hypothermia (≤35°C)'); }
      else if (temp >= 39) { score += 2; details.push('High fever (≥39°C)'); }
      else if (temp >= 38.5) { score += 1; details.push('Fever (38.5-38.9°C)'); }
    }

    // Respiratory Rate
    if (vitals.respiratoryRate != null) {
      const rr = vitals.respiratoryRate;
      if (rr <= 8) { score += 2; details.push('Bradypnea (RR ≤8)'); }
      else if (rr >= 30) { score += 2; details.push('Tachypnea (RR ≥30)'); }
      else if (rr >= 25) { score += 1; details.push('Elevated RR (25-29)'); }
    }

    // Blood Pressure (Systolic)
    if (vitals.bpSystolic != null) {
      const sbp = vitals.bpSystolic;
      if (sbp <= 70) { score += 3; details.push('Severe hypotension (SBP ≤70)'); }
      else if (sbp <= 80) { score += 2; details.push('Hypotension (SBP 71-80)'); }
      else if (sbp <= 100) { score += 1; details.push('Low BP (SBP 81-100)'); }
      else if (sbp >= 200) { score += 2; details.push('Severe hypertension (SBP ≥200)'); }
    }

    // SpO2
    if (vitals.oxygenSaturation != null) {
      const spo2 = vitals.oxygenSaturation;
      if (spo2 <= 91) { score += 2; details.push('Low SpO2 (≤91%)'); }
      else if (spo2 <= 93) { score += 1; details.push('Borderline SpO2 (92-93%)'); }
    }

    setMewsScore(score);
    setMewsDetails(details);
    setSuggestedLevel(mewsToTriageLevel(score));
  };

  // Map MEWS score to suggested triage level
  const mewsToTriageLevel = (mews: number): TriageLevel => {
    if (mews >= 7) return 'RESUSCITATION';
    if (mews >= 5) return 'EMERGENT';
    if (mews >= 3) return 'URGENT';
    if (mews >= 1) return 'LESS_URGENT';
    return 'NON_URGENT';
  };

  // Submit triage assessment
  const submitTriage = async () => {
    if (!selectedPatient) return;
    if (!triageForm.chiefComplaint.trim()) {
      toast.error('Chief complaint is required');
      return;
    }
    if (!triageForm.triageLevel) {
      toast.error('Please select a triage level');
      return;
    }

    setSubmitting(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const vitalSignsData = {
        bpSystolic: triageForm.bpSystolic ? parseInt(triageForm.bpSystolic) : null,
        bpDiastolic: triageForm.bpDiastolic ? parseInt(triageForm.bpDiastolic) : null,
        heartRate: triageForm.heartRate ? parseInt(triageForm.heartRate) : null,
        respiratoryRate: triageForm.respiratoryRate ? parseInt(triageForm.respiratoryRate) : null,
        temperature: triageForm.temperature ? parseFloat(triageForm.temperature) : null,
        oxygenSaturation: triageForm.oxygenSaturation ? parseInt(triageForm.oxygenSaturation) : null,
        painScore: triageForm.painScore ? parseInt(triageForm.painScore) : null,
        weight: triageForm.weight ? parseFloat(triageForm.weight) : null,
        height: triageForm.height ? parseFloat(triageForm.height) : null
      };

      const response = await axios.post(`${API_URL}/triage`, {
        patientId: selectedPatient.patient.id,
        chiefComplaint: triageForm.chiefComplaint,
        triageLevel: triageForm.triageLevel,
        vitalSigns: vitalSignsData
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      toast.success('Triage assessment submitted successfully');
      setSelectedPatient(null);
      setTriageForm({
        chiefComplaint: '',
        triageLevel: '',
        bpSystolic: '',
        bpDiastolic: '',
        heartRate: '',
        respiratoryRate: '',
        temperature: '',
        oxygenSaturation: '',
        painScore: '',
        weight: '',
        height: ''
      });
      setMewsScore(null);
      setMewsDetails([]);
      setSuggestedLevel(null);
      await fetchPendingPatients();
    } catch (error: any) {
      console.error('Error submitting triage:', error);
      toast.error(error.response?.data?.message || 'Failed to submit triage assessment');
    } finally {
      setSubmitting(false);
    }
  };

  // Search patients
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredPatients(pendingPatients);
    } else {
      setFilteredPatients(
        pendingPatients.filter(patient => 
          patient.patient.firstName.toLowerCase().includes(query) ||
          patient.patient.lastName.toLowerCase().includes(query) ||
          patient.patient.patientNumber.toLowerCase().includes(query)
        )
      );
    }
  };

  // Select patient for triage
  const handleSelectPatient = (patient: any) => {
    setSelectedPatient(patient);
    // Reset form when selecting new patient
    setTriageForm({
      chiefComplaint: '',
      triageLevel: '',
      bpSystolic: '',
      bpDiastolic: '',
      heartRate: '',
      respiratoryRate: '',
      temperature: '',
      oxygenSaturation: '',
      painScore: '',
      weight: '',
      height: ''
    });
    setMewsScore(null);
    setMewsDetails([]);
    setSuggestedLevel(null);
  };

  // Clear selection
  const handleClearSelection = () => {
    setSelectedPatient(null);
    setTriageForm({
      chiefComplaint: '',
      triageLevel: '',
      bpSystolic: '',
      bpDiastolic: '',
      heartRate: '',
      respiratoryRate: '',
      temperature: '',
      oxygenSaturation: '',
      painScore: '',
      weight: '',
      height: ''
    });
    setMewsScore(null);
    setMewsDetails([]);
    setSuggestedLevel(null);
  };

  useEffect(() => {
    fetchPendingPatients();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() !== '') {
      handleSearch({ target: { value: searchQuery } } as React.ChangeEvent<HTMLInputElement>);
    } else {
      setFilteredPatients(pendingPatients);
    }
  }, [searchQuery]);

  if (loading && pendingPatients.length === 0) {
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
            <Stethoscope className="mr-2 h-5 w-5" /> Triage Assessment
          </h1>
          <p className="text-gray-500">Assess patients waiting for triage</p>
        </div>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Search patients..."
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
        {/* Pending Patients Column */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-sky-50 px-6 py-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-sky-500" /> Pending Triage ({filteredPatients.length})
              </h2>
            </div>
            <div className="p-4 space-y-3">
              {filteredPatients.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-500">No patients waiting for triage</p>
                  <p className="text-sm text-gray-400">
                    Patients will appear here after they check in but before triage is completed
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredPatients.map((patient: any) => (
                    <div
                      key={patient.appointmentId}
                      className={`bg-gray-50 p-3 rounded-lg border-l-4 ${
                        selectedPatient?.appointmentId === patient.appointmentId 
                          ? 'border-sky-500 bg-sky-50' 
                          : 'border-gray-200'
                      } cursor-pointer hover:bg-gray-50 transition`}
                      onClick={() => handleSelectPatient(patient)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-gray-900">
                            {patient.patient.firstName} {patient.patient.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            #{patient.patient.patientNumber} • 
                            {new Date(patient.patient.dateOfBirth).toLocaleDateString()} • 
                            {patient.patient.gender === 'MALE' ? 'Male' : 'Female'}
                          </div>
                          {patient.reason && (
                            <div className="text-xs text-gray-400 mt-1">
                              Reason: {patient.reason}
                            </div>
                          )}
                        </div>
                        <div className="text-right text-xs flex items-center gap-2">
                          <div className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            patient.queuePosition === 1 
                              ? 'bg-red-100 text-red-800' 
                              : patient.queuePosition <= 3
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                          }`}>
                            #{patient.queuePosition}
                          </div>
                          {!patient.hasVitals && (
                            <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-yellow-100 text-yellow-800">
                              No Vitals
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Triage Assessment Column */}
        <div className="lg:col-span-2">
          {!selectedPatient ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-8 text-center">
                <Users className="w-16 h-16 mx-auto mb-4 text-sky-400" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Select a Patient</h2>
                <p className="text-gray-500">
                  Select a patient from the list to begin triage assessment
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-sky-500" />
                    <span className="font-medium text-gray-900">
                      Assessing: {selectedPatient.patient.firstName} {selectedPatient.patient.lastName}
                    </span>
                  </div>
                  <button
                    onClick={handleClearSelection}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <Edit className="w-4 h-4" /> Change Patient
                  </button>
                </div>
                <div className="px-6 py-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Chief Complaint *</label>
                      <textarea
                        value={triageForm.chiefComplaint}
                        onChange={(e) => 
                          setTriageForm(prev => ({...prev, chiefComplaint: e.target.value}))
                        }
                        placeholder="Describe the patient's main symptoms or reason for visit..."
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-sky-400 focus:ring-sky-400 py-2 px-3 border min-h-[80px]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Triage Level *</label>
                      <select
                        value={triageForm.triageLevel}
                        onChange={(e) => 
                          setTriageForm(prev => ({...prev, triageLevel: e.target.value as TriageLevel}))
                        }
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-sky-400 focus:ring-sky-400 py-2 px-3 border"
                        required
                      >
                        <option value="">Select triage level</option>
                        {triageLevels.map(level => (
                          <option 
                            key={level.value} 
                            value={level.value}
                            className={`text-${level.color}-600`}
                          >
                            {level.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-sky-500" /> Vital Signs
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">BP (mmHg)</label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            placeholder="Systolic"
                            value={triageForm.bpSystolic}
                            onChange={(e) => 
                              setTriageForm(prev => ({...prev, bpSystolic: e.target.value}))
                            }
                            className="w-1/2 rounded-md border-gray-300 shadow-sm focus:border-sky-400 focus:ring-sky-400 py-2 px-3 border"
                          />
                          <input
                            type="number"
                            placeholder="Diastolic"
                            value={triageForm.bpDiastolic}
                            onChange={(e) => 
                              setTriageForm(prev => ({...prev, bpDiastolic: e.target.value}))
                            }
                            className="w-1/2 rounded-md border-gray-300 shadow-sm focus:border-sky-400 focus:ring-sky-400 py-2 px-3 border"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Heart Rate (bpm)</label>
                        <input
                          type="number"
                          placeholder="e.g., 72"
                          value={triageForm.heartRate}
                          onChange={(e) => 
                            setTriageForm(prev => ({...prev, heartRate: e.target.value}))
                          }
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-sky-400 focus:ring-sky-400 py-2 px-3 border"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Respiratory Rate (/min)</label>
                        <input
                          type="number"
                          placeholder="e.g., 16"
                          value={triageForm.respiratoryRate}
                          onChange={(e) => 
                            setTriageForm(prev => ({...prev, respiratoryRate: e.target.value}))
                          }
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-sky-400 focus:ring-sky-400 py-2 px-3 border"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Temperature (°C)</label>
                        <input
                          type="number"
                          placeholder="e.g., 37.0"
                          step="0.1"
                          value={triageForm.temperature}
                          onChange={(e) => 
                            setTriageForm(prev => ({...prev, temperature: e.target.value}))
                          }
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-sky-400 focus:ring-sky-400 py-2 px-3 border"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">SpO2 (%)</label>
                        <input
                          type="number"
                          placeholder="e.g., 98"
                          value={triageForm.oxygenSaturation}
                          onChange={(e) => 
                            setTriageForm(prev => ({...prev, oxygenSaturation: e.target.value}))
                          }
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-sky-400 focus:ring-sky-400 py-2 px-3 border"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pain Scale (0-10)</label>
                        <input
                          type="number"
                          placeholder="e.g., 3"
                          min="0"
                          max="10"
                          value={triageForm.painScore}
                          onChange={(e) => 
                            setTriageForm(prev => ({...prev, painScore: e.target.value}))
                          }
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-sky-400 focus:ring-sky-400 py-2 px-3 border"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                        <input
                          type="number"
                          placeholder="e.g., 70.5"
                          step="0.1"
                          value={triageForm.weight}
                          onChange={(e) => 
                            setTriageForm(prev => ({...prev, weight: e.target.value}))
                          }
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-sky-400 focus:ring-sky-400 py-2 px-3 border"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
                        <input
                          type="number"
                          placeholder="e.g., 175"
                          value={triageForm.height}
                          onChange={(e) => 
                            setTriageForm(prev => ({...prev, height: e.target.value}))
                          }
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-sky-400 focus:ring-sky-400 py-2 px-3 border"
                        />
                      </div>
                    </div>
                  </div>

                  {!suggestedLevel ? null : (
                    <div className="border-t border-gray-200 pt-4">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-purple-500" /> AI-Assisted Triage Suggestion
                      </h3>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-purple-100 text-purple-600`}>
                            {suggestedLevel === 'RESUSCITATION' ? 1
                              : suggestedLevel === 'EMERGENT' ? 2
                              : suggestedLevel === 'URGENT' ? 3
                              : suggestedLevel === 'LESS_URGENT' ? 4 : 5}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              Suggested Level: 
                              <span className={`text-${suggestedLevel === 'RESUSCITATION' ? 'red' 
                                : suggestedLevel === 'EMERGENT' ? 'orange' 
                                : suggestedLevel === 'URGENT' ? 'yellow' 
                                : suggestedLevel === 'LESS_URGENT' ? 'blue' : 'green'}-600 font-bold`}>
                                {suggestedLevels.find(l => l.value === suggestedLevel)?.label}
                              </span>
                            </p>
                            <p className="text-sm text-gray-500">
                              Based on MEWS score of {mewsScore}/6
                            </p>
                          </div>
                        </div>
                        {mewsDetails.length > 0 && (
                          <div className="text-sm text-gray-600 mt-2">
                            <strong>Contributing Factors:</strong>
                            <ul className="mt-1 list-disc list-inside space-y-1">
                              {mewsDetails.map((detail, index) => (
                                <li key={index}>{detail}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          <em>Note: This is a computer-generated suggestion. Clinical judgment should always take precedence.</em>
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="mt-6">
                    <button
                      onClick={submitTriage}
                      disabled={submitting || !triageForm.chiefComplaint.trim() || !triageForm.triageLevel}
                      className={`w-full bg-sky-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {submitting ? 'Submitting...' : 'Submit Triage Assessment'}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TriageDashboard;