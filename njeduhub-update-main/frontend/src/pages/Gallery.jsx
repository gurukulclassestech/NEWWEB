import React, { useState } from 'react';
import PageHero from '../components/PageHero';
import { useApi, api } from '../hooks/useApi';
import { X } from 'lucide-react';

const Gallery = () => {
  const [active, setActive] = useState(null);
  const { data: items } = useApi(() => api.gallery(), []);
  const urls = (items || []).map(i => i.url || i);
  return (
    <>
      <PageHero title="Gallery" subtitle="Glimpses of campus life, classrooms, felicitations and the everyday hustle." breadcrumbs={[{label:'Gallery'}]}/>
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {urls.map((g, i) => (
            <button key={i} onClick={() => setActive(g)} className="block break-inside-avoid w-full overflow-hidden rounded-xl group">
              <img src={g} alt="" className="w-full object-cover group-hover:scale-105 transition-transform duration-500"/>
            </button>
          ))}
        </div>
      </section>
      {active && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setActive(null)}>
          <button onClick={() => setActive(null)} className="absolute top-4 right-4 text-white"><X size={28}/></button>
          <img src={active} alt="" className="max-h-[90vh] max-w-[95vw] rounded-lg"/>
        </div>
      )}
    </>
  );
};
export default Gallery;
