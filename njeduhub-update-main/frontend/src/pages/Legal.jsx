import React from 'react';
import PageHero from '../components/PageHero';

const Section = ({ title, children }) => (
  <section className="mb-8">
    <h2 className="text-xl md:text-2xl font-extrabold text-[#0F2A5C] mb-3">{title}</h2>
    <div className="text-gray-700 leading-relaxed space-y-3">{children}</div>
  </section>
);

export const Privacy = () => (
  <>
    <PageHero title="Privacy Policy" breadcrumbs={[{label:'Privacy'}]}/>
    <article className="py-14 bg-white">
      <div className="max-w-3xl mx-auto px-4">
        <Section title="Information We Collect"><p>We collect basic personal information (name, phone, email, city, current standard) when you submit any inquiry or admission form. We may collect academic information when you appear for the scholarship test.</p></Section>
        <Section title="How We Use Your Information"><p>Your information is used purely for academic counselling, admission support and updates about our programs. We do not sell or share personal data with any third party for marketing purposes.</p></Section>
        <Section title="Cookies"><p>We use minimal cookies for site analytics. You may disable cookies via your browser settings without affecting browsing of public pages.</p></Section>
        <Section title="Data Retention"><p>Inquiry data is retained for up to 24 months for support and follow-up. Admission data is retained per academic record norms.</p></Section>
        <Section title="Your Rights"><p>You may write to us at info@gurukulclasses.com to request access, correction or deletion of your personal data at any time.</p></Section>
      </div>
    </article>
  </>
);

export const Terms = () => (
  <>
    <PageHero title="Terms & Conditions" breadcrumbs={[{label:'Terms'}]}/>
    <article className="py-14 bg-white">
      <div className="max-w-3xl mx-auto px-4">
        <Section title="Acceptance of Terms"><p>By using this website or enrolling in any program, you agree to abide by these terms in full. If you disagree, kindly refrain from using our services.</p></Section>
        <Section title="Program Enrolment"><p>Enrolment is subject to fee payment, eligibility, and timely document verification. Program structure, schedule and faculty allocation may be modified for academic reasons.</p></Section>
        <Section title="Fees & Refunds"><p>Program fees are non-refundable once classes commence. Pre-class withdrawals are eligible for refund as per the institute&apos;s refund policy with applicable deductions.</p></Section>
        <Section title="Code of Conduct"><p>Students and parents are expected to maintain a respectful, learning-positive environment in all classrooms, online platforms and centres.</p></Section>
        <Section title="Intellectual Property"><p>All study material, recorded lectures and test series content are the exclusive intellectual property of Gurukul Classes. Reproduction or distribution is strictly prohibited.</p></Section>
        <Section title="Limitation of Liability"><p>While we strive for academic excellence, we make no guarantee of specific exam outcomes. Outcomes depend on student effort, consistency and other factors.</p></Section>
      </div>
    </article>
  </>
);
