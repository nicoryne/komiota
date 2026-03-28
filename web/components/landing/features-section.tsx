import { WifiOff, Map, Users } from 'lucide-react';

const features = [
  {
    icon: WifiOff,
    title: 'Offline-First Navigation',
    description:
      'Download route maps and stop data for use without an internet connection. Commute confidently even in low-signal areas.',
  },
  {
    icon: Map,
    title: 'Interactive Map',
    description:
      'Explore the full CBRT network on a live, interactive map. See nearby stops, route paths, and real-time community updates.',
  },
  {
    icon: Users,
    title: 'Community Crowdsourcing',
    description:
      'Submit new stops, report changes, and earn points for helping keep the map accurate. Every contribution makes Cebu commuting better.',
  },
];

export function FeaturesSection() {
  return (
    <section className="w-full bg-[#FAFAFA] px-6 py-16">
      <div className="max-w-5xl mx-auto flex flex-col items-center gap-10">
        <div className="text-center flex flex-col gap-2">
          <h2 className="text-3xl font-bold text-[#1C1A22] tracking-tight">
            Built for Cebu Commuters
          </h2>
          <p className="text-[#1C1A22]/60 text-base max-w-lg mx-auto">
            Everything you need to navigate the CBRT network, powered by the community.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="flex flex-col gap-4 p-6 bg-[#FCFAFF] border border-[#4627b6]/10 rounded-[16px]"
              >
                <div className="flex items-center justify-center w-11 h-11 rounded-[12px] bg-[#4627b6]/10">
                  <Icon className="w-5 h-5 text-[#4627b6]" />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-base font-semibold text-[#1C1A22]">{feature.title}</h3>
                  <p className="text-sm text-[#1C1A22]/60 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
