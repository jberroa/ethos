import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  UserPlus, Users, Mail, Building, 
  Shield, Trash2, CheckCircle2, Search,
  Filter, MoreVertical, User, Loader2,
  Download, FileCode
} from 'lucide-react';
import { fetchManagers, addManager, updateManagerStatus, deleteManager as apiDeleteManager, updateManager } from '../services/api';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface Manager {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  department: string;
  role: string;
  status: 'active' | 'inactive';
  roundsCount: number;
  permissions: string[];
}

const AVAILABLE_PERMISSIONS = [
  { id: 'rounding', label: 'Rounding Tool' },
  { id: 'leadership', label: 'Leadership Rounding' },
  { id: 'manager', label: 'Manager Hub' },
  { id: 'director', label: 'Director Control' },
  { id: 'satisfaction', label: 'Patient Satisfaction' },
  { id: 'dashboard', label: 'Executive Insights' },
  { id: 'strategy', label: 'Strategy Room' },
  { id: 'rooms', label: 'Room Registry' },
  { id: 'flyer', label: 'Client Flyer' },
  { id: 'leadership_outcomes', label: 'Rounding Outcomes' },
];

export default function DirectorTab() {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [editingManager, setEditingManager] = useState<Manager | null>(null);
  const [newManager, setNewManager] = useState({
    employeeId: '',
    name: '',
    email: '',
    department: '',
    role: '',
    permissions: ['rounding'] as string[]
  });

  useEffect(() => {
    loadManagers();
  }, []);

  const handleDownloadSource = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch('/api/dev/source');
      if (!response.ok) throw new Error('Failed to fetch source code');
      
      const files = await response.json();
      const zip = new JSZip();
      
      files.forEach((file: { path: string, content: string }) => {
        zip.file(file.path, file.content);
      });
      
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `ethos-rounding-source-${new Date().toISOString().split('T')[0]}.zip`);
    } catch (err) {
      console.error('Download failed', err);
      alert('Failed to download source code. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const loadManagers = async () => {
    setLoading(true);
    try {
      const data = await fetchManagers();
      setManagers(data);
    } catch (err) {
      console.error('Failed to load managers', err);
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (permId: string) => {
    if (editingManager) {
      setEditingManager(prev => {
        if (!prev) return null;
        const perms = prev.permissions || [];
        return {
          ...prev,
          permissions: perms.includes(permId)
            ? perms.filter(p => p !== permId)
            : [...perms, permId]
        };
      });
    } else {
      setNewManager(prev => {
        const perms = prev.permissions || [];
        return {
          ...prev,
          permissions: perms.includes(permId)
            ? perms.filter(p => p !== permId)
            : [...perms, permId]
        };
      });
    }
  };

  const handleAddManager = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingManager) {
      try {
        await updateManager(editingManager.id, editingManager);
        await loadManagers();
        setEditingManager(null);
      } catch (err) {
        console.error('Failed to update manager', err);
      }
      return;
    }

    const manager = {
      id: `MGR-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      ...newManager,
      status: 'active',
      roundsCount: 0
    };
    
    try {
      await addManager(manager);
      await loadManagers();
      setNewManager({ employeeId: '', name: '', email: '', department: '', role: '', permissions: ['rounding'] });
      setIsAdding(false);
    } catch (err) {
      console.error('Failed to add manager', err);
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await updateManagerStatus(id, newStatus);
      await loadManagers();
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handleDeleteManager = async (id: string) => {
    if (confirm('Are you sure you want to remove this manager profile?')) {
      try {
        await apiDeleteManager(id);
        await loadManagers();
      } catch (err) {
        console.error('Failed to delete manager', err);
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Director Control Center</h2>
          <p className="text-slate-500 mt-1">Manage manager profiles and rounding permissions.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleDownloadSource}
            disabled={isDownloading}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-900 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50"
          >
            {isDownloading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <FileCode className="w-5 h-5" />
            )}
            {isDownloading ? 'Preparing Source...' : 'Download Source Code'}
          </button>
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg"
          >
            <UserPlus className="w-5 h-5" /> Create Manager Profile
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Managers</span>
          </div>
          <div className="text-3xl font-black text-slate-900">{managers.length}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Active Rounders</span>
          </div>
          <div className="text-3xl font-black text-slate-900">{managers.filter(m => m.status === 'active').length}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Shield className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">System Admins</span>
          </div>
          <div className="text-3xl font-black text-slate-900">2</div>
        </div>
      </div>

      {/* Manager List */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search managers..." 
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 outline-none"
              />
            </div>
            <button className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-slate-900">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-20 flex flex-col items-center justify-center text-slate-400">
              <Loader2 className="w-10 h-10 animate-spin mb-4" />
              <p className="font-medium">Loading manager profiles...</p>
            </div>
          ) : managers.length === 0 ? (
            <div className="p-20 flex flex-col items-center justify-center text-slate-400">
              <Users className="w-10 h-10 mb-4 opacity-20" />
              <p className="font-medium">No manager profiles found.</p>
              <button onClick={() => setIsAdding(true)} className="mt-4 text-slate-900 font-bold hover:underline">Create your first profile</button>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">
                  <th className="px-6 py-4">Manager</th>
                  <th className="px-6 py-4">Emp ID</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Permissions</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Rounds</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {managers.map((manager) => (
                  <tr key={manager.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold">
                          {manager.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{manager.name}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {manager.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono text-slate-600">{manager.employeeId}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                        <Building className="w-4 h-4 text-slate-400" /> {manager.department}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">{manager.role}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {manager.permissions?.map(p => {
                          const label = AVAILABLE_PERMISSIONS.find(ap => ap.id === p)?.label || p;
                          return (
                            <span key={p} className="px-1.5 py-0.5 bg-slate-100 text-[9px] font-bold text-slate-500 rounded uppercase tracking-tighter">
                              {label}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => toggleStatus(manager.id, manager.status)}
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                          manager.status === 'active' 
                            ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
                            : 'bg-slate-100 border-slate-200 text-slate-400'
                        }`}
                      >
                        {manager.status}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-slate-900">{manager.roundsCount}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setEditingManager(manager)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200 transition-all"
                        >
                          <MoreVertical className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteManager(manager.id)}
                          className="p-2 hover:bg-rose-100 rounded-lg text-slate-400 hover:text-rose-600 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add/Edit Manager Modal */}
      {(isAdding || editingManager) && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
          >
            <div className="p-8 border-b border-slate-100">
              <h3 className="text-2xl font-bold text-slate-900">{editingManager ? 'Edit Manager Profile' : 'New Manager Profile'}</h3>
              <p className="text-slate-500">{editingManager ? 'Update team member details and access.' : 'Grant rounding access to a new team member.'}</p>
            </div>
            <form onSubmit={handleAddManager} className="p-8 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      required
                      type="text" 
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none"
                      placeholder="e.g. Jane Smith"
                      value={editingManager ? editingManager.name : newManager.name}
                      onChange={e => editingManager 
                        ? setEditingManager({ ...editingManager, name: e.target.value })
                        : setNewManager({ ...newManager, name: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Employee ID</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none"
                    placeholder="e.g. 55892"
                    value={editingManager ? editingManager.employeeId : newManager.employeeId}
                    onChange={e => editingManager
                      ? setEditingManager({ ...editingManager, employeeId: e.target.value })
                      : setNewManager({ ...newManager, employeeId: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    required
                    type="email" 
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none"
                    placeholder="jane.smith@hospital.com"
                    value={editingManager ? editingManager.email : newManager.email}
                    onChange={e => editingManager
                      ? setEditingManager({ ...editingManager, email: e.target.value })
                      : setNewManager({ ...newManager, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Department</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none"
                    placeholder="e.g. ICU"
                    value={editingManager ? editingManager.department : newManager.department}
                    onChange={e => editingManager
                      ? setEditingManager({ ...editingManager, department: e.target.value })
                      : setNewManager({ ...newManager, department: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Role</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none"
                    placeholder="e.g. Supervisor"
                    value={editingManager ? editingManager.role : newManager.role}
                    onChange={e => editingManager
                      ? setEditingManager({ ...editingManager, role: e.target.value })
                      : setNewManager({ ...newManager, role: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">View Permissions</label>
                <div className="grid grid-cols-2 gap-2">
                  {AVAILABLE_PERMISSIONS.map(perm => {
                    const isSelected = editingManager 
                      ? editingManager.permissions.includes(perm.id)
                      : newManager.permissions.includes(perm.id);
                    
                    return (
                      <button
                        key={perm.id}
                        type="button"
                        onClick={() => togglePermission(perm.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        <div className={`w-3 h-3 rounded-sm border ${
                          isSelected ? 'bg-emerald-400 border-emerald-400' : 'border-slate-300'
                        }`} />
                        {perm.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setEditingManager(null);
                  }}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg"
                >
                  {editingManager ? 'Update Profile' : 'Create Profile'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
