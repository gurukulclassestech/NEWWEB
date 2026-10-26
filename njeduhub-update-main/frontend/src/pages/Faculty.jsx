import React, { useState } from 'react';
import PageHero from '../components/PageHero';
import { useApi, api } from '../hooks/useApi';
import { Mail, Linkedin } from 'lucide-react';

const Faculty = () => {
  const { data: FACULTY, loading } = useApi(() => api.faculty(), []);
  const list = FACULTY || [];
  const subjects = ['All', ...Array.from(new Set(list.map(f => f.subject)))];
  const [filter, setFilter] = useState('All');
  const view = filter === 'All' ? list : list.filter(f => f.subject === filter);
  return (
    <>
      <PageHero title="Our Faculty" subtitle="Battle-tested mentors who have spent decades demystifying physics, chemistry, biology and maths." breadcrumbs={[{label:'Faculty'}]}/>
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {subjects.map((s) => (
              <button key={s} onClick={() => setFilter(s)} className={`px-4 py-2 rounded-full text-sm font-bold border transition-colors ${filter===s?'bg-[#0F2A5C] text-white border-[#0F2A5C]':'bg-white text-[#0F2A5C] border-gray-200 hover:border-[#F5B921]'}`}>{s}</button>
            ))}
          </div>
          {loading && <div className="text-center text-slate-400">Loading…</div>}
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {view.map((f) => (
              <div key={f.id} className="bg-[#F8FAFC] rounded-xl overflow-hidden border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all group">
                <div className="aspect-square overflow-hidden">
                  <img src={f.img} alt={f.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                </div>
                <div className="p-5">
                  <div className="font-bold text-[#0F2A5C]">{f.name}</div>
                  <div className="text-xs text-[#F5B921] font-bold uppercase tracking-wider">{f.subject} • {f.exp}</div>
                  <div className="text-xs text-gray-500 mt-1">{f.credentials}</div>
                  <p className="text-sm text-gray-600 mt-3 line-clamp-3">{f.bio}</p>
                  <div className="flex gap-2 mt-4">
                    <a href="#" className="w-8 h-8 rounded-full bg-white text-[#0F2A5C] border border-gray-200 hover:bg-[#F5B921] hover:border-[#F5B921] flex items-center justify-center"><Mail size={14}/></a>
                    <a href="#" className="w-8 h-8 rounded-full bg-white text-[#0F2A5C] border border-gray-200 hover:bg-[#F5B921] hover:border-[#F5B921] flex items-center justify-center"><Linkedin size={14}/></a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};
export default Faculty;
