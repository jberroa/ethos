import React, { useState, useEffect } from 'react';
import { ClipboardCheck, User, MapPin, MessageSquare, Clock, Smile, Send, Loader2, ChevronDown, CheckCircle2, Search } from 'lucide-react';
import { analyzeRound } from '../services/geminiService';
import { submitRound, fetchRooms, addActionItem, fetchManagers } from '../services/api';
import { Room } from '../types';
import { motion, AnimatePresence } from 'motion/react';

const DEPARTMENT_QUESTIONS: Record<string, any[]> = {
  'EVS': [
    { id: 'room_clean', label: 'Is the room visually clean?', type: 'boolean' },
    { id: 'bathroom_clean', label: 'Is the bathroom clean and stocked?', type: 'boolean' },
    { id: 'knows_housekeeper', label: 'Does the patient know their housekeeper\'s name?', type: 'boolean' },
    { id: 'used_script', label: 'Did the staff use the service script?', type: 'boolean' }
  ],
  'Food Service': [
    { id: 'food_temp', label: 'Was the food at the right temperature?', type: 'boolean' },
    { id: 'order_accuracy', label: 'Was the order 100% accurate?', type: 'boolean' },
    { id: 'staff_courtesy', label: 'Was the server courteous?', type: 'boolean' }
  ],
  'Nursing': [
    { id: 'pain_managed', label: 'Is pain being managed effectively?', type: 'boolean' },
    { id: 'call_light', label: 'Was the call light answered promptly?', type: 'boolean' },
    { id: 'safety_check', label: 'Bed in low position & rails up?', type: 'boolean' }
  ]
};

