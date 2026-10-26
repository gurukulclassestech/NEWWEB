import React, { useRef, useState } from 'react';
import axios from 'axios';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Upload, Loader2, X, Link as LinkIcon } from 'lucide-react';
import { STORAGE_KEY } from '../auth/AuthContext';

const BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
const API = `${BASE.replace(/\/$/, '')}/api`;

// Resolve a URL — backend-uploaded images must use the API host, but frontend-local
// assets like /gurukul-logo.svg should stay relative to the frontend app.
export const resolveUrl = (u) => {
  if (!u) return '';
  if (u.startsWith('http://') || u.startsWith('https://') || u.startsWith('data:')) return u;
  if (u.startsWith('/api/') || u.startsWith('/uploads/')) return `${BASE}${u}`;
  return u;
};

const ImageUploadField = ({ value, onChange, label = 'Image', placeholder = 'Paste image URL or upload a file' }) => {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const pick = () => fileRef.current?.click();

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      const auth = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      const fd = new FormData();
      fd.append('file', file);
      const { data } = await axios.post(`${API}/upload`, fd, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: auth?.token ? `Bearer ${auth.token}` : '',
        },
      });
      onChange(data.url);
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || 'Upload failed');
    } finally {
      setUploading(false);
      // reset input so same file can be re-selected
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const clear = () => onChange('');

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-slate-600">{label}</label>
      <div className="flex items-stretch gap-2">
        <div className="relative flex-1">
          <LinkIcon size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
          <Input value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="pl-8 pr-8"/>
          {value && (
            <button type="button" onClick={clear} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-600" title="Clear">
              <X size={14}/>
            </button>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile}/>
        <Button type="button" variant="outline" onClick={pick} disabled={uploading} className="shrink-0">
          {uploading ? <><Loader2 size={14} className="animate-spin"/> Uploading…</> : <><Upload size={14}/> Upload</>}
        </Button>
      </div>
      {error && <p className="text-xs text-rose-600">{error}</p>}
      {value && (
        <div className="mt-1">
          <img src={resolveUrl(value)} alt="" className="h-24 w-auto max-w-[200px] object-cover rounded-md border" onError={(e) => { e.target.style.display = 'none'; }}/>
        </div>
      )}
      <p className="text-[11px] text-slate-400">Accepts JPG, PNG, GIF, WEBP, SVG — max 10MB</p>
    </div>
  );
};

export default ImageUploadField;
