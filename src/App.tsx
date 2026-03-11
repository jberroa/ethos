import React, { useState } from 'react';
import RoundingForm from './components/RoundingForm';
import ExecutiveDashboard from './components/ExecutiveDashboard';
import ManagerHub from './components/ManagerHub';
import RoomRegistry from './components/RoomRegistry';
import StrategyRoom from './components/StrategyRoom';
import PatientSatisfaction from './components/PatientSatisfaction';
import Flyer from './components/Flyer';
import LeadershipRounding from './components/LeadershipRounding';
import LeadershipOutcomes from './components/LeadershipOutcomes';
import DirectorTab from './components/DirectorTab';
import Login from './components/Login';
import { 
  LayoutDashboard, ClipboardList, ShieldAlert, 
  Activity, UserCircle, Building2, Zap, Heart,
  FileText, Globe, BarChart3, ShieldCheck, LogOut, TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from './context/AuthContext';

type View = 'rounding' | 'leadership' | 'leadership_outcomes' | 'dashboard' | 'manager' | 'rooms' | 'strategy' | 'satisfaction' | 'flyer' | 'director';

export default function App() {
  const [view, setView] = useState<View>('rounding');
  const [refreshKey, setRefreshKey] = useState(0);
  const { user: currentUser, logout, loading } = useAuth();

  const navItems = [
    { id: 'rounding', label: 'Rounding Tool', icon: <ClipboardList className="w-4 h-4" /> },
    { id: 'leadership', label: 'Leadership Rounding', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'leadership_outcomes', label: 'Rounding Outcomes', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'manager', label: 'Manager Hub', icon: <UserCircle className="w-4 h-4" /> },
    { id: 'director', label: 'Director Control', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'satisfaction', label: 'Patient Satisfaction', icon: <Heart className="w-4 h-4" /> },
    { id: 'dashboard', label: 'Executive Insights', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'strategy', label: 'Strategy Room', icon: <Zap className="w-4 h-4" /> },
    { id: 'rooms', label: 'Room Registry', icon: <Building2 className="w-4 h-4" /> },
    { id: 'flyer', label: 'Client Flyer', icon: <FileText className="w-4 h-4" /> },
  ];

  const filteredNavItems = navItems.filter(item => 
    currentUser?.permissions?.includes(item.id)
  );

  React.useEffect(() => {
    if (!loading && currentUser && filteredNavItems.length > 0) {
      if (!currentUser.permissions?.includes(view)) {
        setView(filteredNavItems[0].id as View);
      }
    }
  }, [loading, currentUser, filteredNavItems, view]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Activity className="w-12 h-12 text-emerald-500 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      {/* Navigation Rail */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-50 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
            <Activity className="w-5 h-5 text-emerald-400" />
          </div>
          <h1 className="font-bold text-lg tracking-tight">Ethos <span className="text-slate-400 font-normal">Rounding</span></h1>
        </div>

        <div className="hidden lg:flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          {filteredNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id as View)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                view === item.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </div>

        {/* Mobile Nav Toggle (Simplified) */}
        <div className="lg:hidden">
          <select 
            className="bg-slate-100 px-4 py-2 rounded-xl text-sm font-medium outline-none"
            value={view}
            onChange={(e) => setView(e.target.value as View)}
          >
            {filteredNavItems.map(item => (
              <option key={item.id} value={item.id}>{item.label}</option>
            ))}
          </select>
        </div>

        <div className="hidden md:flex items-center gap-4">
          {currentUser && (
            <div className="flex items-center gap-3 pr-4 border-r border-slate-200">
              <div className="text-right">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Manager</div>
                <div className="text-sm font-bold text-slate-900 leading-none">{currentUser.name}</div>
              </div>
              <button 
                onClick={logout}
                className="p-2 bg-slate-100 text-slate-500 rounded-lg hover:bg-rose-50 hover:text-rose-600 transition-all"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
          <div className="flex items-center gap-2 px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-xs font-semibold border border-rose-100">
            <ShieldAlert className="w-3 h-3" /> Behavioral Guard Active
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 overflow-hidden">
            {currentUser && (
              <div className="w-full h-full flex items-center justify-center bg-slate-900 text-white text-xs font-bold">
                {currentUser.name.charAt(0)}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      {!currentUser ? (
        <Login />
      ) : (
        <main className="pt-24 px-6 max-w-7xl mx-auto pb-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {view === 'rounding' && (
                <>
                  <div className="mb-8 text-center">
                    <h2 className="text-3xl font-bold text-slate-900">Quality Rounding</h2>
                    <p className="text-slate-500 mt-2">Your interactions drive patient experience and safety.</p>
                  </div>
                  <RoundingForm 
                    currentUser={currentUser}
                    onComplete={() => setRefreshKey(prev => prev + 1)} 
                  />
                </>
              )}
            {view === 'leadership' && (
              <>
                <div className="mb-8 text-center">
                  <h2 className="text-3xl font-bold text-slate-900">Leadership Rounding</h2>
                  <p className="text-slate-500 mt-2">Comprehensive facility and quality inspection rounding.</p>
                </div>
                <LeadershipRounding />
              </>
            )}
            {view === 'leadership_outcomes' && (
              <>
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-slate-900">Rounding Outcomes & Analysis</h2>
                  <p className="text-slate-500 mt-2">Strategic analysis and course of action based on leadership rounding data.</p>
                </div>
                <LeadershipOutcomes />
              </>
            )}
            {view === 'manager' && (
              <>
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-slate-900">Manager Performance Hub</h2>
                  <p className="text-slate-500 mt-2">Track your quotas, awards, and personal growth.</p>
                </div>
                <ManagerHub 
                  currentUser={currentUser}
                  key={refreshKey} 
                />
              </>
            )}
            {view === 'dashboard' && (
              <>
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-slate-900">Hospital Leadership Dashboard</h2>
                  <p className="text-slate-500 mt-2">Behavioral intelligence and quality verification metrics.</p>
                </div>
                <ExecutiveDashboard key={refreshKey} />
              </>
            )}
            {view === 'strategy' && (
              <>
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-slate-900">The Strategy Room</h2>
                  <p className="text-slate-500 mt-2">AI-driven interventions and actionable quality improvements.</p>
                </div>
                <StrategyRoom key={refreshKey} />
              </>
            )}
            {view === 'rooms' && (
              <>
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-slate-900">Room Registry</h2>
                  <p className="text-slate-500 mt-2">Manage hospital room inventory for streamlined rounding.</p>
                </div>
                <RoomRegistry />
              </>
            )}
            {view === 'satisfaction' && (
              <>
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-slate-900">Patient Satisfaction Index</h2>
                  <p className="text-slate-500 mt-2">Correlating manager behavior with Press Ganey HCAHPS scores.</p>
                </div>
                <PatientSatisfaction key={refreshKey} />
              </>
            )}
            {view === 'director' && (
              <>
                <DirectorTab />
              </>
            )}
            {view === 'flyer' && (
              <>
                <div className="mb-8 flex items-center justify-between no-print">
                  <div>
                    <h2 className="text-3xl font-bold text-slate-900">One-Page Client Flyer</h2>
                    <p className="text-slate-500 mt-2">A professional overview of the Ethos platform for potential partners.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <a 
                      href={window.location.href} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-900 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm"
                    >
                      <Globe className="w-5 h-5" /> Open in New Tab
                    </a>
                    <div className="flex flex-col items-end gap-2">
                      <button 
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg"
                      >
                        <FileText className="w-5 h-5" /> Print Flyer
                      </button>
                    </div>
                  </div>
                </div>
                <Flyer />
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
      )}

      {/* Footer Branding */}
      <footer className="mt-12 py-8 border-t border-slate-200 text-center">
        <p className="text-xs text-slate-400 uppercase tracking-widest font-medium">
          Powered by Ethos Behavioral Intelligence Engine
        </p>
      </footer>
    </div>
  );
}
