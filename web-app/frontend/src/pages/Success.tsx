import React from 'react';
import { Link } from 'react-router-dom';
import { PremiumButton } from '@/components/ui/premium-button';
import { Sparkles, RefreshCw } from 'lucide-react';
import snapLogo from '@/assets/cool-logo.png';

const Success = () => {
  return (
    <div className="min-h-screen bg-snapchat-yellow relative overflow-hidden">
      {/* Breathing Glow Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-black/10 via-black/5 to-transparent animate-pulse opacity-30" />
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-black/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-black/8 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-black/3 rounded-full blur-3xl animate-pulse delay-2000" />
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="text-center space-y-8 max-w-2xl mx-auto">
          {/* Snapchat Logo */}
          <div className="flex justify-center animate-scale-in">
            <div className="relative">
              <div className="absolute inset-0 bg-snapchat-yellow rounded-3xl blur-xl opacity-50 animate-pulse" />
              <div className="relative w-32 h-32 flex items-center justify-center">
                <img src={snapLogo} alt="Snapchat" className="w-32 h-32 rounded-3xl" />
              </div>
            </div>
          </div>

          {/* Main Content - Black Box */}
          <div className="bg-black rounded-2xl p-12 border-4 border-black shadow-2xl animate-fade-in delay-300">
            {/* Title */}
            <div className="space-y-4 mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-white animate-fade-in delay-500">
                Story Generated to SnapSpectacles
              </h1>
              <div className="flex items-center justify-center animate-fade-in delay-700">
                <div className="bg-black rounded-full w-12 h-12 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            {/* Success Message */}
            <div className="space-y-4 mb-8 animate-fade-in delay-1000">
              <p className="text-lg text-white">
                Your story has been successfully generated and sent to SnapSpectacles!
              </p>
              <p className="text-gray-300">
                Check your SnapSpectacles app to view your personalized story.
              </p>
            </div>

            {/* Action Button */}
            <div className="animate-fade-in delay-1200">
              <Link to="/generate">
                <PremiumButton variant="secondary" size="lg" className="gap-2 min-w-[250px] bg-blue-accent hover:bg-blue-accent/90 text-white border-0 rounded-full font-semibold px-8 py-4">
                  <RefreshCw className="h-5 w-5" />
                  Generate Another Story
                </PremiumButton>
              </Link>
            </div>

            {/* Decorative Elements */}
            <div className="flex justify-center space-x-4 mt-8 animate-fade-in delay-1500">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
              <div className="w-3 h-3 bg-white rounded-full animate-pulse delay-300" />
              <div className="w-3 h-3 bg-white rounded-full animate-pulse delay-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Success;