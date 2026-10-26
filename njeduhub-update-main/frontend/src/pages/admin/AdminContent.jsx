import React, { useEffect, useState } from 'react';
import api from '../../api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Plus, Trash2, Edit, X, RefreshCw, Save } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import ImageUploadField, { resolveUrl } from '../../components/ImageUploadField';

const SITE_SETTINGS_FIELDS = [
  { key: 'site_name', label: 'Site name', type: 'text', defaultValue: 'Gurukul Classes' },
  { key: 'site_tagline', label: 'Tagline', type: 'text', defaultValue: 'Inclusive Personalised JEE & NEET Coaching' },
  { key: 'site_phone', label: 'Phone', type: 'text', defaultValue: '+91 9876543210' },
  { key: 'site_whatsapp', label: 'WhatsApp', type: 'text', defaultValue: '+919876543210' },
  { key: 'site_email', label: 'Email', type: 'text', defaultValue: 'info@gurukulclasses.com' },
  { key: 'site_address', label: 'Address', type: 'textarea', defaultValue: 'Education Lane, Sector 21, Pune 411001, Maharashtra, India' },
  { key: 'site_logo', label: 'Logo URL', type: 'image', defaultValue: '/gurukul-logo.svg' },
  { key: 'site_logo_width', label: 'Logo width (px)', type: 'text', defaultValue: '220' },
  { key: 'site_logo_height', label: 'Logo height (px)', type: 'text', defaultValue: '88' },
  { key: 'site_class_portal_url', label: 'Class Portal URL', type: 'text', defaultValue: '#' },
  { key: 'site_exam_portal_url', label: 'Exam Portal URL', type: 'text', defaultValue: '#' },
  { key: 'site_facebook', label: 'Facebook URL', type: 'text', defaultValue: '' },
  { key: 'site_instagram', label: 'Instagram URL', type: 'text', defaultValue: '' },
  { key: 'site_youtube', label: 'YouTube URL', type: 'text', defaultValue: '' },
  { key: 'site_twitter', label: 'Twitter URL', type: 'text', defaultValue: '' },
  { key: 'site_linkedin', label: 'LinkedIn URL', type: 'text', defaultValue: '' },
];

