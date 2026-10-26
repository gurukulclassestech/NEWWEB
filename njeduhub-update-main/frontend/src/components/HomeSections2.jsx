import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Play, X } from 'lucide-react';
import { VIDEO_TESTIMONIALS, FAQS } from '../mock';
import { useApi, api } from '../hooks/useApi';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './ui/accordion';
import { Button } from './ui/button';

export const CoursesGrid = ({ compact = false }) => {
  const { data: COURSES, loading } = useApi(() => api.courses(), []);
  const list = compact ? (COURSES || []).slice(0, 3) : (COURSES || []);
  return (
    <section className={`${compact ? 'py-14' : 'py-16'} bg-[#F8FAFC]`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <div className="inline-block text-xs font-bold text-[#F5B921] uppercase tracking-widest">Programs</div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#0F2A5C] mt-2">Our Flagship Courses</h2>
          <div className="w-20 h-1 bg-[#F5B921] mx-auto mt-3"/>
        </div>
        {loading && <div className="text-center text-slate-400">Loading courses…</div>}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((c) => (
            <Link to={`/courses/${c.slug}`} key={c.slug} className="group bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all">
              <div className="relative aspect-[4/3] overflow-hidden">
                <img src={c.image} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                <div className="absolute top-3 left-3 bg-[#F5B921] text-[#0F2A5C] text-xs font-bold px-2 py-1 rounded uppercase">{c.duration}</div>
              </div>
              <div className="p-5">
                <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide">{c.audience}</div>
                <h3 className="text-lg font-bold text-[#0F2A5C] mt-1 leading-snug">{c.title}</h3>
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">{c.short}</p>
                <div className="flex flex-wrap gap-1 mt-3">
                  {(c.highlights || []).slice(0,3).map((h) => (
                    <span key={h} className="text-[10px] font-semibold bg-[#0F2A5C]/5 text-[#0F2A5C] px-2 py-1 rounded">{h}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-4 mt-4 border-t">
                  <div className="text-[#0F2A5C] font-extrabold">{c.price}</div>
                  <div className="inline-flex items-center gap-1 text-sm font-bold text-[#0F2A5C] group-hover:text-[#F5B921]">Explore <ArrowRight size={14}/></div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        {compact && (
          <div className="text-center mt-8"><Link to="/courses"><Button className="bg-[#0F2A5C] hover:bg-[#0a1f44] text-white font-bold">View All Courses <ArrowRight size={16}/></Button></Link></div>
        )}
      </div>
    </section>
  );
};

export const TopResults = () => {
  const { data: TOPPERS } = useApi(() => api.toppers(), []);
  const list = TOPPERS || [];
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <div className="inline-block text-xs font-bold text-[#F5B921] uppercase tracking-widest">Toppers</div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#0F2A5C] mt-2">XII Board Toppers 2026</h2>
          <div className="w-20 h-1 bg-[#F5B921] mx-auto mt-3"/>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {list.slice(0, 10).map((t) => (
            <div key={t.id} className="bg-[#0F2A5C] rounded-xl overflow-hidden text-white text-center hover:-translate-y-1 transition-transform">
              <div className="relative">
                <img src={t.img} alt={t.name} className="w-full aspect-square object-cover"/>
                <div className="absolute top-2 right-2 bg-[#F5B921] text-[#0F2A5C] text-xs font-extrabold rounded-full w-12 h-12 flex flex-col items-center justify-center leading-none">
                  <div className="text-[10px]">SCORE</div>
                  <div className="text-xs">{t.score}</div>
                </div>
              </div>
              <div className="py-3 px-2">
                <div className="font-bold text-sm leading-tight">{t.name}</div>
                <div className="text-[10px] text-[#F5B921] font-bold mt-1 uppercase tracking-wider">{t.rank}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-8"><Link to="/results"><Button className="bg-[#F5B921] hover:bg-[#e3a911] text-[#0F2A5C] font-bold">View All Results <ArrowRight size={16}/></Button></Link></div>
      </div>
    </section>
  );
};

export const FacultyTeaser = () => {
  const { data: FACULTY } = useApi(() => api.faculty(), []);
  const list = (FACULTY || []).slice(0, 4);
  return (
    <section className="py-16 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-wrap items-end justify-between mb-8">
          <div>
            <div className="inline-block text-xs font-bold text-[#F5B921] uppercase tracking-widest">Mentors</div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0F2A5C] mt-2">Meet Our Faculty</h2>
          </div>
          <Link to="/faculty" className="text-[#0F2A5C] font-bold inline-flex items-center gap-1 hover:text-[#F5B921]">All Faculty <ArrowRight size={16}/></Link>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5">
          {list.map((f) => (
            <div key={f.id || f.name} className="bg-white rounded-xl overflow-hidden border border-gray-100 group hover:shadow-xl transition-shadow">
              <div className="aspect-square overflow-hidden">
                <img src={f.img} alt={f.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
              </div>
              <div className="p-4">
                <div className="font-bold text-[#0F2A5C]">{f.name}</div>
                <div className="text-xs text-[#F5B921] font-bold uppercase tracking-wider">{f.subject} • {f.exp}</div>
                <p className="text-xs text-gray-600 mt-2 line-clamp-2">{f.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const YouTubeSection = () => {
  const [playing, setPlaying] = useState(null);
  return (
    <section className="py-16 bg-[#0F2A5C] text-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <div className="inline-block text-xs font-bold text-[#F5B921] uppercase tracking-widest">Watch</div>
          <h2 className="text-3xl md:text-4xl font-extrabold mt-2">A Quick Tour of Gurukul Classes</h2>
          <div className="w-20 h-1 bg-[#F5B921] mx-auto mt-3"/>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {VIDEO_TESTIMONIALS.map((v) => (
            <button onClick={() => setPlaying(v)} key={v.id} className="group relative aspect-video rounded-xl overflow-hidden">
              <img src={v.thumb} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform"/>
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 flex flex-col items-center justify-center transition-colors">
                <div className="w-14 h-14 rounded-full bg-[#F5B921] text-[#0F2A5C] flex items-center justify-center"><Play size={26} fill="#0F2A5C"/></div>
                <div className="mt-3 text-sm font-bold text-white text-center px-3">{v.title}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
      {playing && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setPlaying(null)}>
          <button className="absolute top-4 right-4 text-white" onClick={() => setPlaying(null)}><X size={28}/></button>
          <div className="w-full max-w-4xl aspect-video" onClick={(e) => e.stopPropagation()}>
            <iframe className="w-full h-full rounded-xl" src={`https://www.youtube.com/embed/${playing.id}?autoplay=1`} title={playing.title} allow="autoplay; encrypted-media" allowFullScreen/>
          </div>
        </div>
      )}
    </section>
  );
};

export const Testimonials = () => {
  const { data: TS } = useApi(() => api.testimonials(), []);
  const list = TS || [];
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <div className="inline-block text-xs font-bold text-[#F5B921] uppercase tracking-widest">Testimonials</div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#0F2A5C] mt-2">Students Speak</h2>
          <div className="w-20 h-1 bg-[#F5B921] mx-auto mt-3"/>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {list.map((t) => (
            <div key={t.id} className="bg-[#F8FAFC] border border-gray-100 rounded-xl p-6 hover:border-[#F5B921] transition-colors">
              <div className="flex gap-1 text-[#F5B921] mb-3">
                {[...Array(5)].map((_, n) => <Star key={n} size={16} fill="#F5B921"/>)}
              </div>
              <p className="text-sm text-gray-700 leading-relaxed italic">&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center gap-3 mt-5 pt-4 border-t">
                <img src={t.img} alt={t.name} className="w-12 h-12 rounded-full object-cover"/>
                <div>
                  <div className="font-bold text-[#0F2A5C]">{t.name}</div>
                  <div className="text-xs text-[#F5B921] font-bold">{t.rank}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const FAQSection = () => (
  <section className="py-16 bg-[#F8FAFC]">
    <div className="max-w-4xl mx-auto px-4">
      <div className="text-center mb-10">
        <div className="inline-block text-xs font-bold text-[#F5B921] uppercase tracking-widest">FAQs</div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-[#0F2A5C] mt-2">Frequently Asked Questions</h2>
        <div className="w-20 h-1 bg-[#F5B921] mx-auto mt-3"/>
      </div>
      <Accordion type="single" collapsible className="bg-white rounded-xl border border-gray-100 px-2">
        {FAQS.map((f, i) => (
          <AccordionItem key={i} value={`item-${i}`} className="border-b last:border-b-0">
            <AccordionTrigger className="text-left font-semibold text-[#0F2A5C] hover:no-underline px-4">{f.q}</AccordionTrigger>
            <AccordionContent className="text-gray-600 leading-relaxed px-4">{f.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  </section>
);
