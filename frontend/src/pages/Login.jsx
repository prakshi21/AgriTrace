import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, ChevronRight, Leaf } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-bark-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-brand-500/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-earth-500/20 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 bg-white rounded-[2.5rem] shadow-2xl overflow-hidden relative z-10 animate-fade-in">
        
        {/* Left Side - Image/Branding */}
        <div className="hidden md:flex flex-col justify-between p-12 bg-gradient-to-br from-brand-800 to-bark-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2.5 mb-16">
              <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center shadow-lg">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <span className="font-serif text-2xl tracking-tight">AgriTrace</span>
            </div>
            
            <h2 className="text-4xl font-serif leading-tight mb-6 text-brand-50">
              Secure the Future of Agriculture.
            </h2>
            <p className="text-earth-300 text-lg leading-relaxed max-w-md">
              Log in to the decentralized portal to manage your batches, verify quality, and track shipments securely on the blockchain.
            </p>
          </div>
          
          <div className="relative z-10 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 mt-12">
            <p className="text-brand-100 italic text-sm mb-4">"The transparency AgriTrace brings to our supply chain is unprecedented. We know exactly where our seeds come from."</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-300/30 flex items-center justify-center font-bold">JD</div>
              <div>
                <p className="text-sm font-bold">John Doe</p>
                <p className="text-xs text-brand-200">Lead Producer</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="p-8 md:p-16 flex flex-col justify-center">
          <div className="text-center md:text-left mb-10">
            <div className="w-16 h-16 bg-brand-50 text-brand-600 rounded-2xl flex md:hidden items-center justify-center mx-auto mb-6 shadow-sm">
              <LogIn className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-serif text-bark-900 mb-2">Welcome Back</h2>
            <p className="text-earth-500">Sign in to your staff portal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-200/60 flex items-center gap-2 animate-slide-up">
                <div className="w-2 h-2 rounded-full bg-red-500 shrink-0"></div>
                {error}
              </div>
            )}
            
            <div>
              <label className="input-label text-bark-700">Email address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field bg-cream-50 focus:bg-white" 
                placeholder="staff@agritrace.io"
                required 
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-bark-700">Password</label>
                <a href="#" className="text-xs font-semibold text-brand-600 hover:text-brand-700">Forgot password?</a>
              </div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field bg-cream-50 focus:bg-white" 
                placeholder="••••••••"
                required 
              />
            </div>
            
            <button type="submit" disabled={isLoading} className="btn-primary w-full py-4 text-lg mt-8">
              {isLoading ? (
                 <div className="flex items-center justify-center gap-2">
                   <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                   Authenticating...
                 </div>
              ) : (
                <>Sign In <ChevronRight className="w-5 h-5 ml-1" /></>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
