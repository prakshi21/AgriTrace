import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Package, Search, LogIn, ChevronRight, CheckCircle2, ShieldCheck, Leaf, Truck, Warehouse, XCircle, QrCode, User, Settings, Bell } from 'lucide-react';
import QRScanner from './QRScanner';

const API_URL = 'http://localhost:5000/api';

// --- COMPONENTS ---

const Navbar = ({ user, onLogout }) => (
  <nav className="bg-white/90 backdrop-blur-lg border-b border-earth-200/60 sticky top-0 z-50 shadow-sm">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between h-16">
        <a href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center shadow-md shadow-brand-600/20 group-hover:shadow-brand-600/40 transition-shadow duration-300">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <div className="leading-tight">
            <span className="font-serif text-xl text-bark-800 tracking-tight">AgriTrace</span>
            <span className="block text-[10px] font-semibold uppercase tracking-widest text-earth-400">Supply Tracker</span>
          </div>
        </a>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden sm:flex items-center gap-3 mr-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cream-50 border border-earth-200/60">
                  <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-brand-700" />
                  </div>
                  <div className="text-sm leading-tight">
                    <span className="font-semibold text-bark-800">{user.name}</span>
                    <span className="ml-2 px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 text-[10px] font-bold uppercase tracking-wider">
                      {user.role}
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={onLogout} className="btn-ghost text-sm">
                Logout
              </button>
            </>
          ) : (
            <a href="/login" className="btn-ghost text-sm font-semibold text-brand-600 hover:text-brand-700">
              Staff Login
            </a>
          )}
        </div>
      </div>
    </div>
  </nav>
);

// --- PAGES ---

const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      
      localStorage.setItem('token', data.token);
      onLogin(data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-gradient-to-br from-cream-100 via-cream-50 to-brand-50/30">
      <div className="glass-card w-full max-w-md p-8 animate-slide-up">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand-100 text-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md shadow-brand-200/40">
            <LogIn className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-serif text-bark-800">Sign in to AgriTrace</h2>
          <p className="text-earth-500 mt-2 text-sm">Manage your supply chain securely</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <div className="p-3 bg-red-50 text-red-700 rounded-xl text-sm border border-red-200/60">{error}</div>}
          <div>
            <label className="input-label">Email address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field" 
              placeholder="producer@test.com"
              required 
            />
          </div>
          <div>
            <label className="input-label">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field" 
              placeholder="••••••••"
              required 
            />
          </div>
          
          <button type="submit" className="btn-primary w-full">
            Sign In <ChevronRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

// --- Modals ---
const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-bark-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
    <div className="glass-card w-full max-w-md p-6 relative animate-slide-up" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-serif text-bark-800">{title}</h2>
        <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-earth-400 hover:text-bark-700 hover:bg-earth-100 transition-colors">
          <XCircle className="w-5 h-5" />
        </button>
      </div>
      {children}
    </div>
  </div>
);

