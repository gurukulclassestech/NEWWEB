import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Pencil, Trash2, Eye, Save, Rocket, ArrowLeft, FileText, ExternalLink, CheckCheck, XCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { useToast } from '../../hooks/use-toast';
import api from '../../api';
import { STORAGE_KEY } from '../../auth/AuthContext';

const BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
const API = `${BASE.replace(/\/$/, '')}/api`;

const DEFAULT_EXAM = {
  examName: '',
  className: '11th',
  course: 'JEE',
  examDate: '',
  startTime: '10:00',
  endTime: '11:00',
  durationMinutes: 60,
  instructions: '',
  classplusUrl: 'https://your-classplus-test-link',
  status: 'draft',
};

const CLASS_OPTIONS = ['11th', '12th', '11th Science', '12th Science', '11th Commerce', '12th Commerce', 'Foundation'];
const COURSE_OPTIONS = ['JEE', 'NEET', 'Foundation', 'MHT-CET', 'BITSAT', 'Olympiad', 'Other'];

const getAuthToken = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')?.token || '';
  } catch {
    return '';
  }
};

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
};

const isValidExamUrl = (url) => {
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'https:') return true;
    if (parsed.protocol === 'http:' && (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1')) return true;
    return false;
  } catch {
    return false;
  }
};

