import React from 'react';
import PageHero from '../components/PageHero';
import InquiryForm from '../components/InquiryForm';
import { SITE, CENTRES } from '../mock';
import { Phone, Mail, MapPin, Clock, MessageCircle } from 'lucide-react';

const Contact = () => {
  return (
    <>
      <PageHero title="Contact Us" subtitle="Talk to a counsellor today — we typically respond within 1 hour during working hours." breadcrumbs={[{label:'Contact'}]}/>
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                {icon:Phone, label:'Call us', value:SITE.phone, href:`tel:${SITE.phone}`},
                {icon:Mail, label:'Email us', value:SITE.email, href:`mailto:${SITE.email}`},
                {icon:MessageCircle, label:'WhatsApp', value:SITE.whatsapp, href:`https://wa.me/${SITE.whatsapp.replace(/\D/g,'')}`},
                {icon:Clock, label:'Working hours', value:'Mon – Sat: 9am to 8pm'},
              ].map((c,i)=>(
                <a key={i} href={c.href} className="bg-[#F8FAFC] rounded-xl p-5 border border-gray-100 hover:border-[#F5B921] transition-colors block">
                  <div className="w-10 h-10 rounded-lg bg-[#0F2A5C] text-[#F5B921] flex items-center justify-center mb-3"><c.icon size={18}/></div>
                  <div className="text-xs font-bold text-[#F5B921] uppercase tracking-wider">{c.label}</div>
                  <div className="text-[#0F2A5C] font-bold mt-1">{c.value}</div>
                </a>
              ))}
            </div>
            <div className="bg-[#0F2A5C] text-white rounded-xl p-6">
              <div className="flex items-center gap-2 text-[#F5B921] font-bold uppercase tracking-widest text-xs"><MapPin size={14}/> Head Office</div>
              <div className="mt-2 font-semibold">{SITE.address}</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="font-bold text-[#0F2A5C] mb-3">Our Centres</div>
              <div className="flex flex-wrap gap-2">
                {CENTRES.map(c => <span key={c} className="px-3 py-1.5 text-xs font-semibold bg-[#F8FAFC] border border-gray-100 rounded-full text-[#0F2A5C]">{c}</span>)}
              </div>
            </div>
          </div>
          <InquiryForm title="Send a message" subtitle="We’d love to help you choose the right program."/>
        </div>
      </section>
      <section className="pb-14 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <iframe title="map" className="w-full h-80 rounded-xl border" src="https://www.openstreetmap.org/export/embed.html?bbox=73.78%2C18.49%2C73.96%2C18.59&layer=mapnik"/>
        </div>
      </section>
    </>
  );
};
export default Contact;
