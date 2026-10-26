import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Instagram, Youtube, Twitter, Linkedin } from 'lucide-react';
import { SITE, CENTRES } from '../mock';

const Footer = () => {
  return (
    <footer className="bg-[#0B1F45] text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white rounded-lg p-1 w-14 h-14 flex items-center justify-center">

            </div>
            <div className="leading-tight">
              <div className="font-extrabold text-white text-lg">{SITE.name}</div>
              <div className="text-[11px] text-[#F5B921] uppercase tracking-widest">Premium Coaching</div>
            </div>
          </div>
          <p className="text-sm leading-relaxed">
            India&apos;s trusted IIT-JEE &amp; NEET coaching institute. 23+ years of academic excellence, 1400+ JEE Advanced ranks, and a community of dedicated mentors.
          </p>
          <div className="flex gap-3 mt-4">
            {[
              { key: 'facebook', icon: Facebook, href: SITE.socials.facebook },
              { key: 'instagram', icon: Instagram, href: SITE.socials.instagram },
              { key: 'youtube', icon: Youtube, href: SITE.socials.youtube },
              { key: 'twitter', icon: Twitter, href: SITE.socials.twitter },
              { key: 'linkedin', icon: Linkedin, href: SITE.socials.linkedin },
            ].filter((item) => item.href && item.href !== '#').map(({ key, icon: Icon, href }) => (
              <a key={key} href={href} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#F5B921] hover:text-[#0F2A5C] flex items-center justify-center transition-colors">
                <Icon size={16}/>
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            {['About','Courses','Results','Faculty','Testimonials','Gallery','Blogs','Contact','Career','Franchise'].map((l) => (
              <li key={l}><Link to={`/${l.toLowerCase()}`} className="hover:text-[#F5B921] transition-colors">{l}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Our Centres</h4>
          <ul className="space-y-2 text-sm">
            {CENTRES.slice(0,10).map((c) => <li key={c} className="hover:text-[#F5B921] cursor-pointer">• {c}</li>)}
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Contact</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-2"><MapPin size={16} className="text-[#F5B921] shrink-0 mt-0.5"/>{SITE.address}</li>
            <li className="flex gap-2"><Phone size={16} className="text-[#F5B921] shrink-0 mt-0.5"/><a href={`tel:${SITE.phone}`}>{SITE.phone}</a></li>
            <li className="flex gap-2"><Mail size={16} className="text-[#F5B921] shrink-0 mt-0.5"/><a href={`mailto:${SITE.email}`}>{SITE.email}</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-2 text-xs text-gray-400">
          <div>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</div>
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-[#F5B921]">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-[#F5B921]">Terms &amp; Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
