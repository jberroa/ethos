import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, XCircle, MinusCircle, ChevronRight, ChevronDown, Save, BarChart3 } from 'lucide-react';

interface Question {
  id: string;
  text: string;
  weight: number;
}

interface Category {
  id: string;
  name: string;
  questions: Question[];
}

const categories: Category[] = [
  {
    id: 'entrance',
    name: 'Entrance and Lobby',
    questions: [
      { id: 'e1', text: 'Is the entrance area free of cigarette butts and litter?', weight: 30 },
      { id: 'e2', text: 'Is there a walk-off mat program in place?', weight: 50 },
      { id: 'e3', text: 'Does the walk-off mat program identify what size of mat is needed at each location?', weight: 30 },
      { id: 'e4', text: 'Is a mat replacement inventory maintained?', weight: 10 },
      { id: 'e5', text: 'Are walk off mats clean and in proper position?', weight: 30 },
      { id: 'e6', text: 'Are windows, glass, mirrors and doors free of marks and finger smears?', weight: 30 },
      { id: 'e7', text: 'Are cigarette urns/exterior urns, and trash containers clean and properly lined?', weight: 30 },
      { id: 'e8', text: 'Floors and edges clean of dirt, dust and litter?', weight: 50 },
      { id: 'e9', text: 'Are floors finished with depth shine or carpets clean and fresh?', weight: 30 },
      { id: 'e10', text: 'Are walls clean and free of smudges and marks?', weight: 30 },
      { id: 'e11', text: 'Are push and kick plates clean and polished?', weight: 10 },
      { id: 'e12', text: 'Are ledges, lights, vents and registers clean and free of dust?', weight: 10 },
      { id: 'e13', text: 'Are signs, plants and ornaments clean?', weight: 10 },
      { id: 'e14', text: 'Are the furniture, cabinets and locker exteriors dust free and clean?', weight: 30 },
      { id: 'e15', text: 'Are telephones clean and free of dust?', weight: 30 },
    ]
  },
  {
    id: 'restrooms',
    name: 'Restrooms',
    questions: [
      { id: 'r1', text: 'Are floors and edges clean of dirt, dust and litter?', weight: 50 },
      { id: 'r2', text: 'Are floors clean (free of dirt, spills, litter) and grout lines clean and free of dirt build-up?', weight: 10 },
      { id: 'r3', text: 'Are corners and baseboards clean?', weight: 10 },
      { id: 'r4', text: 'Are walls clean and free of smudges and marks?', weight: 30 },
      { id: 'r5', text: 'Are urinal and toilet stall partitions clean?', weight: 30 },
      { id: 'r6', text: 'Are fixtures (sinks, toilets, tubs, water fountain, etc.) soap and mineral free?', weight: 50 },
      { id: 'r7', text: 'Are fixture pipes dust free and polished?', weight: 30 },
      { id: 'r8', text: 'Are windows, glass, mirrors and doors free of marks and finger smears?', weight: 30 },
      { id: 'r9', text: 'Are waste containers clean, properly lined and in proper condition?', weight: 30 },
      { id: 'r10', text: 'Are supply dispensers clean and adequately filled?', weight: 50 },
      { id: 'r11', text: 'Is the room odor free?', weight: 10 },
    ]
  },
  {
    id: 'corridors',
    name: 'Corridors',
    questions: [
      { id: 'c1', text: 'Are floors and edges clean of dirt, dust and litter?', weight: 50 },
      { id: 'c2', text: 'Are floors finished with depth shine or carpets clean and fresh?', weight: 30 },
      { id: 'c3', text: 'Are walls clean and free of smudges and marks?', weight: 30 },
      { id: 'c4', text: 'Are ledges, lights, vents and registers clean and free of dust?', weight: 10 },
      { id: 'c5', text: 'Is the furniture, cabinets, locker exteriors dust free and clean?', weight: 30 },
      { id: 'c6', text: 'Are fixtures (sinks, water fountain, etc.) soap and mineral free?', weight: 50 },
      { id: 'c7', text: 'Are waste containers clean, properly lined and in proper condition?', weight: 30 },
      { id: 'c8', text: 'Are push and kick plates clean and polished?', weight: 10 },
      { id: 'c9', text: 'Are telephones clean and free of dust?', weight: 30 },
    ]
  },
  {
    id: 'support',
    name: 'Support Rooms',
    questions: [
      { id: 's1', text: 'Are floors and edges clean of dirt, dust and litter?', weight: 50 },
      { id: 's2', text: 'Are floors finished with depth shine or carpets clean and fresh?', weight: 30 },
      { id: 's3', text: 'Are waste containers clean, properly lined and in proper condition?', weight: 30 },
      { id: 's4', text: 'Are ledges, lights, vents and registers clean and free of dust?', weight: 10 },
      { id: 's5', text: 'Are windows, glass, mirrors and doors free of marks and finger smears?', weight: 30 },
      { id: 's6', text: 'Is the furniture, cabinets, locker exteriors dust free and clean?', weight: 30 },
      { id: 's7', text: 'Are walls clean and free of smudges and marks?', weight: 30 },
    ]
  },
  {
    id: 'exam',
    name: 'Examination Rooms',
    questions: [
      { id: 'ex1', text: 'Are waste containers clean, properly lined and in proper condition?', weight: 30 },
      { id: 'ex2', text: 'Is the room orderly including supplies and information?', weight: 10 },
      { id: 'ex3', text: 'Are floors and edges clean of dirt, dust and litter?', weight: 50 },
      { id: 'ex4', text: 'Are floors finished with depth shine or carpets clean and fresh?', weight: 30 },
      { id: 'ex5', text: 'Are walls clean and free of smudges and marks?', weight: 30 },
      { id: 'ex6', text: 'Are ledges, lights, vents and registers clean and free of dust?', weight: 10 },
      { id: 'ex7', text: 'Are windows, glass, mirrors, and doors free of marks and finger smears?', weight: 30 },
      { id: 'ex8', text: 'Are telephones clean and free of dust?', weight: 30 },
      { id: 'ex9', text: 'Is the furniture, cabinets, locker exteriors dust free and clean?', weight: 30 },
      { id: 'ex10', text: 'Is/are the examination bed(s) clean (side rails, headboard, footboard, frame and wheels)?', weight: 30 },
      { id: 'ex11', text: 'Are curtains, drapes, and linens spot and dust free?', weight: 30 },
      { id: 'ex12', text: 'Are push and kick plates clean and polished?', weight: 10 },
      { id: 'ex13', text: 'Are fixtures (sinks, toilets, tubs, water fountain, etc.) soap and mineral free?', weight: 50 },
      { id: 'ex14', text: 'Are fixture pipes dust free and polished?', weight: 30 },
      { id: 'ex15', text: 'Are supply dispensers clean and adequately filled?', weight: 50 },
      { id: 'ex16', text: 'Is the room odor free?', weight: 10 },
    ]
  },
  {
    id: 'technology',
    name: 'Technology',
    questions: [
      { id: 't1', text: 'Does the hospital use UV Cleaning?', weight: 30 },
      { id: 't2', text: 'Do they have robotics for floor care?', weight: 30 },
      { id: 't3', text: 'Do they have QR codes for visitors to communicate with housekeeping and support services?', weight: 30 },
      { id: 't4', text: 'Does the hospital have a bed cleaning system?', weight: 30 },
      { id: 't5', text: 'Do they have physical bed and stretcher maintenance program?', weight: 30 },
      { id: 't6', text: 'Do they have equipment tracking system?', weight: 30 },
    ]
  },
  {
    id: 'grounds',
    name: 'Grounds Cleaning',
    questions: [
      { id: 'g1', text: 'Are exterior walkways free of debris and litter?', weight: 30 },
      { id: 'g2', text: 'Is landscaping well-maintained and free of weeds?', weight: 20 },
      { id: 'g3', text: 'Are exterior trash receptacles clean and emptied?', weight: 30 },
      { id: 'g4', text: 'Is the parking lot free of potholes and clearly marked?', weight: 20 },
      { id: 'g5', text: 'Are exterior signs clean, visible, and in good repair?', weight: 10 },
      { id: 'g6', text: 'Are building entrances free of cobwebs and dust build-up?', weight: 20 },
      { id: 'g7', text: 'Is the loading dock area organized and free of excessive waste?', weight: 30 },
      { id: 'g8', text: 'Are exterior light fixtures clean and functional?', weight: 10 },
    ]
  }
];