const SCHEMAS = {
  'homepage-editor': {
    label: 'HomePage Editor', cols: ['key','value'],
    fields: [
      ['key','Key *','text'], ['value','Value *','text'],
    ],
    blank: { key:'hero_title', value:'' },
  },
  seo: {
    label: 'SEO Manager', cols: ['key','value'],
    fields: [
      ['key','Meta key *','text'], ['value','Meta value *','textarea'],
    ],
    blank: { key:'meta_title', value:'' },
  },
  'site-settings': {
    label: 'Site Settings', cols: ['key','value'],
    fields: [
      ['key','Setting key *','text'], ['value','Setting value *','textarea'],
    ],
    blank: { key:'site_name', value:'Gurukul Classes' },
  },
  banners: {
    label: 'Hero Banners', cols: ['title','cta','link','order'],
    fields: [
      ['title','Title *','text'], ['subtitle','Subtitle','text'],
      ['image','Banner image *','image'],
      ['cta','Button text','text'], ['link','Button link','text'],
      ['order','Display order','number'],
    ],
    blank: { title:'', subtitle:'', image:'', cta:'Learn More', link:'/', order:1, is_active:true },
  },
  counters: {
    label: 'Counters', cols: ['value','prefix','suffix','label'],
    fields: [
      ['value','Value *','number'], ['prefix','Prefix','text'], ['suffix','Suffix','text'],
      ['label','Label *','text'], ['order','Order','number'],
    ],
    blank: { value:0, prefix:'', suffix:'+', label:'', order:0 },
  },
  faqs: {
    label: 'FAQs', cols: ['q','a'],
    fields: [
      ['q','Question *','text'], ['a','Answer *','textarea'], ['order','Order','number'],
    ],
    blank: { q:'', a:'', order:0 },
  },
  'programs-strip': {
    label: 'Programs Strip', cols: ['code','title','sub','href'],
    fields: [
      ['code','Code *','text'], ['title','Title *','text'], ['sub','Sub title','text'],
      ['desc','Description','textarea'], ['href','Link','text'], ['order','Order','number'],
    ],
    blank: { code:'JEE', title:'JEE', sub:'(For Std. 11, 12)', desc:'', href:'/courses/jee', order:0 },
  },
  'why-us': {
    label: 'Why Us', cols: ['title','icon','desc'],
    fields: [
      ['title','Title *','text'], ['icon','Icon name','text'], ['desc','Description *','textarea'], ['order','Order','number'],
    ],
    blank: { title:'', icon:'Sparkles', desc:'', order:0 },
  },
  centres: {
    label: 'Centres', cols: ['name','city','address','phone'],
    fields: [
      ['name','Centre name *','text'], ['city','City','text'], ['address','Address','text'], ['phone','Phone','text'], ['order','Order','number'],
    ],
    blank: { name:'', city:'', address:'', phone:'', order:0 },
  },
  courses: {
    label: 'Courses', cols: ['slug','title','duration','audience','price'],
    fields: [
      ['slug','Slug *','text'], ['title','Title *','text'],
      ['duration','Duration','text'], ['audience','Audience','text'],
      ['price','Price','text'], ['image','Course image','image'],
      ['short','Short description','textarea'], ['detail','Full detail','textarea'],
      ['highlights','Highlights (comma-sep)','tags'], ['subjects','Subjects (comma-sep)','tags'],
    ],
    blank: { slug:'', title:'', duration:'', audience:'', price:'', image:'', short:'', detail:'', highlights:[], subjects:[], is_active:true },
  },
  faculty: {
    label: 'Faculty', cols: ['name','subject','exp','credentials'],
    fields: [
      ['name','Name *','text'], ['subject','Subject *','text'],
      ['exp','Experience','text'], ['credentials','Credentials','text'],
      ['img','Photo','image'], ['bio','Bio','textarea'],
    ],
    blank: { name:'', subject:'', exp:'', credentials:'', img:'', bio:'' },
  },
  blogs: {
    label: 'Blogs', cols: ['slug','title','author','category','date'],
    fields: [
      ['slug','Slug *','text'], ['title','Title *','text'],
      ['author','Author','text'], ['category','Category','text'], ['date','Date','text'],
      ['cover','Cover image','image'], ['excerpt','Excerpt','textarea'], ['body','Body','textarea'],
    ],
    blank: { slug:'', title:'', author:'', category:'', date:'', cover:'', excerpt:'', body:'' },
  },
  testimonials: {
    label: 'Testimonials', cols: ['name','rank','text'],
    fields: [
      ['name','Name *','text'], ['rank','Rank / Title','text'],
      ['img','Photo','image'], ['text','Testimonial text','textarea'],
    ],
    blank: { name:'', rank:'', img:'', text:'' },
  },
  toppers: {
    label: 'Toppers', cols: ['name','rank','score','year'],
    fields: [
      ['name','Name *','text'], ['rank','Rank','text'],
      ['score','Score','text'], ['year','Year','number'], ['img','Photo','image'],
    ],
    blank: { name:'', rank:'', score:'', year:2026, img:'' },
  },
  results: {
    label: 'Results', cols: ['year','name','rank','exam','college'],
    fields: [
      ['year','Year *','number'], ['name','Name *','text'],
      ['rank','Rank','text'], ['exam','Exam','text'], ['college','College','text'],
    ],
    blank: { year:2025, name:'', rank:'', exam:'', college:'' },
  },
  gallery: {
    label: 'Gallery', cols: ['url','caption'],
    fields: [['url','Image *','image'], ['caption','Caption','text']],
    blank: { url:'', caption:'' },
  },
  news: {
    label: 'News', cols: ['title','date'],
    fields: [
      ['title','Title *','text'], ['date','Date','text'],
      ['img','Image','image'], ['desc','Description','textarea'],
    ],
    blank: { title:'', date:'', img:'', desc:'' },
  },
};

