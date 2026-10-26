import React, { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { useToast } from '../../hooks/use-toast';
import { Lock, User, ShieldCheck } from 'lucide-react';
import { SITE } from '../../mock';

const AdminLogin = () => {
  const { login, auth, ready } = useAuth();
  const navigate = useNavigate();
  const loc = useLocation();
  const { toast } = useToast();
  const [form, setForm] = useState({ username: '', password: '' });
  const [busy, setBusy] = useState(false);

  if (!ready) return <div className="min-h-screen grid place-items-center text-slate-400">Loading…</div>;
  if (auth?.token) return <Navigate to={loc.state?.from || '/admin-x9k2'} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await login(form.username.trim(), form.password);
      toast({ title: 'Welcome back!' });
      navigate(loc.state?.from || '/admin-x9k2', { replace: true });
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Login failed';
      toast({ title: 'Login failed', description: msg });
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F2A5C] to-[#1a3a7a] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-[#0F2A5C] text-white text-center py-7 px-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-white p-1 flex items-center justify-center">
            <img src={SITE.logo} alt="" className="w-14 h-14 object-contain"/>
          </div>
          <h1 className="mt-3 font-extrabold text-xl">Gurukul Classes</h1>
          <p className="text-xs text-[#F5B921] uppercase tracking-widest mt-1">Admin Console</p>
        </div>
        <form onSubmit={submit} className="p-7 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase tracking-widest"><ShieldCheck size={16} className="text-[#F5B921]"/> Sign in</div>
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1"><User size={12}/> Username</label>
            <Input value={form.username} onChange={e => setForm(p => ({...p, username: e.target.value}))} autoFocus required/>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1"><Lock size={12}/> Password</label>
            <Input type="password" value={form.password} onChange={e => setForm(p => ({...p, password: e.target.value}))} required/>
          </div>
          <Button type="submit" disabled={busy} className="w-full bg-[#F5B921] hover:bg-[#e3a911] text-[#0F2A5C] font-extrabold h-11">
            {busy ? 'Signing in…' : 'Sign in'}
          </Button>
          <div className="text-[11px] text-slate-400 text-center pt-2 border-t">
            Default credentials: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">admin / admin@123</code>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
