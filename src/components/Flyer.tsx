import React from 'react';
import { 
  Activity, ClipboardList, UserCircle, Heart, 
  LayoutDashboard, Zap, Building2, ShieldCheck, 
  TrendingUp, CheckCircle2, Globe, Mail, Phone
} from 'lucide-react';
import { motion } from 'motion/react';

export default function Flyer() {
  return (
    <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-3xl overflow-hidden border border-slate-200 my-8">
      {/* Header Section */}
      <div className="bg-slate-900 text-white p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full -ml-32 -mb-32 blur-3xl" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-emerald-400 rounded-xl flex items-center justify-center">
              <Activity className="w-7 h-7 text-slate-900" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              Ethos <span className="text-slate-400 font-light">Rounding</span>
              <span className="block text-xs uppercase tracking-[0.3em] text-emerald-400 mt-1 font-medium">Powered by Before & After Proof</span>
            </h1>
          </div>
          
          <h2 className="text-5xl font-extrabold leading-tight mb-6 max-w-2xl">
            Behavioral Intelligence for <span className="text-emerald-400 underline decoration-emerald-400/30 underline-offset-8">High-Performance</span> Healthcare.
          </h2>
          
          <p className="text-xl text-slate-300 max-w-2xl font-light leading-relaxed">
            The only rounding platform that analyzes manager behavior, rounding authenticity, and quality patterns to drive real patient outcomes.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-12 space-y-16">
        
        {/* Value Propositions */}
        <div className="grid grid-cols-3 gap-8">
          <div className="space-y-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="font-bold text-slate-900">Authenticity Guard</h3>
            <p className="text-sm text-slate-500 leading-relaxed">Verify that rounding is actually happening with behavioral pattern detection and geolocation verification.</p>
          </div>
          <div className="space-y-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-bold text-slate-900">Experience Correlation</h3>
            <p className="text-sm text-slate-500 leading-relaxed">Directly link manager rounding frequency and quality to customer satisfaction and loyalty metrics.</p>
          </div>
          <div className="space-y-3">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-bold text-slate-900">AI Interventions</h3>
            <p className="text-sm text-slate-500 leading-relaxed">Predictive analytics identify units at risk before quality metrics drop, providing actionable strategy rooms.</p>
          </div>
        </div>

        {/* The Modules Section */}
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-600">The Platform Ecosystem</h3>
            <h4 className="text-3xl font-bold text-slate-900">A Comprehensive Solution</h4>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {[
              { icon: <ClipboardList />, title: "Quality Rounding Tool", desc: "Intuitive interface for managers to capture meaningful patient interactions and safety checks." },
              { icon: <LayoutDashboard />, title: "Executive Insights", desc: "Real-time visibility into hospital-wide rounding performance and behavioral trends." },
              { icon: <UserCircle />, title: "Manager Performance Hub", desc: "Gamified tracking for quotas, awards, and personal professional growth metrics." },
              { icon: <Heart />, title: "Customer Experience Index", desc: "Advanced data mapping between rounding behaviors and customer experience outcomes." },
              { icon: <Zap />, title: "Strategy Room", desc: "Collaborative space for leadership to deploy AI-driven quality improvement interventions." },
              { icon: <Building2 />, title: "Room Registry", desc: "Dynamic inventory management ensuring every patient bed is accounted for in the rounding cycle." },
            ].map((module, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-2xl border border-slate-100 hover:border-emerald-200 transition-colors bg-slate-50/50">
                <div className="shrink-0 w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-slate-600">
                  {React.cloneElement(module.icon as React.ReactElement, { className: "w-5 h-5" })}
                </div>
                <div>
                  <h5 className="font-bold text-slate-900 text-sm">{module.title}</h5>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{module.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Results Section */}
        <div className="bg-emerald-600 rounded-3xl p-10 text-white flex items-center justify-between gap-8">
          <div className="space-y-4 max-w-md">
            <h4 className="text-2xl font-bold">Proven Outcomes</h4>
            <p className="text-emerald-50 font-light">Ethos transforms management behavior by fostering accountability and authentic engagement, creating a culture of excellence that directly elevates the customer experience.</p>
            <div className="flex gap-4 pt-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span className="text-sm font-medium">Reduced Burnout</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span className="text-sm font-medium">Verified Quality</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 shrink-0">
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl text-center border border-white/20">
              <div className="text-3xl font-bold">15%</div>
              <div className="text-[10px] uppercase tracking-wider opacity-70">Safety Incidents</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl text-center border border-white/20">
              <div className="text-3xl font-bold">98%</div>
              <div className="text-[10px] uppercase tracking-wider opacity-70">Rounding Compliance</div>
            </div>
          </div>
        </div>

        {/* Footer / Contact */}
        <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 tracking-tight leading-none">Ethos Rounding</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">Powered by Before & After Proof</span>
            </div>
          </div>
          
          <div className="flex gap-8 text-slate-500 text-sm">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span>beforeafterproof.com</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span>contact@beforeafterproof.com</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Print Helper */}
      <div className="bg-slate-50 p-4 text-center text-[10px] text-slate-400 uppercase tracking-[0.2em] font-medium">
        Confidential & Proprietary • Ethos Behavioral Intelligence Engine v2.5
      </div>
    </div>
  );
}
