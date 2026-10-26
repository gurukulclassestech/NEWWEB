import React, { useEffect, useMemo, useState } from 'react';
import { PlayCircle, BookOpen, CalendarDays } from 'lucide-react';
import api from '../api';

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

const Lectures = () => {
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await api.lecturesPublished();
        if (active) setLectures(Array.isArray(data) ? data : []);
      } catch (e) {
        if (active) setError(e?.response?.data?.detail || e?.message || 'Unable to load video lectures.');
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => { active = false; };
  }, []);

  const cards = useMemo(() => lectures.filter((item) => item && item.status === 'published'), [lectures]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">Loading video lectures…</div>
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
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8 text-center">
          <span className="inline-block rounded-full bg-[#F5B921] px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-[#0F2A5C]">Learning Hub</span>
          <h1 className="mt-4 text-4xl md:text-5xl font-black text-[#0F2A5C]">Video Lectures</h1>
          <p className="mt-3 text-slate-600">Quick revision lessons, concept videos, and topic-wise guidance from our expert faculty.</p>
        </div>

        {cards.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
            No published video lectures are available right now. Please check back soon.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {cards.map((lecture) => {
              const videoId = lecture.videoId || extractVideoId(lecture.youtubeUrl || '');
              const thumbnail = lecture.thumbnailUrl || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
              const watchUrl = lecture.youtubeUrl || `https://www.youtube.com/watch?v=${videoId}`;

              return (
                <div key={lecture.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="relative overflow-hidden">
                    <img src={thumbnail} alt={lecture.title} className="h-52 w-full object-cover" />
                    <a href={watchUrl} target="_blank" rel="noreferrer" className="absolute inset-0 flex items-center justify-center bg-black/20 transition hover:bg-black/30">
                      <PlayCircle className="h-16 w-16 text-white drop-shadow-lg" />
                    </a>
                  </div>

                  <div className="p-5">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <span className="rounded-full bg-[#F5B921]/20 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#0F2A5C]">{lecture.className}</span>
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-600">{lecture.subject}</span>
                    </div>

                    <h2 className="text-xl font-extrabold text-[#0F2A5C]">{lecture.title}</h2>

                    {lecture.description && <p className="mt-3 text-sm text-slate-600 line-clamp-3">{lecture.description}</p>}

                    <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                      <CalendarDays size={14} />
                      <span>{new Date(lecture.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>

                    <div className="mt-5 flex items-center gap-2">
                      <a href={watchUrl} target="_blank" rel="noreferrer" className="inline-flex flex-1 items-center justify-center rounded-xl bg-[#0F2A5C] px-4 py-3 text-sm font-bold text-white hover:bg-[#142d5f]">
                        <PlayCircle size={16} className="mr-2" /> Watch Lecture
                      </a>
                      <a href={watchUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-3 py-3 text-sm text-slate-700 hover:bg-slate-50">
                        <BookOpen size={16} />
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

export default Lectures;
