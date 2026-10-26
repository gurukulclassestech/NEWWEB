import React, { useEffect, useState } from 'react';
import { Link, Route, Routes, useLocation, Navigate } from 'react-router-dom';
import {
  LayoutDashboard, Inbox, BookOpen, Users, FileText, Quote, Trophy,
  Image as ImgIcon, Newspaper, GraduationCap, LogOut, ListChecks, Menu, X, KeyRound, UserCircle2, Images, Settings, MapPin, ClipboardList, PlayCircle
} from 'lucide-react';
import AdminDashboard from './AdminDashboard';
import AdminLeads from './AdminLeads';
import AdminContent from './AdminContent';
import AdminLogin from './AdminLogin';
import ExamManagement from './ExamManagement';
import LectureManagement from './LectureManagement';
import ChangePasswordModal from './ChangePasswordModal';
import { useAuth } from '../../auth/AuthContext';
import { SITE } from '../../mock';

const NAV = [
  { path: '',                 label: 'Dashboard',      icon: LayoutDashboard },
  { path: 'homepage-editor', label: 'HomePage Editor', icon: LayoutDashboard },
  { path: 'seo',             label: 'SEO Manager',     icon: FileText },
  { path: 'inquiries',       label: 'Inquiries',       icon: Inbox },
  { path: 'admissions',      label: 'Admissions',      icon: GraduationCap },
  { path: 'scholarship',     label: 'Scholarship',     icon: Trophy },
  { path: 'careers',         label: 'Careers',         icon: ListChecks },
  { path: 'site-settings',   label: 'Site Settings',   icon: Settings },
  { path: 'banners',         label: 'Hero Banners',    icon: Images },
  { path: 'counters',       label: 'Counters',        icon: Trophy },
  { path: 'faqs',           label: 'FAQs',            icon: FileText },
  { path: 'programs-strip', label: 'Programs Strip',  icon: BookOpen },
  { path: 'why-us',         label: 'Why Us',          icon: Users },
  { path: 'centres',        label: 'Centres',         icon: MapPin },
  { path: 'courses',        label: 'Courses',         icon: BookOpen },
  { path: 'exams',          label: 'Exam Management', icon: ClipboardList },
  { path: 'lectures',      label: 'Video Lectures',  icon: PlayCircle },
  { path: 'faculty',        label: 'Faculty',         icon: Users },
  { path: 'blogs',          label: 'Blogs',           icon: FileText },
  { path: 'testimonials',   label: 'Testimonials',    icon: Quote },
  { path: 'toppers',       label: 'Toppers',         icon: Trophy },
  { path: 'results',       label: 'Results',         icon: Trophy },
  { path: 'gallery',       label: 'Gallery',         icon: ImgIcon },
  { path: 'news',          label: 'News',            icon: Newspaper },
];

const LEADS = new Set(['inquiries','admissions','scholarship','careers']);
const VALID_CONTENT = ['homepage-editor','seo','site-settings','banners','counters','faqs','programs-strip','why-us','centres','courses','exams','faculty','blogs','testimonials','toppers','results','gallery','news'];

const RequireAuth = ({ children }) => {
  const { auth, ready } = useAuth();
  const loc = useLocation();
  if (!ready) return <div className="min-h-screen grid place-items-center text-slate-400">Loading…</div>;
  if (!auth?.token) return <Navigate to="/admin-x9k2/login" state={{ from: loc.pathname }} replace />;
  return children;
};

