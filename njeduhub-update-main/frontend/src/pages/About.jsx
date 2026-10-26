import React from 'react';
import PageHero from '../components/PageHero';
import { Counters, Features } from '../components/HomeSections';
import { FacultyTeaser } from '../components/HomeSections2';
import { Award, Heart, Lightbulb, Target } from 'lucide-react';

const About = () => {
  return (
    <>
      <PageHero title="About Gurukul Classes" subtitle="23+ years. 1400+ JEE Advanced ranks. One unwavering mission — nurturing world-class problem solvers." breadcrumbs={[{label: 'About'}]} />
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-block text-xs font-bold text-[#F5B921] uppercase tracking-widest">Our Story</div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0F2A5C] mt-2">A Different Kind of Coaching Institute</h2>
            <div className="w-20 h-1 bg-[#F5B921] mt-3"/>
            <p className="mt-6 text-gray-700 leading-relaxed">
              Gurukul Classes, founded in 2002, is a premier coaching institute dedicated to nurturing
              dynamic young minds for top-tier engineering and medical careers. With a board of
              accomplished educators, 75+ faculty members, and 50+ support staff, we obsess over
              one thing — building world-class problem solvers.
            </p>
            <p className="mt-3 text-gray-700 leading-relaxed">
              We do not believe in factory-style coaching. Each batch is small, each lesson is
              differentiated, each test is analysed and each student is mentored personally. Stress
              has no seat in our classrooms; only joy in learning and the thrill of mastery.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80" alt="Classroom" className="rounded-xl aspect-square object-cover"/>
            <img src="https://images.unsplash.com/photo-1561379982-c9f0e54ff067?auto=format&fit=crop&w=600&q=80" alt="Library" className="rounded-xl aspect-square object-cover mt-8"/>
            <img src="https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=600&q=80" alt="Lab" className="rounded-xl aspect-square object-cover"/>
            <img src="https://images.unsplash.com/photo-1581726707445-75cbe4efc586?auto=format&fit=crop&w=600&q=80" alt="Hi-tech" className="rounded-xl aspect-square object-cover mt-8"/>
          </div>
        </div>
      </section>

      <Counters />

      <section className="py-16 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-6">
          {[
            { icon: Target, title: 'Our Mission', desc: 'Build a generation of conceptual thinkers who solve problems with elegance, not effort.' },
            { icon: Lightbulb, title: 'Our Vision', desc: 'To be India’s most trusted name in inclusive, stress-free entrance coaching.' },
            { icon: Heart, title: 'Our Values', desc: 'Integrity. Empathy. Excellence. Long-term thinking. Student-first decisions.' },
          ].map((v, i) => (
            <div key={i} className="bg-white rounded-xl p-7 border border-gray-100 hover:border-[#F5B921] transition-colors">
              <div className="w-12 h-12 rounded-lg bg-[#0F2A5C] text-[#F5B921] flex items-center justify-center mb-4"><v.icon size={22}/></div>
              <h3 className="font-bold text-[#0F2A5C] text-xl">{v.title}</h3>
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <Features />
      <FacultyTeaser />

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-5">
          {[{n:'Mr. Durgesh Mangeshkar',r:'Founder & Managing Director'},{n:'Dr. Rajesh Naik',r:'Academic Director'},{n:'Mrs. Sunita Kale',r:'Operations Director'},{n:'Mr. Anand Joshi',r:'Head — Test Series'}].map((p,i)=>(
            <div key={i} className="bg-[#F8FAFC] rounded-xl p-6 text-center border border-gray-100">
              <div className="w-20 h-20 rounded-full bg-[#0F2A5C] text-[#F5B921] mx-auto flex items-center justify-center text-2xl font-extrabold"><Award size={28}/></div>
              <div className="mt-4 font-bold text-[#0F2A5C]">{p.n}</div>
              <div className="text-xs font-bold text-[#F5B921] uppercase tracking-wider mt-1">{p.r}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};
export default About;
