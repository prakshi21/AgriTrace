import React, { useState, useEffect } from 'react';
import { Package, Settings, XCircle, Activity, Box, MapPin, Search } from 'lucide-react';
import QRScanner from '../QRScanner';

const API_URL = 'http://localhost:5000/api';

const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-bark-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
    <div className="glass-card w-full max-w-md p-6 md:p-8 relative animate-slide-up shadow-2xl" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-serif text-bark-900">{title}</h2>
        <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-earth-400 hover:text-bark-700 hover:bg-earth-100 transition-colors">
          <XCircle className="w-6 h-6" />
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
        headers: { 'Authorization': `Bearer ${token}` },
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
      case 'Created': return 'bg-earth-100 text-earth-700 border border-earth-200';
      case 'Sent to Lab': return 'bg-amber-100 text-amber-800 border border-amber-200';
      case 'Received by Lab': return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'Certified': return 'bg-brand-100 text-brand-800 border border-brand-200';
      case 'Rejected': return 'bg-red-100 text-red-800 border border-red-200';
      case 'In Transport': return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'Awaiting Warehouse Receipt': return 'bg-orange-100 text-orange-800 border border-orange-200';
      case 'With Warehouse': return 'bg-teal-100 text-teal-800 border border-teal-200';
      case 'Sold to Farmer': return 'bg-green-100 text-green-800 border border-green-200';
      case 'Expired': return 'bg-gray-100 text-gray-800 border border-gray-200';
      default: return 'bg-earth-50 text-earth-600 border border-earth-200';
    }
  };

  return (
    <div className="bg-cream-50 min-h-screen pt-8 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full animate-fade-in">
        
        {/* Header */}
        <div className="mb-10 flex flex-col sm:flex-row justify-between sm:items-end gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white border border-earth-200 shadow-sm mb-3">
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse-soft"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-earth-600">Network Online</span>
            </div>
            <h1 className="text-4xl font-serif text-bark-900">{user.role} Dashboard</h1>
            <p className="text-earth-500 mt-2">Manage your assigned batches securely on the ledger.</p>
          </div>
          {user.role === 'Producer' && (
            <button onClick={() => setIsCreateOpen(true)} className="btn-primary py-3.5 shadow-lg shadow-brand-600/30">
              <Package className="w-5 h-5" /> Initialize New Batch
            </button>
          )}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-earth-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
            <div className="w-14 h-14 bg-brand-50 rounded-xl flex items-center justify-center shrink-0">
              <Box className="w-7 h-7 text-brand-600" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-earth-500 mb-1">Total Active Batches</p>
              <p className="text-3xl font-bold text-bark-900">{batches.length}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-earth-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
            <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
              <Activity className="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-earth-500 mb-1">Your Role Actions</p>
              <p className="text-3xl font-bold text-bark-900">
                {batches.filter(b => 
                  (user.role === 'Producer' && b.status === 'Created') ||
                  (user.role === 'QualityLab' && (b.status === 'Sent to Lab' || b.status === 'Received by Lab' || b.status === 'Certified')) ||
                  (user.role === 'Transporter' && b.status === 'In Transport') ||
                  (user.role === 'WarehouseManager' && (b.status === 'Awaiting Warehouse Receipt' || b.status === 'With Warehouse'))
                ).length} Pending
              </p>
            </div>
          </div>
        </div>

        {/* Batch Table */}
        <div className="bg-white rounded-3xl border border-earth-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-earth-100 flex justify-between items-center bg-cream-50/50">
            <h2 className="text-xl font-bold text-bark-800">Inventory Management</h2>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-earth-400" />
              <input type="text" placeholder="Filter by ID..." className="pl-9 pr-4 py-2 bg-white border border-earth-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none w-48" />
            </div>
          </div>
          
          {loading ? (
            <div className="p-20 text-center text-earth-400 flex flex-col items-center">
              <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-4"></div>
              <p className="font-medium">Syncing with Ledger...</p>
            </div>
          ) : batches.length === 0 ? (
            <div className="p-20 text-center">
              <div className="w-20 h-20 bg-earth-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-10 h-10 text-earth-300" />
              </div>
              <p className="text-earth-600 font-medium text-lg">No active batches found.</p>
              <p className="text-earth-400 mt-1">Batches assigned to you will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-white border-b border-earth-100 text-xs font-bold uppercase tracking-wider text-earth-500">
                    <th className="px-6 py-4">Batch ID</th>
                    <th className="px-6 py-4">Crop Details</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Current Location</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-earth-100/60">
                  {batches.map((batch) => (
                    <tr key={batch.id} className="hover:bg-brand-50/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="inline-flex items-center gap-2">
                          <QrCode className="w-4 h-4 text-earth-400 group-hover:text-brand-500 transition-colors" />
                          <span className="font-mono font-bold text-bark-800 text-sm bg-cream-50 px-2 py-1 rounded border border-earth-200">{batch.batch_id}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-bark-700 font-medium">{batch.crop_details}</td>
                      <td className="px-6 py-4">
                        <span className={`badge ${getStatusBadge(batch.status)}`}>
                          {batch.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-earth-600 text-sm flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-earth-400" />
                        {batch.location || 'Pending Origin'}
                      </td>
                      <td className="px-6 py-4 flex gap-3 text-sm justify-end">
                        
                        {user.role === 'Producer' && batch.status === 'Created' && (
                          <button onClick={() => { setActiveBatch(batch.batch_id); loadUsersForRole('QualityLab'); setIsSendLabOpen(true); }} className="px-4 py-2 bg-brand-50 text-brand-700 font-bold rounded-lg border border-brand-200 hover:bg-brand-100 transition-colors shadow-sm">Send to Lab</button>
                        )}

                        {user.role === 'QualityLab' && batch.status === 'Sent to Lab' && (
                          <button onClick={() => apiCall('/lab-receive', { batchID: batch.batch_id })} className="px-4 py-2 bg-purple-50 text-purple-700 font-bold rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors shadow-sm">Confirm Receipt</button>
                        )}
                        {user.role === 'QualityLab' && batch.status === 'Received by Lab' && (
                          <button onClick={() => { setActiveBatch(batch.batch_id); setIsEvalOpen(true); }} className="px-4 py-2 bg-brand-50 text-brand-700 font-bold rounded-lg border border-brand-200 hover:bg-brand-100 transition-colors shadow-sm">Evaluate Batch</button>
                        )}
                        {user.role === 'QualityLab' && batch.status === 'Certified' && (
                          <button onClick={() => { setActiveBatch(batch.batch_id); loadUsersForRole('Transporter'); setIsDispatchOpen(true); }} className="px-4 py-2 bg-blue-50 text-blue-700 font-bold rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors shadow-sm">Dispatch</button>
                        )}

                        {user.role === 'Transporter' && batch.status === 'In Transport' && (
                          <>
                            <button onClick={() => { setActiveBatch(batch.batch_id); setLocationStr(batch.location); setIsUpdateLocOpen(true); }} className="px-4 py-2 bg-orange-50 text-orange-700 font-bold rounded-lg border border-orange-200 hover:bg-orange-100 transition-colors shadow-sm">Update Loc</button>
                            <button onClick={() => { setActiveBatch(batch.batch_id); loadUsersForRole('WarehouseManager'); setIsDropoffOpen(true); }} className="px-4 py-2 bg-teal-50 text-teal-700 font-bold rounded-lg border border-teal-200 hover:bg-teal-100 transition-colors shadow-sm">Dropoff</button>
                          </>
                        )}

                        {user.role === 'WarehouseManager' && batch.status === 'Awaiting Warehouse Receipt' && (
                          <button onClick={() => apiCall('/warehouse-receive', { batchID: batch.batch_id })} className="px-4 py-2 bg-brand-50 text-brand-700 font-bold rounded-lg border border-brand-200 hover:bg-brand-100 transition-colors shadow-sm">Confirm Delivery</button>
                        )}

                        {user.role === 'WarehouseManager' && batch.status === 'With Warehouse' && (
                          <>
                            <button onClick={() => apiCall('/warehouse-action', { batchID: batch.batch_id, action: 'Sold' })} className="px-4 py-2 bg-brand-50 text-brand-700 font-bold rounded-lg border border-brand-200 hover:bg-brand-100 transition-colors shadow-sm">Mark Sold</button>
                            <button onClick={() => apiCall('/warehouse-action', { batchID: batch.batch_id, action: 'Expired' })} className="px-4 py-2 bg-red-50 text-red-700 font-bold rounded-lg border border-red-200 hover:bg-red-100 transition-colors shadow-sm">Mark Expired</button>
                          </>
                        )}

                        {user.role === 'Admin' && (
                          <a href={`/?batch=${batch.batch_id}`} className="px-4 py-2 bg-earth-50 text-earth-700 font-bold rounded-lg border border-earth-200 hover:bg-earth-100 transition-colors shadow-sm">Trace Lineage</a>
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
          <Modal title="Initialize New Batch" onClose={() => setIsCreateOpen(false)}>
            {!newBatch.batchID ? (
              <div className="space-y-5">
                <div className="bg-brand-50 p-4 rounded-xl border border-brand-200 text-sm text-brand-800">
                  <p className="font-semibold mb-1">Step 1: Link Physical Tag</p>
                  <p>Scan the pre-printed QR code on the physical seed bag to bind it to the blockchain ledger.</p>
                </div>
                <div className="rounded-xl overflow-hidden border-2 border-brand-200 shadow-inner">
                  <QRScanner onScanSuccess={(id) => setNewBatch({...newBatch, batchID: id})} />
                </div>
                <div className="flex justify-end mt-6">
                  <button type="button" onClick={() => setIsCreateOpen(false)} className="btn-secondary">Cancel</button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateBatch} className="space-y-5 animate-fade-in">
                <div className="p-4 bg-brand-50 rounded-xl border border-brand-200 flex justify-between items-center">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-brand-600 mb-1">Linked QR Code</p>
                    <p className="font-mono font-bold text-brand-900">{newBatch.batchID}</p>
                  </div>
                  <CheckCircle className="w-6 h-6 text-brand-500" />
                </div>
                <div><label className="input-label text-bark-800">Crop Details</label><input required type="text" className="input-field bg-cream-50" value={newBatch.cropDetails} onChange={e => setNewBatch({...newBatch, cropDetails: e.target.value})} placeholder="e.g., Premium Wheat Seeds V2" /></div>
                <div className="flex gap-4">
                  <div className="flex-1"><label className="input-label text-bark-800">Quantity (kg)</label><input required type="number" min="1" className="input-field bg-cream-50" value={newBatch.quantity} onChange={e => setNewBatch({...newBatch, quantity: e.target.value})} placeholder="100" /></div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1"><label className="input-label text-bark-800">Prod. Date</label><input required type="date" className="input-field bg-cream-50" value={newBatch.dateOfProduction} onChange={e => setNewBatch({...newBatch, dateOfProduction: e.target.value})} /></div>
                  <div className="flex-1"><label className="input-label text-bark-800">Expiry Date</label><input required type="date" className="input-field bg-cream-50" value={newBatch.dateOfExpiry} onChange={e => setNewBatch({...newBatch, dateOfExpiry: e.target.value})} /></div>
                </div>
                <div className="flex justify-end gap-3 mt-8">
                  <button type="button" onClick={() => { setIsCreateOpen(false); setNewBatch({ batchID: '', cropDetails: '', quantity: '', dateOfProduction: '', dateOfExpiry: '' }); }} className="btn-secondary">Cancel</button>
                  <button type="submit" className="btn-primary flex-1">Initialize on Ledger</button>
                </div>
              </form>
            )}
          </Modal>
        )}

        {isSendLabOpen && (
          <Modal title="Send Batch to Lab" onClose={() => setIsSendLabOpen(false)}>
            <form onSubmit={(e) => { e.preventDefault(); apiCall('/send-to-lab', { batchID: activeBatch, labId: targetId }).then(() => setIsSendLabOpen(false)); }} className="space-y-6">
              <p className="text-earth-600 mb-2 leading-relaxed">Select a certified Quality Lab to route this batch to. They will evaluate and upload verification documents.</p>
              <div>
                <label className="input-label">Destination Facility</label>
                <select className="input-field bg-cream-50" value={targetId} onChange={e => setTargetId(e.target.value)}>
                  {dropdownUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setIsSendLabOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary flex-1">Transfer Custody</button>
              </div>
            </form>
          </Modal>
        )}

        {isEvalOpen && (
          <Modal title="Evaluate Quality" onClose={() => setIsEvalOpen(false)}>
            <form onSubmit={handleEvaluate} className="space-y-6">
              <div>
                <label className="input-label">Evaluation Outcome</label>
                <select className="input-field bg-cream-50 font-semibold" value={evalData.status} onChange={e => setEvalData({...evalData, status: e.target.value})}>
                  <option value="Certified" className="text-brand-700">Certify (Pass)</option>
                  <option value="Rejected" className="text-red-700">Reject (Fail)</option>
                </select>
              </div>
              <div>
                <label className="input-label">Quality Grade</label>
                <select className="input-field bg-cream-50" value={evalData.grade} onChange={e => setEvalData({...evalData, grade: e.target.value})}>
                  <option value="A">Grade A (Premium)</option>
                  <option value="B">Grade B (Standard)</option>
                  <option value="C">Grade C (Sub-standard)</option>
                  <option value="F">Grade F (Fail)</option>
                </select>
              </div>
              <div className="bg-white p-5 rounded-xl border-2 border-dashed border-brand-200 hover:border-brand-400 transition-colors">
                <label className="input-label mb-2">Verification Report (PDF)</label>
                <input type="file" accept="application/pdf" required className="w-full text-sm text-earth-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 cursor-pointer" onChange={e => setEvalData({...evalData, file: e.target.files[0]})} />
                <p className="text-xs text-earth-500 mt-3 font-medium bg-earth-50 p-2 rounded flex gap-2"><ShieldCheck className="w-4 h-4 shrink-0 text-brand-500" /> SHA-256 Hash will be generated and stored on-chain automatically.</p>
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setIsEvalOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary flex-1 !bg-purple-600 hover:!bg-purple-700 shadow-purple-600/30">Submit Report</button>
              </div>
            </form>
          </Modal>
        )}

        {isDispatchOpen && (
          <Modal title="Dispatch to Transport" onClose={() => setIsDispatchOpen(false)}>
            <form onSubmit={(e) => { e.preventDefault(); apiCall('/dispatch', { batchID: activeBatch, transporterId: targetId }).then(() => setIsDispatchOpen(false)); }} className="space-y-6">
              <p className="text-earth-600 mb-2 leading-relaxed">Assign this batch to a certified transport partner for delivery to the warehouse.</p>
              <div>
                <label className="input-label">Transport Partner</label>
                <select className="input-field bg-cream-50" value={targetId} onChange={e => setTargetId(e.target.value)}>
                  {dropdownUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setIsDispatchOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary flex-1 !bg-blue-600 hover:!bg-blue-700 shadow-blue-600/30">Initiate Dispatch</button>
              </div>
            </form>
          </Modal>
        )}

        {isUpdateLocOpen && (
          <Modal title="Update GPS/Checkpoint" onClose={() => setIsUpdateLocOpen(false)}>
            <form onSubmit={(e) => { e.preventDefault(); apiCall('/update-location', { batchID: activeBatch, location: locationStr }).then(() => setIsUpdateLocOpen(false)); }} className="space-y-6">
              <p className="text-earth-600 mb-2 leading-relaxed">Log the current physical location or checkpoint. This creates a permanent trace entry.</p>
              <div>
                <label className="input-label">Current Location</label>
                <input required type="text" className="input-field bg-cream-50" value={locationStr} onChange={e => setLocationStr(e.target.value)} placeholder="e.g. Checkpoint Alpha, Interstate 9" />
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setIsUpdateLocOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary flex-1 !bg-orange-600 hover:!bg-orange-700 shadow-orange-600/30">Log Location</button>
              </div>
            </form>
          </Modal>
        )}

        {isDropoffOpen && (
          <Modal title="Dropoff at Warehouse" onClose={() => setIsDropoffOpen(false)}>
            <form onSubmit={(e) => { e.preventDefault(); apiCall('/dropoff', { batchID: activeBatch, warehouseId: targetId }).then(() => setIsDropoffOpen(false)); }} className="space-y-6">
              <p className="text-earth-600 mb-2 leading-relaxed">Select the Warehouse Facility you are delivering this physical batch to.</p>
              <div>
                <label className="input-label">Destination Warehouse</label>
                <select className="input-field bg-cream-50" value={targetId} onChange={e => setTargetId(e.target.value)}>
                  {dropdownUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setIsDropoffOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary flex-1 !bg-teal-600 hover:!bg-teal-700 shadow-teal-600/30">Complete Dropoff</button>
              </div>
            </form>
          </Modal>
        )}

      </div>
    </div>
  );
};

export default Dashboard;