type Answer = 'YES' | 'NO' | 'N/A' | null;

export default function LeadershipRounding() {
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [expandedCategory, setExpandedCategory] = useState<string | null>(categories[0].id);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [hospitalName, setHospitalName] = useState('MT. SINAI MEDICAL CENTER - 1467');
  const [isEditingHospital, setIsEditingHospital] = useState(false);

  const handleAnswer = (questionId: string, answer: Answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const calculateCategoryScore = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return { possible: 0, actual: 0, percent: 0 };

    let possible = 0;
    let actual = 0;

    category.questions.forEach(q => {
      const ans = answers[q.id];
      if (ans === 'YES') {
        possible += q.weight;
        actual += q.weight;
      } else if (ans === 'NO') {
        possible += q.weight;
      }
      // N/A doesn't count towards possible or actual
    });

    const percent = possible > 0 ? (actual / possible) * 100 : 0;
    return { possible, actual, percent };
  };

  const calculateTotalScore = () => {
    let totalPossible = 0;
    let totalActual = 0;

    categories.forEach(cat => {
      const { possible, actual } = calculateCategoryScore(cat.id);
      totalPossible += possible;
      totalActual += actual;
    });

    const totalPercent = totalPossible > 0 ? (totalActual / totalPossible) * 100 : 0;
    return { totalPossible, totalActual, totalPercent };
  };

  const { totalPossible, totalActual, totalPercent } = calculateTotalScore();

  if (isSubmitted) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-100">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900">Rounding Complete</h2>
          <p className="text-slate-500 mt-2">Leadership rounding data for <span className="font-bold text-slate-700">{hospitalName}</span> has been captured and synced.</p>
          
          <div className="mt-12 grid grid-cols-3 gap-6">
            <div className="p-6 bg-slate-50 rounded-2xl">
              <div className="text-sm text-slate-500 uppercase tracking-wider font-bold mb-1">Actual Score</div>
              <div className="text-4xl font-black text-slate-900">{totalActual}</div>
            </div>
            <div className="p-6 bg-emerald-600 rounded-2xl text-white">
              <div className="text-sm opacity-80 uppercase tracking-wider font-bold mb-1">Final Percent</div>
              <div className="text-4xl font-black">{totalPercent.toFixed(1)}%</div>
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl">
              <div className="text-sm text-slate-500 uppercase tracking-wider font-bold mb-1">Possible Score</div>
              <div className="text-4xl font-black text-slate-900">{totalPossible}</div>
            </div>
          </div>

          <button 
            onClick={() => setIsSubmitted(false)}
            className="mt-12 px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all"
          >
            Start New Rounding
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {categories.map(cat => {
            const { percent } = calculateCategoryScore(cat.id);
            return (
              <div key={cat.id} className="bg-white p-6 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900">{cat.name}</h4>
                  <p className="text-sm text-slate-500">Departmental Score</p>
                </div>
                <div className={`text-2xl font-black ${percent >= 90 ? 'text-emerald-500' : percent >= 70 ? 'text-amber-500' : 'text-rose-500'}`}>
                  {percent.toFixed(0)}%
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Summary Header */}
      <div className="bg-slate-900 rounded-3xl p-8 text-white flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-400 rounded-xl flex items-center justify-center text-slate-900">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold">Live Score Summary</h3>
            {isEditingHospital ? (
              <div className="flex items-center gap-2 mt-1">
                <input 
                  type="text"
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                  onBlur={() => setIsEditingHospital(false)}
                  onKeyDown={(e) => e.key === 'Enter' && setIsEditingHospital(false)}
                  autoFocus
                  className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm text-white focus:ring-2 focus:ring-emerald-400 outline-none w-full max-w-md"
                />
              </div>
            ) : (
              <p 
                className="text-slate-400 text-sm cursor-pointer hover:text-white transition-colors flex items-center gap-2"
                onClick={() => setIsEditingHospital(true)}
              >
                {hospitalName}
                <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded uppercase font-bold tracking-tighter">Click to edit</span>
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-8">
          <div className="text-right">
            <div className="text-xs uppercase tracking-widest text-slate-400 font-bold">Current Percent</div>
            <div className="text-3xl font-black text-emerald-400">{totalPercent.toFixed(1)}%</div>
          </div>
          <div className="text-right">
            <div className="text-xs uppercase tracking-widest text-slate-400 font-bold">Points</div>
            <div className="text-3xl font-black">{totalActual} / {totalPossible}</div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-4">
        {categories.map((category) => (
          <div key={category.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <button
              onClick={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-900">{category.name}</span>
                <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-bold uppercase">
                  {category.questions.length} Points
                </span>
              </div>
              {expandedCategory === category.id ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
            </button>

            {expandedCategory === category.id && (
              <div className="px-6 pb-6 space-y-4 border-t border-slate-100 pt-4">
                {category.questions.map((q) => (
                  <div key={q.id} className="flex items-center justify-between gap-6 py-2">
                    <div className="flex-1">
                      <p className="text-sm text-slate-700 font-medium">{q.text}</p>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Weight: {q.weight}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAnswer(q.id, 'YES')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                          answers[q.id] === 'YES' 
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-600 shadow-sm' 
                            : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> YES
                      </button>
                      <button
                        onClick={() => handleAnswer(q.id, 'NO')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                          answers[q.id] === 'NO' 
                            ? 'bg-rose-50 border-rose-200 text-rose-600 shadow-sm' 
                            : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                        }`}
                      >
                        <XCircle className="w-3.5 h-3.5" /> NO
                      </button>
                      <button
                        onClick={() => handleAnswer(q.id, 'N/A')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                          answers[q.id] === 'N/A' 
                            ? 'bg-slate-50 border-slate-200 text-slate-600 shadow-sm' 
                            : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                        }`}
                      >
                        <MinusCircle className="w-3.5 h-3.5" /> N/A
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Submit Button */}
      <div className="pt-6">
        <button
          onClick={() => setIsSubmitted(true)}
          className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all flex items-center justify-center gap-3"
        >
          <Save className="w-6 h-6" /> Submit Leadership Rounding
        </button>
      </div>
    </div>
  );
}
