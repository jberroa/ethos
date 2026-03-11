import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, TrendingDown, AlertCircle, CheckCircle2, 
  ArrowRight, Lightbulb, Target, ShieldAlert,
  BarChart, PieChart, Activity, Loader2, Download
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Outcome {
  id: string;
  category: string;
  score: number;
  status: 'critical' | 'warning' | 'good';
  analysis: string;
  actions: string[];
}

const mockOutcomes: Outcome[] = [
  {
    id: '1',
    category: 'Technology',
    score: 65,
    status: 'warning',
    analysis: 'Low adoption of QR code communication systems and inconsistent use of UV cleaning protocols in high-traffic zones.',
    actions: [
      'Deploy QR code signage in all public restrooms by Friday.',
      'Conduct refresher training on UV-C robot deployment schedules.',
      'Audit equipment tracking system for battery compliance.'
    ]
  },
  {
    id: '2',
    category: 'Restrooms',
    score: 42,
    status: 'critical',
    analysis: 'Significant mineral build-up on fixtures and inconsistent supply replenishment. Odor control measures are failing in the main lobby area.',
    actions: [
      'Deep clean all lobby restroom fixtures using acid-based descaler.',
      'Increase hourly rounding frequency for supply checks.',
      'Install automated odor neutralizing systems in high-volume areas.'
    ]
  },
  {
    id: '3',
    category: 'Grounds Cleaning',
    score: 88,
    status: 'good',
    analysis: 'Exterior walkways and landscaping are well-maintained. Minor debris noted near the loading dock area.',
    actions: [
      'Schedule loading dock sweep for Wednesday morning.',
      'Review exterior lighting functional report.'
    ]
  },
  {
    id: '4',
    category: 'Examination Rooms',
    score: 94,
    status: 'good',
    analysis: 'Excellent compliance with clinical cleaning standards. All supply dispensers are fully stocked and functional.',
    actions: [
      'Maintain current cleaning frequency.',
      'Recognize the night shift team for exceptional performance in clinical areas.'
    ]
  }
];