const ExamAdminRoutes = () => {
  const { pathname } = useLocation();
  const match = pathname.replace('/admin-x9k2/exams', '').replace(/^\//, '');

  if (match === 'create') return <ExamManagement mode="create"/>;
  if (match && match !== '' && match !== 'new') {
    const id = match.split('/')[0];
    if (match.startsWith(`${id}/edit`) || match === id) return <ExamManagement mode="edit" examId={id}/>;
  }
  return <ExamManagement mode="list"/>;
};

const LectureAdminRoutes = () => {
  const { pathname } = useLocation();
  const match = pathname.replace('/admin-x9k2/lectures', '').replace(/^\//, '');

  if (match === 'create') return <LectureManagement mode="create"/>;
  if (match && match !== '' && match !== 'new') {
    const id = match.split('/')[0];
    if (match.startsWith(`${id}/edit`) || match === id) return <LectureManagement mode="edit" lectureId={id}/>;
  }
  return <LectureManagement mode="list"/>;
};

const AdminRouter = () => {
  const { pathname } = useLocation();
  const segment = pathname.replace('/admin-x9k2', '').replace(/^\//, '');
  if (LEADS.has(segment)) return <AdminLeads path={segment}/>;
  if (segment === 'exams') return <ExamAdminRoutes/>;
  if (segment === 'lectures') return <LectureAdminRoutes/>;
  if (VALID_CONTENT.includes(segment)) return <AdminContent path={segment}/>;
  return <Navigate to="/admin-x9k2" replace/>;
};

const Shell = () => {
  const { pathname } = useLocation();
  const { logout, username } = useAuth();
  const [drawer, setDrawer] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  useEffect(() => { setDrawer(false); setUserMenu(false); }, [pathname]);

  const segment = pathname.replace('/admin-x9k2', '').replace(/^\//, '') || '';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-white border-b">
        <div className="px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setDrawer(true)} className="lg:hidden p-2 rounded hover:bg-slate-100"><Menu/></button>
            <Link to="/admin-x9k2" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-[#0F2A5C] flex items-center justify-center">
                <img src={SITE.logo} alt="" className="w-6 h-6 object-contain"/>
              </div>
              <div className="leading-tight">
                <div className="font-extrabold text-[#0F2A5C] text-sm">Gurukul Classes</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-widest">Admin Console</div>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Link to="/" className="hidden sm:inline-block px-3 py-1.5 rounded border hover:bg-slate-100 font-semibold">← View Site</Link>
            <div className="relative">
              <button onClick={() => setUserMenu(v => !v)} className="flex items-center gap-2 px-3 py-1.5 rounded border hover:bg-slate-100 font-semibold">
                <UserCircle2 size={16} className="text-[#0F2A5C]"/> {username || 'admin'}
              </button>
              {userMenu && (
                <div className="absolute right-0 mt-1 w-48 bg-white border rounded-md shadow-lg overflow-hidden z-40">
                  <button onClick={() => { setPwOpen(true); setUserMenu(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-slate-100 flex items-center gap-2"><KeyRound size={14}/> Change password</button>
                  <button onClick={logout} className="w-full text-left px-3 py-2 text-sm hover:bg-rose-50 text-rose-600 flex items-center gap-2"><LogOut size={14}/> Sign out</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - desktop */}
        <aside className="hidden lg:block w-60 shrink-0 border-r bg-white min-h-[calc(100vh-56px)] sticky top-14">
          <nav className="p-3 space-y-0.5">
            {NAV.map(({ path, label, icon: Icon }) => {
              const active = segment === path;
              return (
                <Link key={path} to={`/admin-x9k2${path ? '/' + path : ''}`} className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-medium ${active ? 'bg-[#0F2A5C] text-white' : 'text-slate-700 hover:bg-slate-100'}`}>
                  <Icon size={16}/> {label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Mobile drawer */}
        {drawer && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setDrawer(false)}/>
            <div className="absolute left-0 top-0 h-full w-72 bg-white shadow-xl">
              <div className="p-3 flex justify-between items-center border-b">
                <div className="font-bold text-[#0F2A5C]">Admin</div>
                <button onClick={() => setDrawer(false)} className="p-2 rounded hover:bg-slate-100"><X/></button>
              </div>
              <nav className="p-2 space-y-0.5 overflow-y-auto">
                {NAV.map(({ path, label, icon: Icon }) => {
                  const active = segment === path;
                  return (
                    <Link key={path} to={`/admin-x9k2${path ? '/' + path : ''}`} className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-medium ${active ? 'bg-[#0F2A5C] text-white' : 'text-slate-700 hover:bg-slate-100'}`}>
                      <Icon size={16}/> {label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        )}

        {/* Main */}
        <main className="flex-1 p-4 md:p-6 min-w-0">
          <Routes>
            <Route path="/" element={<AdminDashboard/>}/>
            <Route path="exams/*" element={<ExamAdminRoutes/>}/>
            <Route path="lectures/*" element={<LectureAdminRoutes/>}/>
            <Route path=":path" element={<AdminRouter/>}/>
          </Routes>
        </main>
      </div>

      {pwOpen && <ChangePasswordModal onClose={() => setPwOpen(false)} />}
    </div>
  );
};

const AdminLayout = () => (
  <Routes>
    <Route path="login" element={<AdminLogin/>}/>
    <Route path="*" element={<RequireAuth><Shell/></RequireAuth>}/>
  </Routes>
);

export default AdminLayout;