export default function RoundingForm({ currentUser, onComplete }: { currentUser: any, onComplete: () => void }) {
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showChecklist, setShowChecklist] = useState(false);
  const [roomSearch, setRoomSearch] = useState('');
  const [isRoomDropdownOpen, setIsRoomDropdownOpen] = useState(false);
  const [formData, setFormData] = useState({
    managerId: currentUser.id,
    managerName: currentUser.name,
    department: currentUser.department || 'EVS',
    patientRoom: '',
    patientName: '',
    notes: '',
    mood: 'Neutral',
    durationMinutes: 5,
    checklistData: {} as Record<string, boolean>
  });

  useEffect(() => {
    fetchRooms().then(setRooms);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const analysis = await analyzeRound(formData.notes);
      
      await submitRound({
        ...formData,
        authenticityScore: analysis.authenticityScore,
        sentimentScore: analysis.sentimentScore,
        mood: analysis.detectedMood as any,
        checklistData: formData.checklistData
      });

      // If AI suggested actions, add them to strategy room
      if (analysis.suggestedActions) {
        for (const action of analysis.suggestedActions) {
          await addActionItem(action);
        }
      }
      
      setFormData({
        ...formData,
        patientRoom: '',
        patientName: '',
        notes: '',
        durationMinutes: 5,
        checklistData: {}
      });
      setRoomSearch('');
      setShowChecklist(false);
      onComplete();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const currentQuestions = DEPARTMENT_QUESTIONS[formData.department] || [];

  const filteredRooms = rooms.filter(r => 
    r.roomNumber.toLowerCase().includes(roomSearch.toLowerCase()) ||
    r.unit.toLowerCase().includes(roomSearch.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100"
    >
      <div className="bg-slate-900 p-8 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-500/20">
              <ClipboardCheck className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Smart Quality Round</h2>
              <p className="text-slate-400 text-sm">AI-Enhanced Patient Interaction</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Manager</div>
            <div className="font-semibold text-emerald-400">{formData.managerName}</div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" /> Authenticated Manager
            </label>
            <div className="w-full px-5 py-3 rounded-2xl bg-slate-100 border border-slate-200 text-slate-600 font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {currentUser.name}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-400" /> Department
            </label>
            <select
              className="w-full px-5 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all appearance-none"
              value={formData.department}
              onChange={e => setFormData({...formData, department: e.target.value as any, checklistData: {}})}
            >
              <option value="EVS">EVS</option>
              <option value="Food Service">Food Service</option>
              <option value="Nursing">Nursing</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2 relative">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-400" /> Search Room
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="Type room number or unit..."
                className="w-full px-5 py-3 pl-12 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                value={roomSearch || formData.patientRoom}
                onFocus={() => setIsRoomDropdownOpen(true)}
                onChange={e => {
                  setRoomSearch(e.target.value);
                  setFormData({...formData, patientRoom: e.target.value});
                  setIsRoomDropdownOpen(true);
                }}
              />
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            </div>
            
            <AnimatePresence>
              {isRoomDropdownOpen && (roomSearch || filteredRooms.length > 0) && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute z-50 w-full mt-2 bg-white rounded-2xl border border-slate-200 shadow-2xl max-h-60 overflow-y-auto"
                >
                  {filteredRooms.length > 0 ? (
                    filteredRooms.map(r => (
                      <button
                        key={r.id}
                        type="button"
                        className="w-full px-5 py-3 text-left hover:bg-slate-50 flex items-center justify-between group transition-colors"
                        onClick={() => {
                          setFormData({...formData, patientRoom: r.roomNumber});
                          setRoomSearch(`Room ${r.roomNumber}`);
                          setIsRoomDropdownOpen(false);
                        }}
                      >
                        <div>
                          <div className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">Room {r.roomNumber}</div>
                          <div className="text-xs text-slate-500">{r.unit}</div>
                        </div>
                        <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Select</div>
                      </button>
                    ))
                  ) : (
                    <div className="px-5 py-4 text-sm text-slate-500 italic">
                      No matching rooms found. Using "{roomSearch}"
                    </div>
                  )}
                  <button
                    type="button"
                    className="w-full px-5 py-3 text-left hover:bg-slate-50 border-t border-slate-100 text-xs font-bold text-emerald-600 uppercase tracking-widest"
                    onClick={() => setIsRoomDropdownOpen(false)}
                  >
                    Close Results
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Department Specific Checklist */}
        {currentQuestions.length > 0 && (
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
            <button 
              type="button"
              onClick={() => setShowChecklist(!showChecklist)}
              className="w-full flex items-center justify-between text-slate-900 font-bold"
            >
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" /> {formData.department} Quality Checklist
              </span>
              <ChevronDown className={`w-5 h-5 transition-transform ${showChecklist ? 'rotate-180' : ''}`} />
            </button>
            
            <AnimatePresence>
              {showChecklist && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-6 space-y-4">
                    {currentQuestions.map(q => (
                      <div key={q.id} className="flex items-center justify-between">
                        <span className="text-sm text-slate-600 font-medium">{q.label}</span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setFormData({...formData, checklistData: {...formData.checklistData, [q.id]: true}})}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${formData.checklistData[q.id] === true ? 'bg-emerald-500 text-white' : 'bg-white text-slate-400 border border-slate-200'}`}
                          >
                            YES
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData({...formData, checklistData: {...formData.checklistData, [q.id]: false}})}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${formData.checklistData[q.id] === false ? 'bg-rose-500 text-white' : 'bg-white text-slate-400 border border-slate-200'}`}
                          >
                            NO
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-slate-400" /> Interaction Notes
          </label>
          <textarea
            required
            rows={4}
            className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none"
            value={formData.notes}
            onChange={e => setFormData({...formData, notes: e.target.value})}
            placeholder="Describe the interaction. AI will analyze this for behavioral insights..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" /> Duration
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="30"
                className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                value={formData.durationMinutes}
                onChange={e => setFormData({...formData, durationMinutes: parseInt(e.target.value)})}
              />
              <span className="text-sm font-bold text-slate-900 w-12">{formData.durationMinutes}m</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Smile className="w-4 h-4 text-slate-400" /> Patient Mood
            </label>
            <div className="flex gap-2">
              {['Negative', 'Neutral', 'Positive'].map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setFormData({...formData, mood: m})}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    formData.mood === m 
                      ? 'bg-slate-900 text-white shadow-lg' 
                      : 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {m.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          disabled={loading}
          className="w-full py-5 bg-emerald-500 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              AI ANALYZING...
            </>
          ) : (
            <>
              <Send className="w-6 h-6" />
              SUBMIT ROUND
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
}

function Building2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
      <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
      <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
      <path d="M10 6h4" />
      <path d="M10 10h4" />
      <path d="M10 14h4" />
      <path d="M10 18h4" />
    </svg>
  );
}
