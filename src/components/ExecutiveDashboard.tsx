import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { 
  TrendingUp, Users, AlertCircle, CheckCircle2, 
  Calendar, Clock, Brain, ShieldCheck, Zap
} from 'lucide-react';
import { fetchRounds, fetchBehavioralAnalytics } from '../services/api';
import { Round } from '../types';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';

export default function ExecutiveDashboard() {
  const { user } = useAuth();
  const [rounds, setRounds] = useState<Round[]>([]);
  const [behavioral, setBehavioral] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [r, b] = await Promise.all([
          fetchRounds(user?.hospitalId), 
          fetchBehavioralAnalytics(user?.hospitalId)
        ]);
        setRounds(r);
        setBehavioral(b);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user?.hospitalId]);

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <Brain className="w-12 h-12 text-slate-300 animate-bounce" />
        <p className="text-slate-400 font-medium">Synthesizing Behavioral Intelligence...</p>
      </div>
    </div>
  );

  const avgAuthenticity = rounds.length > 0 
    ? (rounds.reduce((acc, r) => acc + r.authenticityScore, 0) / rounds.length).toFixed(1)
    : 0;

  const weekendRounds = rounds.filter(r => r.isWeekend).length;
  const weekendRatio = rounds.length > 0 ? (weekendRounds / rounds.length * 100).toFixed(1) : 0;

  const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-8 pb-12">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Rounds" 
          value={rounds.length} 
          icon={<Users className="w-5 h-5" />}
          trend="+12% vs last week"
          color="blue"
        />
        <StatCard 
          title="Avg Authenticity" 
          value={`${avgAuthenticity}%`} 
          icon={<ShieldCheck className="w-5 h-5" />}
          trend="AI Verified"
          color="emerald"
        />
        <StatCard 
          title="Weekend Coverage" 
          value={`${weekendRatio}%`} 
          icon={<Calendar className="w-5 h-5" />}
          trend="Target: 28%"
          color="amber"
        />
        <StatCard 
          title="Behavioral Alerts" 
          value={behavioral.filter(b => b.fridayRushRatio > 0.4).length} 
          icon={<AlertCircle className="w-5 h-5" />}
          trend="High Friday Velocity"
          color="rose"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Behavioral Patterns */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" /> Manager Behavioral Index
            </h3>
            <span className="text-xs font-mono text-slate-400">FRIDAY RUSH VS AUTHENTICITY</span>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={behavioral}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="managerName" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="avgAuthenticity" name="Authenticity" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="fridayRushRatio" name="Friday Rush Index" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Quality Trends */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" /> Sentiment & Quality Over Time
            </h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={rounds.slice().reverse()}>
                <defs>
                  <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="timestamp" hide />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="sentimentScore" stroke="#10b981" fillOpacity={1} fill="url(#colorSent)" />
                <Line type="monotone" dataKey="authenticityScore" stroke="#6366f1" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Recent Rounds Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
      >
        <div className="p-6 border-bottom border-slate-50 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">Recent Rounding Intelligence</h3>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-medium rounded-full">High Quality</span>
            <span className="px-3 py-1 bg-rose-50 text-rose-600 text-xs font-medium rounded-full">Low Authenticity</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">Manager</th>
                <th className="px-6 py-4 font-medium">Room / Patient</th>
                <th className="px-6 py-4 font-medium">Notes Summary</th>
                <th className="px-6 py-4 font-medium">Authenticity</th>
                <th className="px-6 py-4 font-medium">Sentiment</th>
                <th className="px-6 py-4 font-medium">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {rounds.slice(0, 10).map((round) => (
                <tr key={round.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{round.managerName}</div>
                    <div className="text-xs text-slate-500">{round.department}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-700">Room {round.patientRoom}</div>
                    <div className="text-xs text-slate-400">{round.patientName || 'Anonymous'}</div>
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <p className="text-sm text-slate-600 truncate italic">"{round.notes}"</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${round.authenticityScore > 70 ? 'bg-emerald-500' : round.authenticityScore > 40 ? 'bg-amber-500' : 'bg-rose-500'}`}
                          style={{ width: `${round.authenticityScore}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono">{round.authenticityScore.toFixed(0)}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                      round.mood === 'Positive' ? 'bg-emerald-50 text-emerald-700' :
                      round.mood === 'Negative' ? 'bg-rose-50 text-rose-700' :
                      'bg-slate-50 text-slate-700'
                    }`}>
                      {round.mood}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400">
                    {new Date(round.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

function StatCard({ title, value, icon, trend, color }: any) {
  const colorMap: any = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600',
  };

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg ${colorMap[color]}`}>
          {icon}
        </div>
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <h4 className="text-2xl font-bold text-slate-900">{value}</h4>
      </div>
      <p className="mt-2 text-xs text-slate-500 flex items-center gap-1">
        <CheckCircle2 className="w-3 h-3 text-emerald-500" /> {trend}
      </p>
    </motion.div>
  );
}
