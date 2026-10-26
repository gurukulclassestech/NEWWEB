import React, { useEffect, useState } from 'react';
import PageHero from '../components/PageHero';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Checkbox } from '../components/ui/checkbox';
import { useToast } from '../hooks/use-toast';
import { api } from '../hooks/useApi';
import { CheckCircle2 } from 'lucide-react';

const Admission = () => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [courses, setCourses] = useState([]);
  const [data, setData] = useState({
    name:'', dob:'', gender:'', email:'', phone:'', father:'', mother:'', city:'',
    school:'', stream:'', percent:'', course:'', mode:'', message:'', terms:false
  });
  const set = (k,v) => setData(p => ({ ...p, [k]: v }));

  useEffect(() => { api.courses().then(setCourses).catch(()=>setCourses([])); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!data.terms) { toast({ title:'Please accept terms to continue' }); return; }
    try {
      const { terms, ...payload } = data;
      await api.submitAdmission(payload);
      toast({ title:'Application submitted!', description:'Our admissions team will reach you within 24 hours.' });
      setStep(4);
    } catch (err) {
      toast({ title:'Could not submit', description:'Please try again shortly.' });
    }
  };

  return (
    <>
      <PageHero title="Online Admission" subtitle="Apply in under 3 minutes. Our admissions team takes it forward from there." breadcrumbs={[{label:'Admission'}]}/>
      <section className="py-14 bg-[#F8FAFC]">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex justify-between mb-8">
            {[1,2,3].map(n => (
              <div key={n} className="flex-1 flex items-center">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${step>=n?'bg-[#F5B921] text-[#0F2A5C]':'bg-white text-gray-400 border'}`}>{n}</div>
                {n<3 && <div className={`flex-1 h-1 ${step>n?'bg-[#F5B921]':'bg-gray-200'}`}/>}
              </div>
            ))}
          </div>
          <form onSubmit={submit} className="bg-white rounded-xl border border-gray-100 p-6 md:p-8">
            {step === 1 && (<>
              <h3 className="font-extrabold text-2xl text-[#0F2A5C] mb-4">Personal details</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <Input placeholder="Full name *" value={data.name} onChange={e=>set('name',e.target.value)}/>
                <Input placeholder="Date of birth" type="date" value={data.dob} onChange={e=>set('dob',e.target.value)}/>
                <Select value={data.gender} onValueChange={v=>set('gender',v)}><SelectTrigger><SelectValue placeholder="Gender"/></SelectTrigger><SelectContent>{['Male','Female','Other'].map(g=><SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent></Select>
                <Input placeholder="City" value={data.city} onChange={e=>set('city',e.target.value)}/>
                <Input placeholder="Email *" type="email" value={data.email} onChange={e=>set('email',e.target.value)}/>
                <Input placeholder="Phone *" value={data.phone} onChange={e=>set('phone',e.target.value)}/>
                <Input placeholder="Father's name" value={data.father} onChange={e=>set('father',e.target.value)}/>
                <Input placeholder="Mother's name" value={data.mother} onChange={e=>set('mother',e.target.value)}/>
              </div>
              <Button type="button" onClick={()=>setStep(2)} className="mt-5 bg-[#0F2A5C] hover:bg-[#0a1f44] text-white font-bold">Next: Academic</Button>
            </>)}
            {step === 2 && (<>
              <h3 className="font-extrabold text-2xl text-[#0F2A5C] mb-4">Academic details</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <Input placeholder="Current school / college" value={data.school} onChange={e=>set('school',e.target.value)}/>
                <Select value={data.stream} onValueChange={v=>set('stream',v)}><SelectTrigger><SelectValue placeholder="Current standard"/></SelectTrigger><SelectContent>{['Std. 8','Std. 9','Std. 10','Std. 11','Std. 12','Dropper'].map(s=><SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
                <Input placeholder="Last exam %" value={data.percent} onChange={e=>set('percent',e.target.value)}/>
                <Select value={data.course} onValueChange={v=>set('course',v)}><SelectTrigger><SelectValue placeholder="Program of interest"/></SelectTrigger><SelectContent>{courses.map(c=><SelectItem key={c.slug} value={c.slug}>{c.title}</SelectItem>)}</SelectContent></Select>
                <Select value={data.mode} onValueChange={v=>set('mode',v)}><SelectTrigger><SelectValue placeholder="Mode"/></SelectTrigger><SelectContent>{['Offline','Online','Hybrid'].map(m=><SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent></Select>
              </div>
              <Textarea placeholder="Anything we should know?" className="mt-3 min-h-[100px]" value={data.message} onChange={e=>set('message',e.target.value)}/>
              <div className="mt-5 flex gap-3">
                <Button type="button" variant="outline" onClick={()=>setStep(1)}>Back</Button>
                <Button type="button" onClick={()=>setStep(3)} className="bg-[#0F2A5C] hover:bg-[#0a1f44] text-white font-bold">Next: Review</Button>
              </div>
            </>)}
            {step === 3 && (<>
              <h3 className="font-extrabold text-2xl text-[#0F2A5C] mb-4">Review &amp; submit</h3>
              <div className="text-sm text-gray-700 bg-[#F8FAFC] rounded-lg p-4 grid sm:grid-cols-2 gap-y-1 gap-x-4">
                {Object.entries(data).filter(([k])=>k!=='terms').map(([k,v])=>(
                  <div key={k} className="flex justify-between border-b border-dashed border-gray-200 py-1"><span className="capitalize text-gray-500">{k}</span><span className="font-semibold text-[#0F2A5C]">{v || '—'}</span></div>
                ))}
              </div>
              <label className="flex items-center gap-2 mt-4 text-sm text-gray-700">
                <Checkbox checked={data.terms} onCheckedChange={(v)=>set('terms', !!v)}/>
                I accept the <a href="/terms" className="text-[#F5B921] font-bold underline">terms &amp; conditions</a>.
              </label>
              <div className="mt-5 flex gap-3">
                <Button type="button" variant="outline" onClick={()=>setStep(2)}>Back</Button>
                <Button type="submit" className="bg-[#F5B921] hover:bg-[#e3a911] text-[#0F2A5C] font-bold">Submit Application</Button>
              </div>
            </>)}
            {step === 4 && (
              <div className="text-center py-10">
                <CheckCircle2 className="mx-auto text-[#F5B921]" size={56}/>
                <h3 className="font-extrabold text-2xl text-[#0F2A5C] mt-4">Application received!</h3>
                <p className="text-gray-600 mt-2">Our admissions team will reach out to you within 24 hours.</p>
              </div>
            )}
          </form>
        </div>
      </section>
    </>
  );
};
export default Admission;
