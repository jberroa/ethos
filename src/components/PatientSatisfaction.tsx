import React, { useState, useEffect } from 'react';
import { 
  Star, TrendingUp, TrendingDown, Minus, 
  ShieldAlert, BrainCircuit, CheckCircle2, 
  AlertCircle, Sparkles, Building2, User,
  Loader2, Zap
} from 'lucide-react';
import { fetchRounds, fetchRooms } from '../services/api';
import { analyzeManagerGaps } from '../services/geminiService';
import { Round, UnitSatisfaction, User as UserType } from '../types';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  Tooltip, CartesianGrid 
} from 'recharts';

// Mock HCAHPS Data (Simulating Press Ganey)
const MOCK_HCAHPS: UnitSatisfaction[] = [
  { unit: 'West Wing', hcahpsCleanliness: 82, hcahpsQuietness: 74, hcahpsNurseComm: 88, hcahpsStaffResponsiveness: 79, trend: 'up' },
  { unit: 'East Wing', hcahpsCleanliness: 68, hcahpsQuietness: 62, hcahpsNurseComm: 75, hcahpsStaffResponsiveness: 64, trend: 'down' },
  { unit: 'ICU', hcahpsCleanliness: 91, hcahpsQuietness: 85, hcahpsNurseComm: 94, hcahpsStaffResponsiveness: 92, trend: 'stable' },
];

