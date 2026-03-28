import Link from 'next/link';
import { MapPin, Trophy, Users } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-vanilla-milk via-orchid-petal/10 to-vanilla-milk">
      <div className="max-w-7xl mx-auto px-6 py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <div className="flex flex-col gap-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orchid-petal/20 text-deep-amethyst text-sm font-medium w-fit">
              <span className="text-lg">🚌</span>
              <span>Gamified Public Transit</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-deep-amethyst leading-tight">
              Transform Your
              <span className="block text-plum-builder">Daily Commute</span>
            </h1>
            
            <p className="text-lg text-gray-700 leading-relaxed">
              Make public transit fun! Track your trips, earn badges, compete with friends, 
              and help build a better commuter community in Cebu.
            </p>

            <div className="flex flex-wrap gap-4 mt-4">
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-deep-amethyst text-vanilla-milk text-base font-semibold hover:bg-plum-builder transition-all hover:scale-105"
              >
                Get Started
              </Link>
              <a
                href="#features"
                className="inline-flex items-center justify-center px-8 py-4 rounded-full border-2 border-deep-amethyst text-deep-amethyst text-base font-semibold hover:bg-deep-amethyst hover:text-vanilla-milk transition-all"
              >
                Learn More
              </a>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-8 mt-8 pt-8 border-t border-orchid-petal/30">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-orchid-petal/30 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-deep-amethyst" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-deep-amethyst">500+</div>
                  <div className="text-sm text-gray-600">Bus Stops</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-orchid-petal/30 flex items-center justify-center">
                  <Users className="w-6 h-6 text-deep-amethyst" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-deep-amethyst">1K+</div>
                  <div className="text-sm text-gray-600">Commuters</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-orchid-petal/30 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-deep-amethyst" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-deep-amethyst">50+</div>
                  <div className="text-sm text-gray-600">Achievements</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Mascot/Visual */}
          <div className="relative">
            <div className="relative w-full aspect-square max-w-md mx-auto">
              {/* Decorative circles */}
              <div className="absolute inset-0 bg-gradient-to-br from-plum-builder/20 to-orchid-petal/20 rounded-full blur-3xl"></div>
              
              {/* Mascot placeholder - you can replace with actual image */}
              <div className="relative z-10 w-full h-full flex items-center justify-center">
                <div className="text-[200px] animate-bounce-slow">🦫</div>
              </div>

              {/* Floating badges */}
              <div className="absolute top-10 right-10 bg-white rounded-2xl shadow-lg p-4 animate-float">
                <div className="text-4xl">🎖️</div>
              </div>
              <div className="absolute bottom-20 left-10 bg-white rounded-2xl shadow-lg p-4 animate-float-delayed">
                <div className="text-4xl">🚌</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
