import React, { useEffect, useState } from 'react';
import api from '../../api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/ui/select';
import { Download, Trash2, RefreshCw, Search, Eye, X, Plus, Edit, Save } from 'lucide-react';
import { StatusPill } from './AdminDashboard';
import { useToast } from '../../hooks/use-toast';

// Per-lead-type schema: which fields to show, labels, and input types.
const SCHEMAS = {
  inquiries: {
    label: 'Inquiries',
    cols: [['name','Name'],['phone','Phone'],['email','Email'],['city','City'],['course','Course'],['message','Message']],
    fields: [
      ['name','Name *','text'], ['phone','Phone *','text'], ['email','Email *','email'],
      ['city','City','text'], ['course','Course (slug)','text'],
      ['message','Message','textarea'],
    ],
    blank: { name:'', phone:'', email:'', city:'', course:'', message:'', status:'new' },
  },
  admissions: {
    label: 'Admissions',
    cols: [['name','Name'],['phone','Phone'],['email','Email'],['city','City'],['course','Course'],['stream','Std.'],['mode','Mode']],
    fields: [
      ['name','Name *','text'], ['phone','Phone *','text'], ['email','Email *','email'],
      ['dob','Date of birth','text'], ['gender','Gender','text'], ['city','City','text'],
      ['father','Father','text'], ['mother','Mother','text'],
      ['school','School / College','text'], ['stream','Current std.','text'], ['percent','Last %','text'],
      ['course','Course (slug)','text'], ['mode','Mode','text'],
      ['message','Notes','textarea'],
    ],
    blank: { name:'', phone:'', email:'', dob:'', gender:'', city:'', father:'', mother:'', school:'', stream:'', percent:'', course:'', mode:'', message:'', status:'new' },
  },
  scholarship: {
    label: 'Scholarship',
    cols: [['name','Name'],['phone','Phone'],['email','Email'],['city','City'],['standard','Std.']],
    fields: [
      ['name','Name *','text'], ['phone','Phone *','text'], ['email','Email *','email'],
      ['standard','Current std.','text'], ['city','City','text'],
    ],
    blank: { name:'', phone:'', email:'', standard:'', city:'', status:'new' },
  },
  careers: {
    label: 'Careers',
    cols: [['name','Name'],['phone','Phone'],['email','Email'],['role','Role'],['message','Cover note']],
    fields: [
      ['name','Name *','text'], ['phone','Phone *','text'], ['email','Email *','email'],
      ['role','Role','text'], ['message','Cover note','textarea'],
    ],
    blank: { name:'', phone:'', email:'', role:'', message:'', status:'new' },
  },
};

const STATUSES = ['all','new','contacted','enrolled','lost'];

