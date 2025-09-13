import { useState } from 'react';
import { Upload, Sparkles } from 'lucide-react';

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
const REQUIRED_IMAGES = 4;

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

    if (!files || files.length !== REQUIRED_IMAGES) {
      setErr(`Please select exactly ${REQUIRED_IMAGES} images.`);
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
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="flex items-center gap-3 p-6">
        <div>
          <h1 className="text-white text-xl">SpectraSphere</h1>
          <p className="text-gray-400 text-sm">Reimagine your world, one memory at a time.</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-medium mb-6 text-white">
            Transform Your Journey Into Art
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Relive the moment through a different lens — powered by Spectacles.
          </p>
        </div>

        <form onSubmit={onSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {/* Upload Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white text-lg">Upload Images</h3>
                <span className="text-gray-400 text-sm">{files?.length ?? 0}/{REQUIRED_IMAGES} images</span>
              </div>
              
              <label className="border-2 border-dashed border-gray-600 rounded-xl p-12 text-center hover:border-gray-500 transition-colors cursor-pointer block">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-4" />
                <h4 className="text-white text-lg mb-2">Upload Your {REQUIRED_IMAGES} Travel Photos</h4>
                <p className="text-gray-400 text-sm">Click to select all images at once</p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => onPick(e.target.files)}
                  className="hidden"
                />
              </label>
            </div>

            {/* Trip Description */}
            <div>
              <h3 className="text-white text-lg mb-4">Trip Description</h3>
              <p className="text-gray-400 text-sm mb-4">
                Share a brief description of your memorable journey
              </p>
              
              <textarea
                value={blurb}
                onChange={(e) => setBlurb(e.target.value)}
                className="w-full h-48 bg-slate-800 border border-gray-700 rounded-xl p-4 text-white placeholder-gray-500 resize-none focus:outline-none focus:border-gray-600 transition-colors"
                placeholder="Tell us about your amazing trip... What made it special? Where did you go? What did you experience?"
              />
            </div>
          </div>

          {/* Generate Button */}
          <div className="text-center mb-12">
            <button
              disabled={loading}
              className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white px-8 py-4 rounded-full text-lg font-medium transition-all duration-300 flex items-center gap-2 mx-auto disabled:opacity-50"
            >
              <Sparkles className="w-5 h-5" />
              {loading ? 'Generating…' : 'Generate Storyboard'}
            </button>
            
            {err && <p className="text-red-500 mt-4">{err}</p>}
          </div>
        </form>

        {story && (
          <div className="bg-slate-800 rounded-xl p-6 mt-8">
            <h2 className="text-xl mb-4">Your Storyboard</h2>
            <h3 className="text-lg mb-4">
              Icon Category: <span className="font-semibold">{story.iconCategory}</span>
            </h3>
            <ol className="space-y-4">
              {PANEL_ORDER.map((k, i) => {
                const p = story[k];
                return (
                  <li key={k} className="bg-slate-700 p-4 rounded-lg">
                    <div className="font-bold mb-2">{p.title || `Panel ${i + 1}`}</div>
                    <p className="text-gray-300">{p.description}</p>
                  </li>
                );
              })}
            </ol>
          </div>
        )}

        {/* How It Works section remains the same as in your new UI */}
      </main>
    </div>
  );
}
