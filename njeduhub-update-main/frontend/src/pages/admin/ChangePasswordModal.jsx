import React, { useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useToast } from '../../hooks/use-toast';
import { X, KeyRound } from 'lucide-react';

const ChangePasswordModal = ({ onClose }) => {
  const { changePassword } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState({ current_password: '', new_password: '', confirm: '' });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (form.new_password !== form.confirm) { toast({ title: 'Passwords do not match' }); return; }
    if (form.new_password.length < 6) { toast({ title: 'New password must be 6+ characters' }); return; }
    setBusy(true);
    try {
      await changePassword(form.current_password, form.new_password);
      toast({ title: 'Password changed' });
      onClose();
    } catch (err) {
      toast({ title: 'Could not change password', description: err?.response?.data?.detail || 'Error' });
    } finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <form onSubmit={submit} onClick={e => e.stopPropagation()} className="bg-white rounded-xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-extrabold text-[#0F2A5C] flex items-center gap-2"><KeyRound size={18}/> Change password</h3>
          <button type="button" onClick={onClose} className="p-1 rounded hover:bg-slate-100"><X size={16}/></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-600">Current password</label>
            <Input type="password" value={form.current_password} onChange={e => setForm(p => ({...p, current_password: e.target.value}))} required/>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">New password</label>
            <Input type="password" value={form.new_password} onChange={e => setForm(p => ({...p, new_password: e.target.value}))} required/>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">Confirm new password</label>
            <Input type="password" value={form.confirm} onChange={e => setForm(p => ({...p, confirm: e.target.value}))} required/>
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          <Button type="submit" disabled={busy} className="flex-1 bg-[#F5B921] hover:bg-[#e3a911] text-[#0F2A5C] font-bold">{busy ? 'Saving…' : 'Save'}</Button>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        </div>
      </form>
    </div>
  );
};

export default ChangePasswordModal;
