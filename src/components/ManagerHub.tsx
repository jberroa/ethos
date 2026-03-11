import React, { useState, useEffect } from 'react';
import { 
  Trophy, Target, Calendar, MessageSquare, 
  TrendingUp, CheckCircle2, Star, Award, 
  Send, Loader2, Heart
} from 'lucide-react';
import { fetchRounds, submitManagerFeedback, fetchManagers } from '../services/api';
import { Round } from '../types';
import { motion } from 'motion/react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { User } from 'lucide-react';

export default function ManagerHub({ currentUser }: { currentUser: any, key?: React.Key }) {
  const [allRounds, setAllRounds] = useState<Round[]>([]);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [managers, setManagers] = useState<any[]>([]);
  const [selectedManager, setSelectedManager] = useState<any>(currentUser);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [roundsData, managersData] = await Promise.all([
      fetchRounds(),
      fetchManagers()
    ]);
    setAllRounds(roundsData);
    setManagers(managersData);
    
    // Default to current user if they are in the managers list, otherwise first manager
    const currentInList = managersData.find(m => m.id === currentUser.id);
    const initialMgr = currentInList || managersData[0];
    
    setSelectedManager(initialMgr);
    setRounds(roundsData.filter(r => r.managerId === initialMgr.id));
    setLoading(false);
  };

  useEffect(() => {
    if (selectedManager) {
      setRounds(allRounds.filter(r => r.managerId === selectedManager.id));
    }
  }, [selectedManager, allRounds]);

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedManager) return;
    setSubmitting(true);
    await submitManagerFeedback({
      managerId: selectedManager.id,
      managerName: selectedManager.name,
      feedback: feedback
    });
    setFeedback('');
    setSubmitting(false);
  };

  const today = new Date().toISOString().split('T')[0];
  const roundsToday = rounds.filter(r => r.timestamp.startsWith(today)).length;
  const dailyQuota = 5;
  const dailyProgress = Math.min((roundsToday / dailyQuota) * 100, 100);

  // Weekly progress (mock)
  const weeklyRounds = rounds.length; // Simplified
  const weeklyQuota = 25;
  const weeklyProgress = Math.min((weeklyRounds / weeklyQuota) * 100, 100);

  return (
    <div className="space-y-8">
      {/* Manager Selector */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-100 rounded-xl text-slate-600">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Viewing Performance For:</h3>
            <p className="text-slate-500 text-sm">Select a manager to see their specific metrics</p>
          </div>
        </div>
        <select 
          className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:ring-2 focus:ring-slate-900"
          value={selectedManager?.id || ''}
          onChange={(e) => {
            const mgr = managers.find(m => m.id === e.target.value);
            setSelectedManager(mgr);
          }}
        >
          {managers.map(m => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </div>

      {/* Quota & Awards Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-white p-8 rounded-2xl border border-slate-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Your Daily Mission</h3>
              <p className="text-slate-500 text-sm">5 high-quality patient interactions per day</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-2xl">
              <Trophy className="w-8 h-8 text-amber-500" />
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-semibold text-slate-700">Today's Progress</span>
                <span className="text-sm font-bold text-emerald-600">{roundsToday} / {dailyQuota}</span>
              </div>
              <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${dailyProgress}%` }}
                  className={`h-full rounded-full transition-all duration-1000 ${dailyProgress === 100 ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-blue-500'}`}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <AwardBadge title="Daily Streak" value="4 Days" icon={<Star className="w-4 h-4" />} active={roundsToday >= dailyQuota} />
              <AwardBadge title="Weekly Goal" value={`${weeklyRounds}/${weeklyQuota}`} icon={<Target className="w-4 h-4" />} active={weeklyRounds >= weeklyQuota} />
              <AwardBadge title="Quality King" value="92%" icon={<Award className="w-4 h-4" />} active={true} />
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900 p-8 rounded-2xl text-white shadow-xl relative overflow-hidden"
        >
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-400" /> Human Feedback
            </h3>
            <p className="text-slate-400 text-sm mb-6">How are you feeling today? Share your thoughts on patient care or hospital environment. Leadership reads this to improve your workplace.</p>
            
            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              <textarea
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                rows={4}
                placeholder="I noticed the 4th floor staff is really stressed today..."
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
              />
              <button 
                disabled={submitting || !feedback}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Submit Reflection
              </button>
            </form>
          </div>
          <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl" />
        </motion.div>
      </div>

      {/* Personal Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" /> Your Rounding Velocity
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rounds.slice(0, 7)}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="dayOfWeek" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="durationMinutes" name="Minutes Spent" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-500" /> Completed Inspections
          </h3>
          <div className="space-y-4 max-h-[256px] overflow-y-auto pr-2">
            {rounds.map(round => (
              <div key={round.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <div className="font-semibold text-slate-900">Room {round.patientRoom}</div>
                  <div className="text-xs text-slate-500">{new Date(round.timestamp).toLocaleDateString()}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold ${round.authenticityScore > 70 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {round.authenticityScore.toFixed(0)}% Auth
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AwardBadge({ title, value, icon, active }: any) {
  return (
    <div className={`p-4 rounded-2xl border transition-all ${active ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100 opacity-50'}`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${active ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
        {icon}
      </div>
      <div className="text-xs font-medium text-slate-500">{title}</div>
      <div className={`text-sm font-bold ${active ? 'text-emerald-700' : 'text-slate-400'}`}>{value}</div>
    </div>
  );
}
