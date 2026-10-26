import React, { useEffect, useState } from 'react';
import { useToast } from '../hooks/use-toast';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { api } from '../hooks/useApi';
import { Send } from 'lucide-react';

const InquiryForm = ({ title = 'Quick Inquiry', subtitle = 'Drop your details — our counsellor will get back within an hour.' }) => {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: '', phone: '', email: '', city: '', course: '', message: '' });
  const [courses, setCourses] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  useEffect(() => { api.courses().then(setCourses).catch(() => setCourses([])); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.email) {
      toast({ title: 'Missing fields', description: 'Please fill in your name, phone and email.' });
      return;
    }
    setSubmitting(true);
    try {
      await api.submitInquiry(form);
      toast({ title: 'Thank you!', description: 'Your inquiry has been received. We will reach out shortly.' });
      setForm({ name: '', phone: '', email: '', city: '', course: '', message: '' });
    } catch (err) {
      toast({ title: 'Could not submit', description: 'Please try again in a moment.' });
    } finally { setSubmitting(false); }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 md:p-8">
      <h3 className="text-2xl font-extrabold text-[#0F2A5C]">{title}</h3>
      <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
      <form onSubmit={submit} className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
        <Input placeholder="Full Name *" value={form.name} onChange={(e) => set('name', e.target.value)} />
        <Input placeholder="Phone *" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
        <Input placeholder="Email *" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
        <Input placeholder="City" value={form.city} onChange={(e) => set('city', e.target.value)} />
        <Select value={form.course} onValueChange={(v) => set('course', v)}>
          <SelectTrigger className="md:col-span-2"><SelectValue placeholder="Choose a program of interest"/></SelectTrigger>
          <SelectContent>
            {courses.map((c) => <SelectItem key={c.slug} value={c.slug}>{c.title}</SelectItem>)}
          </SelectContent>
        </Select>
        <Textarea placeholder="Message (optional)" value={form.message} onChange={(e) => set('message', e.target.value)} className="md:col-span-2 min-h-[100px]"/>
        <Button type="submit" disabled={submitting} className="md:col-span-2 bg-[#0F2A5C] hover:bg-[#0a1f44] text-white font-bold h-12">
          {submitting ? 'Submitting…' : <>Submit Inquiry <Send size={16}/></>}
        </Button>
      </form>
    </div>
  );
};

export default InquiryForm;
