import { MapPin, Trophy, Users, TrendingUp, Star, Zap } from 'lucide-react';

const features = [
  {
    icon: MapPin,
    title: 'Track Your Trips',
    description: 'Log your daily commutes and see your journey history. Every trip counts towards your commuter score.',
    color: 'from-deep-amethyst to-plum-builder',
  },
  {
    icon: Trophy,
    title: 'Earn Badges',
    description: 'Unlock achievements as you explore routes, help others, and reach milestones in your commuting journey.',
    color: 'from-plum-builder to-orchid-petal',
  },
  {
    icon: Users,
    title: 'Join Factions',
    description: 'Team up with fellow commuters, compete in challenges, and climb the leaderboards together.',
    color: 'from-orchid-petal to-plum-builder',
  },
  {
    icon: TrendingUp,
    title: 'Build Streaks',
    description: 'Maintain your commuting streak and watch your rank grow. Consistency is rewarded!',
    color: 'from-deep-amethyst to-orchid-petal',
  },
  {
    icon: Star,
    title: 'Discover Routes',
    description: 'Explore new bus routes, find the best connections, and share your favorite paths with the community.',
    color: 'from-plum-builder to-deep-amethyst',
  },
  {
    icon: Zap,
    title: 'Help Others',
    description: 'Submit new bus stops, verify locations, and contribute to making transit better for everyone.',
    color: 'from-orchid-petal to-deep-amethyst',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-deep-amethyst mb-4">
            Why Commuters Love Komiota
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Turn your daily commute into an adventure with features designed to make public transit engaging and rewarding.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-vanilla-milk rounded-2xl p-8 hover:shadow-xl transition-all duration-300 border border-orchid-petal/20 hover:border-plum-builder/40"
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              
              <h3 className="text-xl font-bold text-deep-amethyst mb-3">
                {feature.title}
              </h3>
              
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
