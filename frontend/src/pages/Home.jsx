import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Package, CheckCircle2, ShieldCheck, XCircle, QrCode, ArrowRight, Leaf, Shield, Globe } from 'lucide-react';
import QRScanner from '../QRScanner';

const API_URL = 'http://localhost:5000/api';

const Home = () => {
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
      if (!res.ok) throw new Error('Batch not found or invalid ID');
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
      // Scroll to trace section
      document.getElementById('trace-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [searchParams]);

  const handleVerify = async (e) => {
    e.preventDefault();
    verifyBatch(batchId);
  };

  const db = batchData?.currentDetails || {};

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-cream-100 via-cream-50 to-brand-50/60 pt-20 pb-32">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-400/10 rounded-full blur-[80px]"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-bark-400/10 rounded-full blur-[80px]"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-100/50 border border-brand-200 text-brand-700 text-xs font-bold uppercase tracking-wider mb-6 animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse-soft"></span>
              Live on Hyperledger Fabric
            </div>
            <h1 className="text-5xl md:text-7xl font-serif text-bark-900 leading-tight mb-6 animate-slide-up">
              Trust in Every <span className="text-brand-600">Seed.</span>
            </h1>
            <p className="text-lg md:text-xl text-earth-600 mb-10 leading-relaxed animate-slide-up animate-stagger-1">
              End-to-end traceability for agricultural supply chains. Verify the origin, quality, and journey of your crops with immutable blockchain records.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up animate-stagger-2">
              <button 
                onClick={() => document.getElementById('trace-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn-primary text-lg px-8 py-4 w-full sm:w-auto"
              >
                Trace a Batch <Search className="w-5 h-5 ml-2" />
              </button>
              <Link to="/about" className="btn-secondary text-lg px-8 py-4 w-full sm:w-auto bg-transparent hover:bg-white">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trace Section */}
      <section id="trace-section" className="py-24 bg-white relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-card w-full p-8 md:p-12 relative z-10 shadow-xl shadow-earth-200/50 -mt-32">
            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm">
                <Search className="w-8 h-8 text-brand-600" />
              </div>
              <h2 className="text-3xl font-serif text-bark-800 mb-3">Verify Your Supply</h2>
              <p className="text-earth-500 text-sm md:text-base">Enter a Batch ID or scan a QR code to view its complete blockchain lineage.</p>
            </div>
            
            {!verified ? (
              showScanner ? (
                <div className="space-y-4 max-w-sm mx-auto animate-fade-in">
                  <p className="text-sm text-earth-500 mb-2 text-center">Point your camera at the Seed Bag QR code</p>
                  <div className="rounded-xl overflow-hidden border-2 border-brand-200 shadow-lg">
                    <QRScanner onScanSuccess={(id) => { setBatchId(id); verifyBatch(id); }} onScanFailure={() => {}} />
                  </div>
                  <button onClick={() => setShowScanner(false)} className="mt-4 btn-secondary w-full">Cancel Scanning</button>
                </div>
              ) : (
                <form onSubmit={handleVerify} className="space-y-5 max-w-lg mx-auto animate-fade-in">
                  {error && <div className="text-red-600 text-sm font-medium p-4 bg-red-50 rounded-xl border border-red-200/60 flex items-center gap-2"><XCircle className="w-5 h-5"/> {error}</div>}
                  <div className="relative group">
                    <input 
                      type="text" 
                      value={batchId} 
                      onChange={(e) => setBatchId(e.target.value)} 
                      placeholder="e.g. BATCH-001" 
                      className="w-full px-6 py-4 pl-14 rounded-2xl border-2 border-earth-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all text-lg font-mono placeholder:font-sans placeholder:text-earth-400 text-bark-800 bg-cream-50/30" 
                      required 
                    />
                    <Package className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-earth-400 group-focus-within:text-brand-500 transition-colors" />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button type="submit" disabled={loading} className="btn-primary flex-1 py-4 text-lg">
                      {loading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Searching Ledger...
                        </div>
                      ) : 'Trace Origin'}
                    </button>
                    <button type="button" onClick={() => setShowScanner(true)} className="btn-secondary py-4 px-6 flex items-center justify-center gap-2 group hover:bg-brand-50 hover:border-brand-200 hover:text-brand-700">
                      <QrCode className="w-6 h-6 text-earth-500 group-hover:text-brand-600 transition-colors" /> <span className="sm:hidden lg:inline">Scan QR</span>
                    </button>
                  </div>
                </form>
              )
            ) : (
              <div className="animate-fade-in bg-cream-50/50 p-6 md:p-8 rounded-3xl border border-earth-200/60">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-earth-200 pb-6">
                  <div className="flex items-center gap-4">
                    {db.status === 'Certified' || db.status === 'Sold to Farmer' || db.status === 'With Warehouse' ? (
                      <div className="w-14 h-14 rounded-2xl bg-brand-100 flex items-center justify-center shadow-inner">
                        <CheckCircle2 className="w-8 h-8 text-brand-600" />
                      </div>
                    ) : db.status === 'Rejected' || db.status === 'Expired' ? (
                      <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center shadow-inner">
                        <XCircle className="w-8 h-8 text-red-600" />
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center shadow-inner">
                        <Package className="w-8 h-8 text-blue-600" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-2xl font-serif text-bark-900 mb-1">Status: {db.status}</h3>
                      <p className="text-sm text-earth-500 font-medium">Current Location: {db.location || 'Unknown'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-widest text-earth-400 font-bold mb-1">Batch ID</p>
                    <p className="font-mono font-bold text-lg text-bark-800 bg-white px-3 py-1 rounded-lg border border-earth-200 inline-block">{batchId}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-white p-4 rounded-2xl border border-earth-100 shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-xs text-earth-500 font-semibold uppercase tracking-wider mb-1">Crop Type</p>
                    <p className="font-semibold text-bark-800 text-lg">{db.crop_details}</p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-earth-100 shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-xs text-earth-500 font-semibold uppercase tracking-wider mb-1">Quantity</p>
                    <p className="font-semibold text-bark-800 text-lg">{db.quantity} kg</p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-earth-100 shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-xs text-earth-500 font-semibold uppercase tracking-wider mb-1">Quality Grade</p>
                    <p className={`font-bold text-lg ${db.quality_grade === 'A' ? 'text-brand-600' : db.quality_grade === 'F' ? 'text-red-600' : 'text-amber-600'}`}>
                      {db.quality_grade || 'Pending Evaluation'}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-earth-100 shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-xs text-earth-500 font-semibold uppercase tracking-wider mb-1">Produced On</p>
                    <p className="font-medium text-bark-800">{db.date_of_production ? new Date(db.date_of_production).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}</p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-earth-100 shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-xs text-earth-500 font-semibold uppercase tracking-wider mb-1">Expires On</p>
                    <p className="font-medium text-bark-800">{db.date_of_expiry ? new Date(db.date_of_expiry).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}</p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-earth-100 shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-xs text-earth-500 font-semibold uppercase tracking-wider mb-1">Delivered</p>
                    <p className="font-medium text-bark-800">{db.date_of_delivery ? new Date(db.date_of_delivery).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Pending'}</p>
                  </div>
                </div>

                <div className="bg-brand-50 p-5 rounded-2xl border border-brand-200/50 mb-8 flex items-start gap-4">
                  <ShieldCheck className="w-6 h-6 text-brand-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-brand-800 mb-1">Blockchain Verification Record</p>
                    <p className="text-xs text-brand-600/80 mb-2">Immutable PDF Hash representing lab results</p>
                    <p className="font-mono text-xs text-brand-900 break-all bg-white/60 p-2 rounded-lg border border-brand-200">
                      {db.pdf_hash || 'No verification hash recorded yet.'}
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <button onClick={() => { setVerified(false); setBatchId(''); }} className="btn-secondary px-8">
                    Trace Another Batch
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-cream-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif text-bark-900 mb-4">Why Choose AgriTrace?</h2>
            <p className="text-earth-500 max-w-2xl mx-auto text-lg">Our platform leverages cutting-edge technology to bring radical transparency to agriculture.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl border border-earth-100 hover:shadow-xl hover:shadow-brand-100/50 transition-all duration-300 group">
              <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-brand-100 transition-transform">
                <Shield className="w-7 h-7 text-brand-600" />
              </div>
              <h3 className="text-xl font-bold text-bark-800 mb-3">Immutable Records</h3>
              <p className="text-earth-500 leading-relaxed">
                Every transaction and quality check is permanently recorded on the blockchain, ensuring data cannot be tampered with.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-3xl border border-earth-100 hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-300 group">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-100 transition-transform">
                <Globe className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-bark-800 mb-3">End-to-End Visibility</h3>
              <p className="text-earth-500 leading-relaxed">
                Track your produce from the moment it leaves the farm to when it arrives at the warehouse facility in real-time.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-earth-100 hover:shadow-xl hover:shadow-amber-100/50 transition-all duration-300 group">
              <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-amber-100 transition-transform">
                <Leaf className="w-7 h-7 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-bark-800 mb-3">Quality Assurance</h3>
              <p className="text-earth-500 leading-relaxed">
                Integrated lab testing workflows mean only certified, high-quality seeds make it to the farmers.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-24 bg-brand-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl font-serif text-white mb-6">Are you a supply chain partner?</h2>
          <p className="text-brand-100 text-lg mb-10 max-w-2xl mx-auto">
            Log in to the system portal to update batch statuses, submit quality reports, and manage your inventory.
          </p>
          <Link to="/login" className="btn-primary bg-white text-brand-900 hover:bg-brand-50 hover:text-brand-800 text-lg px-8 py-4 inline-flex shadow-[0_0_40px_rgba(255,255,255,0.3)]">
            Go to Staff Dashboard <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