const AdminLeads = ({ path }) => {
  const schema = SCHEMAS[path];
  const { toast } = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('all');
  const [q, setQ] = useState('');
  const [view, setView] = useState(null);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.list(path);
      setRows(data);
    } catch (e) {
      const status = e?.response?.status;
      toast({ title: status === 401 ? 'Session expired' : 'Could not load', description: status === 401 ? 'Please sign in again.' : e?.message });
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [path]);

  const filtered = rows.filter((r) =>
    (status === 'all' || r.status === status) &&
    (q === '' || JSON.stringify(r).toLowerCase().includes(q.toLowerCase()))
  );

  const setStatusFor = async (id, s) => {
    try {
      await api.patchStatus(path, id, s);
      setRows(rs => rs.map(r => r.id === id ? { ...r, status: s } : r));
      toast({ title: 'Status updated' });
    } catch (e) {
      toast({ title: 'Error', description: e?.response?.data?.detail || e?.message });
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this entry?')) return;
    try {
      await api.remove(path, id);
      setRows(rs => rs.filter(r => r.id !== id));
      toast({ title: 'Deleted' });
    } catch (e) {
      toast({ title: 'Could not delete', description: e?.response?.data?.detail || e?.message });
    }
  };

  const save = async () => {
    if (!editing.name || !editing.phone || !editing.email) {
      toast({ title: 'Name, phone and email are required' });
      return;
    }
    setSaving(true);
    try {
      const payload = { ...editing };
      delete payload.created_at;
      if (payload.id) {
        await api.update(path, payload.id, payload);
      } else {
        delete payload.id;
        await api.create(path, payload);
      }
      toast({ title: 'Saved' });
      setEditing(null);
      load();
    } catch (e) {
      const status = e?.response?.status;
      if (status === 401) toast({ title: 'Session expired', description: 'Please sign in again.' });
      else toast({ title: 'Error saving', description: e?.response?.data?.detail || e?.message || 'Unknown error' });
    } finally { setSaving(false); }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h1 className="text-2xl font-extrabold text-[#0F2A5C]">{schema.label} ({rows.length})</h1>
        <div className="flex gap-2 flex-wrap">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
            <Input placeholder="Search" value={q} onChange={e=>setQ(e.target.value)} className="pl-9 w-64 h-9 bg-white"/>
          </div>
          <div className="flex gap-1 bg-white border rounded-md p-1">
            {STATUSES.map(s => (
              <button key={s} onClick={() => setStatus(s)} className={`px-2.5 py-1 text-xs font-bold rounded uppercase ${status===s ? 'bg-[#0F2A5C] text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{s}</button>
            ))}
          </div>
          <a href={api.csvUrl(path)} target="_blank" rel="noreferrer">
            <Button variant="outline" size="sm"><Download size={14}/> CSV</Button>
          </a>
          <Button onClick={load} variant="outline" size="sm" disabled={loading}><RefreshCw size={14} className={loading?'animate-spin':''}/></Button>
          <Button onClick={() => setEditing({ ...schema.blank })} className="bg-[#F5B921] hover:bg-[#e3a911] text-[#0F2A5C] font-bold" size="sm"><Plus size={14}/> New</Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              {schema.cols.map(([k,l]) => <th key={k} className="text-left p-3 text-xs uppercase tracking-wider text-slate-500">{l}</th>)}
              <th className="text-left p-3 text-xs uppercase tracking-wider text-slate-500">Status</th>
              <th className="text-right p-3 text-xs uppercase tracking-wider text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && <tr><td colSpan={schema.cols.length + 2} className="p-8 text-center text-slate-400">No entries</td></tr>}
            {filtered.map((r) => (
              <tr key={r.id} className="border-t hover:bg-slate-50">
                {schema.cols.map(([k]) => <td key={k} className="p-3 max-w-[180px] truncate">{r[k] || '—'}</td>)}
                <td className="p-3">
                  <Select value={r.status} onValueChange={(v)=>setStatusFor(r.id, v)}>
                    <SelectTrigger className="h-7 w-32 text-xs"><SelectValue/></SelectTrigger>
                    <SelectContent>
                      {['new','contacted','enrolled','lost'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </td>
                <td className="p-3 text-right whitespace-nowrap">
                  <button onClick={()=>setView(r)} className="p-1.5 rounded hover:bg-slate-100" title="View"><Eye size={14}/></button>
                  <button onClick={()=>setEditing({ ...schema.blank, ...r })} className="p-1.5 rounded hover:bg-slate-100 ml-1" title="Edit"><Edit size={14}/></button>
                  <button onClick={()=>remove(r.id)} className="p-1.5 rounded hover:bg-rose-50 text-rose-600 ml-1" title="Delete"><Trash2 size={14}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View detail modal */}
      {view && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={()=>setView(null)}>
          <div onClick={e=>e.stopPropagation()} className="bg-white rounded-xl max-w-lg w-full p-6">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wider">{schema.label} detail</div>
                <h3 className="text-xl font-extrabold text-[#0F2A5C]">{view.name}</h3>
              </div>
              <button onClick={()=>setView(null)} className="p-1 rounded hover:bg-slate-100"><X size={18}/></button>
            </div>
            <div className="flex items-center gap-2 mb-3"><StatusPill v={view.status}/></div>
            <div className="space-y-1 text-sm">
              {Object.entries(view).filter(([k]) => !['id','_id','status','created_at'].includes(k)).map(([k,v]) => (
                <div key={k} className="flex justify-between gap-3 py-1 border-b border-dashed">
                  <span className="text-slate-500 capitalize">{k}</span>
                  <span className="font-semibold text-slate-800 text-right break-words max-w-[60%]">{String(v) || '—'}</span>
                </div>
              ))}
              <div className="text-xs text-slate-400 pt-2">Received: {new Date(view.created_at).toLocaleString()}</div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center p-4 overflow-y-auto" onClick={()=>setEditing(null)}>
          <div onClick={e=>e.stopPropagation()} className="bg-white rounded-xl max-w-2xl w-full p-6 my-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-extrabold text-[#0F2A5C]">{editing.id ? 'Edit' : 'New'} {schema.label.replace(/s$/,'')}</h3>
              <button onClick={()=>setEditing(null)} className="p-1 rounded hover:bg-slate-100"><X size={18}/></button>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {schema.fields.map(([k, label, type]) => {
                const wide = type === 'textarea' ? 'sm:col-span-2' : '';
                const val = editing[k] ?? '';
                if (type === 'textarea') return (
                  <div key={k} className={wide}>
                    <label className="text-xs font-semibold text-slate-600">{label}</label>
                    <Textarea className="min-h-[100px]" value={val} onChange={e=>setEditing(p=>({...p,[k]:e.target.value}))}/>
                  </div>
                );
                return (
                  <div key={k}>
                    <label className="text-xs font-semibold text-slate-600">{label}</label>
                    <Input type={type === 'email' ? 'email' : 'text'} value={val} onChange={e=>setEditing(p=>({...p,[k]:e.target.value}))}/>
                  </div>
                );
              })}
              <div>
                <label className="text-xs font-semibold text-slate-600">Status</label>
                <Select value={editing.status || 'new'} onValueChange={(v)=>setEditing(p=>({...p, status: v}))}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent>
                    {['new','contacted','enrolled','lost'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <Button variant="outline" onClick={()=>setEditing(null)}>Cancel</Button>
              <Button onClick={save} disabled={saving} className="bg-[#F5B921] hover:bg-[#e3a911] text-[#0F2A5C] font-bold">
                <Save size={14}/> {saving ? 'Saving…' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLeads;
