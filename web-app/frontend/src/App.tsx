import { useState } from 'react';

type Panel = {
  id: string;
  title: string;
  description: string;
  keywords: string[];
  iconPrompt: string;
  generatedImageUrl?: string | null;
};

type Story = {
  storyId: string;
  theme: string;
  panels: Panel[];
};

export default function App() {
  const [files, setFiles] = useState<FileList | null>(null);
  const [blurb, setBlurb] = useState('');
  const [loading, setLoading] = useState(false);
  const [story, setStory] = useState<Story | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const onPick = (fl: FileList | null) => {
    setFiles(fl);
    setStory(null);
    setErr(null);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setStory(null);

    if (!files || files.length !== 3) {
      setErr('Please select exactly 3 images.');
      return;
    }
    if (!blurb.trim()) {
      setErr('Please enter a trip blurb.');
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('blurb', blurb);
      Array.from(files).forEach(f => fd.append('images', f)); // exactly 3

      const res = await fetch('http://localhost:8787/api/storyboard', { method: 'POST', body: fd });
      const json = await res.json();
      console.log('API payload:', json); // will show in browser console


      // Read JSON either way so we can inspect it
      const payload = await res.json().catch(() => ({}));
      console.log('API status:', res.status, res.statusText);
      console.log('API payload:', payload);

      if (!res.ok) {
        const msg =
          payload?.error
            ? `${payload.error}${
                payload.preview ? ` — preview: ${payload.preview.slice(0, 120)}…` : ''
              }`
            : 'Request failed';
        throw new Error(msg);
      }

      setStory(payload as Story);
    } catch (e: any) {
      setErr(e.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };


  return (
    <main style={{ maxWidth: 800, margin: '2rem auto', fontFamily: 'system-ui' }}>
      <h1>Storyboard (images + Cohere)</h1>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
        <label>
          Pick 3 images:
          <input type="file" accept="image/*" multiple onChange={e => onPick(e.target.files)} />
        </label>
        <label>
          Trip blurb:
          <textarea rows={3} value={blurb} onChange={e => setBlurb(e.target.value)} style={{ width: '100%' }} />
        </label>
        <button disabled={loading}>{loading ? 'Generating…' : 'Generate 5-panel Storyboard'}</button>
      </form>

      {err && <p style={{ color: 'crimson' }}>{err}</p>}

      {story && (
        <>
          <h2>Result JSON</h2>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(story, null, 2)}</pre>

          <h3>Panels</h3>
          <ol>
            {story.panels.map(p => (
              <li key={p.id} style={{ marginBottom: 12 }}>
                <strong>{p.title}</strong>
                <div style={{ fontSize: 13, opacity: 0.8 }}>{p.keywords.join(', ')}</div>
                <p style={{ marginTop: 6 }}>{p.description}</p>
              </li>
            ))}
          </ol>
        </>
      )}
    </main>
  );
}