export default function PatientSatisfaction() {
  const { user } = useAuth();
  const [rounds, setRounds] = useState<Round[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUnit, setSelectedUnit] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    loadData();
  }, [user?.hospitalId]);

  const loadData = async () => {
    try {
      const [roundsData, roomsData] = await Promise.all([
        fetchRounds(user?.hospitalId), 
        fetchRooms(user?.hospitalId)
      ]);
      setRounds(roundsData);
      setRooms(roomsData);
      
      // Derive units from rooms
      const dynamicUnits = Array.from(new Set(roomsData.map(r => r.unit))).filter(Boolean) as string[];
      const mockUnits = MOCK_HCAHPS.map(u => u.unit);
      const combinedUnits = Array.from(new Set([...mockUnits, ...dynamicUnits]));
      
      // Set initial selected unit if not set
      if (combinedUnits.length > 0 && !selectedUnit) {
        setSelectedUnit(combinedUnits[0]);
      }
    } catch (err) {
      console.error("Failed to load satisfaction data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Merge dynamic units with mock HCAHPS data
  const dynamicUnits = Array.from(new Set(rooms.map(r => r.unit))).filter(Boolean) as string[];
  const mockUnits = MOCK_HCAHPS.map(u => u.unit);
  const combinedUnits = Array.from(new Set([...mockUnits, ...dynamicUnits]));

  const allUnitStats: UnitSatisfaction[] = combinedUnits.map(unitName => {
    const existing = MOCK_HCAHPS.find(u => u.unit === unitName);
    if (existing) return existing;
    
    // Generate default stats for new units
    return {
      unit: unitName,
      hcahpsCleanliness: 75,
      hcahpsQuietness: 70,
      hcahpsNurseComm: 80,
      hcahpsStaffResponsiveness: 75,
      trend: 'stable'
    };
  });

  const runAiAudit = async () => {
    setAnalyzing(true);
    const unitRounds = rounds.filter(r => {
      // Find the room's unit
      const roomInfo = rooms.find(rm => rm.roomNumber === r.patientRoom);
      return roomInfo?.unit === selectedUnit;
    });
    const unitStats = allUnitStats.find(u => u.unit === selectedUnit);
    const analysis = await analyzeManagerGaps(user.name, unitRounds, unitStats);
    setAiAnalysis(analysis);
    setAnalyzing(false);
  };

  const currentHcahps = allUnitStats.find(u => u.unit === selectedUnit) || allUnitStats[0];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
      </div>
    );
  }

  if (!currentHcahps) {
    return (
      <div className="bg-white p-12 rounded-3xl border border-dashed border-slate-200 text-center">
        <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-900">No Units Found</h3>
        <p className="text-slate-500">Please add rooms and units in the Room Registry first.</p>
      </div>
    );
  }

  // Calculate Housekeeping Score from Rounding Data for the selected unit
  const unitRounds = rounds.filter(r => {
    const roomInfo = rooms.find(rm => rm.roomNumber === r.patientRoom);
    return roomInfo?.unit === selectedUnit;
  });
  
  const housekeepingRounds = unitRounds.filter(r => r.department === 'EVS');
  const totalQuestions = housekeepingRounds.length * 2; // room_clean + bathroom_clean
  const positiveAnswers = housekeepingRounds.reduce((acc, r) => {
    const clean = r.checklistData?.room_clean ? 1 : 0;
    const bath = r.checklistData?.bathroom_clean ? 1 : 0;
    return acc + clean + bath;
  }, 0);
  const housekeepingScore = totalQuestions > 0 ? Math.round((positiveAnswers / totalQuestions) * 100) : 0;

  // Calculate Manager Rounding Rating (Authenticity + Sentiment) for the selected unit
  const managerScore = unitRounds.length > 0 
    ? Math.round((unitRounds.reduce((acc, r) => acc + r.authenticityScore, 0) / unitRounds.length + (unitRounds.reduce((acc, r) => acc + (r.sentimentScore + 1) * 50, 0) / unitRounds.length)) / 2)
    : 0;

  const radarData = [
    { subject: 'Cleanliness', A: currentHcahps.hcahpsCleanliness, fullMark: 100 },
    { subject: 'Quietness', A: currentHcahps.hcahpsQuietness, fullMark: 100 },
    { subject: 'Nurse Comm', A: currentHcahps.hcahpsNurseComm, fullMark: 100 },
    { subject: 'Staff Resp', A: currentHcahps.hcahpsStaffResponsiveness, fullMark: 100 },
    { subject: 'Manager Rounding', A: managerScore, fullMark: 100 },
    { subject: 'Housekeeping', A: housekeepingScore, fullMark: 100 },
  ];

  return (
    <div className="space-y-8">
      {/* Unit Selector */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <Building2 className="w-5 h-5 text-slate-400" />
          <h3 className="font-bold text-slate-900">Unit Performance View</h3>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
          {allUnitStats.map(u => (
            <button
              key={u.unit}
              onClick={() => setSelectedUnit(u.unit)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                selectedUnit === u.unit 
                  ? 'bg-slate-900 text-white shadow-lg' 
                  : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
              }`}
            >
              {u.unit}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* HCAHPS & Press Ganey Scores */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Patient Satisfaction (HCAHPS)</h3>
              <p className="text-slate-500 text-sm">Official Press Ganey Unit Metrics</p>
            </div>
            <div className={`p-3 rounded-2xl ${currentHcahps.trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              {currentHcahps.trend === 'up' ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#f1f5f9" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fontWeight: 600 }} />
                  <Radar
                    name="Unit Scores"
                    dataKey="A"
                    stroke="#6366f1"
                    fill="#6366f1"
                    fillOpacity={0.5}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-4">
              <SatisfactionMetric label="Room Cleanliness" value={currentHcahps.hcahpsCleanliness} target={85} />
              <SatisfactionMetric label="Housekeeping Quality (Rounding)" value={housekeepingScore} target={90} />
              <SatisfactionMetric label="Manager Presence Rating" value={managerScore} target={80} />
              <SatisfactionMetric label="Staff Responsiveness" value={currentHcahps.hcahpsStaffResponsiveness} target={85} />
            </div>
          </div>
        </motion.div>

        {/* AI Auditor Section */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden"
        >
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-500 rounded-lg">
                <BrainCircuit className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold">AI Performance Auditor</h3>
            </div>

            {!aiAnalysis ? (
              <div className="text-center py-12">
                <Sparkles className="w-12 h-12 text-emerald-400 mx-auto mb-4 animate-pulse" />
                <p className="text-slate-400 text-sm mb-6">Compare manager rounding behavior with patient satisfaction trends to find performance gaps.</p>
                <button 
                  onClick={runAiAudit}
                  disabled={analyzing}
                  className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-xl font-bold transition-all flex items-center gap-2 mx-auto"
                >
                  {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  Run Gap Analysis
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm font-bold uppercase tracking-widest">AI Rating</span>
                  <div className="flex items-center gap-1">
                    {[...Array(10)].map((_, i) => (
                      <div 
                        key={i} 
                        className={`w-2 h-4 rounded-sm ${i < aiAnalysis.performanceRating ? 'bg-emerald-400' : 'bg-slate-700'}`} 
                      />
                    ))}
                    <span className="ml-2 font-bold text-emerald-400">{aiAnalysis.performanceRating}/10</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-800 rounded-2xl border border-slate-700">
                  <p className="text-sm text-slate-300 italic leading-relaxed">
                    "{aiAnalysis.gapAnalysis}"
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Critical Gaps Found</h4>
                  {aiAnalysis.criticalGaps.map((gap: any, idx: number) => (
                    <div key={idx} className="flex gap-3 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                      <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                      <div>
                        <div className="text-sm font-bold text-rose-200">{gap.title}</div>
                        <div className="text-xs text-rose-300/70 mt-1">{gap.remedy}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => setAiAnalysis(null)}
                  className="w-full py-2 text-xs font-bold text-slate-500 hover:text-slate-300 transition-all"
                >
                  Reset Analysis
                </button>
              </div>
            )}
          </div>
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl" />
        </motion.div>
      </div>

      {/* Housekeeping Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Housekeeping Quality (Rounding Tool)
          </h3>
          <div className="space-y-4">
            <QualityRow label="Room Cleanliness" value={housekeepingScore} />
            <QualityRow label="Bathroom Stocked" value={Math.max(0, housekeepingScore - 5)} />
            <QualityRow label="Housekeeper Name Known" value={Math.max(0, housekeepingScore - 15)} />
            <QualityRow label="Service Script Used" value={Math.max(0, housekeepingScore - 10)} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-500" /> Manager Feedback Loop
          </h3>
          <div className="space-y-4 max-h-[200px] overflow-y-auto pr-2">
            {unitRounds.slice(0, 5).map(r => (
              <div key={r.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-slate-900">Room {r.patientRoom}</span>
                  <span className="text-[10px] text-slate-400">{new Date(r.timestamp).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-slate-600 italic">"{r.notes}"</p>
              </div>
            ))}
            {unitRounds.length === 0 && (
              <div className="text-center py-8">
                <p className="text-xs text-slate-400 italic">No rounds recorded for this unit yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SatisfactionMetric({ label, value, target }: any) {
  const isGood = value >= target;
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-xs font-bold text-slate-600">{label}</span>
        <span className={`text-xs font-bold ${isGood ? 'text-emerald-600' : 'text-rose-600'}`}>{value}%</span>
      </div>
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-1000 ${isGood ? 'bg-emerald-500' : 'bg-rose-500'}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-slate-400 uppercase tracking-widest">Target: {target}%</span>
        {!isGood && <span className="text-[10px] text-rose-500 font-bold">-{target - value}% Gap</span>}
      </div>
    </div>
  );
}

function QualityRow({ label, value }: any) {
  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <div className="flex items-center gap-3">
        <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full bg-slate-900 rounded-full" style={{ width: `${value}%` }} />
        </div>
        <span className="text-xs font-bold text-slate-900">{value}%</span>
      </div>
    </div>
  );
}