const Dashboard = ({ user }) => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSendLabOpen, setIsSendLabOpen] = useState(false);
  const [isEvalOpen, setIsEvalOpen] = useState(false);
  const [isDispatchOpen, setIsDispatchOpen] = useState(false);
  const [isUpdateLocOpen, setIsUpdateLocOpen] = useState(false);
  const [isDropoffOpen, setIsDropoffOpen] = useState(false);
  const [activeBatch, setActiveBatch] = useState(null);

  // Forms state
  const [newBatch, setNewBatch] = useState({ batchID: '', cropDetails: '', quantity: '', dateOfProduction: '', dateOfExpiry: '' });
  const [evalData, setEvalData] = useState({ grade: 'A', status: 'Certified', file: null });
  const [targetId, setTargetId] = useState('');
  const [locationStr, setLocationStr] = useState('');
  const [dropdownUsers, setDropdownUsers] = useState([]);

  const fetchInventory = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/batches/inventory`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBatches(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadUsersForRole = async (role) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/batches/users/role/${role}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if(res.ok) {
        const users = await res.json();
        setDropdownUsers(users);
        if(users.length > 0) setTargetId(users[0].id);
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchInventory();
  }, [user]);

  // Actions
  const apiCall = async (endpoint, payload) => {
    if (isProcessing) return false;
    setIsProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/batches${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        fetchInventory();
        return true;
      } else {
        const data = await res.json();
        alert(data.error);
        return false;
      }
    } catch (err) {
      alert(err.message);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateBatch = async (e) => {
    e.preventDefault();
    const success = await apiCall('/create', { ...newBatch, quantity: parseFloat(newBatch.quantity) });
    if (success) {
      setIsCreateOpen(false);
      setNewBatch({ batchID: '', cropDetails: '', quantity: '', dateOfProduction: '', dateOfExpiry: '' });
    }
  };

  const handleEvaluate = async (e) => {
    e.preventDefault();
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('batchID', activeBatch);
      formData.append('qualityGrade', evalData.grade);
      formData.append('status', evalData.status);
      if (evalData.file) {
        formData.append('verificationPdf', evalData.file);
      }

      const res = await fetch(`${API_URL}/batches/evaluate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }, // Browser sets multipart/form-data boundary
        body: formData
      });
      if (res.ok) {
        setIsEvalOpen(false);
        fetchInventory();
      } else {
        alert('Failed to evaluate');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Status badge coloring
  const getStatusBadge = (status) => {
    switch(status) {
      case 'Created': return 'bg-earth-100 text-earth-600 border border-earth-200/60';
      case 'Sent to Lab': return 'bg-amber-50 text-amber-700 border border-amber-200/60';
      case 'Received by Lab': return 'bg-purple-50 text-purple-700 border border-purple-200/60';
      case 'Certified': return 'bg-brand-50 text-brand-700 border border-brand-200/60';
      case 'Rejected': return 'bg-red-50 text-red-700 border border-red-200/60';
      case 'In Transport': return 'bg-blue-50 text-blue-700 border border-blue-200/60';
      case 'Awaiting Warehouse Receipt': return 'bg-orange-50 text-orange-700 border border-orange-200/60';
      case 'With Warehouse': return 'bg-teal-50 text-teal-700 border border-teal-200/60';
      case 'Sold to Farmer': return 'bg-brand-100 text-brand-800 border border-brand-200/60';
      case 'Expired': return 'bg-red-50 text-red-800 border border-red-200/60';
      default: return 'bg-earth-100 text-earth-600 border border-earth-200/60';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full animate-fade-in">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-serif text-bark-800">{user.role} Dashboard</h1>
          <p className="text-earth-500 mt-1 text-sm">Manage Blockchain Supply Chain Batches</p>
        </div>
        {user.role === 'Producer' && (
          <button onClick={() => setIsCreateOpen(true)} className="btn-primary">
            <Package className="w-4 h-4" /> New Batch
          </button>
        )}
      </div>

      {/* Network Status */}
      <div className="card-warm inline-flex items-center gap-3 px-5 py-3 mb-6">
        <div className="flex items-center gap-2">
          <span className="input-label mb-0">Network Status</span>
          <Settings className="w-3.5 h-3.5 text-earth-400" />
        </div>
        <div className="flex items-center gap-2">
          <span className="status-indicator"></span>
          <span className="text-lg font-serif text-bark-800">Online</span>
        </div>
      </div>

      {/* Batch Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-earth-400">
            <div className="w-8 h-8 border-2 border-brand-300 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            Loading inventory...
          </div>
        ) : batches.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 text-earth-300 mx-auto mb-3" />
            <p className="text-earth-500 font-medium">No active batches found in your scope.</p>
            <p className="text-earth-400 text-sm mt-1">Create a new batch to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="table-header">
                  <th className="p-4">Batch ID</th>
                  <th className="p-4">Crop Details</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {batches.map((batch) => (
                  <tr key={batch.id} className="table-row">
                    <td className="p-4 font-semibold text-bark-800 font-mono text-sm">{batch.batch_id}</td>
                    <td className="p-4 text-bark-600">{batch.crop_details}</td>
                    <td className="p-4">
                      <span className={`badge ${getStatusBadge(batch.status)}`}>
                        {batch.status}
                      </span>
                    </td>
                    <td className="p-4 text-earth-500 text-sm">{batch.location || 'N/A'}</td>
                    <td className="p-4 flex gap-3 text-sm">
                      
                      {user.role === 'Producer' && batch.status === 'Created' && (
                        <button onClick={() => { setActiveBatch(batch.batch_id); loadUsersForRole('QualityLab'); setIsSendLabOpen(true); }} className="text-brand-600 font-semibold hover:text-brand-700 hover:underline transition-colors">Send to Lab</button>
                      )}

                      {user.role === 'QualityLab' && batch.status === 'Sent to Lab' && (
                        <button onClick={() => apiCall('/lab-receive', { batchID: batch.batch_id })} className="text-purple-600 font-semibold hover:text-purple-700 hover:underline transition-colors">Confirm Receipt</button>
                      )}
                      {user.role === 'QualityLab' && batch.status === 'Received by Lab' && (
                        <button onClick={() => { setActiveBatch(batch.batch_id); setIsEvalOpen(true); }} className="text-brand-600 font-semibold hover:text-brand-700 hover:underline transition-colors">Evaluate Batch</button>
                      )}
                      {user.role === 'QualityLab' && batch.status === 'Certified' && (
                        <button onClick={() => { setActiveBatch(batch.batch_id); loadUsersForRole('Transporter'); setIsDispatchOpen(true); }} className="text-blue-600 font-semibold hover:text-blue-700 hover:underline transition-colors">Dispatch</button>
                      )}

                      {user.role === 'Transporter' && batch.status === 'In Transport' && (
                        <>
                          <button onClick={() => { setActiveBatch(batch.batch_id); setLocationStr(batch.location); setIsUpdateLocOpen(true); }} className="text-orange-600 font-semibold hover:text-orange-700 hover:underline transition-colors">Update Loc</button>
                          <button onClick={() => { setActiveBatch(batch.batch_id); loadUsersForRole('WarehouseManager'); setIsDropoffOpen(true); }} className="text-teal-600 font-semibold hover:text-teal-700 hover:underline transition-colors">Dropoff</button>
                        </>
                      )}

                      {user.role === 'WarehouseManager' && batch.status === 'Awaiting Warehouse Receipt' && (
                        <button onClick={() => apiCall('/warehouse-receive', { batchID: batch.batch_id })} className="text-brand-600 font-semibold hover:text-brand-700 hover:underline transition-colors">Confirm Delivery</button>
                      )}

                      {user.role === 'WarehouseManager' && batch.status === 'With Warehouse' && (
                        <>
                          <button onClick={() => apiCall('/warehouse-action', { batchID: batch.batch_id, action: 'Sold' })} className="text-brand-600 font-semibold hover:text-brand-700 hover:underline transition-colors">Mark Sold</button>
                          <button onClick={() => apiCall('/warehouse-action', { batchID: batch.batch_id, action: 'Expired' })} className="text-red-600 font-semibold hover:text-red-700 hover:underline transition-colors">Mark Expired</button>
                        </>
                      )}

                      {user.role === 'Admin' && (
                        <a href={`/`} className="text-earth-500 hover:text-bark-800 underline transition-colors">Trace Lineage</a>
                      )}

                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- Modals Render --- */}
      {isCreateOpen && (
        <Modal title="Create New Batch" onClose={() => setIsCreateOpen(false)}>
          {!newBatch.batchID ? (
            <div className="space-y-4">
              <p className="text-sm text-earth-500 mb-2">Scan a pre-printed QR code to begin.</p>
              <QRScanner onScanSuccess={(id) => setNewBatch({...newBatch, batchID: id})} />
              <div className="flex justify-end mt-4">
                <button type="button" onClick={() => setIsCreateOpen(false)} className="btn-secondary">Cancel</button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleCreateBatch} className="space-y-4">
              <div className="p-3 bg-brand-50 rounded-xl text-sm text-brand-700 font-mono text-center font-bold border border-brand-200/40">
                Batch ID: {newBatch.batchID}
              </div>
              <div><label className="input-label">Crop Details</label><input required type="text" className="input-field" value={newBatch.cropDetails} onChange={e => setNewBatch({...newBatch, cropDetails: e.target.value})} placeholder="Premium Wheat" /></div>
              <div className="flex gap-4">
                <div className="flex-1"><label className="input-label">Quantity (kg)</label><input required type="number" min="1" className="input-field" value={newBatch.quantity} onChange={e => setNewBatch({...newBatch, quantity: e.target.value})} /></div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1"><label className="input-label">Prod. Date</label><input required type="date" className="input-field" value={newBatch.dateOfProduction} onChange={e => setNewBatch({...newBatch, dateOfProduction: e.target.value})} /></div>
                <div className="flex-1"><label className="input-label">Expiry Date</label><input required type="date" className="input-field" value={newBatch.dateOfExpiry} onChange={e => setNewBatch({...newBatch, dateOfExpiry: e.target.value})} /></div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => { setIsCreateOpen(false); setNewBatch({ batchID: '', cropDetails: '', quantity: '', dateOfProduction: '', dateOfExpiry: '' }); }} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Create</button>
              </div>
            </form>
          )}
        </Modal>
      )}

      {isSendLabOpen && (
        <Modal title="Send Batch to Lab" onClose={() => setIsSendLabOpen(false)}>
          <form onSubmit={(e) => { e.preventDefault(); apiCall('/send-to-lab', { batchID: activeBatch, labId: targetId }).then(() => setIsSendLabOpen(false)); }} className="space-y-4">
            <p className="text-sm text-earth-500 mb-2">Select a Quality Lab to route this batch to for certification.</p>
            <select className="input-field" value={targetId} onChange={e => setTargetId(e.target.value)}>
              {dropdownUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
            <div className="flex justify-end gap-2 mt-6">
              <button type="button" onClick={() => setIsSendLabOpen(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">Send</button>
            </div>
          </form>
        </Modal>
      )}

      {isEvalOpen && (
        <Modal title="Evaluate Quality" onClose={() => setIsEvalOpen(false)}>
          <form onSubmit={handleEvaluate} className="space-y-4">
            <div>
              <label className="input-label">Outcome</label>
              <select className="input-field" value={evalData.status} onChange={e => setEvalData({...evalData, status: e.target.value})}>
                <option value="Certified">Certify (Pass)</option>
                <option value="Rejected">Reject (Fail)</option>
              </select>
            </div>
            <div>
              <label className="input-label">Quality Grade</label>
              <select className="input-field" value={evalData.grade} onChange={e => setEvalData({...evalData, grade: e.target.value})}>
                <option value="A">Grade A (Premium)</option>
                <option value="B">Grade B (Standard)</option>
                <option value="C">Grade C (Sub-standard)</option>
                <option value="F">Grade F (Fail)</option>
              </select>
            </div>
            <div>
              <label className="input-label">Verification Report (PDF)</label>
              <input type="file" accept="application/pdf" required className="w-full text-sm text-earth-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 file:transition-colors" onChange={e => setEvalData({...evalData, file: e.target.files[0]})} />
              <p className="text-xs text-earth-400 mt-1">Hash will be automatically generated and stored on-chain.</p>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button type="button" onClick={() => setIsEvalOpen(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary !bg-purple-600 hover:!bg-purple-700">Submit Report</button>
            </div>
          </form>
        </Modal>
      )}

      {isDispatchOpen && (
        <Modal title="Dispatch to Transport" onClose={() => setIsDispatchOpen(false)}>
          <form onSubmit={(e) => { e.preventDefault(); apiCall('/dispatch', { batchID: activeBatch, transporterId: targetId }).then(() => setIsDispatchOpen(false)); }} className="space-y-4">
            <select className="input-field" value={targetId} onChange={e => setTargetId(e.target.value)}>
              {dropdownUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
            <div className="flex justify-end gap-2 mt-6">
              <button type="button" onClick={() => setIsDispatchOpen(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">Dispatch</button>
            </div>
          </form>
        </Modal>
      )}

      {isUpdateLocOpen && (
        <Modal title="Update GPS Location" onClose={() => setIsUpdateLocOpen(false)}>
          <form onSubmit={(e) => { e.preventDefault(); apiCall('/update-location', { batchID: activeBatch, location: locationStr }).then(() => setIsUpdateLocOpen(false)); }} className="space-y-4">
            <input required type="text" className="input-field" value={locationStr} onChange={e => setLocationStr(e.target.value)} placeholder="e.g. Checkpoint Alpha, Highway 9" />
            <div className="flex justify-end gap-2 mt-6">
              <button type="button" onClick={() => setIsUpdateLocOpen(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary !bg-orange-600 hover:!bg-orange-700">Update</button>
            </div>
          </form>
        </Modal>
      )}

      {isDropoffOpen && (
        <Modal title="Dropoff at Warehouse" onClose={() => setIsDropoffOpen(false)}>
          <form onSubmit={(e) => { e.preventDefault(); apiCall('/dropoff', { batchID: activeBatch, warehouseId: targetId }).then(() => setIsDropoffOpen(false)); }} className="space-y-4">
            <p className="text-sm text-earth-500 mb-2">Select the Warehouse Facility you are delivering this batch to.</p>
            <select className="input-field" value={targetId} onChange={e => setTargetId(e.target.value)}>
              {dropdownUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
            <div className="flex justify-end gap-2 mt-6">
              <button type="button" onClick={() => setIsDropoffOpen(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">Dropoff</button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};

const VerificationPage = () => {
  const [searchParams] = useSearchParams();
  const [batchId, setBatchId] = useState('');
  const [verified, setVerified] = useState(false);
  const [batchData, setBatchData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showScanner, setShowScanner] = useState(false);

  const verifyBatch = async (id) => {
    if(!id) return;
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch(`${API_URL}/batches/${id}/history`);
      if (!res.ok) throw new Error('Batch not found');
      const data = await res.json();
      if (!data.currentDetails) throw new Error('Batch data is empty');
      setBatchData(data);
      setVerified(true);
      setShowScanner(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const urlBatch = searchParams.get('batch');
    if (urlBatch) {
      setBatchId(urlBatch);
      verifyBatch(urlBatch);
    }
  }, [searchParams]);

  const handleVerify = async (e) => {
    e.preventDefault();
    verifyBatch(batchId);
  };

  const db = batchData?.currentDetails || {};

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4 bg-gradient-to-br from-bark-700 via-bark-800 to-brand-900 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-bark-600/20 rounded-full blur-3xl"></div>
      
      <div className="glass-card w-full max-w-lg p-8 relative z-10 text-center animate-slide-up !bg-white/95">
        <div className="w-14 h-14 bg-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Search className="w-7 h-7 text-brand-600" />
        </div>
        <h2 className="text-3xl font-serif text-bark-800 mb-2">Batch Verification</h2>
        <p className="text-earth-500 mb-8 text-sm">Enter the Batch ID to trace its entire lifecycle.</p>
        
        {!verified ? (
          showScanner ? (
            <div className="space-y-4">
              <p className="text-sm text-earth-500 mb-2">Point your camera at the Seed Bag QR code</p>
              <QRScanner onScanSuccess={(id) => { setBatchId(id); verifyBatch(id); }} onScanFailure={() => {}} />
              <button onClick={() => setShowScanner(false)} className="mt-2 btn-secondary w-full">Cancel Scanning</button>
            </div>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
              {error && <div className="text-red-600 text-sm font-medium p-3 bg-red-50 rounded-xl border border-red-200/60">{error}</div>}
              <div className="relative">
                <input type="text" value={batchId} onChange={(e) => setBatchId(e.target.value)} placeholder="e.g. BATCH-001" className="input-field pl-12 text-lg font-medium" required />
                <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-earth-400" />
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={loading} className="btn-primary flex-1 py-4 text-lg">
                  {loading ? 'Searching...' : 'Trace Origin'}
                </button>
                <button type="button" onClick={() => setShowScanner(true)} className="btn-secondary py-4 px-6 flex items-center justify-center gap-2">
                  <QrCode className="w-6 h-6" /> Scan QR
                </button>
              </div>
            </form>
          )
        ) : (
          <div className="text-left animate-slide-up">
            <div className="flex items-center gap-3 mb-6 border-b border-earth-200 pb-4">
              {db.status === 'Certified' || db.status === 'Sold to Farmer' || db.status === 'With Warehouse' ? (
                <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-brand-600" />
                </div>
              ) : db.status === 'Rejected' || db.status === 'Expired' ? (
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-500" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Package className="w-6 h-6 text-blue-500" />
                </div>
              )}
              <div>
                <h3 className="text-xl font-serif text-bark-800">Status: {db.status}</h3>
                <p className="text-sm text-earth-500">Current Location: {db.location}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-cream-50 p-3 rounded-xl border border-earth-200/60">
                <p className="text-xs text-earth-500 font-semibold uppercase tracking-wider">Type</p>
                <p className="font-semibold text-bark-800">{db.crop_details}</p>
              </div>
              <div className="bg-cream-50 p-3 rounded-xl border border-earth-200/60">
                <p className="text-xs text-earth-500 font-semibold uppercase tracking-wider">Quantity</p>
                <p className="font-semibold text-bark-800">{db.quantity} kg</p>
              </div>
              <div className="bg-cream-50 p-3 rounded-xl border border-earth-200/60">
                <p className="text-xs text-earth-500 font-semibold uppercase tracking-wider">Produced On</p>
                <p className="font-semibold text-bark-800">{db.date_of_production ? new Date(db.date_of_production).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div className="bg-cream-50 p-3 rounded-xl border border-earth-200/60">
                <p className="text-xs text-earth-500 font-semibold uppercase tracking-wider">Expires On</p>
                <p className="font-semibold text-bark-800">{db.date_of_expiry ? new Date(db.date_of_expiry).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div className="bg-cream-50 p-3 rounded-xl border border-earth-200/60">
                <p className="text-xs text-earth-500 font-semibold uppercase tracking-wider">Delivery Date</p>
                <p className="font-semibold text-bark-800">{db.date_of_delivery ? new Date(db.date_of_delivery).toLocaleDateString() : 'Not Delivered'}</p>
              </div>
              <div className="bg-cream-50 p-3 rounded-xl border border-earth-200/60">
                <p className="text-xs text-earth-500 font-semibold uppercase tracking-wider">Quality Grade</p>
                <p className="font-semibold text-brand-600">{db.quality_grade || 'Pending'}</p>
              </div>
            </div>

            <div className="bg-cream-50 p-3 rounded-xl border border-earth-200/60 mb-6">
              <p className="text-xs text-earth-500 font-semibold uppercase tracking-wider mb-1 flex items-center gap-1"><ShieldCheck className="w-3 h-3"/> PDF Hash (Blockchain)</p>
              <p className="font-mono text-xs text-bark-700 break-all">{db.pdf_hash || 'N/A'}</p>
            </div>
            
            <button onClick={() => { setVerified(false); setBatchId(''); }} className="mt-2 btn-secondary w-full">
              Trace Another Batch
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) localStorage.removeItem('token'); 
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Navbar user={user} onLogout={handleLogout} />
        <main className="flex-grow flex flex-col">
          <Routes>
            <Route path="/" element={<VerificationPage />} />
            <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage onLogin={setUser} />} />
            <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
