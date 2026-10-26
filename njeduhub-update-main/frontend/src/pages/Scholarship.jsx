import React, { useState } from 'react';
import PageHero from '../components/PageHero';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { useToast } from '../hooks/use-toast';
import { api } from '../hooks/useApi';
import { Award, CheckCircle2, GraduationCap, Calendar, MapPin } from 'lucide-react';

const Scholarship = () => {
  const { toast } = useToast();
  const [data, setData] = useState({ name:'', email:'', phone:'', standard:'', city:'' });
  const [submitting, setSubmitting] = useState(false);
  const set = (k,v) => setData(p => ({ ...p, [k]: v }));
  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.submitScholarship(data);
      toast({ title: 'You\'re registered!', description: 'Test slot details will be sent to your email.' });
      setData({ name:'', email:'', phone:'', standard:'', city:'' });
    } catch (err) {
      toast({ title: 'Could not register', description: 'Please try again shortly.' });
    } finally { setSubmitting(false); }
  };
  return (
    <>
      <PageHero title="Scholarship Test" subtitle="Earn up to 100% tuition fee waiver. Open to all serious aspirants from Std. 8 to Std. 12." breadcrumbs={[{label:'Scholarship'}]}/>
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-10 items-start">
          <div>
            <div className="inline-block text-xs font-bold text-[#F5B921] uppercase tracking-widest">NJ EH — Scholarship Exam</div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0F2A5C] mt-2">Up to 100% fee waiver for top talent</h2>
            <p className="text-gray-700 leading-relaxed mt-4">A 90-minute aptitude test that maps your strengths in mathematical reasoning, scientific thinking and problem-solving. Based on your percentile band, you receive an automatic scholarship offer.</p>
            <div className="mt-6 grid sm:grid-cols-2 gap-3">
              {[
                {icon:Award, label:'Top 1% — 100% fee waiver'},
                {icon:CheckCircle2, label:'Top 5% — 50% fee waiver'},
                {icon:GraduationCap, label:'Top 10% — 25% fee waiver'},
                {icon:Calendar, label:'Slots every Saturday'},
                {icon:MapPin, label:'Online & all centres'},
                {icon:CheckCircle2, label:'Free attempt, no fee to register'},
              ].map((x,i)=>(
                <div key={i} className="flex items-start gap-3 bg-[#F8FAFC] rounded-lg p-3 border border-gray-100">
                  <x.icon className="text-[#F5B921] mt-0.5" size={18}/>
                  <div className="text-sm text-[#0F2A5C] font-semibold">{x.label}</div>
                </div>
              ))}
            </div>
          </div>
          <form onSubmit={submit} className="bg-[#0F2A5C] text-white rounded-xl p-6 md:p-8">
            <h3 className="text-2xl font-extrabold">Register for the next slot</h3>
            <p className="text-white/70 text-sm mt-1">Free • 90 minutes • Online or any centre</p>
            <div className="mt-5 grid grid-cols-1 gap-3">
              <Input className="bg-white text-[#0F2A5C]" placeholder="Full name *" value={data.name} onChange={e=>set('name',e.target.value)}/>
              <Input className="bg-white text-[#0F2A5C]" placeholder="Email *" type="email" value={data.email} onChange={e=>set('email',e.target.value)}/>
              <Input className="bg-white text-[#0F2A5C]" placeholder="Phone *" value={data.phone} onChange={e=>set('phone',e.target.value)}/>
              <Input className="bg-white text-[#0F2A5C]" placeholder="Current standard" value={data.standard} onChange={e=>set('standard',e.target.value)}/>
              <Input className="bg-white text-[#0F2A5C]" placeholder="City" value={data.city} onChange={e=>set('city',e.target.value)}/>
              <Button type="submit" disabled={submitting} className="bg-[#F5B921] hover:bg-[#e3a911] text-[#0F2A5C] font-bold h-12 mt-2">{submitting ? 'Submitting…' : 'Reserve my slot'}</Button>
            </div>
          </form>
        </div>
      </section>
    </>
  );
};
export default Scholarship;
