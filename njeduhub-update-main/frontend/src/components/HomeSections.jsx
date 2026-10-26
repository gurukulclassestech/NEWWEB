import React, { useEffect, useRef, useState } from 'react';
import { COUNTERS, FEATURES } from '../mock';
import { useApi } from '../hooks/useApi';
import { api } from '../hooks/useApi';
import * as Icons from 'lucide-react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const Counter = ({ value, prefix = '', suffix = '' }) => {
  const [n, setN] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        const duration = 1400, steps = 60;
        let cur = 0; const step = value / steps;
        const t = setInterval(() => {
          cur += step;
          if (cur >= value) { setN(value); clearInterval(t); } else setN(Math.round(cur));
        }, duration / steps);
        obs.disconnect();
      }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [value]);
  return <span ref={ref}>{prefix}{n}{suffix}</span>;
};

export const Counters = () => {
  const { data: backendCounters } = useApi(() => api.counters(), COUNTERS);

  const normalizeCounter = (c, idx) => ({
    id: c?.id || idx,
    value: Number(c?.value) || 0,
    prefix: String(c?.prefix || ''),
    suffix: String(c?.suffix || ''),
    label: String(c?.label || c?.title || ''),
    order: Number(c?.order) || 0,
  });

  const itemsSource = Array.isArray(backendCounters)
    ? backendCounters
    : backendCounters && typeof backendCounters === 'object'
      ? [backendCounters]
      : COUNTERS;

  const items = [...itemsSource].map(normalizeCounter).sort((a, b) => (a.order - b.order) || (a.id - b.id));

  return (
    <section className="bg-white py-14">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#0F2A5C]">Inclusive Personalised JEE &amp; NEET Coaching</h2>
          <div className="w-20 h-1 bg-[#F5B921] mx-auto mt-3"/>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map((c, i) => (
            <div key={c.id || i} className="bg-[#F8FAFC] hover:bg-[#0F2A5C] hover:text-white border border-gray-100 rounded-xl p-6 text-center group transition-colors">
              <div className="text-4xl md:text-5xl font-extrabold text-[#0F2A5C] group-hover:text-[#F5B921]">
                <Counter value={c.value} prefix={c.prefix} suffix={c.suffix} />
              </div>
              <div className="mt-2 text-sm font-semibold text-gray-600 group-hover:text-white">{c.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const Features = () => (
  <section className="py-16 bg-[#F8FAFC]">
    <div className="max-w-7xl mx-auto px-4">
      <div className="text-center mb-10">
        <div className="inline-block text-xs font-bold text-[#F5B921] uppercase tracking-widest">Why Gurukul Classes</div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-[#0F2A5C] mt-2">A different kind of coaching institute</h2>
        <div className="w-20 h-1 bg-[#F5B921] mx-auto mt-3"/>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {FEATURES.map((f, i) => {
          const Icon = Icons[f.icon] || Icons.Sparkles;
          return (
            <div key={i} className="bg-white rounded-xl p-6 border border-gray-100 hover:border-[#F5B921] hover:-translate-y-1 transition-all shadow-sm">
              <div className="w-12 h-12 rounded-lg bg-[#0F2A5C] text-[#F5B921] flex items-center justify-center mb-4"><Icon size={22}/></div>
              <h3 className="font-bold text-[#0F2A5C] mb-1">{f.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{f.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);

export const LatestUpdates = () => {
  const { data: news } = useApi(() => api.news(), []);
  if (!news || news.length === 0) return null;
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-wrap items-end justify-between mb-8">
          <div>
            <div className="inline-block text-xs font-bold text-[#F5B921] uppercase tracking-widest">Latest</div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0F2A5C] mt-2">News &amp; Announcements</h2>
          </div>
          <Link to="/blogs" className="text-[#0F2A5C] font-bold inline-flex items-center gap-1 hover:text-[#F5B921]">View All <ArrowRight size={16}/></Link>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {news.slice(0, 4).map((n) => (
            <article key={n.id} className="group bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="aspect-video overflow-hidden">
                <img src={n.img} alt={n.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
              </div>
              <div className="p-5">
                <div className="text-xs text-[#F5B921] font-bold uppercase tracking-widest">{n.date}</div>
                <h3 className="font-bold text-[#0F2A5C] mt-1 leading-snug">{n.title}</h3>
                <p className="text-sm text-gray-600 mt-2 line-clamp-3">{n.desc}</p>
                <Link to="/blogs" className="inline-flex items-center gap-1 text-sm font-bold text-[#0F2A5C] mt-3 hover:text-[#F5B921]">Read more <ArrowRight size={14}/></Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
