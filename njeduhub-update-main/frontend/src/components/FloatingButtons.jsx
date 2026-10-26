import React from 'react';
import { MessageCircle, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SITE } from '../mock';

const FloatingButtons = () => {
  return (
    <>
      <a
        href={`https://wa.me/${SITE.whatsapp.replace(/\D/g,'')}`}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 left-6 z-40 bg-[#25D366] hover:bg-[#1ebe57] text-white rounded-full w-14 h-14 flex items-center justify-center shadow-2xl transition-transform hover:scale-110"
        aria-label="WhatsApp"
      >
        <MessageCircle size={26}/>
      </a>
      <Link
        to="/admission"
        className="fixed bottom-6 right-6 z-40 bg-[#F5B921] hover:bg-[#e3a911] text-[#0F2A5C] font-extrabold rounded-full px-5 h-14 flex items-center gap-2 shadow-2xl transition-transform hover:scale-105"
      >
        <Phone size={18}/> Apply Now
      </Link>
    </>
  );
};

export default FloatingButtons;
