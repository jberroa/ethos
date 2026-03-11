import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Key, Loader2, AlertCircle } from 'lucide-react';
import { loginManager } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const [employeeId, setEmployeeId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const manager = await loginManager(employeeId);
      login(manager);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your ID.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 overflow-hidden border border-slate-100">
          <div className="bg-slate-900 p-10 text-white text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500 rounded-full blur-3xl" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500 rounded-full blur-3xl" />
            </div>
            
            <div className="relative z-10">
              <div className="inline-flex p-4 bg-white/10 rounded-2xl backdrop-blur-md mb-6">
                <Shield className="w-10 h-10 text-emerald-400" />
              </div>
              <h1 className="text-3xl font-black tracking-tight mb-2">Ethos Rounding</h1>
              <p className="text-slate-400 font-medium">Manager Authentication Portal</p>
            </div>
          </div>

          <div className="p-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Employee ID</label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    required
                    type="text" 
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none transition-all font-mono text-lg tracking-widest"
                    placeholder="•••••"
                    value={employeeId}
                    onChange={e => setEmployeeId(e.target.value)}
                  />
                </div>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 p-4 bg-rose-50 text-rose-600 rounded-2xl text-sm font-bold border border-rose-100"
                >
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  {error}
                </motion.div>
              )}

              <button 
                disabled={loading}
                type="submit"
                className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    VERIFYING...
                  </>
                ) : (
                  'ACCESS PORTAL'
                )}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-slate-50 text-center">
              <p className="text-xs text-slate-400 font-medium">
                Authorized Personnel Only. <br />
                Contact Director for access credentials.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
