import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Pencil, Trash2, Eye, Save, Rocket, ArrowLeft, PlayCircle, ExternalLink, CheckCheck, XCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { useToast } from '../../hooks/use-toast';
import { STORAGE_KEY } from '../../auth/AuthContext';

const BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
const API = `${BASE.replace(/\/$/, '')}/api`;

const DEFAULT_LECTURE = {
  title: '',
  className: '11th',
  subject: 'Physics',
  youtubeUrl: 'https://www.youtube.com/watch?v=',
  description: '',
  status: 'draft',
};

const CLASS_OPTIONS = ['11th', '12th', '11th Science', '12th Science', '11th Commerce', '12th Commerce', 'Foundation'];
const SUBJECT_OPTIONS = ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English', 'General Science', 'JEE', 'NEET'];

const getAuthToken = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')?.token || '';
  } catch {
    return '';
  }
};

const extractVideoId = (url = '') => {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    if (host === 'youtu.be') return parsed.pathname.replace('/', '');
    if (host.includes('youtube.com')) {
      const v = parsed.searchParams.get('v');
      if (v) return v;
      const path = parsed.pathname || '';
      const match = path.match(/\/embed\/([^/?]+)/);
      if (match) return match[1];
    }
  } catch {
    return '';
  }
  return '';
};

const isValidYoutubeUrl = (value = '') => {
  try {
    const parsed = new URL(value);
    const host = parsed.hostname.toLowerCase();
    return ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be'].includes(host) && !!extractVideoId(value);
  } catch {
    return false;
  }
};

