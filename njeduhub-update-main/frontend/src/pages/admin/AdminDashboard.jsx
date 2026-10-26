import React, { useEffect, useState } from 'react';
import api from '../../api';
import { Inbox, GraduationCap, Trophy, ListChecks, BookOpen, Users, FileText, Quote, Image, Newspaper, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/button';

const Stat = ({ icon: Icon, label, value, sub, color }) => (
  <div className="bg-white rounded-xl border p-5">
    <div className="flex items-center justify-between">
      <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center text-white`}><Icon size={18}/></div>
      {sub != null && <span className="text-[11px] font-bold text-amber-600 bg-amber-100 rounded-full px-2 py-0.5">+{sub} new</span>}
    </div>
    <div className="mt-3 text-2xl font-extrabold text-[#0F2A5C]">{value ?? '—'}</div>
    <div className="text-xs text-slate-500 mt-0.5">{label}</div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState({ inquiries: [], admissions: [] });

  const load = async () => {
    setLoading(true);
    try {
      const [s, inq, adm] = await Promise.all([
        api.stats(),
        api.list('inquiries'),
        api.list('admissions'),
      ]);
      setStats(s);
      setRecent({ inquiries: inq.slice(0, 5), admissions: adm.slice(0, 5) });
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-extrabold text-[#0F2A5C]">Dashboard</h1>
        <Button onClick={load} variant="outline" size="sm" disabled={loading}><RefreshCw size={14} className={loading ? 'animate-spin' : ''}/> Refresh</Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat icon={Inbox}        color="bg-blue-500"   label="Total inquiries"  value={stats?.inquiries} sub={stats?.inquiries_new}/>
        <Stat icon={GraduationCap} color="bg-emerald-500" label="Admissions"       value={stats?.admissions} sub={stats?.admissions_new}/>
        <Stat icon={Trophy}       color="bg-amber-500"  label="Scholarship leads" value={stats?.scholarship} sub={stats?.scholarship_new}/>
        <Stat icon={ListChecks}   color="bg-fuchsia-500" label="Career applications" value={stats?.careers} sub={stats?.careers_new}/>
      </div>

      <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-8 mb-3">Content snapshot</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat icon={BookOpen} color="bg-slate-700" label="Courses" value={stats?.courses}/>
        <Stat icon={Users}    color="bg-slate-700" label="Faculty" value={stats?.faculty}/>
        <Stat icon={FileText} color="bg-slate-700" label="Blogs"   value={stats?.blogs}/>
        <Stat icon={Quote}    color="bg-slate-700" label="Testimonials" value={stats?.testimonials}/>
        <Stat icon={Trophy}   color="bg-slate-700" label="Toppers" value={stats?.toppers}/>
        <Stat icon={Trophy}   color="bg-slate-700" label="Results" value={stats?.results}/>
        <Stat icon={Image}    color="bg-slate-700" label="Gallery" value={stats?.gallery}/>
        <Stat icon={Newspaper} color="bg-slate-700" label="News"   value={stats?.news}/>
      </div>

      <div className="grid lg:grid-cols-2 gap-5 mt-8">
        <RecentTable title="Recent inquiries" rows={recent.inquiries} cols={[['name','Name'],['phone','Phone'],['course','Course'],['status','Status']]}/>
        <RecentTable title="Recent admissions" rows={recent.admissions} cols={[['name','Name'],['phone','Phone'],['course','Course'],['status','Status']]}/>
      </div>
    </div>
  );
};

const RecentTable = ({ title, rows, cols }) => (
  <div className="bg-white rounded-xl border">
    <div className="px-4 py-3 border-b font-bold text-[#0F2A5C]">{title}</div>
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-slate-500">
          <tr>{cols.map(([k,l]) => <th key={k} className="text-left p-3">{l}</th>)}</tr>
        </thead>
        <tbody>
          {rows.length === 0 && <tr><td colSpan={cols.length} className="p-6 text-center text-slate-400">No data yet</td></tr>}
          {rows.map((r) => (
            <tr key={r.id} className="border-t">
              {cols.map(([k]) => (
                <td key={k} className="p-3">
                  {k === 'status' ? <StatusPill v={r[k]}/> : (r[k] || '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export const StatusPill = ({ v }) => {
  const styles = {
    new: 'bg-blue-100 text-blue-700',
    contacted: 'bg-amber-100 text-amber-700',
    enrolled: 'bg-emerald-100 text-emerald-700',
    lost: 'bg-rose-100 text-rose-700',
  };
  return <span className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded-full ${styles[v] || 'bg-slate-100'}`}>{v}</span>;
};

export default AdminDashboard;
