import { useState } from 'react';

type Panel = {
  title: string;
  description: string;
};

type Story = {
  iconCategory: string;
  p1: Panel;
  p2: Panel;
  p3: Panel;
  p4: Panel;
  p5: Panel;
};

const PANEL_ORDER: Array<keyof Omit<Story, 'iconCategory'>> = ['p1','p2','p3','p4','p5'];

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
      Array.from(files).forEach((f) => fd.append('images', f)); // backend expects "images"

      const res = await fetch('http://localhost:8787/api/storyboard', {
        method: 'POST',
        body: fd,
      });

      const payload = await res.json().catch(() => ({}));
      console.log('API status:', res.status, res.statusText);
      console.log('API payload:', payload);

      if (!res.ok) {
        const msg = payload?.error
          ? `${payload.error}${payload.preview ? ` — preview: ${String(payload.preview).slice(0, 120)}…` : ''}`
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
    <main style={{ maxWidth: 820, margin: '2rem auto', fontFamily: 'system-ui' }}>
      <h1>Storyboard (images + Aya Vision)</h1>

      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
        <label>
          Pick 3 images:
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => onPick(e.target.files)}
          />
        </label>

        <label>
          Trip blurb:
          <textarea
            rows={4}
            value={blurb}
            onChange={(e) => setBlurb(e.target.value)}
            style={{ width: '100%' }}
          />
        </label>

        <button disabled={loading}>
          {loading ? 'Generating…' : 'Generate 5-panel Storyboard'}
        </button>
      </form>

      {err && <p style={{ color: 'crimson', marginTop: 12 }}>{err}</p>}

      {story && (
        <>
          <h2 style={{ marginTop: 24 }}>Result JSON</h2>
          <pre style={{ whiteSpace: 'pre-wrap', background: '#fafafa', padding: 12, borderRadius: 8 }}>
            {JSON.stringify(story, null, 2)}
          </pre>

          <h3 style={{ marginTop: 24 }}>
            Icon Category: <span style={{ fontWeight: 600 }}>{story.iconCategory}</span>
          </h3>

          <ol style={{ marginTop: 12 }}>
            {PANEL_ORDER.map((k, i) => {
              const p = story[k];
              return (
                <li key={k} style={{ marginBottom: 16 }}>
                  <div style={{ fontWeight: 700 }}>{p.title || `Panel ${i + 1}`}</div>
                  <p style={{ marginTop: 6 }}>{p.description}</p>
                </li>
              );
            })}
          </ol>
        </>
      )}
    </main>
  );
}
