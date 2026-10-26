import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, CalendarDays, Clock3, ExternalLink, PencilRuler, TimerReset } from 'lucide-react';
import api from '../api';

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
};

const formatTime = (value) => {
  if (!value) return '—';
  const [hours, minutes] = String(value).split(':').map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return value;
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit' }).format(date);
};

const getExamStatus = (exam) => {
  if (!exam?.examDate || !exam?.startTime || !exam?.endTime) return { state: 'Upcoming', canStart: false };

  const started = new Date(`${exam.examDate}T${exam.startTime}:00`);
  const ended = new Date(`${exam.examDate}T${exam.endTime}:00`);
  const now = new Date();

  if (now < started) return { state: 'Upcoming', canStart: false };
  if (now > ended) return { state: 'Closed', canStart: false };
  return { state: 'Available', canStart: true };
};

const validExamUrl = (url) => {
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'https:') return true;
    if (parsed.protocol === 'http:' && (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1')) return true;
    return false;
  } catch {
    return false;
  }
};

const Exam = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await api.examsPublished();
        if (active) setExams(Array.isArray(data) ? data : []);
      } catch (e) {
        if (active) setError(e?.response?.data?.detail || e?.message || 'Unable to load exams.');
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => { active = false; };
  }, []);

  const cards = useMemo(() => exams.filter((exam) => exam && exam.status === 'published'), [exams]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">Loading exams…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 text-rose-700 p-8 text-center">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-8 text-center">
          <span className="inline-block rounded-full bg-[#F5B921] px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-[#0F2A5C]">Student Portal</span>
          <h1 className="mt-4 text-4xl md:text-5xl font-black text-[#0F2A5C]">Upcoming Exams</h1>
          <p className="mt-3 text-slate-600">Discover the latest published mock tests, challenge papers, and scheduled exam windows.</p>
        </div>

        {cards.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
            No published exams are available right now. Please check back soon.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {cards.map((exam) => {
              const state = getExamStatus(exam);
              const valid = validExamUrl(exam.classplusUrl || '');
              const isOpen = expanded === exam.id;

              return (
                <div key={exam.id} className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                  <div className="bg-[#0F2A5C] px-5 py-4 text-white">
                    <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.18em]">
                      <span className="rounded-full bg-white/10 px-2 py-1">{exam.className}</span>
                      <span className={`rounded-full px-2 py-1 font-bold ${state.state === 'Available' ? 'bg-emerald-500 text-white' : state.state === 'Closed' ? 'bg-rose-500 text-white' : 'bg-[#F5B921] text-[#0F2A5C]'}`}>
                        {state.state}
                      </span>
                    </div>
                    <h2 className="mt-4 text-xl font-extrabold leading-snug">{exam.examName}</h2>
                  </div>

                  <div className="p-5 space-y-4 text-sm text-slate-700">
                    <div className="flex items-center gap-2"><PencilRuler size={15} className="text-[#0F2A5C]"/> <span><strong>Course:</strong> {exam.course}</span></div>
                    <div className="flex items-center gap-2"><CalendarDays size={15} className="text-[#0F2A5C]"/> <span><strong>Date:</strong> {formatDate(exam.examDate)}</span></div>
                    <div className="flex items-center gap-2"><Clock3 size={15} className="text-[#0F2A5C]"/> <span><strong>Time:</strong> {formatTime(exam.startTime)} – {formatTime(exam.endTime)}</span></div>
                    <div className="flex items-center gap-2"><TimerReset size={15} className="text-[#0F2A5C]"/> <span><strong>Duration:</strong> {exam.durationMinutes} minutes</span></div>

                    {exam.instructions && (
                      <div className="pt-2 border-t border-slate-200">
                        <button type="button" onClick={() => setExpanded(isOpen ? null : exam.id)} className="text-xs font-bold uppercase tracking-[0.18em] text-[#0F2A5C]">
                          {isOpen ? 'Hide instructions' : 'View instructions'}
                        </button>
                        {isOpen && <p className="mt-3 whitespace-pre-line text-slate-600">{exam.instructions}</p>}
                      </div>
                    )}

                    <div className="flex gap-3 pt-3">
                      <button
                        type="button"
                        onClick={() => window.open(exam.classplusUrl, '_blank', 'noopener,noreferrer')}
                        disabled={!valid || !state.canStart}
                        className="flex-1 rounded-xl bg-[#F5B921] px-4 py-3 text-sm font-bold text-[#0F2A5C] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {state.state === 'Available' ? 'Start Exam' : state.state === 'Upcoming' ? 'Starts Soon' : 'Closed'}
                        {state.state === 'Available' && <ArrowRight className="inline-block ml-2" size={16} />}
                      </button>

                      <a
                        href={exam.classplusUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center rounded-xl border border-[#0F2A5C] px-4 py-3 text-sm font-bold text-[#0F2A5C]"
                        onClick={(e) => {
                          if (!valid) e.preventDefault();
                        }}
                      >
                        Details <ExternalLink size={14} className="ml-2" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Exam;