export default function LeadershipOutcomes() {
  const [generating, setGenerating] = useState(false);

  const generatePDF = async () => {
    setGenerating(true);
    try {
      const doc = new jsPDF();
      const timestamp = new Date().toLocaleString();
      
      // Header
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('Ethos Rounding Outcomes', 15, 25);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated on: ${timestamp}`, 15, 33);
      
      // Summary Stats
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(16);
      doc.text('Executive Summary', 15, 55);
      
      autoTable(doc, {
        startY: 60,
        head: [['Metric', 'Value', 'Status']],
        body: [
          ['Overall Compliance', '72.4%', 'Improving (+4.2%)'],
          ['Critical Areas', '2', 'Restrooms, Technology'],
          ['Open Action Items', '11', '4 High Priority'],
        ],
        theme: 'striped',
        headStyles: { fillColor: [15, 23, 42] }
      });

      // Detailed Analysis
      doc.setFontSize(16);
      doc.text('Detailed Category Analysis', 15, (doc as any).lastAutoTable.finalY + 15);

      const tableBody = mockOutcomes.map(o => [
        o.category,
        `${o.score}%`,
        o.status.toUpperCase(),
        o.analysis,
        o.actions.join('\n• ')
      ]);

      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 20,
        head: [['Category', 'Score', 'Status', 'Analysis', 'Action Items']],
        body: tableBody,
        theme: 'grid',
        headStyles: { fillColor: [15, 23, 42] },
        columnStyles: {
          3: { cellWidth: 50 },
          4: { cellWidth: 60 }
        },
        styles: { fontSize: 8 }
      });

      // Strategic Summary
      const finalY = (doc as any).lastAutoTable.finalY + 15;
      doc.setFontSize(14);
      doc.text('Strategic Outlook', 15, finalY);
      doc.setFontSize(10);
      const splitText = doc.splitTextToSize(
        'Based on the latest leadership rounding data, the facility is maintaining high standards in clinical areas but faces operational challenges in public-facing infrastructure. The primary focus for the next 48 hours should be the Restroom Remediation Plan and Technology Integration Audit.',
        180
      );
      doc.text(splitText, 15, finalY + 7);

      doc.save(`Ethos_Rounding_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('PDF Generation Error:', error);
      alert('Failed to generate PDF report. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm text-slate-500 font-bold uppercase tracking-wider">Overall Compliance</div>
              <div className="text-3xl font-black text-slate-900">72.4%</div>
            </div>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full w-[72%]" />
          </div>
          <p className="text-xs text-slate-400 mt-3 font-medium">+4.2% from last week</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm text-slate-500 font-bold uppercase tracking-wider">Critical Areas</div>
              <div className="text-3xl font-black text-slate-900">2</div>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <span className="px-2 py-1 bg-rose-50 text-rose-600 text-[10px] font-bold rounded uppercase">Restrooms</span>
            <span className="px-2 py-1 bg-rose-50 text-rose-600 text-[10px] font-bold rounded uppercase">Technology</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm text-slate-500 font-bold uppercase tracking-wider">Open Actions</div>
              <div className="text-3xl font-black text-slate-900">11</div>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3 font-medium">4 high priority tasks pending</p>
        </div>
      </div>

      {/* Main Analysis Grid */}
      <div className="grid grid-cols-1 gap-6">
        {mockOutcomes.map((outcome, index) => (
          <motion.div 
            key={outcome.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden"
          >
            <div className="flex flex-col md:flex-row">
              {/* Left Score Panel */}
              <div className={`md:w-48 p-8 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-slate-50 ${
                outcome.status === 'critical' ? 'bg-rose-50/30' : 
                outcome.status === 'warning' ? 'bg-amber-50/30' : 'bg-emerald-50/30'
              }`}>
                <div className={`text-4xl font-black mb-1 ${
                  outcome.status === 'critical' ? 'text-rose-600' : 
                  outcome.status === 'warning' ? 'text-amber-600' : 'text-emerald-600'
                }`}>
                  {outcome.score}%
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Compliance</div>
                <div className={`mt-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                  outcome.status === 'critical' ? 'bg-rose-100 text-rose-700' : 
                  outcome.status === 'warning' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {outcome.status}
                </div>
              </div>

              {/* Right Content Panel */}
              <div className="flex-1 p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-slate-900">{outcome.category}</h3>
                  <div className="flex items-center gap-2 text-slate-400">
                    <BarChart className="w-4 h-4" />
                    <span className="text-xs font-medium">Last 7 Days</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Analysis Section */}
                  <div>
                    <div className="flex items-center gap-2 text-slate-900 font-bold text-sm mb-3">
                      <Lightbulb className="w-4 h-4 text-amber-500" />
                      Root Cause Analysis
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      {outcome.analysis}
                    </p>
                  </div>

                  {/* Actions Section */}
                  <div>
                    <div className="flex items-center gap-2 text-slate-900 font-bold text-sm mb-3">
                      <ShieldAlert className="w-4 h-4 text-rose-500" />
                      Course of Action
                    </div>
                    <ul className="space-y-2">
                      {outcome.actions.map((action, i) => (
                        <li key={i} className="flex items-start gap-3 group">
                          <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-emerald-500 transition-colors" />
                          <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Strategic Summary */}
      <div className="bg-slate-900 rounded-3xl p-10 text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-emerald-400 rounded-xl flex items-center justify-center text-slate-900">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold">Executive Strategic Summary</h3>
          </div>
          <p className="text-slate-400 max-w-2xl leading-relaxed mb-8">
            Based on the latest leadership rounding data, the facility is maintaining high standards in clinical areas but faces operational challenges in public-facing infrastructure. The primary focus for the next 48 hours should be the <span className="text-white font-bold">Restroom Remediation Plan</span> and <span className="text-white font-bold">Technology Integration Audit</span>.
          </p>
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={generatePDF}
              disabled={generating}
              className="px-6 py-3 bg-emerald-500 text-slate-900 rounded-xl font-bold hover:bg-emerald-400 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  GENERATING...
                </>
              ) : (
                <>
                  Generate Full PDF Report <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            <button className="px-6 py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 transition-all">
              Email to Department Heads
            </button>
          </div>
        </div>
        
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 blur-[100px] -ml-32 -mb-32" />
      </div>
    </div>
  );
}
