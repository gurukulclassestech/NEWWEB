import React, { useState } from 'react';
import PageHero from '../components/PageHero';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Button } from '../components/ui/button';
import { useToast } from '../hooks/use-toast';
import { api } from '../hooks/useApi';
import { Briefcase, MapPin, Clock } from 'lucide-react';

const JOBS = [
  { title:'Physics Faculty (JEE)', loc:'Pune', type:'Full-time', exp:'5+ years', desc:'Lead JEE Physics for Std. 11 & 12 batches. Build conceptual depth with experiment-led pedagogy.' },
  { title:'Chemistry Faculty (NEET)', loc:'Pune', type:'Full-time', exp:'3+ years', desc:'Mentor NEET aspirants in Organic & Physical Chemistry. NCERT-mapped delivery.' },
  { title:'Mathematics Faculty (Foundation)', loc:'Mumbai', type:'Full-time', exp:'2+ years', desc:'Build maths foundation for Std. 8–10 with story-led, problem-first teaching.' },
  { title:'Counsellor', loc:'Pune', type:'Full-time', exp:'1+ years', desc:'Engage with parents and aspirants, drive admissions and student success.' },
  { title:'Content Writer — EdTech', loc:'Remote', type:'Full-time', exp:'1+ years', desc:'Write blogs, study material, video scripts. STEM education background preferred.' },
  { title:'Frontend Engineer (React)', loc:'Pune / Remote', type:'Full-time', exp:'2+ years', desc:'Build delightful learner-facing products with React, Tailwind and modern stack.' },
];

const Career = () => {
  const { toast } = useToast();
  const [open, setOpen] = useState(null);
  const [form, setForm] = useState({ name:'', email:'', phone:'', message:'' });
  const [submitting, setSubmitting] = useState(false);
  const set = (k,v) => setForm(p => ({ ...p, [k]:v }));
  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.submitCareer({ ...form, role: open?.title || '' });
      toast({ title:'Application sent!', description:'Our HR team will reach out shortly.' });
      setForm({ name:'', email:'', phone:'', message:'' });
      setOpen(null);
    } catch (err) {
      toast({ title:'Could not submit', description:'Please try again shortly.' });
    } finally { setSubmitting(false); }
  };
  return (
    <>
      <PageHero title="Careers" subtitle="Join a mission-driven team that has been changing lives through education since 2002." breadcrumbs={[{label:'Career'}]}/>
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {JOBS.map((j,i)=>(
            <div key={i} className="bg-[#F8FAFC] rounded-xl p-6 border border-gray-100 hover:border-[#F5B921] transition-colors">
              <div className="flex items-center gap-2 text-xs font-bold text-[#F5B921] uppercase tracking-wider"><Briefcase size={14}/> {j.type}</div>
              <h3 className="font-bold text-[#0F2A5C] text-lg mt-2">{j.title}</h3>
              <div className="flex gap-3 text-xs text-gray-600 mt-2">
                <span className="flex items-center gap-1"><MapPin size={12}/> {j.loc}</span>
                <span className="flex items-center gap-1"><Clock size={12}/> {j.exp}</span>
              </div>
              <p className="text-sm text-gray-600 mt-3 leading-relaxed">{j.desc}</p>
              <Button onClick={()=>setOpen(j)} className="mt-4 bg-[#0F2A5C] hover:bg-[#0a1f44] text-white font-bold">Apply</Button>
            </div>
          ))}
        </div>
      </section>
      {open && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={()=>setOpen(null)}>
          <form onSubmit={submit} onClick={e=>e.stopPropagation()} className="bg-white rounded-xl p-6 md:p-8 w-full max-w-md">
            <h3 className="font-extrabold text-2xl text-[#0F2A5C]">Apply: {open.title}</h3>
            <div className="mt-4 grid gap-3">
              <Input placeholder="Full name *" value={form.name} onChange={e=>set('name',e.target.value)} required/>
              <Input placeholder="Email *" type="email" value={form.email} onChange={e=>set('email',e.target.value)} required/>
              <Input placeholder="Phone *" value={form.phone} onChange={e=>set('phone',e.target.value)} required/>
              <Textarea placeholder="Cover note" className="min-h-[100px]" value={form.message} onChange={e=>set('message',e.target.value)}/>
              <div className="flex gap-2">
                <Button type="submit" disabled={submitting} className="bg-[#F5B921] hover:bg-[#e3a911] text-[#0F2A5C] font-bold flex-1">{submitting ? 'Submitting…' : 'Submit'}</Button>
                <Button type="button" variant="outline" onClick={()=>setOpen(null)}>Cancel</Button>
              </div>
            </div>
          </form>
        </div>
      )}
    </>
  );
};
export default Career;
