import React, { useState } from 'react';
import PageHero from '../components/PageHero';
import { TopResults } from '../components/HomeSections2';
import { useApi, api } from '../hooks/useApi';
import { Input } from '../components/ui/input';
import { Trophy, Search } from 'lucide-react';

const Results = () => {
  const { data: ALL } = useApi(() => api.results(), []);
  const list = ALL || [];
  const [q, setQ] = useState('');
  const [year, setYear] = useState('all');
  const years = ['all', ...Array.from(new Set(list.map(r => r.year))).sort((a,b)=>b-a)];
  const filtered = list.filter((r) =>
    (year === 'all' || r.year === Number(year)) &&
    (r.name.toLowerCase().includes(q.toLowerCase()) || r.college.toLowerCase().includes(q.toLowerCase()) || r.rank.toLowerCase().includes(q.toLowerCase()))
  );
  return (
    <>
      <PageHero title="Results & Placements" subtitle="1400+ JEE Advanced ranks, 600+ NEET scorers, 8 consecutive years of medical excellence." breadcrumbs={[{label:'Results'}]}/>
      <TopResults />
      <section className="py-14 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap gap-3 items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#0F2A5C]">JEE / NEET Top Rankers</h2>
            <div className="flex gap-3 flex-wrap">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                <Input placeholder="Search by name, rank, college" value={q} onChange={(e)=>setQ(e.target.value)} className="pl-9 w-72 bg-white"/>
              </div>
              <div className="flex gap-1 bg-white rounded-md p-1 border">
                {years.map((y) => (
                  <button key={y} onClick={()=>setYear(y)} className={`px-3 py-1.5 text-xs font-bold rounded ${String(year)===String(y)?'bg-[#0F2A5C] text-white':'text-[#0F2A5C] hover:bg-gray-100'}`}>{y === 'all' ? 'All' : y}</button>
                ))}
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#0F2A5C] text-white">
                <tr>
                  <th className="text-left p-3">Year</th>
                  <th className="text-left p-3">Student</th>
                  <th className="text-left p-3">Rank / Score</th>
                  <th className="text-left p-3">Exam</th>
                  <th className="text-left p-3">College</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b last:border-b-0 hover:bg-[#F5B921]/5">
                    <td className="p-3 font-bold text-[#0F2A5C]">{r.year}</td>
                    <td className="p-3">{r.name}</td>
                    <td className="p-3"><span className="inline-flex items-center gap-1 bg-[#F5B921]/20 text-[#0F2A5C] font-bold px-2 py-1 rounded"><Trophy size={14}/> {r.rank}</span></td>
                    <td className="p-3">{r.exam}</td>
                    <td className="p-3 font-semibold">{r.college}</td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan="5" className="p-8 text-center text-gray-500">No results found.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
};
export default Results;
