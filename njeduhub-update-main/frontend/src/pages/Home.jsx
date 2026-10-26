import React from 'react';
import HeroSlider from '../components/HeroSlider';
import { Counters, Features, LatestUpdates } from '../components/HomeSections';
import { CoursesGrid, TopResults, FacultyTeaser, YouTubeSection, Testimonials, FAQSection } from '../components/HomeSections2';
import InquiryForm from '../components/InquiryForm';

const Home = () => {
  return (
    <>
      <HeroSlider />
      <Counters />
      <CoursesGrid compact />
      <TopResults />
      <Features />
      <FacultyTeaser />
      <YouTubeSection />
      <Testimonials />
      <LatestUpdates />
      <section className="py-16 bg-gradient-to-br from-[#F8FAFC] to-white">
        <div className="max-w-5xl mx-auto px-4">
          <InquiryForm/>
        </div>
      </section>
      <FAQSection />
    </>
  );
};

export default Home;
