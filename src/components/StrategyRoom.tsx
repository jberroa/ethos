import React, { useState, useEffect } from 'react';
import { 
  Zap, ShieldCheck, AlertTriangle, Lightbulb, 
  ArrowRight, CheckCircle2, BrainCircuit, 
  TrendingUp, Activity
} from 'lucide-react';
import { fetchActionItems, addActionItem, fetchRounds } from '../services/api';
import { ActionItem, Round } from '../types';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';

export default function StrategyRoom() {
  const { user } = useAuth();
  const [items, setItems] = useState<ActionItem[]>([]);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user?.hospitalId]);

  const loadData = async () => {
    const [i, r] = await Promise.all([
      fetchActionItems(), 
      fetchRounds()
    ]);
    setItems(i);
    setRounds(r);
    setLoading(false);
  };

  // AI Logic Simulation: Find problems in rounds and suggest actions
  const lowAuthRounds = rounds.filter(r => r.authenticityScore < 40);
  const negativeSentimentRounds = rounds.filter(r => r.sentimentScore < -0.2);

  return (
    <div className="space-y-8">
      {/* AI Intelligence Header */}
      <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/30">
            <BrainCircuit className="w-12 h-12 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">Ethos Strategy Engine</h2>
            <p className="text-slate-400 max-w-2xl">
              Our AI has analyzed {rounds.length} interactions. We've identified {lowAuthRounds.length} behavioral anomalies and {negativeSentimentRounds.length} quality concerns that require immediate intervention.
            </p>
          </div>
          <div className="ml-auto">
            <button className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-xl font-bold transition-all flex items-center gap-2">
              Generate New Strategy <Zap className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-48 -mt-48" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Behavioral Interventions */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-blue-500" /> Behavioral Interventions
            </h3>
            <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full uppercase">Manager Focus</span>
          </div>

          <div className="space-y-6">
            {lowAuthRounds.length > 0 && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-500 mt-1" />
                  <div>
                    <h4 className="font-bold text-rose-900">Low Authenticity Cluster</h4>
                    <p className="text-sm text-rose-700 mt-1">Multiple rounds detected with repetitive notes. This suggests "Compliance Rounding" rather than genuine patient engagement.</p>
                    <div className="mt-4 flex gap-2">
                      <button className="text-xs font-bold bg-rose-500 text-white px-3 py-1.5 rounded-lg">Schedule Coaching</button>
                      <button className="text-xs font-bold bg-white text-rose-500 border border-rose-200 px-3 py-1.5 rounded-lg">View Details</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <StrategyItem 
                icon={<Lightbulb className="w-4 h-4 text-amber-500" />}
                title="Implement 'Script-Free' Tuesdays"
                description="Encourage managers to ditch the checklist and have 100% organic conversations to boost authenticity scores."
              />
              <StrategyItem 
                icon={<Activity className="w-4 h-4 text-emerald-500" />}
                title="Rounding Pair-Ups"
                description="Pair high-authenticity managers with those in the 'Friday Rush' cluster for peer-to-peer mentoring."
              />
            </div>
          </div>
        </motion.div>

        {/* Quality Action Items */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-emerald-500" /> Quality Action Items
            </h3>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-full uppercase">Patient Focus</span>
          </div>

          <div className="space-y-4">
            {items.filter(i => i.type === 'Quality').map(item => (
              <div key={item.id} className="p-4 border border-slate-100 rounded-xl flex items-center justify-between group hover:border-emerald-200 transition-all">
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    <CheckCircle2 className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 transition-all cursor-pointer" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{item.title}</h4>
                    <p className="text-sm text-slate-500">{item.description}</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300" />
              </div>
            ))}
            
            {items.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-400 italic">No active quality items. AI is monitoring...</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function StrategyItem({ icon, title, description }: any) {
  return (
    <div className="flex gap-4 p-4 rounded-xl hover:bg-slate-50 transition-all cursor-pointer border border-transparent hover:border-slate-100">
      <div className="mt-1">{icon}</div>
      <div>
        <h4 className="font-bold text-slate-900 text-sm">{title}</h4>
        <p className="text-xs text-slate-500 mt-1">{description}</p>
      </div>
    </div>
  );
}
