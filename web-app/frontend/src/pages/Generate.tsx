import React, { useState, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PremiumButton } from '@/components/ui/premium-button';
import { PremiumCard, PremiumCardHeader, PremiumCardTitle, PremiumCardContent } from '@/components/ui/premium-card';
import { PremiumInput } from '@/components/ui/premium-input';
import { PremiumTextarea } from '@/components/ui/premium-textarea';
import { PremiumAlert, PremiumAlertTitle, PremiumAlertDescription } from '@/components/ui/premium-alert';
import { Upload, FileCode, RefreshCw, AlertCircle, Image, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import scLogo from '@/assets/sc-logo.png';

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

const REQUIRED_IMAGES = 4;

const Generate = () => {
  const [description, setDescription] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<FileList | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [story, setStory] = useState<Story | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      if (files.length !== REQUIRED_IMAGES) {
        setError(`Please select exactly ${REQUIRED_IMAGES} images`);
        return;
      }
      
      // Check file sizes and types
      for (let i = 0; i < files.length; i++) {
        if (files[i].size > 5 * 1024 * 1024) {
          setError('Each file must be less than 5MB');
          return;
        }
        if (!files[i].type.startsWith('image/')) {
          setError('Please only upload image files');
          return;
        }
      }
      
      setUploadedFiles(files);
      setError('');
      toast({
        title: "Files uploaded successfully",
        description: `${files.length} images ready for processing`,
      });
    }
  }, [toast]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files) {
      if (files.length !== REQUIRED_IMAGES) {
        setError(`Please drop exactly ${REQUIRED_IMAGES} images`);
        return;
      }
      
      setUploadedFiles(files);
      setError('');
      toast({
        title: "Files uploaded successfully",
        description: `${files.length} images ready for processing`,
      });
    }
  }, [toast]);

  const handleGenerate = useCallback(async () => {
    if (!description.trim()) {
      setError('Trip description is required');
      return;
    }

    if (!uploadedFiles || uploadedFiles.length !== REQUIRED_IMAGES) {
      setError(`Please upload exactly ${REQUIRED_IMAGES} images`);
      return;
    }

    setIsGenerating(true);
    setError('');
    setStory(null);
    
    try {
      const fd = new FormData();
      fd.append('blurb', description);
      Array.from(uploadedFiles).forEach((f) => fd.append('images', f));

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
      toast({
        title: "Generation complete!",
        description: "Your storyboard has been generated successfully",
      });
      
      // Navigate to success page with story data
      navigate('/success', { state: { story: payload } });
      
    } catch (err: any) {
      const errorMsg = err.message || 'Generation failed. Please try again.';
      setError(errorMsg);
      toast({
        title: "Generation failed",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  }, [description, uploadedFiles, toast, navigate]);

  const handleReset = useCallback(() => {
    setDescription('');
    setUploadedFiles(null);
    setStory(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast({
      title: "Reset complete",
      description: "All fields have been cleared",
    });
  }, [toast]);


  return (
    <div className="min-h-screen bg-background">
      {/* Clean Header */}
      <header className="border-b border-surface-hover bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <PremiumButton variant="link" className="gap-2 pl-0">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Welcome
                </PremiumButton>
              </Link>
              <h1 className="text-2xl font-bold text-foreground">
                SpectraSphere Generate
              </h1>
            </div>
            <img src={scLogo} alt="SC Logo" className="w-12 h-12 object-contain" />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Input Panel */}
          <div className="space-y-6">
            <div className="bg-surface rounded-xl border border-surface-hover p-8 animate-fade-in">
              <div className="mb-6">
                <h2 className="flex items-center gap-3 text-xl font-semibold text-text-primary mb-2">
                  <FileCode className="h-5 w-5 text-foreground" />
                  Trip Description
                </h2>
              </div>
              <div className="space-y-6">
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-text-primary mb-3">
                    Tell us about your amazing trip
                  </label>
                  <PremiumTextarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What made it special? Where did you go? What did you experience?"
                    rows={4}
                    maxLength={500}
                    showCounter
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* File Upload */}
            <div className="bg-surface rounded-xl border border-surface-hover p-8 animate-slide-up">
              <div className="mb-6">
                <h2 className="flex items-center gap-3 text-xl font-semibold text-text-primary mb-2">
                  <Upload className="h-5 w-5 text-foreground" />
                  Upload {REQUIRED_IMAGES} Travel Photos
                </h2>
              </div>
              <div>
                <div
                  className="border-2 border-dashed border-surface-hover rounded-lg p-8 text-center transition-all duration-200 hover:border-foreground hover:bg-surface-hover/30 cursor-pointer"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                    accept="image/*"
                    multiple
                    aria-label="Upload images"
                  />
                  
                  {uploadedFiles && uploadedFiles.length > 0 ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-center">
                        <div className="rounded-full bg-surface-hover p-4">
                          <Image className="h-8 w-8 text-foreground" />
                        </div>
                      </div>
                      <p className="text-text-primary font-medium text-lg">
                        {uploadedFiles.length} / {REQUIRED_IMAGES} images selected
                      </p>
                      <div className="text-text-secondary space-y-1">
                        {Array.from(uploadedFiles).map((file, i) => (
                          <div key={i} className="truncate">{file.name}</div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-center">
                        <div className="rounded-full bg-surface-hover p-4">
                          <Upload className="h-8 w-8 text-text-secondary" />
                        </div>
                      </div>
                      <p className="text-text-primary font-medium">
                        Drop {REQUIRED_IMAGES} images here or click to upload
                      </p>
                      <p className="text-text-secondary">
                        Select all {REQUIRED_IMAGES} photos at once (max 5MB each)
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {error && (
              <PremiumAlert variant="destructive" className="animate-scale-in">
                <AlertCircle className="h-4 w-4" />
                <PremiumAlertTitle>Error</PremiumAlertTitle>
                <PremiumAlertDescription>{error}</PremiumAlertDescription>
              </PremiumAlert>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-surface-hover">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center gap-4">
            <PremiumButton
              variant="primary"
              onClick={handleGenerate}
              disabled={isGenerating || !description.trim() || !uploadedFiles || uploadedFiles.length !== REQUIRED_IMAGES}
              className="min-w-[140px] px-8 py-3 bg-blue-accent hover:bg-blue-accent/90 text-white border-0"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Storyboard'
              )}
            </PremiumButton>

            <PremiumButton
              variant="secondary"
              onClick={handleReset}
              disabled={isGenerating}
              className="px-6 py-3"
            >
              <RefreshCw className="h-4 w-4" />
              Reset
            </PremiumButton>
          </div>
        </div>
      </div>

      {/* Padding for sticky bar */}
      <div className="h-20" />
    </div>
  );
};

export default Generate;