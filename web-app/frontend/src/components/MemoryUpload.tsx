import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MemoryUploadProps {
  onMemoryCreated: (memory: any) => void;
}

export default function MemoryUpload({ onMemoryCreated }: MemoryUploadProps) {
  const [files, setFiles] = useState<FileList | null>(null);
  const [blurb, setBlurb] = useState('');
  const [theme, setTheme] = useState('auto');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const themes = [
    { id: 'auto', name: 'Auto-Detect', icon: '🤖' },
    { id: 'watercolor', name: 'Watercolor', icon: '🎨' },
    { id: 'sketch', name: 'Sketch', icon: '✏️' },
    { id: 'comic', name: 'Comic', icon: '💥' },
    { id: 'vintage', name: 'Vintage', icon: '📸' },
    { id: 'modern', name: 'Modern', icon: '✨' }
  ];

  const handleFileSelect = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    if (selectedFiles.length !== 3) {
      setError('Please select exactly 3 images');
      return;
    }

    setFiles(selectedFiles);
    setError(null);

    // Create preview URLs
    const urls = Array.from(selectedFiles).map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
    setStep(2);
  }, []);

  const handleSubmit = async () => {
    if (!files || !blurb.trim()) {
      setError('Please complete all fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('blurb', blurb);
      formData.append('theme', theme);
      Array.from(files).forEach(file => formData.append('images', file));

      const response = await fetch('/api/memories', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to create memory');
      }

      const memory = await response.json();
      onMemoryCreated(memory);

      // Reset form
      setFiles(null);
      setBlurb('');
      setTheme('auto');
      setStep(1);
      setPreviewUrls([]);

    } catch (err: any) {
      setError(err.message || 'Failed to create memory');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="memory-upload">
      <div className="progress-bar">
        <div className={`step ${step >= 1 ? 'active' : ''}`}>1. Photos</div>
        <div className={`step ${step >= 2 ? 'active' : ''}`}>2. Details</div>
        <div className={`step ${step >= 3 ? 'active' : ''}`}>3. Create</div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="upload-section"
          >
            <h3>Upload Your Photos</h3>
            <p>Select exactly 3 photos that tell your story</p>

            <div className="file-drop-zone">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleFileSelect(e.target.files)}
                className="file-input"
              />
              <div className="drop-message">
                <span className="upload-icon">📸</span>
                <p>Drag & drop or click to select 3 photos</p>
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="details-section"
          >
            <h3>Tell Your Story</h3>

            <div className="image-preview">
              {previewUrls.map((url, index) => (
                <img key={index} src={url} alt={`Preview ${index + 1}`} />
              ))}
            </div>

            <textarea
              value={blurb}
              onChange={(e) => setBlurb(e.target.value)}
              placeholder="Describe your experience... Where did you go? What made it special?"
              rows={4}
              className="story-input"
            />

            <div className="theme-selector">
              <h4>Visual Style</h4>
              <div className="theme-grid">
                {themes.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={`theme-option ${theme === t.id ? 'selected' : ''}`}
                  >
                    <span className="theme-icon">{t.icon}</span>
                    <span className="theme-name">{t.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="step-actions">
              <button onClick={() => setStep(1)} className="btn-secondary">
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!blurb.trim()}
                className="btn-primary"
              >
                Continue
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="confirm-section"
          >
            <h3>Create Your Memory</h3>

            <div className="memory-preview">
              <div className="preview-images">
                {previewUrls.map((url, index) => (
                  <img key={index} src={url} alt={`Preview ${index + 1}`} />
                ))}
              </div>

              <div className="preview-details">
                <p className="preview-story">{blurb}</p>
                <p className="preview-theme">
                  Style: {themes.find(t => t.id === theme)?.name}
                </p>
              </div>
            </div>

            <div className="step-actions">
              <button onClick={() => setStep(2)} className="btn-secondary">
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn-create"
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Creating Memory...
                  </>
                ) : (
                  '✨ Create Memory'
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="error-message"
        >
          {error}
        </motion.div>
      )}

      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="loading-overlay"
        >
          <div className="loading-content">
            <div className="ai-animation">🤖</div>
            <p>AI is crafting your story...</p>
            <div className="loading-steps">
              <div className="step-item">✓ Analyzing photos</div>
              <div className="step-item active">🎨 Generating storyboard</div>
              <div className="step-item">🎵 Creating narration</div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}