const AdminContent = ({ path }) => {
  const schema = SCHEMAS[path];
  const { toast } = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);

  const buildSiteSettingsEditing = (items = []) => {
    const map = {};
    (items || []).forEach((item) => {
      if (item && item.key) map[item.key] = item.value ?? '';
    });
    return Object.fromEntries(
      SITE_SETTINGS_FIELDS.map((field) => [field.key, map[field.key] ?? field.defaultValue ?? ''])
    );
  };

  const load = async () => {
    setLoading(true);
    try {
      const result = await api.list(path);
      const normalized = Array.isArray(result) ? result : result ? [result] : [];
      setRows(normalized.filter(Boolean));
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [path]);

  const save = async () => {
    if (path === 'site-settings') {
      try {
        const existing = Object.fromEntries((rows || []).filter(r => r?.key).map(r => [r.key, r]));
        const saves = SITE_SETTINGS_FIELDS.map((field) => {
          const value = String(editing?.[field.key] ?? field.defaultValue ?? '').trim();
          const row = existing[field.key];
          const payload = { key: field.key, value };
          return row?.id ? api.update(path, row.id, { ...row, ...payload }) : api.create(path, payload);
        });
        await Promise.all(saves);
        toast({ title: 'Site settings saved' });
        setEditing(null);
        load();
      } catch (e) {
        const status = e?.response?.status;
        if (status === 401) toast({ title: 'Session expired', description: 'Please sign in again.' });
        else toast({ title: 'Error saving', description: e?.response?.data?.detail || e?.message || 'Unknown error' });
      }
      return;
    }

    const payload = { ...editing };
    // normalize exact value types before sending to backend
    schema.fields.forEach(([k, _, t]) => {
      if (t === 'tags' && typeof payload[k] === 'string') {
        payload[k] = payload[k].split(',').map(s=>s.trim()).filter(Boolean);
      }
      if (t === 'number') payload[k] = Number(payload[k]) || 0;
      if (k === 'value' && path === 'counters') payload[k] = Number(payload[k]) || 0;
      if (k === 'order' && payload[k] !== undefined) payload[k] = Number(payload[k]) || 0;
      if (['prefix','suffix','label','title','q','a','key','meta','slug','name','city','address','phone','code','sub','desc','href'].includes(k) && payload[k] !== undefined) {
        payload[k] = String(payload[k]).trim();
      }
    });
    try {
      if (payload.id) await api.update(path, payload.id, payload);
      else await api.create(path, payload);
      toast({ title: 'Saved' });
      setEditing(null);
      load();
    } catch (e) {
      const status = e?.response?.status;
      if (status === 401) toast({ title: 'Session expired', description: 'Please sign in again.' });
      else toast({ title: 'Error saving', description: e?.response?.data?.detail || e?.message || 'Unknown error' });
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await api.remove(path, id);
      setRows(rs => rs.filter(r => r.id !== id));
      toast({ title: 'Deleted' });
    } catch (e) {
      const status = e?.response?.status;
      if (status === 401) toast({ title: 'Session expired', description: 'Please sign in again.' });
      else toast({ title: 'Could not delete', description: e?.response?.data?.detail || e?.message });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-extrabold text-[#0F2A5C]">{schema.label} ({rows.length})</h1>
        <div className="flex gap-2">
          <Button onClick={load} variant="outline" size="sm" disabled={loading}><RefreshCw size={14} className={loading?'animate-spin':''}/></Button>
          <Button onClick={() => setEditing(path === 'site-settings' ? buildSiteSettingsEditing(rows) : { ...schema.blank })} className="bg-[#F5B921] hover:bg-[#e3a911] text-[#0F2A5C] font-bold" size="sm"><Plus size={14}/> New</Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              {schema.cols.map((c) => <th key={c} className="text-left p-3 text-xs uppercase tracking-wider text-slate-500">{c}</th>)}
              <th className="text-right p-3 text-xs uppercase tracking-wider text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={schema.cols.length + 1} className="p-8 text-center text-slate-400">No items — click <b>New</b> to add</td></tr>}
            {rows.map((r) => (
              <tr key={r.id} className="border-t hover:bg-slate-50">
                {schema.cols.map((c) => (
                  <td key={c} className="p-3 max-w-[220px] truncate">{Array.isArray(r[c]) ? r[c].join(', ') : (r[c] ?? '—')}</td>
                ))}
                <td className="p-3 text-right">
                  <button onClick={()=>setEditing(
                    path === 'site-settings'
                      ? buildSiteSettingsEditing(rows)
                      : { ...schema.blank, ...r, highlights: (r.highlights||[]).join(', '), subjects: (r.subjects||[]).join(', ') }
                  )} className="p-1.5 rounded hover:bg-slate-100" title="Edit"><Edit size={14}/></button>
                  <button onClick={()=>remove(r.id)} className="p-1.5 rounded hover:bg-rose-50 text-rose-600 ml-1" title="Delete"><Trash2 size={14}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center p-4 overflow-y-auto" onClick={()=>setEditing(null)}>
          <div onClick={e=>e.stopPropagation()} className="bg-white rounded-xl max-w-3xl w-full p-6 my-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-extrabold text-[#0F2A5C]">{editing.id ? 'Edit' : 'New'} {schema.label.slice(0,-1)}</h3>
              <button onClick={()=>setEditing(null)} className="p-1 rounded hover:bg-slate-100"><X size={18}/></button>
            </div>

            {path === 'site-settings' ? (
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  {SITE_SETTINGS_FIELDS.map((field) => {
                    const val = editing[field.key] ?? field.defaultValue ?? '';
                    const wide = field.type === 'textarea' || field.type === 'image' ? 'sm:col-span-2' : '';

                    if (field.type === 'image') return (
                      <div key={field.key} className={wide}>
                        <ImageUploadField label={field.label} value={val} onChange={(u) => setEditing(p => ({ ...p, [field.key]: u }))}/>
                      </div>
                    );

                    if (field.type === 'textarea') return (
                      <div key={field.key} className={wide}>
                        <label className="text-xs font-semibold text-slate-600">{field.label}</label>
                        <Textarea className="min-h-[100px]" value={val} onChange={e => setEditing(p => ({ ...p, [field.key]: e.target.value }))}/>
                      </div>
                    );

                    return (
                      <div key={field.key} className={wide}>
                        <label className="text-xs font-semibold text-slate-600">{field.label}</label>
                        <Input value={val} onChange={e => setEditing(p => ({ ...p, [field.key]: e.target.value }))}/>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 border rounded-xl bg-slate-50 p-4">
                  <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-3">Live logo preview</div>
                  <div className="bg-white border rounded-lg p-4 flex items-center justify-center min-h-[120px]">
                    {editing.site_logo ? (
                      <img
                        src={resolveUrl(editing.site_logo)}
                        alt="Site logo preview"
                        style={{ width: `${Number(editing.site_logo_width) || 220}px`, height: `${Number(editing.site_logo_height) || 88}px` }}
                        className="object-contain max-w-full"
                      />
                    ) : (
                      <div className="text-sm text-slate-400">Upload a logo to preview here</div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {schema.fields.map(([k, label, type]) => {
                  const wide = type === 'textarea' || type === 'tags' || type === 'image' ? 'sm:col-span-2' : '';
                  const val = editing[k] ?? '';
                  if (type === 'image') return (
                    <div key={k} className={wide}>
                      <ImageUploadField label={label} value={val} onChange={(u) => setEditing(p => ({...p, [k]: u}))}/>
                    </div>
                  );
                  if (type === 'textarea') return (
                    <div key={k} className={wide}>
                      <label className="text-xs font-semibold text-slate-600">{label}</label>
                      <Textarea className="min-h-[100px]" value={val} onChange={e=>setEditing(p=>({...p,[k]:e.target.value}))}/>
                    </div>
                  );
                  return (
                    <div key={k} className={wide}>
                      <label className="text-xs font-semibold text-slate-600">{label}</label>
                      <Input type={type === 'number' ? 'number' : 'text'} value={val} onChange={e=>setEditing(p=>({...p,[k]:e.target.value}))}/>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="flex justify-end gap-2 mt-5">
              <Button variant="outline" onClick={()=>setEditing(null)}>Cancel</Button>
              <Button onClick={save} className="bg-[#F5B921] hover:bg-[#e3a911] text-[#0F2A5C] font-bold"><Save size={14}/> Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminContent;