const ExamManagement = ({ mode = 'list', examId = null }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [exams, setExams] = useState([]);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [preview, setPreview] = useState(null);
  const [form, setForm] = useState(DEFAULT_EXAM);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadExams = useCallback(async () => {
    try {
      const data = await api.list('admin/exams');
      setExams(Array.isArray(data) ? data : []);
    } catch (e) {
      toast({ title: 'Failed to load exams', description: e?.response?.data?.detail || e?.message || 'Could not fetch exams.' });
    }
  }, [toast]);

  useEffect(() => {
    if (mode === 'list') {
      loadExams();
    }
  }, [mode, loadExams]);

  useEffect(() => {
    if (mode === 'edit' && examId) {
      const fetchExam = async () => {
        setLoading(true);
        try {
          const { data } = await axios.get(`${API}/admin/exams/${examId}`, {
            headers: { Authorization: `Bearer ${getAuthToken()}` },
          });
          setForm({
            examName: data.examName || '',
            className: data.className || '11th',
            course: data.course || 'JEE',
            examDate: data.examDate || '',
            startTime: data.startTime || '10:00',
            endTime: data.endTime || '11:00',
            durationMinutes: data.durationMinutes || 60,
            instructions: data.instructions || '',
            classplusUrl: data.classplusUrl || 'https://your-classplus-test-link',
            status: data.status || 'draft',
          });
        } catch (e) {
          toast({ title: 'Could not load exam', description: e?.response?.data?.detail || e?.message || 'Exam not found.' });
          navigate('/admin-x9k2/exams');
        } finally {
          setLoading(false);
        }
      };
      fetchExam();
    }
  }, [mode, examId, navigate, toast]);

  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      const searchText = `${exam.examName || ''} ${exam.course || ''} ${exam.className || ''}`.toLowerCase();
      const matchesSearch = !search || searchText.includes(search.toLowerCase());
      const matchesClass = classFilter === 'All' || exam.className === classFilter;
      const matchesStatus = statusFilter === 'All' || exam.status === statusFilter;
      return matchesSearch && matchesClass && matchesStatus;
    });
  }, [exams, search, classFilter, statusFilter]);

  const updateField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const validateForm = () => {
    const required = ['examName', 'className', 'course', 'examDate', 'startTime', 'endTime', 'classplusUrl'];
    for (const field of required) {
      if (!String(form[field] || '').trim()) {
        throw new Error(`${field === 'classplusUrl' ? 'Classplus URL' : field.replace(/([A-Z])/g, ' $1')} is required.`);
      }
    }

    if (!isValidExamUrl(form.classplusUrl)) {
      throw new Error('Classplus test URL must be HTTPS, or http://localhost for development only.');
    }

    if (Number(form.durationMinutes) <= 0) {
      throw new Error('Duration must be greater than zero.');
    }
  };

  const submitExam = async (publishNow) => {
    try {
      validateForm();
      setSaving(true);
      const payload = {
        ...form,
        durationMinutes: Number(form.durationMinutes) || 60,
        status: publishNow ? 'published' : 'draft',
      };

      if (mode === 'edit' && examId) {
        await axios.put(`${API}/admin/exams/${examId}`, payload, {
          headers: { Authorization: `Bearer ${getAuthToken()}` },
        });
      } else {
        await axios.post(`${API}/admin/exams`, payload, {
          headers: { Authorization: `Bearer ${getAuthToken()}` },
        });
      }

      toast({ title: publishNow ? 'Exam published' : 'Exam saved', description: 'The exam was saved successfully.' });
      navigate('/admin-x9k2/exams');
    } catch (e) {
      toast({ title: 'Unable to save exam', description: e?.response?.data?.detail || e?.message || 'Please review the form and try again.' });
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async (exam) => {
    const nextStatus = exam.status === 'published' ? 'draft' : 'published';
    try {
      await axios.patch(`${API}/admin/exams/${exam.id}/status`, { status: nextStatus }, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      toast({ title: nextStatus === 'published' ? 'Exam published' : 'Exam moved to draft', description: 'The exam status has been updated.' });
      loadExams();
    } catch (e) {
      toast({ title: 'Status update failed', description: e?.response?.data?.detail || e?.message || 'Unable to update exam.' });
    }
  };

  const deleteExam = async (id) => {
    if (!window.confirm('Delete this exam? This cannot be undone.')) return;
    try {
      await axios.delete(`${API}/admin/exams/${id}`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      toast({ title: 'Exam deleted', description: 'The record was removed successfully.' });
      loadExams();
      navigate('/admin-x9k2/exams');
    } catch (e) {
      toast({ title: 'Delete failed', description: e?.response?.data?.detail || e?.message || 'Could not delete this exam.' });
    }
  };

  if (mode === 'create' || mode === 'edit') {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Exam Management</p>
            <h1 className="text-2xl font-black text-[#0F2A5C]">{mode === 'edit' ? 'Edit Exam' : 'Create Exam'}</h1>
          </div>
          <Button variant="outline" onClick={() => navigate('/admin-x9k2/exams')} className="gap-2"><ArrowLeft size={14}/> Back</Button>
        </div>

        <div className="bg-white rounded-2xl border p-6">
          <div className="grid md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Exam name</label>
              <Input value={form.examName} onChange={(e) => updateField('examName', e.target.value)} placeholder="JEE Main Mathematics Mock Test 01" />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Class</label>
              <select value={form.className} onChange={(e) => updateField('className', e.target.value)} className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 text-sm">
                {CLASS_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Course / Stream</label>
              <select value={form.course} onChange={(e) => updateField('course', e.target.value)} className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 text-sm">
                {COURSE_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Exam date</label>
              <Input type="date" value={form.examDate} onChange={(e) => updateField('examDate', e.target.value)} />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Start time</label>
              <Input type="time" value={form.startTime} onChange={(e) => updateField('startTime', e.target.value)} />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">End time</label>
              <Input type="time" value={form.endTime} onChange={(e) => updateField('endTime', e.target.value)} />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Duration (minutes)</label>
              <Input type="number" min="1" value={form.durationMinutes} onChange={(e) => updateField('durationMinutes', e.target.value)} />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Publication status</label>
              <select value={form.status} onChange={(e) => updateField('status', e.target.value)} className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 text-sm">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Classplus Test Portal Link</label>
              <Input value={form.classplusUrl} onChange={(e) => updateField('classplusUrl', e.target.value)} placeholder="https://your-classplus-test-link" />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Instructions</label>
              <Textarea value={form.instructions} onChange={(e) => updateField('instructions', e.target.value)} className="min-h-[120px]" placeholder="Any rules, instructions, or exam notes for students" />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
            <Button variant="outline" onClick={() => navigate('/admin-x9k2/exams')} disabled={saving}>Cancel</Button>
            <Button onClick={() => submitExam(false)} className="bg-slate-100 text-slate-800 hover:bg-slate-200" disabled={saving}>
              <Save size={14} className="mr-2" /> Save as Draft
            </Button>
            <Button onClick={() => submitExam(true)} className="bg-[#F5B921] hover:bg-[#e3a911] text-[#0F2A5C] font-bold" disabled={saving}>
              <Rocket size={14} className="mr-2" /> Publish Exam
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Exam Management</p>
          <h1 className="text-2xl font-black text-[#0F2A5C]">Published and Draft Exams</h1>
        </div>
        <Button onClick={() => navigate('/admin-x9k2/exams/create')} className="bg-[#F5B921] hover:bg-[#e3a911] text-[#0F2A5C] font-bold">
          <Plus size={14} className="mr-2" /> Create Exam
        </Button>
      </div>

      <div className="bg-white rounded-2xl border p-4">
        <div className="grid md:grid-cols-3 gap-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search exam, course, class" className="pl-9" />
          </div>
          <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm">
            <option value="All">All classes</option>
            {CLASS_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm">
            <option value="All">All statuses</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100 text-slate-600 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="text-left p-3">Exam</th>
                <th className="text-left p-3">Class</th>
                <th className="text-left p-3">Date</th>
                <th className="text-left p-3">Time</th>
                <th className="text-left p-3">Classplus URL</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Created</th>
                <th className="text-right p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredExams.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-slate-400">No exams match the current filters.</td>
                </tr>
              ) : (
                filteredExams.map((exam) => (
                  <tr key={exam.id} className="border-t hover:bg-slate-50">
                    <td className="p-3">
                      <div className="font-semibold text-[#0F2A5C]">{exam.examName}</div>
                      <div className="text-xs text-slate-500">{exam.course}</div>
                    </td>
                    <td className="p-3">{exam.className}</td>
                    <td className="p-3">{formatDate(exam.examDate)}</td>
                    <td className="p-3">{exam.startTime} — {exam.endTime}</td>
                    <td className="p-3 max-w-[180px] truncate">
                      {exam.classplusUrl ? (
                        <a href={exam.classplusUrl} target="_blank" rel="noreferrer" className="text-[#0F2A5C] underline break-all">{exam.classplusUrl}</a>
                      ) : '—'}
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-bold uppercase ${exam.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {exam.status}
                      </span>
                    </td>
                    <td className="p-3">{formatDate(exam.createdAt?.slice(0, 10) || exam.createdAt || '')}</td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setPreview(exam)} className="p-2 rounded hover:bg-slate-100 text-slate-600" title="Preview"><Eye size={14}/></button>
                        <button onClick={() => navigate(`/admin-x9k2/exams/${exam.id}/edit`)} className="p-2 rounded hover:bg-slate-100 text-slate-600" title="Edit"><Pencil size={14}/></button>
                        <button onClick={() => togglePublish(exam)} className="p-2 rounded hover:bg-emerald-50 text-emerald-600" title={exam.status === 'published' ? 'Unpublish' : 'Publish'}>
                          {exam.status === 'published' ? <XCircle size={14}/> : <CheckCheck size={14}/>}
                        </button>
                        <button onClick={() => deleteExam(exam.id)} className="p-2 rounded hover:bg-rose-50 text-rose-600" title="Delete"><Trash2 size={14}/></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {preview && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50" onClick={() => setPreview(null)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl w-full max-w-2xl p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="text-xl font-black text-[#0F2A5C]">Exam Preview</h2>
              <button onClick={() => setPreview(null)} className="p-2 rounded hover:bg-slate-100"><XCircle size={16}/></button>
            </div>
            <div className="space-y-3 text-sm text-slate-700">
              <div className="text-lg font-extrabold text-[#0F2A5C]">{preview.examName}</div>
              <div><strong>Class:</strong> {preview.className}</div>
              <div><strong>Course:</strong> {preview.course}</div>
              <div><strong>Date:</strong> {formatDate(preview.examDate)}</div>
              <div><strong>Time:</strong> {preview.startTime} – {preview.endTime}</div>
              <div><strong>Duration:</strong> {preview.durationMinutes} minutes</div>
              <div><strong>Status:</strong> {preview.status}</div>
              <div><strong>Classplus URL:</strong> <a href={preview.classplusUrl} target="_blank" rel="noreferrer" className="text-[#0F2A5C] underline break-all">{preview.classplusUrl}</a></div>
              {preview.instructions && <div><strong>Instructions:</strong><div className="mt-2 whitespace-pre-line text-slate-600">{preview.instructions}</div></div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamManagement;
