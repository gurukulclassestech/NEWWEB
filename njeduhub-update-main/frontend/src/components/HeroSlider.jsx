import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { HERO_SLIDES, QUICK_PROGRAMS } from '../mock';
import { api } from '../hooks/useApi';
import { resolveUrl } from './ImageUploadField';

const HeroSlider = () => {
  const [slides, setSlides] = useState(HERO_SLIDES); // fallback to mock
  const [i, setI] = useState(0);

  useEffect(() => {
    let cancel = false;
    api.banners()
      .then((data) => {
        if (cancel || !data) return;
        const active = data
          .filter((b) => b.is_active !== false)
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        if (active.length > 0) setSlides(active);
      })
      .catch(() => { /* keep mock fallback */ });
    return () => { cancel = true; };
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => setI((p) => (p + 1) % slides.length), 5500);
    return () => clearInterval(t);
  }, [slides.length]);

  if (!slides.length) return null;
  const next = () => setI((p) => (p + 1) % slides.length);
  const prev = () => setI((p) => (p - 1 + slides.length) % slides.length);
  const s = slides[i];

  return (
    <section className="relative">
      {/* Programs strip */}
      <div className="bg-[#F5B921]">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4">
          {QUICK_PROGRAMS.map((p) => (
            <Link key={p.code} to={p.href} className="group p-5 md:p-6 border-r last:border-r-0 border-[#0F2A5C]/15 hover:bg-[#0F2A5C] hover:text-white transition-colors">
              <div className="text-[#0F2A5C] group-hover:text-[#F5B921] font-extrabold text-lg uppercase tracking-wide">{p.title}</div>
              <div className="text-xs font-semibold text-[#0F2A5C]/70 group-hover:text-white/80">{p.sub}</div>
              <div className="text-xs mt-2 text-[#0F2A5C]/80 group-hover:text-white/80 line-clamp-3">{p.desc}</div>
              <div className="mt-3 inline-flex items-center gap-1 text-sm font-bold"><ArrowRight size={14}/> Learn more</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Slider */}
      <div className="relative h-[460px] md:h-[560px] overflow-hidden">
        {slides.map((slide, idx) => (
          <div key={slide.id || idx} className={`absolute inset-0 transition-opacity duration-700 ${idx === i ? 'opacity-100' : 'opacity-0'}`}>
            <img src={resolveUrl(slide.image)} alt={slide.title} className="w-full h-full object-cover"/>
            <div className="absolute inset-0 bg-gradient-to-r from-[#0F2A5C]/85 via-[#0F2A5C]/55 to-transparent"/>
          </div>
        ))}
        <div className="relative z-10 max-w-7xl mx-auto px-4 h-full flex items-center">
          <div className="max-w-xl text-white">
            <div className="inline-block bg-[#F5B921] text-[#0F2A5C] px-3 py-1 text-xs font-bold rounded mb-4 uppercase tracking-widest">Premium Coaching • Since 2002</div>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">{s.title}</h1>
            {s.subtitle && <p className="mt-4 text-white/90 text-lg">{s.subtitle}</p>}
            <div className="mt-7 flex gap-3">
              <Link to={s.link || '/courses'}><Button className="bg-[#F5B921] hover:bg-[#e3a911] text-[#0F2A5C] font-bold h-12 px-6">{s.cta || 'Learn more'} <ArrowRight size={16}/></Button></Link>
              <Link to="/contact"><Button variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-[#0F2A5C] h-12 px-6">Talk to Counsellor</Button></Link>
            </div>
          </div>
        </div>
        {slides.length > 1 && (
          <>
            <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/20 hover:bg-[#F5B921] hover:text-[#0F2A5C] text-white flex items-center justify-center backdrop-blur"><ChevronLeft/></button>
            <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/20 hover:bg-[#F5B921] hover:text-[#0F2A5C] text-white flex items-center justify-center backdrop-blur"><ChevronRight/></button>
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-20">
              {slides.map((_, idx) => (
                <button key={idx} onClick={() => setI(idx)} className={`h-2 rounded-full transition-all ${idx === i ? 'w-8 bg-[#F5B921]' : 'w-2 bg-white/60'}`}/>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default HeroSlider;
