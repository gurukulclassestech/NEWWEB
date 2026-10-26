import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const PageHero = ({ title, subtitle, breadcrumbs = [] }) => {
  return (
    <section className="relative bg-[#0F2A5C] text-white overflow-hidden">
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: 'radial-gradient(circle at 20% 20%, #F5B921 0px, transparent 200px), radial-gradient(circle at 80% 80%, #2c5fb8 0px, transparent 250px)'
      }}/>
      <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-20">
        <nav className="text-sm text-white/80 flex items-center gap-1 mb-4">
          <Link to="/" className="hover:text-[#F5B921]">Home</Link>
          {breadcrumbs.map((b, i) => (
            <span key={i} className="flex items-center gap-1">
              <ChevronRight size={14}/>
              {b.href ? <Link to={b.href} className="hover:text-[#F5B921]">{b.label}</Link> : <span className="text-[#F5B921]">{b.label}</span>}
            </span>
          ))}
        </nav>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-3 text-white/80 max-w-2xl">{subtitle}</p>}
      </div>
    </section>
  );
};

export default PageHero;
