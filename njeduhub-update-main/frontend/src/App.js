import React, { useEffect, useState } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import FloatingButtons from './components/FloatingButtons';
import { Toaster } from './components/ui/toaster';
import { AuthProvider } from './auth/AuthContext';
import { syncSiteSettings } from './mock';

import Home from './pages/Home';
import About from './pages/About';
import { CoursesList, CourseDetail } from './pages/Courses';
import Results from './pages/Results';
import Faculty from './pages/Faculty';
import Gallery from './pages/Gallery';
import Testimonials from './pages/Testimonials';
import { BlogsList, BlogDetail } from './pages/Blogs';
import Contact from './pages/Contact';
import Admission from './pages/Admission';
import Scholarship from './pages/Scholarship';
import Franchise from './pages/Franchise';
import Career from './pages/Career';
import Exam from './pages/Exam';
import Lectures from './pages/Lectures';
import { Privacy, Terms } from './pages/Legal';
import AdminLayout from './pages/admin/AdminLayout';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [pathname]);
  return null;
};

const PublicLayout = ({ children }) => (
  <>
    <Header />
    <main>{children}</main>
    <Footer />
    <FloatingButtons />
  </>
);

function App() {
  const [siteReady, setSiteReady] = useState(false);

  useEffect(() => {
    let active = true;
    syncSiteSettings().finally(() => {
      if (active) setSiteReady(true);
    });
    return () => { active = false; };
  }, []);

  if (!siteReady) {
    return <div className="min-h-screen bg-[#0F2A5C]" />;
  }

  return (
    <div className="App">
      <AuthProvider>
        <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/admin-x9k2/*" element={<AdminLayout />} />
          <Route path="/*" element={
            <PublicLayout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/courses" element={<CoursesList />} />
                <Route path="/courses/:slug" element={<CourseDetail />} />
                <Route path="/exam" element={<Exam />} />
                <Route path="/lectures" element={<Lectures />} />
                <Route path="/results" element={<Results />} />
                <Route path="/faculty" element={<Faculty />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/testimonials" element={<Testimonials />} />
                <Route path="/blogs" element={<BlogsList />} />
                <Route path="/blogs/:slug" element={<BlogDetail />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/admission" element={<Admission />} />
                <Route path="/scholarship" element={<Scholarship />} />
                <Route path="/franchise" element={<Franchise />} />
                <Route path="/career" element={<Career />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
              </Routes>
            </PublicLayout>
          } />
        </Routes>
        <Toaster />
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;
