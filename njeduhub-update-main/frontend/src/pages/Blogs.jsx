import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PageHero from '../components/PageHero';
import { useApi, api } from '../hooks/useApi';
import { Calendar, User, ArrowRight, ChevronRight } from 'lucide-react';

export const BlogsList = () => {
  const { data: BLOGS, loading } = useApi(() => api.blogs(), []);
  const list = BLOGS || [];
  return (
    <>
      <PageHero title="Knowledge Hub" subtitle="Practical, evidence-based articles on JEE, NEET, foundation and the future of test prep." breadcrumbs={[{label:'Blogs'}]}/>
      <section className="py-14 bg-white">
        {loading && <div className="text-center text-slate-400 mb-4">Loading…</div>}
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((b) => (
            <Link to={`/blogs/${b.slug}`} key={b.slug} className="group bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="aspect-video overflow-hidden">
                <img src={b.cover} alt={b.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Calendar size={12}/> {b.date}</span>
                  <span className="flex items-center gap-1"><User size={12}/> {b.author}</span>
                </div>
                <h3 className="font-bold text-[#0F2A5C] mt-2 text-lg leading-snug">{b.title}</h3>
                <p className="text-sm text-gray-600 mt-2 line-clamp-3">{b.excerpt}</p>
                <div className="inline-flex items-center gap-1 text-sm font-bold text-[#0F2A5C] mt-3 group-hover:text-[#F5B921]">Read article <ArrowRight size={14}/></div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
};

export const BlogDetail = () => {
  const { slug } = useParams();
  const [b, setB] = useState(null);
  const [nf, setNf] = useState(false);
  useEffect(() => {
    let cancel = false;
    setB(null); setNf(false);
    api.blogBySlug(slug)
      .then(d => { if (!cancel) setB(d); })
      .catch(() => { if (!cancel) setNf(true); });
    return () => { cancel = true; };
  }, [slug]);
  if (nf) return <div className="py-32 text-center">Article not found. <Link to="/blogs" className="text-[#F5B921] font-bold">Browse all</Link></div>;
  if (!b) return <div className="py-32 text-center text-slate-400">Loading…</div>;
  return (
    <>
      <PageHero title={b.title} subtitle={b.excerpt} breadcrumbs={[{label:'Blogs', href:'/blogs'},{label: b.category}]}/>
      <article className="py-14 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
            <span className="flex items-center gap-1"><Calendar size={14}/> {b.date}</span>
            <span className="flex items-center gap-1"><User size={14}/> {b.author}</span>
            <span className="px-2 py-0.5 rounded bg-[#F5B921]/20 text-[#0F2A5C] text-xs font-bold uppercase">{b.category}</span>
          </div>
          <img src={b.cover} alt={b.title} className="w-full aspect-[16/9] object-cover rounded-xl"/>
          <div className="prose prose-slate max-w-none mt-6 text-gray-700 leading-relaxed whitespace-pre-line">{b.body}</div>
          <Link to="/blogs" className="inline-flex items-center gap-1 text-[#0F2A5C] font-bold mt-8 hover:text-[#F5B921]"><ChevronRight size={16} className="rotate-180"/> Back to all articles</Link>
        </div>
      </article>
    </>
  );
};