const LectureManagement = ({ mode = 'list', lectureId = null }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [lectures, setLectures] = useState([]);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [preview, setPreview] = useState(null);
  const [form, setForm] = useState(DEFAULT_LECTURE);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadLectures = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/admin/lectures`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      setLectures(Array.isArray(response.data) ? response.data : []);
    } catch (e) {
      toast({ title: 'Failed to load lectures', description: e?.response?.data?.detail || e?.message || 'Could not fetch lectures.' });
    }
  }, [toast]);

  useEffect(() => {
    if (mode === 'list') {
      loadLectures();
    }
  }, [mode, loadLectures]);

  useEffect(() => {
    if (mode === 'edit' && lectureId) {
      const fetchLecture = async () => {
        setLoading(true);
        try {
          const { data } = await axios.get(`${API}/admin/lectures/${lectureId}`, {
            headers: { Authorization: `Bearer ${getAuthToken()}` },
          });
          setForm({
            title: data.title || '',
            className: data.className || '11th',
            subject: data.subject || 'Physics',
            youtubeUrl: data.youtubeUrl || 'https://www.youtube.com/watch?v=',
            description: data.description || '',
            status: data.status || 'draft',
          });
        } catch (e) {
          toast({ title: 'Could not load lecture', description: e?.response?.data?.detail || e?.message || 'Lecture not found.' });
          navigate('/admin-x9k2/lectures');
        } finally {
          setLoading(false);
        }
      };
      fetchLecture();
    }
  }, [mode, lectureId, navigate, toast]);

  const filteredLectures = useMemo(() => {
    return lectures.filter((lecture) => {
      const searchText = `${lecture.title || ''} ${lecture.subject || ''} ${lecture.className || ''}`.toLowerCase();
      const matchesSearch = !search || searchText.includes(search.toLowerCase());
      const matchesClass = classFilter === 'All' || lecture.className === classFilter;
      const matchesStatus = statusFilter === 'All' || lecture.status === statusFilter;
      return matchesSearch && matchesClass && matchesStatus;
    });
  }, [lectures, search, classFilter, statusFilter]);

  const updateField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const validateForm = () => {
    const required = ['title', 'className', 'subject', 'youtubeUrl'];
    for (const field of required) {
      if (!String(form[field] || '').trim()) {
        throw new Error(`${field === 'youtubeUrl' ? 'YouTube link' : field.replace(/([A-Z])/g, ' $1')} is required.`);
      }
    }

    if (!isValidYoutubeUrl(form.youtubeUrl)) {
      throw new Error('YouTube link must be a valid YouTube video URL.');
    }
  };

  const submitLecture = async (publishNow) => {
    try {
      validateForm();
      setSaving(true);
      const payload = {
        ...form,
        status: publishNow ? 'published' : 'draft',
        videoId: extractVideoId(form.youtubeUrl),
        thumbnailUrl: `https://img.youtube.com/vi/${extractVideoId(form.youtubeUrl)}/hqdefault.jpg`,
      };

      if (mode === 'edit' && lectureId) {
        await axios.put(`${API}/admin/lectures/${lectureId}`, payload, {
          headers: { Authorization: `Bearer ${getAuthToken()}` },
        });
      } else {
        await axios.post(`${API}/admin/lectures`, payload, {
          headers: { Authorization: `Bearer ${getAuthToken()}` },
        });
      }

      toast({ title: publishNow ? 'Lecture published' : 'Lecture saved', description: 'The lecture was saved successfully.' });
      navigate('/admin-x9k2/lectures');
    } catch (e) {
      toast({ title: 'Unable to save lecture', description: e?.response?.data?.detail || e?.message || 'Please review the form and try again.' });
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async (lecture) => {
    const nextStatus = lecture.status === 'published' ? 'draft' : 'published';
    try {
      await axios.patch(`${API}/admin/lectures/${lecture.id}/status`, { status: nextStatus }, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      toast({ title: nextStatus === 'published' ? 'Lecture published' : 'Lecture moved to draft', description: 'The lecture status has been updated.' });
      loadLectures();
    } catch (e) {
      toast({ title: 'Status update failed', description: e?.response?.data?.detail || e?.message || 'Unable to update lecture.' });
    }
  };

  const deleteLecture = async (id) => {
    if (!window.confirm('Delete this lecture? This cannot be undone.')) return;
    try {
      await axios.delete(`${API}/admin/lectures/${id}`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      toast({ title: 'Lecture deleted', description: 'The lecture was removed successfully.' });
      loadLectures();
      navigate('/admin-x9k2/lectures');
    } catch (e) {
      toast({ title: 'Delete failed', description: e?.response?.data?.detail || e?.message || 'Could not delete this lecture.' });
    }
  };

  if (mode === 'create' || mode === 'edit') {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Video Lectures</p>
            <h1 className="text-2xl font-black text-[#0F2A5C]">{mode === 'edit' ? 'Edit Lecture' : 'Create Lecture'}</h1>
          </div>
          <Button variant="outline" onClick={() => navigate('/admin-x9k2/lectures')} className="gap-2"><ArrowLeft size={14}/> Back</Button>
        </div>

        <div className="bg-white rounded-2xl border p-6">
          <div className="grid md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Lecture title</label>
              <Input value={form.title} onChange={(e) => updateField('title', e.target.value)} placeholder="Chemical Bonding Revision" />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Class</label>
              <select value={form.className} onChange={(e) => updateField('className', e.target.value)} className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 text-sm">
                {CLASS_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Subject</label>
              <select value={form.subject} onChange={(e) => updateField('subject', e.target.value)} className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 text-sm">
                {SUBJECT_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">YouTube URL</label>
              <Input value={form.youtubeUrl} onChange={(e) => updateField('youtubeUrl', e.target.value)} placeholder="https://www.youtube.com/watch?v=..." />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Description</label>
              <Textarea value={form.description} onChange={(e) => updateField('description', e.target.value)} className="min-h-[100px]" placeholder="Short lecture summary or revision note" />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Publication status</label>
              <select value={form.status} onChange={(e) => updateField('status', e.target.value)} className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 text-sm">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
            <Button variant="outline" onClick={() => navigate('/admin-x9k2/lectures')} disabled={saving}>Cancel</Button>
            <Button onClick={() => submitLecture(false)} className="bg-slate-100 text-slate-800 hover:bg-slate-200" disabled={saving}><Save size={14} className="mr-2" /> Save as Draft</Button>
            <Button onClick={() => submitLecture(true)} className="bg-[#F5B921] hover:bg-[#e3a911] text-[#0F2A5C] font-bold" disabled={saving}><Rocket size={14} className="mr-2" /> Publish Lecture</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Video Lectures</p>
          <h1 className="text-2xl font-black text-[#0F2A5C]">Published and Draft Lectures</h1>
        </div>
        <Button onClick={() => navigate('/admin-x9k2/lectures/create')} className="bg-[#F5B921] hover:bg-[#e3a911] text-[#0F2A5C] font-bold"><Plus size={14} className="mr-2" /> Add Lecture</Button>
      </div>

      <div className="bg-white rounded-2xl border p-4">
        <div className="grid md:grid-cols-3 gap-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search title, subject, class" className="pl-9" />
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
                <th className="text-left p-3">Lecture</th>
                <th className="text-left p-3">Class</th>
                <th className="text-left p-3">Subject</th>
                <th className="text-left p-3">YouTube</th>
                <th className="text-left p-3">Status</th>
                <th className="text-right p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLectures.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-slate-400">No lectures match the current filters.</td>
                </tr>
              ) : (
                filteredLectures.map((lecture) => (
                  <tr key={lecture.id} className="border-t hover:bg-slate-50">
                    <td className="p-3">
                      <div className="font-semibold text-[#0F2A5C]">{lecture.title}</div>
                      <div className="text-xs text-slate-500">{lecture.description || 'No summary added'}</div>
                    </td>
                    <td className="p-3">{lecture.className}</td>
                    <td className="p-3">{lecture.subject}</td>
                    <td className="p-3 max-w-[200px] truncate">
                      <a href={lecture.youtubeUrl} target="_blank" rel="noreferrer" className="text-[#0F2A5C] underline break-all">{lecture.youtubeUrl}</a>
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-bold uppercase ${lecture.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {lecture.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setPreview(lecture)} className="p-2 rounded hover:bg-slate-100 text-slate-600" title="Preview"><Eye size={14}/></button>
                        <button onClick={() => navigate(`/admin-x9k2/lectures/${lecture.id}/edit`)} className="p-2 rounded hover:bg-slate-100 text-slate-600" title="Edit"><Pencil size={14}/></button>
                        <button onClick={() => togglePublish(lecture)} className="p-2 rounded hover:bg-emerald-50 text-emerald-600" title={lecture.status === 'published' ? 'Unpublish' : 'Publish'}>
                          {lecture.status === 'published' ? <XCircle size={14}/> : <CheckCheck size={14}/>}
                        </button>
                        <button onClick={() => deleteLecture(lecture.id)} className="p-2 rounded hover:bg-rose-50 text-rose-600" title="Delete"><Trash2 size={14}/></button>
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
              <h2 className="text-xl font-black text-[#0F2A5C]">Lecture Preview</h2>
              <button onClick={() => setPreview(null)} className="p-2 rounded hover:bg-slate-100"><XCircle size={16}/></button>
            </div>
            <div className="space-y-3 text-sm text-slate-700">
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <img src={preview.thumbnailUrl || `https://img.youtube.com/vi/${extractVideoId(preview.youtubeUrl || '')}/hqdefault.jpg`} alt={preview.title} className="w-full h-56 object-cover" />
              </div>
              <div className="text-lg font-extrabold text-[#0F2A5C]">{preview.title}</div>
              <div><strong>Class:</strong> {preview.className}</div>
              <div><strong>Subject:</strong> {preview.subject}</div>
              <div><strong>Status:</strong> {preview.status}</div>
              <div><strong>YouTube:</strong> <a href={preview.youtubeUrl} target="_blank" rel="noreferrer" className="text-[#0F2A5C] underline break-all">{preview.youtubeUrl}</a></div>
              {preview.description && <div><strong>Description:</strong><div className="mt-2 whitespace-pre-line text-slate-600">{preview.description}</div></div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LectureManagement;
