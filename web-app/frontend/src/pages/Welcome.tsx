import React from 'react';
import { Link } from 'react-router-dom';
import { PremiumButton } from '@/components/ui/premium-button';
import { PremiumCard } from '@/components/ui/premium-card';
import { Sparkles, Zap, Palette, Code, Images, Rotate3d } from 'lucide-react';
import snapLogo from '@/assets/snap-logo.png';
import scLogo from '@/assets/cool-logo.png';

const Welcome = () => {

const features = [
  {
    icon: Images,
    title: "Photo to Story",
    description: "Upload 4 photos and watch them transform into a flipbook-style storyline."
  },
  {
    icon: Sparkles,
    title: "AI Magic",
    description: "Smart generation that adds captions and narrative flair to your trip."
  },
  {
    icon: Palette,
    title: "Custom Themes",
    description: "Choose from visual styles to make your story feel unique and expressive."
  },
  {
    icon: Rotate3d,
    title: "AR Experience",
    description: "Step into your story and explore your memories in an immersive way."
  }
];


  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <nav className="bg-black p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex space-x-6">
            <button className="text-white hover:text-gray-400 transition-colors duration-200 px-4 py-2">
              Login
            </button>
            <button className="text-white hover:text-gray-400 transition-colors duration-200 px-4 py-2">
              Sign Up
            </button>
          </div>
          <img src={scLogo} alt="SC Logo" className="w-10 h-10 object-contain" />
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-4 pt-16">
        <div className="mx-auto max-w-6xl text-center">
          {/* Hero Section with Yellow Background */}
          <div className="animate-fade-in mb-16">
            <div className="highlight-yellow rounded-2xl p-12 mb-8 shadow-lg">
              <h1 className="mb-6 text-6xl font-bold md:text-8xl text-foreground">
                SpectraSphere
              </h1>
              <p className="text-xl text-foreground/80 md:text-2xl max-w-3xl mx-auto leading-relaxed">
                Unleash the power of premium AI generation with beautiful, responsive designs that captivate and inspire.
              </p>
            </div>
          </div>

          {/* Primary CTA */}
          <div className="mb-16 animate-slide-up">
            <Link to="/generate">
              <PremiumButton variant="secondary" size="lg" className="min-w-[280px] text-xl px-16 py-8 rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 bg-blue-accent hover:bg-blue-accent/90 text-white border-0">
                Get Started
              </PremiumButton>
            </Link>
          </div>

      {/* About Section */}
      <div className="mb-16 animate-fade-in delay-300">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            About SpectraSphere
          </h2>
          <div className="space-y-4 text-lg md:text-xl text-foreground/80 leading-relaxed">
            <p>
              SpectraSphere takes four of your favorite trip photos and turns them
              into a themed, five panel story complete with captions and stylized
              visuals. It’s a playful way to bring your memories to life.
            </p>
            <p>
              Just pick your images, choose a theme, and let the AI generate a
              flipbook style experience you can explore in AR. Whether it’s a quick
              outing or a special adventure, every set of photos becomes a mini
              narrative you can relive.
            </p>
            <p className="text-foreground/70">
              Built for fun and creativity no setup, no fuss,
              just stories you can see and share.
            </p>
          </div>
        </div>
      </div>



          {/* Features Grid - Single Row Layout */}
          <div className="grid grid-cols-4 gap-8 max-w-6xl mx-auto animate-scale-in">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={feature.title} 
                  className="group p-8 bg-surface rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 border border-surface-hover"
                  style={{
                    animationDelay: `${index * 150}ms`
                  }}
                >
                  <div className="mb-6 flex justify-center">
                    <div className="rounded-xl bg-snapchat-yellow p-6 shadow-sm">
                      <Icon className="h-12 w-12 text-foreground" />
                    </div>
                  </div>
                  <h3 className="mb-3 text-lg font-semibold text-text-primary">{feature.title}</h3>
                  <p className="text-text-secondary leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black p-4">
        <div className="max-w-6xl mx-auto">
          <p className="text-white text-sm">Made @ Hack the North 2025</p>
        </div>
      </footer>

      {/* Minimal Background Elements */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-snapchat-yellow/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-blue-accent/5 blur-3xl" />
      </div>
    </div>
  );
};

export default Welcome;