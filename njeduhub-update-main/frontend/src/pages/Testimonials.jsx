import React from 'react';
import PageHero from '../components/PageHero';
import { Testimonials as TestimonialsBlock, YouTubeSection } from '../components/HomeSections2';

const Testimonials = () => (
  <>
    <PageHero title="Testimonials" subtitle="In the voice of those who have lived the journey — our students." breadcrumbs={[{label:'Testimonials'}]}/>
    <TestimonialsBlock />
    <YouTubeSection />
  </>
);
export default Testimonials;
