import React from 'react';
import PageHero from '../components/PageHero';
import InquiryForm from '../components/InquiryForm';
import { Building2, IndianRupee, Handshake, BookOpenCheck, Users, Award, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';

const Franchise = () => (
  <>
    <PageHero title="Franchise Partnership" subtitle="Bring Gurukul Classes’ 23-year academic IP to your city. Start your own coaching empire." breadcrumbs={[{label:'Franchise'}]}/>
    <section className="py-14 bg-white">
      <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-10 items-center">
        <img src="https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1000&q=80" alt="" className="rounded-xl aspect-[4/3] object-cover"/>
        <div>
          <div className="inline-block text-xs font-bold text-[#F5B921] uppercase tracking-widest">Partnership Opportunity</div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#0F2A5C] mt-2">Run your own Gurukul Classes centre</h2>
          <p className="text-gray-700 leading-relaxed mt-4">
            Leverage two decades of curriculum, faculty training, AI testing engine and brand pull. We offer end-to-end support — from launch playbooks to marketing, from teacher hiring to student onboarding.
          </p>
          <Link to="/contact"><Button className="mt-5 bg-[#F5B921] hover:bg-[#e3a911] text-[#0F2A5C] font-bold">Request Franchise Brochure <ArrowRight size={16}/></Button></Link>
        </div>
      </div>
    </section>
    <section className="py-14 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-extrabold text-[#0F2A5C] text-center">Why Partner With Us</h2>
        <div className="w-20 h-1 bg-[#F5B921] mx-auto mt-3 mb-10"/>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            {icon:Award, t:'Established Brand', d:'23+ years of academic excellence. 1400+ JEE Advanced ranks.'},
            {icon:BookOpenCheck, t:'World-class Curriculum', d:'Battle-tested study material, test series and assessment engine.'},
            {icon:Users, t:'Faculty Training', d:'Comprehensive teacher training and on-going pedagogy support.'},
            {icon:Handshake, t:'Marketing Support', d:'Local marketing playbooks, creatives, lead funnels, CRM.'},
            {icon:Building2, t:'Setup Assistance', d:'Centre setup, classroom design, IT and operations playbooks.'},
            {icon:IndianRupee, t:'Healthy Margins', d:'Predictable, recurring revenue with industry-leading margins.'},
          ].map((x,i)=>(
            <div key={i} className="bg-white rounded-xl p-6 border border-gray-100 hover:border-[#F5B921] transition-colors">
              <div className="w-12 h-12 rounded-lg bg-[#0F2A5C] text-[#F5B921] flex items-center justify-center mb-4"><x.icon size={22}/></div>
              <h3 className="font-bold text-[#0F2A5C]">{x.t}</h3>
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">{x.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
    <section className="py-14 bg-white">
      <div className="max-w-5xl mx-auto px-4">
        <InquiryForm title="Apply for Franchise" subtitle="Share your interest and city. Our partnership team will reach out within 48 hours."/>
      </div>
    </section>
  </>
);
export default Franchise;
