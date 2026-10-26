import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageHero from '../components/PageHero';
import { CoursesGrid } from '../components/HomeSections2';
import InquiryForm from '../components/InquiryForm';
import { api } from '../hooks/useApi';
import { Check, Clock, Users, BookOpen, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';

export const CoursesList = () => (
  <>
    <PageHero title="Our Courses" subtitle="Hybrid + Online + Offline tracks for every aspirant — from foundation to droppers." breadcrumbs={[{label:'Courses'}]} />
    <CoursesGrid />
  </>
);

export const CourseDetail = () => {
  const { slug } = useParams();
  const [c, setC] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancel = false;
    setC(null); setNotFound(false);
    api.courseBySlug(slug)
      .then(d => { if (!cancel) setC(d); })
      .catch(() => { if (!cancel) setNotFound(true); });
    return () => { cancel = true; };
  }, [slug]);

  if (notFound) return <div className="py-32 text-center">Course not found. <Link to="/courses" className="text-[#F5B921] font-bold">Browse all courses</Link></div>;
  if (!c) return <div className="py-32 text-center text-slate-400">Loading…</div>;

  return (
    <>
      <PageHero title={c.title} subtitle={c.short} breadcrumbs={[{label:'Courses', href:'/courses'},{label:c.title}]} />
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <img src={c.image} alt={c.title} className="w-full aspect-[16/9] object-cover rounded-xl"/>
            <div className="grid grid-cols-3 gap-3 mt-5">
              {[
                {icon:Clock, label:'Duration', value:c.duration},
                {icon:Users, label:'Audience', value:c.audience},
                {icon:BookOpen, label:'Subjects', value:(c.subjects||[]).join(', ')},
              ].map((x,i)=>(
                <div key={i} className="bg-[#F8FAFC] rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#F5B921] uppercase tracking-wider"><x.icon size={14}/> {x.label}</div>
                  <div className="font-bold text-[#0F2A5C] mt-1">{x.value}</div>
                </div>
              ))}
            </div>
            <h3 className="font-extrabold text-2xl text-[#0F2A5C] mt-8">Program Overview</h3>
            <p className="text-gray-700 leading-relaxed mt-2">{c.detail}</p>
            <h3 className="font-extrabold text-2xl text-[#0F2A5C] mt-8">What you get</h3>
            <ul className="mt-3 grid sm:grid-cols-2 gap-2">
              {(c.highlights || []).map((h) => (
                <li key={h} className="flex gap-2 items-start text-gray-700"><Check className="text-[#F5B921] mt-0.5 shrink-0" size={18}/> {h}</li>
              ))}
            </ul>
            <h3 className="font-extrabold text-2xl text-[#0F2A5C] mt-8">Curriculum Snapshot</h3>
            <div className="mt-3 space-y-3">
              {['Phase 1 — Conceptual Foundations','Phase 2 — Application & Practice','Phase 3 — Advanced Problem Solving','Phase 4 — Full-Length Mock Marathon','Phase 5 — Final Revision & Exam Temperament'].map((p)=>(
                <div key={p} className="bg-white rounded-xl border border-gray-100 p-4 hover:border-[#F5B921] transition-colors">
                  <div className="font-bold text-[#0F2A5C]">{p}</div>
                </div>
              ))}
            </div>
          </div>
          <aside className="space-y-5">
            <div className="bg-[#0F2A5C] text-white rounded-xl p-6">
              <div className="text-xs uppercase tracking-widest text-[#F5B921] font-bold">Course Fee</div>
              <div className="text-4xl font-extrabold mt-1">{c.price}</div>
              <div className="text-xs text-white/70 mt-1">EMI options available. Scholarship up to 100%.</div>
              <Link to="/admission" className="block mt-5">
                <Button className="w-full bg-[#F5B921] hover:bg-[#e3a911] text-[#0F2A5C] font-bold h-12">Apply Now <ArrowRight size={16}/></Button>
              </Link>
              <Link to="/scholarship" className="block mt-2">
                <Button variant="outline" className="w-full bg-transparent border-white text-white hover:bg-white hover:text-[#0F2A5C]">Try Scholarship Test</Button>
              </Link>
            </div>
            <InquiryForm title="Talk to a Counsellor" subtitle="Get a personal program walkthrough."/>
          </aside>
        </div>
      </section>
    </>
  );
};
